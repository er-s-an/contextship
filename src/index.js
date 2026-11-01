import api, { route } from '@forge/api';

import { buildChecklist, formatChecklistMarkdown } from './delivery-context.js';
import {
  extractPullRequests,
  normaliseComments,
  normaliseIssue,
  resolveIssueKey,
} from './issue-data.js';

/**
 * Delivery context for an issue (fields + PR signals).
 */
export async function getDeliveryContext(payload = {}) {
  const issueKey = resolveIssueKey(payload);
  const response = await api.asUser().requestJira(
    route`/rest/api/3/issue/${issueKey}?fields=summary,description,issuetype,status,priority,assignee,reporter,labels,components,duedate,parent,subtasks,issuelinks`,
    { headers: { Accept: 'application/json' } },
  );

  const issue = await readJiraResponse(response, `retrieve issue ${issueKey}`);
  const normalised = normaliseIssue(issue);
  normalised.pullRequests = extractPullRequests(issue);
  return normalised;
}

/**
 * Recent comments (bounded).
 */
export async function getIssueComments(payload = {}) {
  const issueKey = resolveIssueKey(payload);
  const response = await api.asUser().requestJira(
    route`/rest/api/3/issue/${issueKey}/comment?maxResults=20&orderBy=-created`,
    { headers: { Accept: 'application/json' } },
  );
  const data = await readJiraResponse(response, `retrieve comments for ${issueKey}`);

  return {
    issueKey,
    comments: normaliseComments(data.comments ?? []),
    totalComments: data.total ?? 0,
    commentsTruncated: (data.total ?? 0) > (data.comments?.length ?? 0),
  };
}

/**
 * Build risk-ranked release checklist. Accepts prior tool JSON or fetches live.
 */
export async function buildReleaseChecklist(payload = {}) {
  let context = parseJsonInput(payload.deliveryContextJson);
  let commentsPayload = parseJsonInput(payload.commentsJson);

  if (!context) {
    context = await getDeliveryContext(payload);
  }
  if (!commentsPayload && (payload.issueKey || payload.context?.jira?.issueKey || context?.key)) {
    try {
      commentsPayload = await getIssueComments({
        issueKey: payload.issueKey || context.key,
        context: payload.context,
      });
    } catch {
      commentsPayload = { comments: [] };
    }
  }

  const report = buildChecklist(context, commentsPayload);
  return {
    ...report,
    markdown: formatChecklistMarkdown(report),
  };
}

function parseJsonInput(value) {
  if (!value) return null;
  if (typeof value === 'object') return value;
  if (typeof value !== 'string') return null;
  try {
    return JSON.parse(value);
  } catch {
    throw new Error('deliveryContextJson / commentsJson must be valid JSON when provided.');
  }
}

async function readJiraResponse(response, operation) {
  if (!response.ok) {
    throw new Error(`Unable to ${operation}. Jira returned status ${response.status}.`);
  }
  return response.json();
}
