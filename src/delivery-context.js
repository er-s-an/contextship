/**
 * Pure delivery-context → risk / next-step checklist engine.
 * Used by Forge actions and the local mock demo (no Atlassian network required).
 */

const BLOCKER_PATTERNS = [
  /\bblocked\b/i,
  /\bblocker\b/i,
  /\bwaiting on\b/i,
  /\bneed(s)? (sign[- ]?off|approval|review)\b/i,
  /\bcannot ship\b/i,
  /\bhold(ing)?\b/i,
];

const ACCEPTANCE_PATTERNS = [
  /acceptance criteria/i,
  /\bAC[:\s]/i,
  /\bgiven\b.+\bwhen\b.+\bthen\b/i,
  /\bdefinition of done\b/i,
];

const TEST_PATTERNS = [
  /\bqa\b/i,
  /\btest(ed|ing| plan| cases?)?\b/i,
  /\be2e\b/i,
  /\bcoverage\b/i,
  /\bregression\b/i,
];

const ROLLBACK_PATTERNS = [
  /\brollback\b/i,
  /\bfeature flag\b/i,
  /\bkill switch\b/i,
  /\bcanary\b/i,
];

/**
 * @param {object} context normalised delivery context
 * @param {object} [commentsPayload]
 * @returns {object} checklist report
 */
export function buildChecklist(context, commentsPayload = null) {
  const comments = commentsPayload?.comments ?? [];
  const findings = [];
  const nextSteps = [];

  const description = context.description ?? '';
  const labels = context.labels ?? [];
  const links = context.issueLinks ?? [];
  const subtasks = context.subtasks ?? [];
  const prs = context.pullRequests ?? [];
  const status = (context.status ?? '').toLowerCase();

  // --- Gaps / risks ---
  if (!description || description.trim().length < 40) {
    findings.push(risk('high', 'thin-description', 'Issue description is thin or missing.', 'Expand the problem statement and expected behaviour.'));
  }

  const docsOnly = labels.some((l) => /docs-only|no-code|process/i.test(l));
  if (!docsOnly && !ACCEPTANCE_PATTERNS.some((p) => p.test(description))) {
    findings.push(risk('high', 'missing-acceptance', 'No clear acceptance criteria detected.', 'Add measurable acceptance criteria before merge.'));
  }

  if (!context.assignee || context.assignee === 'Unassigned') {
    findings.push(risk('medium', 'unassigned', 'Issue is unassigned.', 'Assign an owner accountable for shipping.'));
  }

  if (!context.priority || context.priority === 'None') {
    findings.push(risk('low', 'no-priority', 'Priority is unset.', 'Set priority so release triage can rank this work.'));
  }

  const openSubtasks = subtasks.filter((s) => !/done|closed|resolved|cancelled|canceled/i.test(s.status ?? ''));
  if (openSubtasks.length > 0) {
    findings.push(risk(
      'medium',
      'open-subtasks',
      `${openSubtasks.length} open subtask(s) remain.`,
      `Close or re-scope: ${openSubtasks.slice(0, 5).map((s) => s.key).join(', ')}.`,
    ));
  }

  const blockingLinks = links.filter((l) => /is blocked by|depends on/i.test(l.relationship ?? ''));
  const unresolvedBlockers = blockingLinks.filter((l) => !/done|closed|resolved/i.test(l.status ?? ''));
  if (unresolvedBlockers.length > 0) {
    findings.push(risk(
      'high',
      'blocked-by-links',
      `Blocked by ${unresolvedBlockers.length} open linked issue(s).`,
      `Resolve or detach: ${unresolvedBlockers.map((l) => l.key).join(', ')}.`,
    ));
  }

  const commentBlockers = comments.filter((c) => BLOCKER_PATTERNS.some((p) => p.test(c.body ?? '')));
  if (commentBlockers.length > 0) {
    findings.push(risk(
      'high',
      'comment-blockers',
      `${commentBlockers.length} recent comment(s) mention blockers or holds.`,
      'Confirm each blocker is cleared or explicitly deferred in the issue.',
    ));
  }

  if (prs.length === 0 && !labels.some((l) => /no-code|docs-only|process/i.test(l))) {
    findings.push(risk('medium', 'no-pr', 'No linked pull request signals found.', 'Link the implementing PR (or label as docs/process-only).'));
  } else {
    const openPrs = prs.filter((p) => /open|draft/i.test(p.status ?? 'open'));
    const unapproved = prs.filter((p) => p.approved !== true && !/merged|closed/i.test(p.status ?? ''));
    if (openPrs.length > 0) {
      findings.push(risk('medium', 'open-prs', `${openPrs.length} PR(s) still open.`, 'Get review + merge or update the release cut.'));
    }
    if (unapproved.length > 0) {
      findings.push(risk('high', 'unapproved-prs', `${unapproved.length} PR(s) lack approval.`, 'Obtain required code-owner / reviewer approval.'));
    }
  }

  const hasTestSignal = TEST_PATTERNS.some((p) => p.test(description))
    || labels.some((l) => TEST_PATTERNS.some((p) => p.test(l)))
    || comments.some((c) => TEST_PATTERNS.some((p) => p.test(c.body ?? '')))
    || prs.some((p) => p.checksPassing === true);

  if (!hasTestSignal) {
    findings.push(risk('high', 'weak-test-signal', 'Weak test / QA signal in description, labels, comments, or PR checks.', 'Record test evidence or attach a QA note before release.'));
  }

  const hasRollback = ROLLBACK_PATTERNS.some((p) => p.test(description))
    || labels.some((l) => /flag|canary|rollback/i.test(l))
    || comments.some((c) => ROLLBACK_PATTERNS.some((p) => p.test(c.body ?? '')));

  if (!hasRollback && /prod|production|release|hotfix/i.test(`${description} ${labels.join(' ')} ${status}`)) {
    findings.push(risk('medium', 'no-rollback', 'No rollback / feature-flag plan detected for a release-shaped change.', 'Document rollback or flag kill-switch in the issue.'));
  }

  // --- Next steps (executable, ordered) ---
  const severityOrder = { high: 0, medium: 1, low: 2 };
  findings.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  for (const f of findings) {
    nextSteps.push({
      priority: f.severity,
      action: f.recommendation,
      relatedFinding: f.id,
    });
  }

  if (nextSteps.length === 0) {
    nextSteps.push({
      priority: 'low',
      action: 'Context looks ship-ready — run final smoke test, update release notes, then transition the issue.',
      relatedFinding: null,
    });
  } else {
    nextSteps.push({
      priority: 'low',
      action: 'After clearing high/medium items, post a short ship note (what changed, how to verify, rollback) and move to Done.',
      relatedFinding: null,
    });
  }

  const score = scoreReadiness(findings);
  return {
    issueKey: context.key,
    summary: context.summary,
    status: context.status,
    readinessScore: score.value,
    readinessLabel: score.label,
    findings,
    nextSteps,
    releaseChecklist: [
      { item: 'Acceptance criteria complete', done: !findings.some((f) => f.id === 'missing-acceptance') },
      { item: 'Owner assigned', done: !findings.some((f) => f.id === 'unassigned') },
      { item: 'Blocking links cleared', done: !findings.some((f) => f.id === 'blocked-by-links') },
      { item: 'PR approved / merged (or N/A)', done: !findings.some((f) => f.id === 'no-pr' || f.id === 'unapproved-prs' || f.id === 'open-prs') },
      { item: 'Test / QA evidence recorded', done: !findings.some((f) => f.id === 'weak-test-signal') },
      { item: 'Rollback / flag plan noted', done: !findings.some((f) => f.id === 'no-rollback') },
      { item: 'Open subtasks closed or re-scoped', done: !findings.some((f) => f.id === 'open-subtasks') },
    ],
    generatedAt: new Date().toISOString(),
  };
}

