# ContextShip — Codegeist 2026 Build Status

Updated: 2026-11-02 ~02:59 Asia/Shanghai

Skills loaded: remotion, remotion-best-practices, remotion-markup, remotion-create (explainer LIVE); design-taste-frontend pending landing polish if needed.

## Contest gates

| Gate | Status |
| --- | --- |
| Soft registered (`er-s-an`) | Done — https://codegeist2026.devpost.com/ |
| Zero fee / no card | OK |
| English-only materials | OK |
| Devpost **Submit** | **NOT done** — wait for user 「交」 |
| Demo video (review-clips) | **LIVE** https://review-clips.vercel.app/v/contextship-explainer (~106s Remotion) |

## Forge cloud (2026-11-02)

| Item | Value |
| --- | --- |
| whoami | Caesar (`er-s-an@mail.grokbot.com`) |
| Developer Space | ContextShip (`c95f91db-4ca1-4df3-81d8-a47293b3f859`) |
| App id | `ari:cloud:ecosystem::app/815e22c9-8885-4360-ad85-5c33aa609e60` |
| Demo site | https://one-atlas-fyci.atlassian.net (active, expires 2027-01-30) |
| Deploy | **OK** — development env |
| Install | **OK** — Jira + Confluence on demo site (dev env, up-to-date) |
| Auth path | Headless `FORGE_EMAIL` + `FORGE_API_TOKEN` (no `forge login` / keytar) |
| Lint fixes for deploy | Skill frontmatter `name` → `delivery-context`; function key → `build-checklist-fn` (≤23 chars) |

Console: https://developer.atlassian.com/console/myapps/815e22c9-8885-4360-ad85-5c33aa609e60/monitoring/installations

## Done

- [x] Forge app scaffold under `/workspace/competitions/codegeist-contextship/`
- [x] `manifest.yml` with `rovo:agent`, `rovo:skill`, `action` ×3, stretch `rovo:mcp`
- [x] Skill `skills/delivery-context/` (`SKILL.md` + checklist/report refs)
- [x] Actions: `get-delivery-context`, `get-issue-comments`, `build-release-checklist`
- [x] Pure checklist engine `src/delivery-context.js` (shared)
- [x] Local E2E demo: `npm run demo` (SHIP-42 blocked → checklist; SHIP-7 ship-ready)
- [x] Tests: `npm test` (2 passing)
- [x] README + LICENSE (MIT) + CONTRIBUTING + `.env.example`
- [x] Static landing: `static/demo/index.html` + `sample-checklist.json`
- [x] Public GitHub repo: https://github.com/er-s-an/contextship
- [x] **Vercel demo landing live:** https://contextship.vercel.app (CLI deploy, project `contextship`; `vercel.json` → `static/demo`)
- [x] **EN Remotion explainer:** https://review-clips.vercel.app/v/contextship-explainer (Skills loaded: remotion, remotion-best-practices, remotion-markup, remotion-create)
- [x] **Forge register + deploy (development) + install on demo site** (Jira + Confluence)

## Remaining / optional

1. Smoke-test Rovo agent on demo site (Chat may still vary on free/demo tenancies).
2. Optional: `forge deploy -e production` + install production if contest judges need prod env.
3. Optional: Confluence enrichment via `read:confluence-content.summary`; Teamwork Graph stretch.
4. Optional: Vercel ↔ GitHub Login Connection for push-to-deploy (CLI redeploy still works).
5. Submit on Devpost **only** after 「交」.

## How to run (local)

```bash
cd /workspace/competitions/codegeist-contextship
npm install
npm test
npm run demo
```

Live landing: https://contextship.vercel.app

## Headless Forge auth (box)

- Skip `forge login` (keytar/Secret Service broken headless).
- Use env: `FORGE_EMAIL=er-s-an@mail.grokbot.com` and `FORGE_API_TOKEN` from `/workspace/contest-regs/atlassian-forge-api-token.txt` (mode 600; never commit/print token).
