// Passing tests for the shipped board module.
// Green from the start — proves the harness works before the demo begins.

import { test } from "node:test";
import assert from "node:assert/strict";
import { createBoard, addTask, moveTask, tasksByStatus } from "../src/board.js";

test("addTask puts a task in the todo column", () => {
  const board = createBoard();
  const t = addTask(board, "Write docs");
  assert.equal(t.status, "todo");
  assert.equal(tasksByStatus(board, "todo").length, 1);
});

test("moveTask changes status", () => {
  const board = createBoard();
  const t = addTask(board, "Ship it");
  moveTask(board, t.id, "doing");
  assert.equal(tasksByStatus(board, "doing").length, 1);
  assert.equal(tasksByStatus(board, "todo").length, 0);
});

test("moveTask throws on unknown id", () => {
  const board = createBoard();
  assert.throws(() => moveTask(board, 999, "done"), /No task with id 999/);
});
