# Clone → Your Repo → Issues Appear → Run

How anyone reproduces this whole demo in their **own** GitHub repo. The sprints
become GitHub issues **automatically** on first push — no manual issue creation.

## 0. Prerequisites

- [`gh` CLI](https://cli.github.com) — `gh auth login`
- Node 18+ and `pnpm` (the run script installs pnpm if missing)

## 1. Clone this repo

```bash
git clone https://github.com/ronaldajusan0/DEMO.git bookit
cd bookit
```

## 2. Make it YOUR repo — one command

```bash
bash bootstrap.sh                 # or: bash bootstrap.sh my-repo-name --public
```

This creates a new repo under **your** account, repoints `origin` to it, pushes
`main` + `develop`, and keeps the template as `upstream`. After it, every push,
PR, issue, and Action runs in **your** repo — never the author's.

> **Why this is required:** a plain clone leaves `origin` pointing at the
> template author's repo. Pushing then fails with
> `Permission … denied … 403` (you don't own it). `bootstrap.sh` fixes that.
> The seed + build scripts also refuse to run until you own the repo, so you
> can't accidentally push to the author.

<details><summary>Manual equivalent (if you skip bootstrap.sh)</summary>

```bash
git remote rename origin upstream
gh repo create bookit --private --source=. --remote=origin --push
git push origin refs/remotes/upstream/develop:refs/heads/develop
```
</details>

## 3. Issues appear automatically

On that first push to `main`, the **Seed sprints & issues** GitHub Action runs
and creates every milestone + issue from `booking/sprints/*.json`. It's
idempotent, so it never duplicates.

Check it:
```bash
gh issue list                 # your sprint backlog, already there
gh run list --workflow "Seed sprints & issues"
```

Nothing appearing? Trigger it by hand: repo → **Actions** → *Seed sprints &
issues* → **Run workflow**. (Or locally: `bash booking/scripts/create-issues.sh --all`.)

## 4. Run the app — same experience as the demo

```bash
bash booking/run.sh
# → switches to develop, installs, boots http://localhost:3000
```

## 5. Run the workflow (build an issue with AI)

Paste [booking/auto-dev.md](auto-dev.md) into your AI coding agent. It branches
from `develop`, builds an issue green, opens a PR (`Closes #N`) targeting
`develop`, and stops for your review. Merge the PR → the **close-on-develop**
Action auto-closes the issue.

---

## What's automated for a fresh cloner

| They do | They get automatically |
| --- | --- |
| Push to their new repo | All sprints created as Milestones + Issues (Seed Action) |
| Merge a feature PR into `develop` | The linked issue auto-closes (Close-on-develop Action) |
| `bash booking/run.sh` | Correct branch + deps + dev server, identical to the demo |
