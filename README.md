# Sprint Demo

A tiny task-board library (Node, zero dependencies) built to **demo AI-assisted development** in ~30 minutes. It shows three things at once:

- **Sprints** — a backlog of user stories, one pulled into this sprint ([SPRINT.md](SPRINT.md)).
- **The auto dev loop** — tests run continuously; the AI drives red → green ([scripts/dev-loop.sh](scripts/dev-loop.sh)).
- **Git workflow** — branch → commit → PR → merge, narrated as you go.

## Layout

| Path | Role |
| --- | --- |
| `src/board.js` | Shipped last sprint. Done, tested, green. |
| `src/sprint.js` | **This sprint's feature.** Stubs that throw — the demo target. |
| `test/board.test.js` | Green from the start (proves the harness works). |
| `test/sprint.test.js` | **Red.** The spec the AI implements against. Don't edit. |
| `scripts/dev-loop.sh` | The auto dev loop (test watcher). |
| [SPRINT.md](SPRINT.md) | Sprint board + backlog. |
| [FACILITATOR.md](FACILITATOR.md) | Minute-by-minute run sheet. |
| [SOLUTION.md](SOLUTION.md) | Answer key (facilitator only). |

## Quick start

```bash
npm test          # run once — sprint.js tests are RED
npm run loop      # auto dev loop — watches files, re-runs on save
```

No install step. Needs Node 18+ (uses the built-in test runner).
# DEMO
