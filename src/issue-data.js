const ISSUE_KEY_PATTERN = /^[A-Z][A-Z0-9_]{1,19}-[1-9][0-9]*$/i;
const BLOCK_NODES = new Set([
  'blockquote', 'bulletList', 'codeBlock', 'heading', 'listItem',
  'orderedList', 'panel', 'paragraph', 'rule', 'table', 'tableCell',
  'tableHeader', 'tableRow',
]);

export function resolveIssueKey(payload = {}) {
  const suppliedKey = normaliseKey(payload.issueKey);
  const contextKey = normaliseKey(payload.context?.jira?.issueKey);
  const issueKey = ISSUE_KEY_PATTERN.test(suppliedKey) ? suppliedKey : contextKey;

  if (!ISSUE_KEY_PATTERN.test(issueKey)) {
    throw new Error('Provide a valid Jira issue key or invoke the Agent from an issue.');
  }

  return issueKey;
}

function normaliseKey(value) {
  return typeof value === 'string' ? value.trim().toUpperCase() : '';
}

export function adfToText(document, maximumLength = 8000) {
  if (!document) return '';
  if (typeof document === 'string') return truncate(document, maximumLength);

  const text = readAdfNode(document).replace(/\n{3,}/g, '\n\n').trim();
  return truncate(text, maximumLength);
}

function readAdfNode(node) {
  if (!node || typeof node !== 'object') return '';
  if (node.type === 'text') return node.text ?? '';
  if (node.type === 'hardBreak') return '\n';
  if (node.type === 'emoji') return node.attrs?.shortName ?? '';

  const content = Array.isArray(node.content)
    ? node.content.map(readAdfNode).join('')
    : '';
  return BLOCK_NODES.has(node.type) ? `${content}\n` : content;
}

export function normaliseIssue(issue) {
  const fields = issue.fields ?? {};
  const links = (fields.issuelinks ?? []).slice(0, 25).map(normaliseIssueLink);

  return {
    key: issue.key,
    summary: fields.summary ?? '',
    description: adfToText(fields.description),
    issueType: fields.issuetype?.name ?? 'Unknown',
    status: fields.status?.name ?? 'Unknown',
    priority: fields.priority?.name ?? 'None',
    assignee: fields.assignee?.displayName ?? 'Unassigned',
    reporter: fields.reporter?.displayName ?? 'Unknown',
    labels: fields.labels ?? [],
    components: (fields.components ?? []).map(({ name }) => name),
    dueDate: fields.duedate ?? null,
    parent: fields.parent
      ? { key: fields.parent.key, summary: fields.parent.fields?.summary ?? '' }
      : null,
    subtasks: (fields.subtasks ?? []).map((subtask) => ({
      key: subtask.key,
      summary: subtask.fields?.summary ?? '',
      status: subtask.fields?.status?.name ?? 'Unknown',
    })),
    issueLinks: links,
    issueLinksTruncated: (fields.issuelinks?.length ?? 0) > links.length,
  };
}

function normaliseIssueLink(link) {
  const linkedIssue = link.outwardIssue ?? link.inwardIssue;
  const relationship = link.outwardIssue ? link.type?.outward : link.type?.inward;

  return {
    relationship: relationship ?? 'relates to',
    key: linkedIssue?.key ?? 'Unknown',
    summary: linkedIssue?.fields?.summary ?? '',
    status: linkedIssue?.fields?.status?.name ?? 'Unknown',
  };
}

export function normaliseComments(comments) {
  return comments.map((comment) => ({
    author: comment.author?.displayName ?? 'Unknown',
    created: comment.created ?? null,
    updated: comment.updated ?? null,
    body: adfToText(comment.body, 2000),
  }));
}

/**
 * Best-effort extraction of PR / development info from Jira issue JSON.
 * Supports common marketplace / DVCS shapes when present; otherwise empty.
 */
export function extractPullRequests(issue) {
  const fields = issue.fields ?? {};
  const candidates = [];

  // Some sites expose development info under custom fields or expanded properties.
  const devField = fields.development ?? fields.devSummary ?? null;
  if (devField && typeof devField === 'object') {
    const prList = devField.pullRequests ?? devField.prs ?? [];
    for (const pr of prList) {
      candidates.push({
        id: String(pr.id ?? pr.pullRequestId ?? ''),
        title: pr.name ?? pr.title ?? 'Pull request',
        status: pr.status ?? pr.state ?? 'open',
        url: pr.url ?? pr.repository?.url ?? null,
        approved: Boolean(pr.approved ?? pr.reviewers?.some?.((r) => r.approved)),
        checksPassing: pr.buildStatus === 'SUCCESSFUL' || pr.checksPassing === true,
      });
    }
  }

  // Fallback: parse URLs from description text
  const description = adfToText(fields.description);
  const urlMatches = description.match(/https?:\/\/[^\s)]+\/(pull|merge_requests)\/\d+/gi) ?? [];
  for (const url of urlMatches) {
    if (!candidates.some((c) => c.url === url)) {
      candidates.push({
        id: url,
        title: 'Linked PR from description',
        status: 'open',
        url,
        approved: false,
        checksPassing: null,
      });
    }
  }

  return candidates.slice(0, 15);
}

function truncate(value, maximumLength) {
  if (value.length <= maximumLength) return value;
  return `${value.slice(0, maximumLength - 1)}…`;
}
