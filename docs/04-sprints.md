# Module 04 — Sprints

## What it is

A **sprint** is a short, fixed timebox (commonly 1–2 weeks) in which a team ships
a small, agreed slice of the spec. It's how you turn a big product (`SPEC.md`)
into a rhythm of shippable chunks instead of a single giant push.

The pieces:
- **Backlog** — every wanted story, unordered-ish, prioritized.
- **Sprint goal** — one sentence: what's true at the end that wasn't before.
- **Sprint backlog** — the few stories pulled in for *this* sprint.
- **Definition of Done** — the bar every story clears (tests green, reviewed, merged).
- **Retro** — what to keep/change next sprint.

With an AI agent, sprints matter *more*, not less: they keep the AI aimed at a
small, well-defined batch instead of "build the whole app," which is where agents
wander.

See [SPRINT.md](../SPRINT.md) (the board) and
[templates/sprint-issues.json](../templates/sprint-issues.json) (the sprint's
stories in a machine-readable form you can turn into GitHub issues).

## How to create one, AI-assisted

**Slice the spec into a sprint:**
> From this SPEC.md, propose Sprint 1: a sprint goal plus 2–4 user stories that
> form the smallest useful slice. For each story give a title and acceptance
> criteria. Keep anything non-essential in the backlog.

**Turn stories into issues (machine-readable):**
> Output those stories as a JSON array where each item has: title, labels
> (["agent-ready","sprint-1"]), and a body with context + acceptance criteria.

That JSON feeds Module 06 (create GitHub issues from it with one script).

## Activity (≈20 min) — plan and cut a sprint

**Goal:** go from a spec to a concrete, agent-ready sprint backlog.

1. **State the goal (3 min).** Look at [templates/SPEC.md](../templates/SPEC.md).
   Write one sentence: *"By end of sprint, a user can list tasks by priority and
   see sprint % complete."*
2. **Pull stories with AI (5 min).** Use the "Slice the spec" prompt. You should
   get roughly SP2-1 (prioritized list) and SP2-2 (progress) — already the demo
   feature.
3. **Write the Definition of Done (3 min).** Reuse the one in
   [SPRINT.md](../SPRINT.md): tests green, no test edits, no regressions, merged via PR.
4. **Emit issue JSON (5 min).** Use the second prompt. Compare to
   [templates/sprint-issues.json](../templates/sprint-issues.json).
5. **Debrief (4 min):** A sprint is a promise scoped small enough to keep. The
   backlog is where everything else waits without derailing the AI.

**Done when:** you have a one-line goal, 2–4 stories with acceptance criteria, and
a Definition of Done. Bonus: it's valid JSON ready for Module 06.
