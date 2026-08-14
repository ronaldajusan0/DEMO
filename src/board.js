// A minimal in-memory task board.
// This module is DONE — it ships in the demo as "last sprint's work"
// so the board has real behavior for the new feature to build on.

let nextId = 1;

export function createBoard() {
  return { tasks: [] };
}

export function addTask(board, title, { priority = "medium" } = {}) {
  const task = {
    id: nextId++,
    title,
    priority,
    status: "todo", // todo | doing | done
  };
  board.tasks.push(task);
  return task;
}

export function moveTask(board, id, status) {
  const task = board.tasks.find((t) => t.id === id);
  if (!task) throw new Error(`No task with id ${id}`);
  task.status = status;
  return task;
}

export function tasksByStatus(board, status) {
  return board.tasks.filter((t) => t.status === status);
}
