import test from 'node:test';
import assert from 'node:assert/strict';

import { buildChecklist, formatChecklistMarkdown } from '../src/delivery-context.js';
import { getMockComments, getMockIssue } from '../src/mock-data.js';

test('SHIP-42 is blocked / needs work with actionable next steps', () => {
  const report = buildChecklist(getMockIssue('SHIP-42'), getMockComments('SHIP-42'));
  assert.equal(report.issueKey, 'SHIP-42');
  assert.ok(report.readinessScore < 85, 'expected gaps on SHIP-42');
  assert.ok(report.findings.some((f) => f.id === 'blocked-by-links'));
  assert.ok(report.findings.some((f) => f.id === 'unapproved-prs' || f.id === 'open-prs'));
  assert.ok(report.nextSteps.length >= 2);
  const md = formatChecklistMarkdown(report);
  assert.match(md, /ContextShip/);
  assert.match(md, /Release checklist/);
});

test('SHIP-7 docs-only path scores healthier', () => {
  const report = buildChecklist(getMockIssue('SHIP-7'), getMockComments('SHIP-7'));
  assert.equal(report.issueKey, 'SHIP-7');
  assert.ok(report.readinessScore >= 70);
  assert.ok(!report.findings.some((f) => f.id === 'no-pr'));
});
