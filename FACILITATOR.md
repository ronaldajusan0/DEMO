# Facilitator run sheet — 30 minutes

Two-pane setup: **left** = editor + AI assistant, **right** = terminal running the auto dev loop. Everyone watches red turn green.

> Works for both audiences: new-to-AI folks follow the flow; experienced folks get the guardrail talking points in the callouts.

## Before you start (2 min, do it once)

```bash
npm test        # show sprint.test.js RED — this is the target
npm run loop    # start the auto dev loop in the right-hand pane, leave it running
```

Point out: `board.test.js` is green, `sprint.test.js` is red. **Red is the spec.**

---

## 0:00 — Frame the sprint (3 min)

- Open [SPRINT.md](SPRINT.md). Two stories pulled in: SP2-1, SP2-2.
- Point at **Definition of Done**: tests green, no test edits, no regressions, merged via PR.
- Message: *the sprint backlog decides what we build; the tests decide when it's done.*

## 0:03 — Git: start the work on a branch (3 min)

```bash
git switch -c feat/sprint-2-prioritization
```

- Talk track: never build on `main`; a branch is a safe sandbox and the unit of review.
- `git status` — clean tree, new branch. This is where the AI will work.

## 0:06 — AI-assisted: the auto dev loop (12 min)

Prompt the assistant (paste this):

> Implement the two functions in `src/sprint.js` so every test in
> `test/sprint.test.js` passes. Do not modify any test file. Run the tests
> and iterate until green.

Narrate what happens in the loop pane:

1. AI reads the failing tests — **the tests are the prompt.**
2. AI writes `prioritizedTasks`, saves → loop re-runs → some green.
3. AI writes `sprintProgress`, saves → loop re-runs → all green.

> **Callout (experienced devs):** the tests are the guardrail. The AI can't
> "cheat" by editing them — DoD forbids it. This is how you keep an AI honest:
> a spec it must satisfy but cannot move.

> **Callout (new devs):** notice you never ran tests by hand. The loop is the
> feedback. AI writes, loop grades, AI reads the grade, repeats.

If it goes green fast, ask a follow-up to show iteration:
> Add a JSDoc comment to each function explaining the ordering rule.

## 0:18 — Review the diff before committing (4 min)

```bash
git diff
```

- Read the diff **out loud**. Message: AI wrote it, *you* own it. Review is not optional.
- Optional: run `/code-review` or a reviewer pass here.

## 0:22 — Git: commit + PR + merge (6 min)

```bash
git add src/sprint.js
git commit    # see the message below
git switch main
git merge --no-ff feat/sprint-2-prioritization
```

Suggested commit message:

```
feat(sprint): add prioritizedTasks and sprintProgress

Implements SP2-1 and SP2-2. Sorts tasks high>medium>low keeping
insertion order, and reports sprint completion percentage.
```

- If a remote/GitHub is set up, do a real PR instead of a local merge:
  `git push -u origin feat/sprint-2-prioritization` then `gh pr create`.
- Show `git log --oneline --graph` — the merge commit tells the story.

## 0:28 — Retro (2 min)

- Sprint goal met? Tests green, feature merged. Update [SPRINT.md](SPRINT.md).
- The loop: **backlog → branch → tests-as-spec → AI + auto loop → review → PR → merge.**
- Next sprint pulls SP2-3 from the backlog. Repeat.

---

## If something breaks

- Loop not re-running: needs Node 18+ (`node --version`). Restart `npm run loop`.
- AI edited a test: reset it — `git checkout test/sprint.test.js` — and re-prompt.
- Answer key is in [SOLUTION.md](SOLUTION.md) if you need to hand-drive.
