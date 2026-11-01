# ContextShip

**Forge-installable Rovo agent** that turns Jira ticket, pull request, and release context into an **executable next-step checklist**.

Built for [Codegeist 2026](https://codegeist2026.devpost.com/) — category **Apps for Software Teams**, aiming for **Best Agents** (`rovo:agent` + `rovo:skill` + `action`, plus a stretch `rovo:mcp` server).

> Devpost account: `er-s-an` (already registered). **Do not Submit** without explicit owner approval (「交」).

## Problem

Software teams already hold ticket, pull request, and release context in Jira, and still assemble the ship checklist by hand. ContextShip installs into that workflow as an assignable Rovo agent: **context in, concrete next action out**.

## What it does

1. Reads delivery context for a Jira issue (fields, links, subtasks, labels, and pull-request signals).
2. Reads recent comments for blockers and decisions.
3. Builds a **risk-ranked readiness score**, a release checklist, and ordered next steps.
4. Exposes the same tools through **`rovo:mcp`** so other custom agents can call them.

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

The `app.id` in `manifest.yml` is a placeholder (`ari:cloud:ecosystem::app/00000000-0000-4000-8000-000000000001`). **`forge register` replaces it** with the id Atlassian assigns. Leave that placeholder in the repo until the owner registers the app.

## Quick start — local demo (no Atlassian account)

```bash
npm install
npm test
npm run demo          # SHIP-42 → Blocked checklist
npm run demo -- SHIP-7
npm run demo:json     # machine-readable snapshot
```

**SHIP-42** is in review: the pull request is open and unapproved, the issue is blocked by **SHIP-39**, and the QA subtask is still in progress. The report lists high and medium findings, then ordered next steps. **SHIP-7** is a merged docs-only task and scores as ship-ready.

No secrets or `.env` file are required. See [`.env.example`](.env.example).

## Forge install (Atlassian account required)

Prerequisites: Node.js **≥ 22.23.4** (Forge CLI 15.x), an Atlassian account, and a Jira Cloud site with **Rovo**. When a free developer site has no Rovo Chat, use a [Forge demo site](https://developer.atlassian.com/platform/forge/provision-a-demo-development-site/). The local demo above runs without that account. Register, deploy, and demo-site steps are also in [CONTRIBUTING.md](CONTRIBUTING.md).

```bash
npm install -g @forge/cli@latest
forge login
forge register          # replaces the placeholder app id in manifest.yml
forge lint
forge deploy
forge install           # select Jira
# When the free site has no Rovo, deploy first, then:
forge site provision
forge install --demo-site
```

`forge register` writes a new `app.id` into `manifest.yml` and sets the logged-in Atlassian account as the owner. Run it once, on the account that will own the contest app. Running it again issues another id and disconnects the previous environments.

After install, open **Rovo Chat**, select **ContextShip**, open a Jira issue, and try:

- “What is blocking this ticket from shipping?”
- “Build a release checklist for this issue”
- “What should I do next?”

### Share / judge install

Judges install from the distribution link of a deployed Forge app. Until the contest Atlassian account has run `forge register` and `forge deploy`, use the **local demo** for the end-to-end story.

## Permissions

Read-only scopes:

- `read:jira-work`
- `read:confluence-content.summary` (reserved for follow-on Confluence enrichment)

The agent only reads issues. It does not create, edit, assign, comment, or transition them.

## Demo video

Recordings will be produced later via [review-clips](https://review-clips.vercel.app). This repo focuses on **code + runnable demo path**.

## License

MIT © Caesar (`er-s-an`)
