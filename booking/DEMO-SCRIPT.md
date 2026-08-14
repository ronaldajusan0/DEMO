# BookIt Demo — 30-Minute Talk Script

A minute-by-minute script for presenting the AI-assisted development flow using
the BookIt booking website. **Bold = say it. `code` = run/show it.**

Setup before you start:
- VSCode open on `DEMO/booking/`, files ready: SPEC.md, AGENT.md, auto-dev.md.
- Browser tab on the repo Issues + Milestones: `github.com/ronaldajusan0/DEMO/issues`.
- A terminal pane. AI coding agent (Claude Code) panel open.

---

## 0:00–0:03 — Hook (3 min)

> **"Everyone's using AI to write code. The hard part isn't getting AI to write
> code — it's getting it to write the *right* code, safely, without babysitting
> every line. Today I'll show you the setup that makes that work: four plain
> Markdown files and GitHub. No magic tools."**

> **"Our example is BookIt — an appointment booking website. Customers book time
> slots with providers. I'll take it from an idea to live, tracked work an AI
> agent can build autonomously — in about 25 minutes."**

Show the `booking/` folder tree. **"Four files run this: SPEC, AGENT, the
sprints, and auto-dev. Let's walk them."**

---

## 0:03–0:08 — SPEC.md: the contract (5 min)

Open `SPEC.md`.

> **"First question: what are we building? Precisely? This is the spec — the
> contract. If I hand an AI a vague idea, it builds *a* thing, confidently, and
> it's usually wrong. A good spec removes the guessing."**

Scroll to §5 data model and §7 API.

> **"Notice what's here: the data model, the API endpoints, and — this matters —
> acceptance criteria."** Scroll to §8. **"'No double-booking. Two customers
> can't grab the same slot — the second gets a 409.' That's not a wish, it's a
> testable rule. The AI builds against these."**

Scroll to §4 scope.

> **"And just as important — what's *out* of scope. Payments, reviews, SMS. I
> list them so the AI does NOT wander off building them. Scope discipline is half
> the battle with an eager agent."**

> **Takeaway:** *"The spec is what to build. AI-assisted tip: I didn't hand-write
> all of this — I described BookIt to the AI, it drafted the spec, then I asked
> it to poke holes and list every ambiguity. Two rounds and it's solid."**

---

## 0:08–0:13 — AGENT.md: the guardrails (5 min)

Open `AGENT.md`.

> **"The spec is *what*. This is *how we build here* — the rules the AI loads
> every single session so I never re-explain them."**

Point at §0 Prime directives.

> **"Non-negotiables. 'Tests are the contract — never edit a test to make it
> pass.' That one line is why I can trust an AI at speed: it can't fake done by
> weakening the test."**

Point at §2 security guardrails.

> **"BookIt handles personal data and calendars, so the guardrails are real:
> authorization checked on the server every time, validate all input, no secrets
> or personal info in logs, and bookings created inside a database transaction so
> two people can't double-book. The AI must obey these — they're written down
> once, applied everywhere."**

> **Takeaway:** *"AGENT.md is how you scale trust. The more explicit the rule,
> the less you babysit. Claude Code reads this — or a CLAUDE.md — automatically."**

---

## 0:13–0:19 — Sprints as GitHub issues (6 min)

Open `sprints/sprint-1.json`.

> **"A spec is big. You don't build it in one go — you slice it into sprints. A
> sprint is a small, shippable batch. Here's Sprint 1: foundation, auth, the
> service catalog, availability. Sprint 2 is the booking flow itself."**

> **"Each of these is one atomic task with its own acceptance criteria. And I
> want them tracked where the team lives — GitHub. So I turn this JSON into real
> GitHub issues with one script."**

Show the command (already run, so just point at it):

```bash
bash booking/scripts/create-issues.sh --all
```

Switch to the browser — **Milestones** tab.

> **"Each sprint became a GitHub *Milestone* — that's the sprint. Sprint 1: four
> open issues. Sprint 2: four open. As we finish work, these bars march to
> 100%."**

Click into **Sprint 1**, open issue **#2 (Auth)**.

> **"Every issue has the context, the task, and a checklist of acceptance
> criteria — and it's labeled `agent-ready`. That label means: an AI can pick
> this up and run with it. Which is exactly what happens next."**

---

## 0:19–0:27 — auto-dev.md: the automation (8 min)

Open `auto-dev.md`.

> **"This is the loop that ties it together. It's a prompt I paste into the AI
> agent. It says: fetch the open `agent-ready` issues, pick one, make a branch,
> build it until the tests pass — without editing the tests — then open a pull
> request that closes the issue. Then do the next one."**

Point at the guardrails section.

> **"Notice the hard stops: never weaken a test, never skip authorization, never
> log personal data, one issue per pull request. The automation runs inside the
> same guardrails from AGENT.md."**

Now run it live. In the AI agent, paste `auto-dev.md` (or:) 

> **"Process issue #1 following auto-dev.md."**

While it works, narrate:

> **"Watch what it's doing: it read the issue, created a branch, it's writing the
> code, running the tests. I'm not typing code. My job now isn't to check that it
> *ran* — the tests already answered that. My job is to review whether it's
> *right*."**

When it opens a PR, open the PR in the browser.

> **"There it is — a pull request. See the body: 'Closes #1.' Those two words are
> the magic — GitHub will link the PR to the issue and close it automatically on
> merge."**

Show the diff briefly.

> **"I read the diff. AI wrote it — I own it. Review is never optional."**

---

## 0:27–0:29 — Close the issue from GitHub (2 min)

Merge the PR (`Merge` button, or `gh pr merge --squash`).

Refresh issue #1.

> **"Merged — and issue #1 closed itself, linked to the PR. Back on the
> Milestone…"** switch to Sprint 1 milestone **"…it's now three open instead of
> four. The sprint just moved. Repeat this across the issues and the milestone
> hits 100% — that's a shipped sprint, and I close the milestone."**

---

## 0:29–0:30 — Recap (1 min)

> **"That's the whole system, and none of it was a special tool — it's Markdown
> and GitHub:"**
>
> - **SPEC.md** — what to build.
> - **AGENT.md** — the rules and guardrails the AI always follows.
> - **Sprints → GitHub issues + milestones** — the work, sliced and tracked.
> - **auto-dev.md** — the AI builds it, one issue to one PR, and GitHub closes
>   the issue on merge.
>
> **"You give the AI a clear contract, firm guardrails, and small tracked tasks —
> and it ships, while you stay in the loop at review. That's AI-assisted
> development."**

---

## Backup / Q&A ammo

- *"What if the AI gets it wrong?"* → It can't merge without a reviewed PR;
  `main` is always protected. The tests + acceptance criteria catch most of it.
- *"Does it work for any stack?"* → Yes — swap SPEC/AGENT contents. The process
  is the product, not the language.
- *"What if an issue is unclear?"* → auto-dev.md tells the agent to comment a
  question and label `needs-info` instead of guessing.
- If the live agent stalls: fall back to showing an already-opened PR, or close
  an issue by hand: `gh issue close 1 --comment "shipped"`.
