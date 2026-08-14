# auto-dev.md — BookIt Autonomous Issue Processor

You are an autonomous GitHub issue processor for BookIt. Follow this loop
continuously until no eligible issues remain.

> Paste this into an AI coding agent to run the sprint automatically, one issue
> at a time, guarded by tests and the rules in `AGENT.md`. Read `SPEC.md` and
> `AGENT.md` first.

## Preamble — read for context

- `SPEC.md` — what to build (the contract).
- `AGENT.md` — tech stack, security guardrails, git conventions.
- `README.md` — setup.

## Workflow

1. **Fetch open, ready issues (lowest number / current sprint first):**

   ```bash
   REPO=$(git remote get-url origin | sed 's/.*github.com[:/]//' | sed 's/.git$//') && \
   gh issue list --repo "$REPO" --label "agent-ready" --state open \
     --json number,title,body,labels,milestone --limit 20
   ```

2. **Pick one issue. Assess it:**
   - Is the task clearly described with acceptance criteria?
   - Can you identify the files to touch?
   - Does it depend on an earlier, still-open issue? If so, do that one first.

3. **If CONFIRMED (clear and unblocked):**
   - Branch from **`develop`** (never `main`):

     ```bash
     git switch develop && git pull --ff-only && \
     git switch -c feat/issue-<number>
     ```

   - Implement until acceptance criteria pass. **Do not edit tests to pass.**
   - Enforce the `AGENT.md` guardrails: server-side authZ, Zod validation, no
     secrets/PII in logs, parameterized queries, transaction on booking.
   - Run `pnpm test` — must be green.
   - Commit (conventional), push, and open a PR **targeting `develop`** that
     closes the issue:

     ```bash
     git push -u origin HEAD && \
     gh pr create --base develop --title "feat: <title>" \
       --body "Implements #<number>.

     Closes #<number>"
     ```

   - **Then STOP on this issue.** Do NOT merge your own PR. A human reviews and
     merges into `develop`. Move on to the next issue.

4. **If UNCLEAR or BLOCKED:** comment the specific blocking question on the issue,
   add label `needs-info`, and move on. Do not guess on auth, money, or data models.

5. Repeat until no `agent-ready` issues are open.

## Guardrails (hard stops)

- Never weaken or delete a test to go green.
- Never bypass authorization or validation "to save time."
- Never print or log emails, names, passwords, or session tokens.
- One issue per branch per PR — no batching unrelated work.
- **Never commit/push directly to `main` or `develop`.** Branch from `develop`.
- **Never merge your own PR.** Open it targeting `develop` and stop; a human merges.
- `main` is release-only — it receives `develop`, never a feature branch.
- If `pnpm test` is red after your change, you are not done.

## Definition of Done (per issue)

Acceptance criteria pass with tests · guardrails honored · `pnpm test` green ·
PR merged · issue auto-closed by `Closes #<number>`.
