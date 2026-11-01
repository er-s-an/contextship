# Contributing

ContextShip is a Codegeist 2026 Forge app: a Rovo agent that turns a Jira ticket into a release checklist. Local tests and the demo need no Atlassian account.

## Local demo

```bash
npm install
npm test
npm run demo            # SHIP-42, Blocked
npm run demo -- SHIP-7  # docs-only, ship-ready
npm run demo:json
```

No secrets are required. Forge sign-in is `forge login`, not a token in `.env`. See `.env.example`.

## Forge: register, deploy, demo site

Prerequisites: Node.js **≥ 22.23.4**, `@forge/cli` 15.x, and an Atlassian account. Sign in with the CLI. Do not commit tokens, passwords, or a personal app id.

```bash
npm install -g @forge/cli@latest
forge login
forge register          # replaces the placeholder app id in manifest.yml
forge lint
forge deploy
```

`manifest.yml` ships with the placeholder id `ari:cloud:ecosystem::app/00000000-0000-4000-8000-000000000001`. **`forge register` replaces it** and sets the logged-in account as owner. Run register once, on the contest account. A second `forge register` creates a new id and disconnects the earlier environments. Leave the placeholder in shared commits until the owner registers.

A free developer site often has no Rovo Chat. A Forge demo site includes Jira, Confluence, Rovo, and sample data. Deploy first (deploy does not provision a site), then install there:

```bash
forge site provision
forge deploy
forge install --demo-site
```

`forge install -d` is the same flag. `--demo-site` uses the active demo site and cannot be combined with `--site`. The CLI can provision a site during install when none exists. For a specific developer site:

```bash
forge install --site <your-site>.atlassian.net --product Jira
```

Then open **Rovo Chat**, select **ContextShip**, and ask what is blocking the current issue.

## Devpost

**Do not Submit** on Devpost without explicit owner approval (「交」). The Devpost account `er-s-an` is already registered. Do not submit the project, and do not create Atlassian credentials for this repo.
