# Module 06 — GitHub Issues (create · work · close)

## What it is

A **GitHub issue** is one unit of work with an address: a number (`#12`), a title,
a body, labels, and a thread. Issues are how a sprint's stories become atomic,
trackable, assignable tasks. In an AI-assisted flow, an issue is the **prompt with
a paper trail** — the AI reads it, does it, and the closing PR links back to it, so
anyone can see *why* a change happened.

The lifecycle:
```
  open issue ──► branch ──► commit(s) ──► PR "Closes #N" ──► merge ──► issue auto-closes
```

## Setup (once)

You need the `gh` CLI, authenticated, and the project on GitHub.

```bash
gh --version                 # install from https://cli.github.com if missing
gh auth login                # authenticate (browser)

# If this repo isn't on GitHub yet, create + push it:
gh repo create taskboard-demo --private --source=. --remote=origin --push
```

Verify: `gh repo view --web` opens it in the browser.

## Create issues

**One at a time (from the CLI):**
```bash
gh issue create \
  --title "prioritizedTasks: sort high > medium > low" \
  --body-file templates/github-issue.md \
  --label "agent-ready,sprint-2"
```

**In bulk (from the sprint JSON):**
```bash
bash scripts/create-issues.sh templates/sprint-issues.json --dry-run   # preview
bash scripts/create-issues.sh templates/sprint-issues.json             # for real
```
This reads [templates/sprint-issues.json](../templates/sprint-issues.json) and
creates one GitHub issue per entry — your sprint backlog, now live.

**AI-assisted:** let the agent draft and file them:
> Read SPEC.md and SPRINT.md. Create GitHub issues with gh for each sprint-2
> story: clear title, body with acceptance criteria, labels agent-ready,sprint-2.

**From the browser:** repo → **Issues** tab → **New issue** → paste
[templates/github-issue.md](../templates/github-issue.md), add labels, submit.

## Work an issue

```bash
gh issue list                          # see the backlog
gh issue view 1                        # read one
gh issue develop 1 --checkout          # create + switch to a branch linked to issue #1
# ...build it green (Module 03)...
git commit -am "feat(sprint): implement prioritizedTasks"
git push -u origin HEAD
```

**AI-assisted:** *"Read issue #1 with `gh issue view 1`, implement it against the
tests without editing them, then push a branch."*

## Close an issue — from GitHub

Three ways, from most to least automatic:

1. **Via a PR (recommended).** Put `Closes #1` in the PR body. When the PR merges,
   GitHub **auto-closes** issue #1 and links them.
   ```bash
   gh pr create --title "feat: prioritized tasks" --body "Implements #1

   Closes #1"
   gh pr merge --squash --delete-branch     # merging closes #1
   ```
   The magic words GitHub recognizes: `Closes`, `Fixes`, `Resolves` + `#N`.

2. **Manually from the CLI:** `gh issue close 1 --comment "Shipped in #<pr>."`

3. **From the browser:** open the issue → **Close issue** button (use for
   won't-do / duplicates). Comment why before closing.

## Activity (≈25 min) — full issue round-trip on GitHub

**Goal:** create a real issue, do the work, and watch merging the PR close it.

1. **Setup (5 min).** `gh auth login`; push the repo with `gh repo create` (above).
2. **Create the backlog (3 min).**
   `bash scripts/create-issues.sh templates/sprint-issues.json` →
   `gh issue list`. You now have live issues. Open one with `gh issue view 1 --web`.
3. **Start the work (2 min).** `gh issue develop 1 --checkout` — branch linked to #1.
4. **Build it green (7 min).** Run the auto dev loop (Module 03) until `npm test` passes.
5. **PR that closes it (5 min).**
   ```bash
   git commit -am "feat(sprint): implement prioritizedTasks (#1)"
   git push -u origin HEAD
   gh pr create --title "feat: prioritized tasks" --body "Closes #1"
   ```
   Open the PR in the browser (`gh pr view --web`) — see the linked issue.
6. **Merge and watch it close (3 min).** `gh pr merge --squash --delete-branch`.
   Refresh the issue: **it's closed automatically**, linked to the PR.

**Done when:** issue #1 shows **Closed**, linked to a merged PR, and `main` is green.

> No GitHub access in the room? Do steps 3–6 locally: skip `gh`, use
> `git switch -c`, merge with `--no-ff`, and close the issue by hand later. The
> concept is identical; only the hosting differs.