function risk(severity, id, finding, recommendation) {
  return { severity, id, finding, recommendation };
}

function scoreReadiness(findings) {
  let score = 100;
  for (const f of findings) {
    if (f.severity === 'high') score -= 18;
    else if (f.severity === 'medium') score -= 10;
    else score -= 4;
  }
  score = Math.max(0, Math.min(100, score));
  let label = 'Ship-ready';
  if (score < 40) label = 'Blocked';
  else if (score < 70) label = 'Needs work';
  else if (score < 85) label = 'Almost ready';
  return { value: score, label };
}

/**
 * Format checklist as concise markdown for Agent / CLI output.
 */
export function formatChecklistMarkdown(report) {
  const lines = [];
  lines.push(`# ContextShip — ${report.issueKey}`);
  lines.push('');
  lines.push(`**${report.summary}**`);
  lines.push(`Status: ${report.status} · Readiness: **${report.readinessScore}/100 (${report.readinessLabel})**`);
  lines.push('');
  lines.push('## Findings');
  if (report.findings.length === 0) {
    lines.push('- No material gaps detected.');
  } else {
    for (const f of report.findings) {
      const emoji = f.severity === 'high' ? '🔴' : f.severity === 'medium' ? '🟡' : '🟢';
      lines.push(`- ${emoji} **${f.severity}** · ${f.finding}`);
      lines.push(`  - Next: ${f.recommendation}`);
    }
  }
  lines.push('');
  lines.push('## Release checklist');
  for (const c of report.releaseChecklist) {
    lines.push(`- [${c.done ? 'x' : ' '}] ${c.item}`);
  }
  lines.push('');
  lines.push('## Executable next steps');
  report.nextSteps.forEach((s, i) => {
    lines.push(`${i + 1}. (${s.priority}) ${s.action}`);
  });
  lines.push('');
  lines.push('_Generated by ContextShip · facts above come from issue fields/comments/PR signals; recommendations are advisory._');
  return lines.join('\n');
}
