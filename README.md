# ai-output-gates

Catch weak AI-generated work before a client, reader, or user sees it.

`ai-output-gates` is a local CLI that rejects common AI failure modes, writes a concrete repair brief, and can loop that brief back into your agent workflow.

```bash
npm exec --yes --package github:ban10yuu/ai-output-gates#main -- ai-output-gates run manuscript.md --type book
```

No API key. No telemetry. No human review UI. Runs locally.

## What it catches

- A "book" that is really a short blob with no chapter shape
- A landing page with no H1, no CTA, no proof, or broken mobile basics
- A README that does not explain value or show a copyable command
- A code repo with source files but no tests, no check script, or secret-looking strings
- Generic prose with no audience, no examples, and repeated filler

## Quick demo

Run the intentionally bad landing page:

```bash
npm exec --yes --package github:ban10yuu/ai-output-gates#main -- ai-output-gates run examples/weak-landing.html --type landing-page
```

Expected shape:

```text
FAIL 2/100 landing-page
Report: .ai-output-gates/gate-report.json
Repair brief: .ai-output-gates/repair.md
```

The generated `repair.md` tells the producing agent exactly what to fix. `visual-inspection.md` tells an AI reviewer what to look at before a human sees the artifact.

## Why this exists

AI often ships the first draft as if it were final. Humans do not work that way: they inspect, reject, repair, and inspect again.

`ai-output-gates` adds that missing inspection layer. It does not promise perfect taste. It catches common AI failure modes and writes a repair brief that can be fed back into Codex, Claude Code, or another generating agent.

## Install

Run from GitHub:

```bash
npm exec --yes --package github:ban10yuu/ai-output-gates#main -- ai-output-gates --help
```

Or clone locally:

```bash
git clone https://github.com/ban10yuu/ai-output-gates.git
cd ai-output-gates
npm install
npm run check
```

## Usage

```bash
ai-output-gates run <target> --type auto --out .ai-output-gates
ai-output-gates run manuscript.md --type book
ai-output-gates run landing.html --type landing-page
ai-output-gates loop manuscript.md --type book --max-rounds 3 --repair-command "<your-agent-repair-command>"
ai-output-gates explain .ai-output-gates/gate-report.json
```

Try the intentionally weak example:

```bash
ai-output-gates run examples/weak-book.md --type book --out .ai-output-gates/weak-book
ai-output-gates run examples/weak-landing.html --type landing-page --out .ai-output-gates/weak-landing
sed -n '1,120p' .ai-output-gates/weak-book/repair.md
```

Supported gates:

- `book`
- `prose`
- `landing-page`
- `readme`
- `code`

## Output

```text
.ai-output-gates/
  gate-report.json
  SUMMARY.md
  repair.md
  review-packet.md
  visual-inspection.md
```

Use `repair.md` as the next prompt for the agent that produced the weak artifact. The package is designed for this loop:

```text
draft -> gate -> repair.md -> agent fixes -> gate again
```

`visual-inspection.md` is the "look at it before a human sees it" packet for an AI reviewer. `loop` automates the repair cycle when you provide a repair command. The command receives environment variables such as `AI_OUTPUT_GATES_REPAIR`, `AI_OUTPUT_GATES_REPORT`, `AI_OUTPUT_GATES_VISUAL_PACKET`, `AI_OUTPUT_GATES_TARGET`, and `AI_OUTPUT_GATES_ROUND`. The package itself still makes no hidden LLM/API calls.

## Why star it

Star this if you are building agent workflows and want a tiny, inspectable quality gate between "the model generated it" and "a human has to catch the mistake."

## Status

Alpha. The first releases are intentionally local-first and heuristic-based. `loop` can call a repair command you provide, but the package itself makes no hidden LLM/API calls.

## License

MIT
