# ai-output-gates

Artifact-specific quality gates for AI-generated books, prose, landing pages, READMEs, and code.

```bash
npm exec --yes --package github:ban10yuu/ai-output-gates#main -- ai-output-gates run manuscript.md --type book
```

No API key. No telemetry. No human review UI. Runs locally.

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
```

Use `repair.md` as the next prompt for the agent that produced the weak artifact. The package is designed for this loop:

```text
draft -> gate -> repair.md -> agent fixes -> gate again
```

`loop` automates that cycle when you provide a repair command. The command receives environment variables such as `AI_OUTPUT_GATES_REPAIR`, `AI_OUTPUT_GATES_REPORT`, `AI_OUTPUT_GATES_TARGET`, and `AI_OUTPUT_GATES_ROUND`. The package itself still makes no hidden LLM/API calls.

## Status

Alpha. The first releases are intentionally local-first and heuristic-based. `loop` can call a repair command you provide, but the package itself makes no hidden LLM/API calls.

## License

MIT
