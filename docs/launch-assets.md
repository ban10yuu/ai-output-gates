# Launch Assets

Use these manually. Do not mass-post, auto-post, or repeat identical text across accounts.

## GitHub Description

Catch weak AI-generated work before a client, reader, or user sees it.

## One-Liner

`ai-output-gates` is a local CLI that checks AI-generated books, prose, landing pages, READMEs, and code before they reach a human.

## X Drafts

### Draft 1

I built a tiny local CLI for a problem I keep hitting:

AI drafts often look "done" before they have passed a human-quality check.

`ai-output-gates` catches weak books, landing pages, READMEs, prose, and code, then writes a repair brief for the agent.

GitHub: https://github.com/ban10yuu/ai-output-gates

### Draft 2

New OSS experiment:

`draft -> gate -> repair.md -> agent fixes -> gate again`

No API key, no telemetry, no human review UI.

The goal is simple: stop weak AI-generated work before a client, reader, or user sees it.

https://github.com/ban10yuu/ai-output-gates

### Draft 3

I do not want AI agents to ship first drafts as final work.

So I made `ai-output-gates`: artifact-specific checks for books, LPs, READMEs, prose, and code.

It produces `repair.md` and `visual-inspection.md` so another agent can fix and inspect before humans spend attention.

https://github.com/ban10yuu/ai-output-gates

## LinkedIn Draft

AI-generated work has a strange failure mode: it can look finished before it has gone through the inspection step a human would naturally do.

I built a small open-source CLI called `ai-output-gates` to make that inspection step explicit.

It checks generated artifacts by type:

- books
- prose
- landing pages
- READMEs
- code repos

When something fails, it writes a concrete `repair.md` for the producing agent and a `visual-inspection.md` packet for an AI reviewer. The package itself runs locally and makes no hidden LLM/API calls.

The loop is:

`draft -> gate -> repair.md -> agent fixes -> gate again`

GitHub: https://github.com/ban10yuu/ai-output-gates

## Hacker News / Reddit Title Ideas

- Show HN: ai-output-gates, local quality gates for AI-generated artifacts
- I built a CLI that rejects weak AI-generated books, landing pages, READMEs, and code
- A local "quality gate" between AI drafts and human review

## Short Reply For Comments

The main idea is not to replace human taste. It is to catch obvious "a human would not ship this" failures before the human has to spend attention on them.
