# AI-Assisted Development — Demo Kit

A workshop that shows how a team ships software with an AI coding agent. Every
piece can be demoed **on its own** (15–25 min each) or run start-to-finish as
one story.

## The mental model

The AI is a fast, literal junior engineer. It's only as good as the context and
guardrails you give it. This kit is those guardrails, made of plain files:

```
  SPEC.md      what to build        (the contract)
  AGENT.md     how we build         (rules, stack, conventions)
  auto-dev.md  the loop that builds (paste-in agent prompt)
     │
     ▼
  Sprint   = a slice of the spec, cut into GitHub issues
  Issue    = one atomic, testable task
  Git flow = branch → commit → PR → merge, closing the issue
```

Nothing here is a special tool. It's Markdown files + git + the `gh` CLI + an AI
chat. That's the whole point: **the process is portable.**

## The modules

| # | Module | Question it answers |
| --- | --- | --- |
| 01 | [Spec](01-spec.md) | What are we building, precisely? |
| 02 | [AGENT.md](02-agent-md.md) | What rules must the AI always follow? |
| 03 | [Auto dev loop](03-auto-dev.md) | How does the AI build without hand-holding? |
| 04 | [Sprints](04-sprints.md) | How do we slice the spec into shippable chunks? |
| 05 | [Git workflow](05-git-workflow.md) | How does a change safely reach `main`? |
| 06 | [GitHub issues](06-github-issues.md) | Create, work, and close a task on GitHub. |

## The codebase used for every activity

A tiny task-board library (`src/`, `test/`). One feature is deliberately
**unbuilt** (`src/sprint.js`, tests red) so the AI has something real to do.

```bash
npm test        # sprint tests RED — the demo target
npm run loop    # auto dev loop: watches files, re-runs tests on save
```

## Suggested order for a live demo

1. Show the **spec** (01) — "here's the contract."
2. Show **AGENT.md** (02) — "here are the rules the AI obeys."
3. Cut a **sprint** (04) — "here's this week's slice."
4. Create **issues** on GitHub (06) — "here are the atomic tasks."
5. Run the **auto dev loop** (03) — "watch the AI close one."
6. Ship via **git workflow** (05) — "branch → PR → merge → issue closed."

Each module page is self-contained if you'd rather teach just one.
