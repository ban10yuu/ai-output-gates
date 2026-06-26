# Launch Assets

Use these manually. Do not mass-post, auto-post, or repeat identical text across accounts. Pick one angle, run the command once, and post with a real note about what happened.

## GitHub Description

Local quality gates for AI-generated books, landing pages, READMEs, prose, and code.

## One-Liner

`ai-output-gates` is a local CLI that rejects weak AI-generated artifacts and writes the `repair.md` prompt the next agent should use.

## Best Manual Channels

- X: agent builders, Codex/Claude Code users, indie hackers shipping AI-generated sites or books
- LinkedIn: founders and operators worried about AI work reaching clients too early
- Hacker News: "Show HN" only if you include the local-first and no-hidden-API angle
- Reddit: use sparingly in relevant threads; lead with the problem, not the link

## X Drafts

### Draft 1

I built a tiny local CLI for a problem I keep hitting with agents:

AI drafts can look done before they have passed any human-quality check.

`ai-output-gates` catches weak books, landing pages, READMEs, prose, and code, then writes the `repair.md` prompt the next agent should use.

GitHub: https://github.com/ban10yuu/ai-output-gates

### Draft 2

New OSS experiment:

`draft -> gate -> repair.md -> agent fixes -> gate again`

No API key, no telemetry, no human review UI.

The goal is boring but useful: reject the obvious AI failures before a client, reader, or user sees them.

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
- A local quality gate between AI drafts and human review

## Comment Reply Angles

- It is not trying to replace human taste. It catches the stuff a human should not have to be the first to notice.
- It makes no hidden LLM calls. The repair loop only runs if you provide the repair command.
- The useful artifact is `repair.md`: a concrete prompt for the next agent pass.

## Short Reply For Comments

The point is not to replace human taste. It catches obvious "a human should not have to be the first reviewer" failures and writes a repair prompt for the next agent pass.
