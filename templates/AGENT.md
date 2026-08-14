# AGENT.md — TaskBoard Coding Agent Guide

> Operating manual for the AI agent building TaskBoard. Read with `SPEC.md`
> (what to build). This file defines the **tech stack, project conventions,
> and engineering best practices** that are non-negotiable.

> **This is a TEMPLATE.** Rules here are examples — replace with your project's.
> An `AGENT.md` (or `CLAUDE.md`) is the standing context the AI loads every
> session so you don't re-explain conventions each time.

---

## 0. Prime directives

1. **Tests are the contract.** Never edit a test to make it pass. Make the code satisfy the test.
2. **Small, reviewable changes.** One issue → one branch → one PR.
3. **No new dependencies** without saying why in the PR description.
4. **Explain before large edits.** State the plan, then act.
5. **Leave the tree green.** Run `npm test` before every commit; no regressions.

## 1. Tech stack

| Layer | Choice |
| --- | --- |
| Runtime | Node.js 18+ |
| Language | JavaScript (ESM, `"type": "module"`) |
| Tests | Node built-in test runner (`node --test`) — no framework install |
| Package manager | npm |

## 2. Project conventions

- Source in `src/`, tests in `test/`, one test file per source module.
- Named exports only; no default exports.
- Throw `Error` with a specific message on invalid input (see `SPEC.md` §4).
- Keep functions pure where possible — no hidden global state beyond the id counter.
- Comments explain *why*, not *what*.

## 3. Git conventions

- Branch per issue: `feat/<slug>`, `fix/<slug>`, `chore/<slug>`.
- Conventional commit subjects: `feat(scope): summary`.
- PR body ends with `Closes #<issue-number>`.
- Never commit directly to `main`.

## 4. Definition of Done

A change is done when: acceptance criteria pass, no test files were edited,
`npm test` is fully green, the diff is reviewed, and it merged via a PR that
closed its issue.
