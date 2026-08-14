# SPEC.md — TaskBoard Application Specification

> **Audience:** a code-expert AI agent building TaskBoard end to end.
> **Read `AGENT.md`** for engineering rules and conventions.
> This document defines scope, data model, behavior, and API precisely
> enough to implement without guessing.

> **This is a TEMPLATE + worked example.** Keep the shape (numbered sections,
> concrete data model, explicit scope, acceptance criteria). Swap the product.

---

## 1. Product summary

TaskBoard is a tiny task-tracking library and CLI. A user creates a board,
adds tasks with a priority, moves tasks across columns (`todo → doing → done`),
and reads back a prioritized list and a sprint progress report.

It has **no** database and **no** network in this version — an in-memory board
so the demo stays fast and every behavior is unit-testable.

## 2. Scope for this version

- In scope: create board, add task, move task, filter by status,
  prioritized listing, sprint progress percentage.
- Out of scope (backlog): persistence, due dates, assignees, WIP limits,
  a web UI. These are named so the agent does **not** build them.

## 3. Data model

```
Task {
  id: number            // auto-increment, starts at 1
  title: string
  priority: "high" | "medium" | "low"   // default "medium"
  status: "todo" | "doing" | "done"     // default "todo"
}

Board {
  tasks: Task[]
}
```

## 4. Behavior (the contract)

| Function | Input | Output / rule |
| --- | --- | --- |
| `createBoard()` | — | empty board |
| `addTask(board, title, {priority})` | title, optional priority | new Task in `todo`, returned |
| `moveTask(board, id, status)` | id, status | updates status; throws `No task with id {id}` if missing |
| `tasksByStatus(board, status)` | status | tasks in that column |
| `prioritizedTasks(board)` | — | tasks sorted `high → medium → low`; equal priority keeps insertion order |
| `sprintProgress(board)` | — | `{ total, done, remaining, percentComplete }`; empty board = 100% |

## 5. Acceptance criteria

- Every function in §4 behaves exactly as stated.
- `percentComplete` is an integer 0–100, `done/total*100` rounded.
- All unit tests pass; no test files are modified to make them pass.
- No new runtime dependencies.

## 6. Definition of Done

Feature is done when its acceptance criteria pass in the auto dev loop,
the diff is reviewed, and it is merged to `main` via a pull request that
closes its GitHub issue.
