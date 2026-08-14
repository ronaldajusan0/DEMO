# Module 05 — Git Workflow

## What it is

A **git workflow** is the agreed path a change takes from an idea to `main`. It
keeps `main` always-shippable and makes every change reviewable. The common shape
(GitHub Flow):

```
  main  ─────●────────────────────────●─────►   (always green, always shippable)
              \                       /
   feature     ●──●──●  commit(s)   ● merge via Pull Request
   branch      └ branch from main   └ review + CI here
```

Steps:
1. **Branch** off `main` for one issue: `git switch -c feat/<slug>`.
2. **Commit** small, meaningful changes with clear messages.
3. **Push** the branch, **open a Pull Request**.
4. **Review** the diff (a human, and/or an AI review pass).
5. **Merge** to `main`; the PR **closes the issue**.

Some teams add a long-lived `develop` branch (that's what the HeyPay screenshots
show: `sprint-8-9-on-develop`, branch from `develop` not `main`). Same idea, one
extra integration layer. Start with GitHub Flow; add `develop` only if you need it.

Why it matters with AI: the branch is the AI's sandbox, and the **PR is where a
human stays in the loop**. The AI can move fast because nothing reaches `main`
without review.

Conventions live in [templates/AGENT.md](../templates/AGENT.md) §3.

## How to create/adopt one, AI-assisted

The AI is fluent in git. Let it do the plumbing, you make the decisions.

- **Branch + commit:** *"Create a branch feat/priority-sort, stage src/sprint.js,
  and write a conventional-commit message describing the change."*
- **PR:** *"Open a PR with gh; body should summarize the change and end with
  Closes #<n>."*
- **Explain, don't just run:** *"Before you merge, show me git diff and git log
  --oneline --graph and explain what will land on main."*
- **Stuck?** *"I have a merge conflict in src/sprint.js — walk me through
  resolving it and explain each hunk."*

## Activity (≈20 min) — ship a change through the full flow

**Goal:** take the sprint feature from branch to merged, the way a team would.

1. **Branch (2 min).** `git switch -c feat/priority-sort`
2. **Build it (5 min).** Run the Module 03 loop until `npm test` is green.
3. **Review before commit (3 min).** `git diff` — read it aloud. *You* own AI code.
4. **Commit (2 min).**
   ```
   git add src/sprint.js
   git commit -m "feat(sprint): add prioritizedTasks and sprintProgress"
   ```
5. **PR + merge (5 min).**
   - With a GitHub remote: `git push -u origin HEAD && gh pr create` (body ends
     `Closes #<n>`), then merge in the GitHub UI or `gh pr merge`.
   - No remote: simulate locally —
     `git switch main && git merge --no-ff feat/priority-sort`.
6. **Show the history (3 min).** `git log --oneline --graph` — the merge commit is
   the story of the change.

**Done when:** the feature is on `main`, `npm test` green there, and (if using
GitHub) the PR closed the issue automatically. See Module 06 for the issue side.
