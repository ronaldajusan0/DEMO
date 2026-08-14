# Sprint 2 — Board

**Sprint goal:** ship prioritization + progress reporting so a team can see what to work on next and how close the sprint is to done.

## Board

| Story | Status | Notes |
| --- | --- | --- |
| SP2-1 As a user I can list tasks sorted by priority | **In sprint** | `prioritizedTasks()` in `src/sprint.js` |
| SP2-2 As a lead I can see sprint % complete | **In sprint** | `sprintProgress()` in `src/sprint.js` |
| SP2-3 Due dates on tasks | Backlog | next sprint |
| SP2-4 Persist board to disk | Backlog | next sprint |
| SP2-5 Assignees + WIP limits | Backlog | icebox |

## Definition of Done

- All tests in `test/sprint.test.js` green.
- No changes to the test files (tests are the contract).
- Existing `board.test.js` still green (no regressions).
- Merged to `main` via PR.

## Last sprint (done)

- SP1: create board, add/move tasks, filter by status → `src/board.js`.
