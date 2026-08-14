# DEMO — AI-Assisted Development Workshop Kit

A hands-on kit for demoing how a team ships software with an AI coding agent.
Six concepts, each with **what it is + how to make it (AI-assisted) + a
standalone activity**. Runs on a tiny zero-dependency task-board app so every
activity is concrete.

Start here → **[docs/00-overview.md](docs/00-overview.md)**

## The six modules

| # | Module | What you'll demo |
| --- | --- | --- |
| 01 | [Spec](docs/01-spec.md) | Write a `SPEC.md` contract the AI builds against |
| 02 | [AGENT.md](docs/02-agent-md.md) | The rules the AI loads every session — and proving it obeys them |
| 03 | [Auto dev loop](docs/03-auto-dev.md) | Tests-as-referee; AI drives red → green |
| 04 | [Sprints](docs/04-sprints.md) | Slice the spec into a shippable, agent-ready backlog |
| 05 | [Git workflow](docs/05-git-workflow.md) | Branch → commit → PR → merge, keeping `main` safe |
| 06 | [GitHub issues](docs/06-github-issues.md) | Create, work, and **close issues from GitHub** |

Each module is self-contained (15–25 min). Or run them in order for one
end-to-end story: **spec → rules → sprint → issues → auto dev loop → merge**.

## Templates (copy these into your own project)

| File | Purpose |
| --- | --- |
| [templates/SPEC.md](templates/SPEC.md) | The contract — what to build |
| [templates/AGENT.md](templates/AGENT.md) | Standing rules for the AI (a.k.a. `CLAUDE.md`) |
| [templates/auto-dev.md](templates/auto-dev.md) | Paste-in "autonomous issue processor" prompt |
| [templates/sprint-issues.json](templates/sprint-issues.json) | A sprint's stories, ready to become GitHub issues |
| [templates/github-issue.md](templates/github-issue.md) | Issue body template |

## The codebase (the thing you build during activities)

| Path | Role |
| --- | --- |
| `src/board.js` + `test/board.test.js` | Shipped, green — last sprint's work |
| `src/sprint.js` | **The demo target** — stubs that throw |
| `test/sprint.test.js` | **Red** — the spec the AI implements against |
| `scripts/dev-loop.sh` | The auto dev loop (`npm run loop`) |
| `scripts/create-issues.sh` | Turn `sprint-issues.json` into real GitHub issues |

## Quick start

```bash
npm test          # sprint tests are RED — the demo target
npm run loop      # auto dev loop: watches files, re-runs tests on save
```

Needs Node 18+ (built-in test runner). For Module 06 you also need the `gh` CLI
(`gh auth login`) and, ideally, `jq`.

## Facilitator note

For a 30-minute condensed run, use **[FACILITATOR.md](FACILITATOR.md)** — a
minute-by-minute script for one feature, spec → merge.
