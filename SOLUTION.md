# Answer key (facilitator only)

Reference implementation of `src/sprint.js`. Use only if you need to hand-drive
when the AI stalls. Keep this closed during the demo.

```js
const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

export function prioritizedTasks(board) {
  // stable sort: Array.prototype.sort is stable in Node, so equal-priority
  // tasks keep insertion order automatically.
  return [...board.tasks].sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
  );
}

export function sprintProgress(board) {
  const total = board.tasks.length;
  const done = board.tasks.filter((t) => t.status === "done").length;
  const remaining = total - done;
  const percentComplete = total === 0 ? 100 : Math.round((done / total) * 100);
  return { total, done, remaining, percentComplete };
}
```

Verify: `npm test` → all suites green.
