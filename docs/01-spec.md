# Module 01 — The Spec (`SPEC.md`)

## What it is

A **spec** is the contract: what the software must do, precisely enough that
someone (or an AI) can build it without guessing. It defines scope, the data
model, behavior, and acceptance criteria — and, just as importantly, what is
**out of scope** so the AI doesn't over-build.

An AI agent with a good spec builds the right thing. An AI agent without one
builds *a* thing — often the wrong one, confidently.

A good spec has:
- **Product summary** — one paragraph, plain language.
- **Scope** — in and, explicitly, out.
- **Data model** — the shapes/types.
- **Behavior** — a table of inputs → outputs/rules.
- **Acceptance criteria** — how you know it's done.

See the worked example: [templates/SPEC.md](../templates/SPEC.md).

## How to create one, AI-assisted

The AI is great at turning a rough idea into a structured spec, then poking
holes in it. Two prompts:

**Draft it:**
> I want to build <one-line idea>. Write a SPEC.md with these sections:
> product summary, scope (in and out), data model, behavior table, acceptance
> criteria. Keep this version tiny. List anything ambiguous as an open question
> instead of guessing.

**Harden it (the valuable step):**
> Act as a skeptical engineer. Read this SPEC and list every ambiguity, missing
> case, and place where two readers could build different things. Don't fix
> them — just ask me the questions.

Then you answer, the AI folds answers back in. Two or three rounds → a spec an
agent can build against.

## Activity (≈20 min) — write a spec from scratch

**Goal:** produce a `SPEC.md` for a small feature and feel how it removes ambiguity.

1. **Pick a scope (2 min).** Use the board app. Idea: *"add task tags so tasks
   can be filtered by tag."*
2. **Draft with AI (5 min).** Use the "Draft it" prompt above. Save output to a
   scratch file `SPEC-tags.md`.
3. **Harden with AI (5 min).** Use the "Harden it" prompt. Answer at least 3 of
   its questions. Watch the spec get sharper.
4. **Add a behavior table + acceptance criteria (5 min).** Every row should be
   something you could later write a test for.
5. **Debrief (3 min):** Could a stranger build exactly this from your spec? What
   would they still have to guess? That gap is what specs exist to close.

**Done when:** your `SPEC-tags.md` has a behavior table where every row is
testable, and an explicit "out of scope" list.
