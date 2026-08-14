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

## 2. Make it YOUR repo

You need your own GitHub repo so the issues + Actions run under your account.

```bash
# creates a new repo under your account and pushes the current branch
gh repo create bookit --private --source=. --remote=origin --push

# push the other branches too (the app lives on develop)
git push -u origin main
git push -u origin develop
```

> This repoints `origin` from mine to yours and uploads everything you cloned —
> code, docs, sprints, workflows. Your teammates get the exact same thing when
> they clone *your* repo.

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
