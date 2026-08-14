# AGENT.md — BookIt Coding Agent Guide

> Operating manual for the AI agent building BookIt. Read with `SPEC.md` (what to
> build). This file defines the **tech stack, conventions, and non-negotiable
> guardrails**. BookIt handles personal data and calendars; treat correctness,
> authorization, and privacy as first-class, not afterthoughts.

---

## 0. Prime directives

1. **Tests are the contract.** Never edit or weaken a test to make it pass.
2. **Authorization on the server, every time.** Never trust the client for role
   or ownership; check on every API call.
3. **Validate all input at the boundary** (Zod) before it touches the database.
4. **No secrets in client code, logs, or git.** Env vars only; `.env` is ignored.
5. **Small, reviewable changes.** One issue → one branch → one PR.
   Branch from `develop`; PRs target `develop`; never touch `main` directly and
   never merge your own PR (see §4).
6. **Leave the tree green.** Run the test suite before every commit; no regressions.
7. **Explain before large edits.** State the plan, then act.

## 1. Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js (App Router) — Server Components, Route Handlers |
| Language | TypeScript (`strict: true`) |
| Database | PostgreSQL via Prisma |
| Validation | Zod at every API boundary |
| Auth | Session-based (httpOnly cookie); passwords hashed with bcrypt/argon2 |
| Tests | Vitest (unit) + Playwright (e2e happy path) |
| Package manager | pnpm |

Pin to current stable releases; `pnpm audit` must be clean before shipping.

## 2. Security guardrails (BookIt handles personal data)

- **AuthZ:** enforce role + resource ownership server-side. A customer may read
  only their own appointments; a provider only their own services/calendar.
- **AuthN:** hash passwords (never store plaintext); httpOnly + Secure + SameSite
  cookies; regenerate session on login.
- **Input:** validate and normalize every field with Zod; reject unknown keys.
- **Injection:** use Prisma parameterized queries only; never string-build SQL.
- **PII:** never log emails, names, or session tokens. No PII in error messages.
- **Booking integrity:** create appointments inside a DB transaction with a
  uniqueness/overlap check so two requests can't grab the same slot (return 409).
- **Rate-limit** auth and booking endpoints.
- **Secrets:** all via env; provide `.env.example` with placeholders only.

## 3. Project conventions

- `src/app` routes, `src/lib` domain logic, `src/lib/db` Prisma access.
- Pure domain functions (slot generation, overlap checks) live in `src/lib` and
  are unit-tested without a database.
- Named exports; no default exports except Next.js page/route files.
- Times stored in UTC; converted at the edge. Durations in minutes.
- Comments explain *why*, not *what*.

## 4. Git conventions & branching model

**Branch hierarchy — work never lands on `main` directly.**

```
  main     ← protected. Release-only. Receives merges from `develop`, nothing else.
    ▲
  develop  ← integration branch. All feature work merges HERE first, via PR.
    ▲
  feat/*   ← one branch per issue, cut FROM `develop`.
```

- **Never commit or push directly to `main` or `develop`.** Both are updated
  only through reviewed pull requests.
- **Cut every feature branch from `develop`**, not `main`:
  `git switch develop && git pull && git switch -c feat/<slug>`.
- **Feature PRs target `develop`** (`--base develop`), never `main`.
- **`main` only ever receives `develop`** via a release PR, when a sprint is done.
- **No instant / self-merge.** A PR must be reviewed and its checks green before
  merge. The agent opens the PR and stops — it does **not** merge its own PR.
- Branch names: `feat/<slug>`, `fix/<slug>`, `chore/<slug>`.
- Conventional commits: `feat(booking): prevent double-booking`.
- PR body ends with `Closes #<issue-number>`.

## 5. Definition of Done

Acceptance criteria pass with tests · input validated · authorization enforced
server-side · no PII leaks · `pnpm test` green · diff reviewed · merged via a PR
that closed its issue.
