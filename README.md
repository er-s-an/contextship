# ContextShip

**Forge-installable Rovo agent** that turns Jira ticket / PR / release context into an **executable next-step checklist**.

Built for [Codegeist 2026](https://codegeist2026.devpost.com/) — category **Apps for Software Teams**, aiming **Best Agents** (`rovo:agent` + `rovo:skill` + `action` + stretch `rovo:mcp`).

> Soft registration: Devpost user `er-s-an`. **Do not Submit** without explicit owner approval (「交」).

## Problem

Software teams drown in Jira/Confluence context and still hand-stitch PR, acceptance, and release checklists. Generic GPT shells do not install into Atlassian workflows. ContextShip is an **assignable-style Rovo agent** (installable via Forge) that behaves like a Cursor/Linear delivery agent: **context in → concrete next action out**.

## What it does

1. Reads delivery context for a Jira issue (fields, links, subtasks, labels, PR signals).
2. Reads recent comments for blockers / decisions.
3. Builds a **risk-ranked readiness score**, release checklist, and ordered next steps.
4. Exposes the same tools via **`rovo:mcp`** so other custom agents can call them.

## Stack

| Layer | Choice |
| --- | --- |
| Platform | Atlassian **Forge** (`nodejs24.x`) |
| Agent | `rovo:agent` **ContextShip** |
| Skill | `rovo:skill` `delivery-context-review` (`SKILL.md`) |
| Actions | `get-delivery-context`, `get-issue-comments`, `build-release-checklist` |
| Stretch | `rovo:mcp` ContextShip delivery tools |
| Local demo | Pure Node mock path — **no cloud login** |

## Repository layout

```
manifest.yml                 # Forge modules (agent / skill / actions / mcp)
src/
  index.js                   # Forge action handlers (@forge/api)
  delivery-context.js        # Pure checklist engine (shared)
  issue-data.js              # ADF + issue normalisation
  mock-data.js               # Offline fixtures (SHIP-42, SHIP-7)
skills/delivery-context/     # Rovo skill + references
resources/agent/prompts/     # Agent system prompt
demo/run-demo.mjs            # End-to-end CLI story
static/demo/                 # Icon + lightweight landing
```

## Quick start — local demo (no Atlassian account)

```bash
npm install
npm test
npm run demo          # SHIP-42 → blocked / needs-work checklist
npm run demo -- SHIP-7
npm run demo:json     # machine-readable snapshot
```

Expected story for **SHIP-42**: open PR without approval, blocked by **SHIP-39**, QA subtask still in progress → high/medium findings and ordered next steps.

## Forge install (Atlassian account required)

Prerequisites: Node.js **≥ 22.23.4** (Forge CLI 15.x), Atlassian account, Jira Cloud site with **Rovo** (use a [Forge demo site](https://developer.atlassian.com/platform/forge/) if your free dev site lacks Rovo Chat).

```bash
npm install -g @forge/cli@latest
forge login
forge register          # replaces the placeholder app id in manifest.yml
forge lint
forge deploy
forge install           # select Jira
# If Rovo is missing on the free site:
forge site provision
forge install --demo-site
```

After install, open **Rovo Chat** → select **ContextShip**, open a Jira issue, and try:

- “What is blocking this ticket from shipping?”
- “Build a release checklist for this issue”
- “What should I do next?”

### Share / judge install

Judges need an installation link from a deployed Forge app (`forge install` / distribution link from developer console). Until `forge register` + deploy succeed under the contest Atlassian account, use the **local demo** above for the end-to-end story.

## Permissions

Read-only scopes:

- `read:jira-work`
- `read:confluence-content.summary` (reserved for follow-on Confluence enrichment)

The agent **does not** create, edit, assign, comment, or transition issues.

## Demo video

Recordings will be produced later via [review-clips](https://review-clips.vercel.app). This repo focuses on **code + runnable demo path**.

## License

MIT © Caesar (`er-s-an`)
