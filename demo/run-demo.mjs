#!/usr/bin/env node
/**
 * Local end-to-end demo — no Atlassian cloud / Forge login required.
 * Story: ticket SHIP-42 → delivery context → risk/release checklist → next steps.
 *
 *   npm run demo
 *   npm run demo:json
 *   node demo/run-demo.mjs SHIP-7
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildChecklist, formatChecklistMarkdown } from '../src/delivery-context.js';
import { getMockComments, getMockIssue } from '../src/mock-data.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const asJson = args.includes('--json');
const issueKey = args.find((a) => !a.startsWith('--')) || 'SHIP-42';

const context = getMockIssue(issueKey);
const comments = getMockComments(issueKey);
const report = buildChecklist(context, comments);

// Also persist a snapshot for the static landing page to load.
const snapshotPath = join(__dirname, 'fixtures', `${issueKey}-checklist.json`);
try {
  const { writeFileSync, mkdirSync } = await import('node:fs');
  mkdirSync(join(__dirname, 'fixtures'), { recursive: true });
  const payload = {
    context,
    comments,
    report: { ...report, markdown: formatChecklistMarkdown(report) },
  };
  writeFileSync(snapshotPath, JSON.stringify(payload, null, 2));
  const staticDir = join(__dirname, '..', 'static', 'demo');
  mkdirSync(staticDir, { recursive: true });
  writeFileSync(join(staticDir, 'sample-checklist.json'), JSON.stringify(payload, null, 2));
} catch {
  // non-fatal
}

if (asJson) {
  console.log(JSON.stringify({ context, comments, report }, null, 2));
} else {
  console.log(formatChecklistMarkdown(report));
  console.log('\n---');
  console.log(`Fixture snapshot: demo/fixtures/${issueKey}-checklist.json`);
  console.log('Forge path (when Atlassian account available): forge login && forge register && forge deploy && forge install');
}
