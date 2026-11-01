# Contributing to ContextShip

## Hard rules (contest)

- Soft is already **REGISTERED** on Devpost as `er-s-an`.
- **Do not Submit** on Devpost without the owner's explicit 「交」.
- English-only materials (README, UI strings, demo copy).
- Zero entry fee / no card. Do not invent Atlassian or cloud credentials.

## Local development

```bash
npm install
npm test
npm run demo
```

No `.env` secrets are required for the mock demo path.

## Forge (Atlassian account)

```bash
npm install -g @forge/cli@latest   # needs Node ^22.23.4+
forge login
forge register                     # replaces placeholder app id in manifest.yml
forge deploy
forge install                      # Jira
# Rovo missing on free site? Use a Forge demo site:
forge site provision
forge install --demo-site
```

`forge lint` / deploy need a working Forge login + OS secret store (or CI token). On headless boxes without Secret Service, prefer running Forge on a machine where `forge login` succeeds.

## Pull requests

Keep the agent **read-only** unless a write action is intentionally designed and scoped. Prefer pure logic in `src/delivery-context.js` so the local demo stays authoritative.
