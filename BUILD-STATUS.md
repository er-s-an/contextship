# ContextShip — Codegeist 2026 Build Status

Updated: 2026-11-02 ~02:42 Asia/Shanghai

## Contest gates

| Gate | Status |
| --- | --- |
| Soft registered (`er-s-an`) | Done — https://codegeist2026.devpost.com/ |
| Zero fee / no card | OK |
| English-only materials | OK |
| Devpost **Submit** | **NOT done** — wait for user 「交」 |
| Demo video (review-clips) | Later — code path first |

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

## Blockers (need user / Atlassian)

1. **Atlassian account + `forge login`** — not available / Secret Service missing on this headless box (`forge lint` fails keytar). User must `forge login` on a machine with a secret store (or CI token), then `forge register` (replace placeholder app id), `forge deploy`, `forge install` (prefer `--demo-site` if free site lacks Rovo).
2. **Rovo on free developer sites** — community reports Chat/agents may be missing; use Forge demo site (`forge site provision`).
3. **GitHub ↔ Vercel auto-link** — CLI create succeeded; GitHub Login Connection missing on the Vercel team (`Failed to link er-s-an/contextship`). Redeploys via `npx vercel deploy --prod` from this box still work. Optional: connect GitHub in Vercel dashboard for push-to-deploy.
4. Videos later via https://review-clips.vercel.app.

## How to run (now)

```bash
cd /workspace/competitions/codegeist-contextship
npm install
npm test
npm run demo
```

Live landing: https://contextship.vercel.app

## Next steps

1. User: Atlassian `forge login` → `forge register` → deploy/install on demo site.
2. Capture ≤5 min demo via review-clips once cloud agent path works.
3. Optional: Confluence enrichment via existing `read:confluence-content.summary` scope; Teamwork Graph stretch.
4. Optional: add Vercel ↔ GitHub Login Connection for auto deploys.
5. Submit on Devpost **only** after 「交」.

## Forge auth path (2026-11-02)

- Headless box: skip `forge login` keytar; use `FORGE_EMAIL` + `FORGE_API_TOKEN` env vars.
- Creating Atlassian account with `er-s-an@mail.grokbot.com` for API token (self-register authorized).
