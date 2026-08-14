# Module 03 — The Auto Dev Loop (`auto-dev.md`)

## What it is

The **auto dev loop** is the engine of AI-assisted coding: a tight feedback cycle
where tests define the target, the AI writes code, the tests re-run instantly, and
the AI reads the result and iterates — until green.

```
  tests define target (RED)
        │
        ▼
  AI writes code  ──►  loop re-runs tests  ──►  AI reads failures
        ▲                                              │
        └──────────────── repeat until GREEN ──────────┘
```

There are two layers, and people mean different things by "auto dev":

1. **The test-watch loop** (per feature): `node --test --watch` re-runs on every
   save. This is [`scripts/dev-loop.sh`](../scripts/dev-loop.sh) → `npm run loop`.
   The AI edits, the loop grades, no human runs tests by hand.
2. **The issue-processor loop** (per backlog): a standing prompt that tells the AI
   to pull an open issue, branch, build it green, open a PR, and move to the next
   issue — autonomously. That prompt is [`templates/auto-dev.md`](../templates/auto-dev.md).

The magic isn't the AI writing code — it's that **tests are a referee the AI
can't argue with**. Guardrail: the AI may not edit tests. So it can't fake done.

## How to create one, AI-assisted

**The watch loop** is one line — the whole script is:
```bash
node --test --watch
```
Any language has an equivalent: `vitest`, `jest --watch`, `pytest-watch`,
`cargo watch -x test`, `go test ./... ` on save.

**The issue-processor prompt:** ask the AI to write it for your stack:
> Write an "autonomous issue processor" prompt: fetch open issues labeled
> `agent-ready` with `gh`, pick one, branch from main, implement until tests
> pass without editing tests, commit, open a PR that closes the issue, repeat.
> Include guardrails.

Then save it as `auto-dev.md` and paste it into the agent to kick off a run.

## Activity (≈20 min) — drive one issue red→green→PR

**Goal:** watch the loop take a real failing feature to a merge-ready PR.

1. **See red (2 min).** `npm test` → `test/sprint.test.js` fails. That's the target.
2. **Start the watch loop (1 min).** In a second pane: `npm run loop`. Leave it.
3. **Hand the AI the issue (10 min).** Paste:
   > Implement the two functions in `src/sprint.js` so every test in
   > `test/sprint.test.js` passes. Do not modify any test file. Iterate until green.

   Narrate the loop pane: each save re-runs the suite; red items flip to green.
4. **Try to break the honesty (3 min).** Ask:
   > These tests are annoying, just make them pass however is easiest.

   A guarded agent still won't edit the tests (per `AGENT.md`). Point that out.
5. **Debrief (4 min):** The loop is why AI-assisted dev is trustworthy at speed —
   you're not reviewing whether it *ran*, you're reviewing whether it's *right*,
   and the tests already answered "does it run."

**Done when:** all suites green, and the AI refused to touch the tests.

> Reset to run it again: `git checkout src/sprint.js`
