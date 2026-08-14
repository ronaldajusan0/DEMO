# BookIt — Booking Website Demo

The AI-assisted development artifacts for **BookIt**, an appointment booking
website. Use these to demo the whole flow: spec → guardrails → sprint issues on
GitHub → autonomous build.

## The files

| File | What it is |
| --- | --- |
| [SPEC.md](SPEC.md) | The contract — product, roles, data model, pages, API, acceptance criteria |
| [AGENT.md](AGENT.md) | Guardrails — tech stack, security rules, git conventions the AI must obey |
| [auto-dev.md](auto-dev.md) | Paste-in prompt that makes an AI agent process issues autonomously |
| [sprints/sprint-1.json](sprints/sprint-1.json) | Sprint 1 issues (foundation, auth, catalog, availability) |
| [sprints/sprint-2.json](sprints/sprint-2.json) | Sprint 2 issues (slots, booking, cancel, my-bookings) |
| [scripts/create-issues.sh](scripts/create-issues.sh) | Pushes a sprint to GitHub as a **Milestone + Issues** |

## Sprints live on GitHub

Each sprint JSON maps to a **GitHub Milestone** (the sprint) containing labeled
**Issues** (the tasks). That's what you close during the demo.

### One-time setup

```bash
gh auth login          # authenticate the GitHub CLI (browser)
```

### Push the sprints to GitHub

```bash
# preview first
bash booking/scripts/create-issues.sh booking/sprints/sprint-1.json --dry-run

# create Sprint 1 milestone + issues
bash booking/scripts/create-issues.sh booking/sprints/sprint-1.json

# or push every sprint at once
bash booking/scripts/create-issues.sh --all
```

Verify:
```bash
gh issue list
gh api repos/$(gh repo view --json nameWithOwner -q .nameWithOwner)/milestones --jq '.[].title'
```
Or open the repo → **Issues** and **Milestones** tabs in the browser.

## Demo script (≈15 min)

1. **Show the spec + guardrails (3 min).** Open [SPEC.md](SPEC.md) and
   [AGENT.md](AGENT.md). "This is what to build and the rules the AI must follow."
2. **Create the sprint on GitHub (3 min).** Run `create-issues.sh` for Sprint 1.
   Open the **Milestone** and its issues in the browser — the sprint is now live.
3. **Kick off automation (5 min).** Paste [auto-dev.md](auto-dev.md) into your AI
   coding agent. It picks issue #1, branches, builds, and opens a PR that says
   `Closes #1`.
4. **Close a sprint issue from GitHub (2 min).** Merge the PR → the issue
   **auto-closes** and drops out of the Milestone's open count. Repeat, and the
   Milestone marches to 100%.
5. **Close the sprint (2 min).** When every issue is done, close the Milestone in
   the GitHub UI. That's a shipped sprint.

## Closing issues from GitHub — the three ways

1. **Via PR (best):** PR body contains `Closes #<n>` → merging auto-closes it.
2. **CLI:** `gh issue close <n> --comment "shipped"`.
3. **Browser:** open the issue → **Close issue** (for won't-do / duplicates).
