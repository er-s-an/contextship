/** Fixtures for local demo / offline Forge tunnel fallbacks. */

export const MOCK_ISSUES = {
  'SHIP-42': {
    key: 'SHIP-42',
    summary: 'Add checkout retry for flaky payment webhooks',
    description: [
      'Payment webhooks occasionally fail with 503 from the provider.',
      'We need idempotent retries with exponential backoff.',
      '',
      '## Acceptance criteria',
      '- Given a 503 response, when the worker retries, then the charge is not double-captured',
      '- Metrics emit retry_count and final_status',
      '- Feature flag `payments.retry_v2` can disable the path in production',
      '',
      'PR: https://github.com/acme/payments/pull/118',
    ].join('\n'),
    issueType: 'Story',
    status: 'In Review',
    priority: 'High',
    assignee: 'Alex Chen',
    reporter: 'Sam Rivera',
    labels: ['payments', 'release-candidate', 'production'],
    components: ['checkout'],
    dueDate: '2026-12-01',
    parent: { key: 'SHIP-40', summary: 'Q4 payments reliability' },
    subtasks: [
      { key: 'SHIP-43', summary: 'Add retry metrics', status: 'Done' },
      { key: 'SHIP-44', summary: 'QA webhook chaos test', status: 'In Progress' },
    ],
    issueLinks: [
      {
        relationship: 'is blocked by',
        key: 'SHIP-39',
        summary: 'Provider sandbox credentials rotation',
        status: 'In Progress',
      },
      {
        relationship: 'relates to',
        key: 'SHIP-21',
        summary: 'Idempotency keys for charges',
        status: 'Done',
      },
    ],
    issueLinksTruncated: false,
    pullRequests: [
      {
        id: '118',
        title: 'feat: webhook retry with backoff',
        status: 'open',
        url: 'https://github.com/acme/payments/pull/118',
        approved: false,
        checksPassing: true,
      },
    ],
  },
  'SHIP-7': {
    key: 'SHIP-7',
    summary: 'Update README badges',
    description: 'Docs-only badge refresh for the public repo.',
    issueType: 'Task',
    status: 'Done',
    priority: 'Low',
    assignee: 'Jordan Lee',
    reporter: 'Jordan Lee',
    labels: ['docs-only'],
    components: [],
    dueDate: null,
    parent: null,
    subtasks: [],
    issueLinks: [],
    issueLinksTruncated: false,
    pullRequests: [
      {
        id: '12',
        title: 'docs: badges',
        status: 'merged',
        url: 'https://github.com/acme/app/pull/12',
        approved: true,
        checksPassing: true,
      },
    ],
  },
};

export const MOCK_COMMENTS = {
  'SHIP-42': {
    issueKey: 'SHIP-42',
    comments: [
      {
        author: 'Sam Rivera',
        created: '2026-11-01T08:00:00.000Z',
        updated: '2026-11-01T08:00:00.000Z',
        body: 'Blocked on SHIP-39 — waiting on sandbox credentials before final QA.',
      },
      {
        author: 'Alex Chen',
        created: '2026-11-01T12:30:00.000Z',
        updated: '2026-11-01T12:30:00.000Z',
        body: 'PR is up. Still need a second approval from payments-codeowners.',
      },
    ],
    totalComments: 2,
    commentsTruncated: false,
  },
  'SHIP-7': {
    issueKey: 'SHIP-7',
    comments: [
      {
        author: 'Jordan Lee',
        created: '2026-10-20T10:00:00.000Z',
        updated: '2026-10-20T10:00:00.000Z',
        body: 'Merged. Nothing else required.',
      },
    ],
    totalComments: 1,
    commentsTruncated: false,
  },
};

export function getMockIssue(issueKey) {
  const key = String(issueKey || '').toUpperCase();
  const issue = MOCK_ISSUES[key];
  if (!issue) {
    throw new Error(`No mock issue for ${key}. Try SHIP-42 or SHIP-7.`);
  }
  return structuredClone(issue);
}

export function getMockComments(issueKey) {
  const key = String(issueKey || '').toUpperCase();
  const comments = MOCK_COMMENTS[key];
  if (!comments) {
    return { issueKey: key, comments: [], totalComments: 0, commentsTruncated: false };
  }
  return structuredClone(comments);
}
