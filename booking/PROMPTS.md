# Prompts — Regenerate This System for Any Project

Copy-paste prompts to recreate each artifact with an AI agent. Replace
`<PROJECT>` with your product idea. Run them in order.

---

## 1. SPEC.md — the contract

```
You are a senior engineer. Write a SPEC.md for <PROJECT>.
Keep this version small and buildable. Use exactly these sections:

1. Product summary — one paragraph, plain language.
2. Roles — who uses it and what each can do (table).
3. Happy path — numbered end-to-end flow for the main user.
4. Scope — what's IN, and explicitly what's OUT (backlog), so nothing gets over-built.
5. Data model — every entity with fields and types, plus the key rules.
6. Pages — route table (path, who can access, purpose).
7. API — method + path, auth required, body/query, returns (table).
8. Acceptance criteria — observable, testable rules (each must map to a future test).
9. Definition of Done.

List any ambiguity as an open question instead of guessing. Output only the file.
```

Follow-up to harden it:
```
Act as a skeptical reviewer. List every ambiguity, missing case, and place where
two engineers could build different things from this SPEC. Don't fix them — ask me
the questions. I'll answer, then you fold the answers back in.
```

---

## 2. AGENT.md — the guardrails

```
Write an AGENT.md — the standing rules an AI coding agent loads every session for
<PROJECT>. Use these sections:

0. Prime directives — 5-7 non-negotiables. MUST include:
   "Tests are the contract — never edit a test to make it pass",
   "Small changes: one issue -> one branch -> one PR",
   "Explain before large edits".
1. Tech stack — table of framework, language, DB, validation, auth, tests, package manager.
2. Security guardrails — authorization checked server-side every call, validate all
   input at the boundary, no secrets/PII in logs or git, parameterized queries,
   transactions for integrity-critical writes, rate-limit sensitive endpoints.
3. Project conventions — file layout, exports, error handling, comment style.
4. Git conventions & branching model — feature branches cut FROM `develop`, PRs
   target `develop`, `main` is release-only, NEVER commit directly to main/develop,
   NO self-merge (agent opens PR and stops), conventional commits, PR body ends
   "Closes #<issue>".
5. Definition of Done.

Base the stack and security rules on the domain in SPEC.md. Output only the file.
```

---

## 3. Sprints — the backlog as JSON

```
Read SPEC.md. Slice it into sprints. Output one JSON file per sprint named
sprints/sprint-<n>.json with this exact shape:

{
  "milestone": "Sprint <n> — <theme>",
  "description": "<one line: what this sprint delivers>",
  "issues": [
    {
      "area": "<subsystem>",
      "title": "<imperative task title>",
      "labels": ["agent-ready", "sprint-<n>", "<area>"],
      "body": "## Context\nSource: SPEC.md §<x>\n\n## Task\n<what to build, name the files>\n\n## Acceptance criteria\n- [ ] <observable rule 1>\n- [ ] <observable rule 2>\n- [ ] tests green, no test files edited"
    }
  ]
}

Rules: 3-5 issues per sprint, each atomic and testable. Sprint 1 is the smallest
useful foundation. Put non-essential work in later sprints. Every acceptance
criterion must be something a test could check.
```

---

## 4. auto-dev.md — the automation prompt

```
Write an auto-dev.md: a prompt that makes an AI agent process GitHub issues
autonomously for <PROJECT>. It must instruct the agent to:

- Preflight: confirm `gh api user` owns `origin`; if not, STOP and say run bootstrap.sh.
- Fetch open issues labeled "agent-ready" with `gh issue list ... --json number,title,body`.
- Pick one; assess if it's clear and unblocked.
- If clear: branch from `develop` (never main), implement until acceptance criteria
  pass WITHOUT editing tests, enforce the AGENT.md guardrails, run the test suite,
  commit (conventional), push, and open a PR with `--base develop` whose body ends
  "Closes #<number>". Then STOP on that issue — do NOT self-merge; a human reviews.
- If unclear: comment the blocking question, label "needs-info", move on.
- Repeat until no agent-ready issues remain.
- Include a "Guardrails (hard stops)" section: never weaken tests, never bypass
  authorization/validation, never log PII, one issue per PR, never push to main/develop.
```

---

## 5. Reflect issues on GitHub — the automation

This is what makes sprints show up as issues in the repo and close themselves.

**Issue-creation script:**
```
Write a bash script scripts/create-issues.sh that reads a sprints/sprint-<n>.json
file (shape above) and, via the `gh` CLI:
- creates the GitHub Milestone named by "milestone" if it doesn't exist (gh api),
- ensures each label exists,
- creates one issue per entry, attached to the milestone, with its labels.
Make it IDEMPOTENT: fetch existing issue titles once and skip any that already
exist, so re-runs and CI never duplicate. Support `--all` (all sprint files) and
`--dry-run`. Add a guard: refuse to run if the gh user doesn't own `origin`
(unless in CI). Portable for macOS bash 3.2 (no mapfile).
```

**Auto-seed on push (GitHub Action):**
```
Write .github/workflows/seed-sprints.yml. On push to the default branch (paths:
sprints/*.json) and on workflow_dispatch, run scripts/create-issues.sh --all with
permissions issues:write, using the built-in GITHUB_TOKEN. This makes every sprint
appear as Milestones + Issues automatically when someone pushes their own repo.
```

**Auto-close issues on merge (GitHub Action):**
```
Write .github/workflows/close-issues-on-develop.yml. On pull_request closed &
merged into `develop`, parse closing keywords (Closes/Fixes/Resolves #N) from the
PR title and body and close those issues with `gh issue close`, permissions
issues:write. This closes issues when work merges into develop, before release to main.
```

**Clone-and-go bootstrap:**
```
Write bootstrap.sh: for someone who cloned this template, create THEIR OWN GitHub
repo with `gh repo create --source=. --remote=origin --push`, rename the template
remote to `upstream`, and push main + develop. After it, origin is theirs so all
issues/PRs/Actions run under their account, never the template author's.
```

---

## Order to run

1. Prompt 1 → `SPEC.md`  (then harden)
2. Prompt 2 → `AGENT.md`
3. Prompt 3 → `sprints/*.json`
4. Prompt 4 → `auto-dev.md`
5. Prompt 5 → `scripts/create-issues.sh`, the two workflows, `bootstrap.sh`
6. `bash bootstrap.sh` → your repo + issues appear
7. Paste `auto-dev.md` into your agent → it builds the issues
```
