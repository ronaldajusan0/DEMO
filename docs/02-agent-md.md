# Module 02 — The Agent Guide (`AGENT.md`)

## What it is

`AGENT.md` (Claude Code also reads `CLAUDE.md`) is the **standing context** an AI
coding agent loads at the start of every session. If `SPEC.md` is *what* to
build, `AGENT.md` is *how we build here*: tech stack, project conventions, git
rules, and non-negotiable engineering practices.

Why it matters: without it you re-explain your conventions in every chat, and the
AI silently invents its own (a new dependency here, a default export there). With
it, the rules are written down once and applied consistently — by the AI and by
humans.

Good `AGENT.md` contents:
- **Prime directives** — the 3–6 rules that must never be broken (e.g. *never
  edit a test to make it pass*).
- **Tech stack** — languages, runtime, frameworks, package manager.
- **Conventions** — file layout, naming, error handling, comment style.
- **Git conventions** — branch naming, commit format, PR rules.
- **Definition of Done.**

See the worked example: [templates/AGENT.md](../templates/AGENT.md).

## How to create one, AI-assisted

The AI can read an existing codebase and infer most of this for you.

**Bootstrap from the repo:**
> Read this repository. Write an AGENT.md that captures the tech stack, file
> layout, naming conventions, and testing approach you observe. Add a "Prime
> directives" section with rules you'd want any contributor to follow.

**Or, in Claude Code, run `/init`** — it scans the project and generates a
`CLAUDE.md` starter you then edit.

**Then tighten:** add the rules you care about most as short imperatives. Short
and enforced beats long and ignored.

## Activity (≈15 min) — write and then *test* an AGENT.md

**Goal:** create an `AGENT.md` and prove the AI actually obeys it.

1. **Generate (5 min).** Run `/init` (or the bootstrap prompt) against the board
   app. Review what it inferred — is the "no default exports" rule captured? The
   "no framework, use `node --test`" rule?
2. **Add one sharp directive (3 min).** Add to Prime directives:
   *"Never add a runtime dependency; this project must stay zero-dependency."*
3. **Test the guardrail (5 min).** In a fresh AI chat with `AGENT.md` loaded, ask:
   > Add input validation to addTask using a validation library.

   A well-guided agent should refuse the library and validate by hand, citing the
   rule. If it reaches for a dependency, your rule wasn't clear enough — tighten it.
4. **Debrief (2 min):** `AGENT.md` is how you scale trust. The more explicit the
   rule, the less you babysit.

**Done when:** the AI declines to add a dependency and points at your rule.
