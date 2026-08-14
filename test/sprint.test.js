// SPRINT-2 spec — the target for the AI + auto dev loop.
// These are RED until src/sprint.js is implemented. Keep them as the source
// of truth: the loop is "done" when every one of these passes.

import { test } from "node:test";
import assert from "node:assert/strict";
import { createBoard, addTask, moveTask } from "../src/board.js";
import { prioritizedTasks, sprintProgress } from "../src/sprint.js";

test("prioritizedTasks orders high -> medium -> low", () => {
  const board = createBoard();
  addTask(board, "low one", { priority: "low" });
  addTask(board, "high one", { priority: "high" });
  addTask(board, "medium one", { priority: "medium" });
  const titles = prioritizedTasks(board).map((t) => t.title);
  assert.deepEqual(titles, ["high one", "medium one", "low one"]);
});

test("prioritizedTasks keeps insertion order within a priority", () => {
  const board = createBoard();
  addTask(board, "high A", { priority: "high" });
  addTask(board, "high B", { priority: "high" });
  const titles = prioritizedTasks(board).map((t) => t.title);
  assert.deepEqual(titles, ["high A", "high B"]);
});

test("sprintProgress counts done vs remaining", () => {
  const board = createBoard();
  const a = addTask(board, "a");
  addTask(board, "b");
  addTask(board, "c");
  addTask(board, "d");
  moveTask(board, a.id, "done");
  const p = sprintProgress(board);
  assert.equal(p.total, 4);
  assert.equal(p.done, 1);
  assert.equal(p.remaining, 3);
  assert.equal(p.percentComplete, 25);
});

test("sprintProgress treats an empty board as 100% complete", () => {
  const p = sprintProgress(createBoard());
  assert.equal(p.total, 0);
  assert.equal(p.percentComplete, 100);
});
