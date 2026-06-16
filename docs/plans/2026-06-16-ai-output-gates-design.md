# ai-output-gates Design

## Goal

Create a public, local-first package that prevents AI-generated artifacts from being treated as done before they pass artifact-specific quality gates.

The package must not create a human review UI. The intended loop is:

1. Inspect the artifact.
2. Classify or accept the declared artifact type.
3. Run a dedicated quality gate.
4. Emit a machine-readable verdict and a repair brief.
5. If the verdict fails, feed the repair brief back into the generating agent.
6. Repeat until the gate passes or the maximum number of repair rounds is reached.

## Package Name

`ai-output-gates`

## Core Principle

This is not a universal "is it good?" oracle. It is a set of small, strict, artifact-specific failure detectors.

The first version should catch common AI failure modes:

- vague, generic content
- missing audience or purpose
- repetition and filler
- structural gaps
- unverified claims
- code that cannot prove it works
- LPs that lack a first-screen promise, CTA, trust, and mobile evidence

## Artifact Types

### A: Common Package

Initial supported gates:

- `book`
- `prose`
- `landing-page`
- `readme`
- `code`

Each gate returns:

- `status`: `pass`, `review`, or `fail`
- `score`: 0-100
- `findings`: structured issues with severity, location, and repair advice
- `repair.md`: a concise brief to give back to an AI agent
- `SUMMARY.md`: readable summary for logs

### B: Book Gate

The book gate is stricter than generic prose. It checks:

- table-of-contents shape
- chapter count
- repeated headings
- repeated paragraphs
- thin chapters
- generic filler phrases
- unsupported strong claims
- inconsistent reader promise
- missing introduction or conclusion

It should also support page-like inspection for Markdown or extracted PDF text by splitting content into sections and chunks.

### C: Landing Page Gate

The landing-page gate checks:

- first-screen promise
- CTA visibility in text/HTML
- trust signals
- offer clarity
- mobile viewport evidence hints
- missing metadata
- vague business copy
- repeated decorative sections

For HTML files, it should parse enough structure locally to inspect title, headings, links, buttons, forms, images, and text density.

## AI Review Phase

The package should be designed around AI review, but the v0.1 implementation must not depend on a hosted LLM API.

Instead it emits:

- `review-packet.md`: compact artifact summary and exact reviewer instructions
- `repair.md`: precise repair prompt for a generating agent
- `gate-report.json`: structured facts that another agent can consume

This lets Codex, Claude Code, or another agent perform the "AI reviews and repairs" loop without hard-wiring one provider.

Future versions can add an optional `--review-command` or `--repair-command` hook that calls a user-provided command such as `codex exec`, but v0.1 should avoid hidden network calls and stay local-first.

## CLI Design

```bash
ai-output-gates run <target> --type auto --out .ai-output-gates
ai-output-gates run manuscript.md --type book --max-rounds 0
ai-output-gates run landing.html --type landing-page
ai-output-gates explain .ai-output-gates/gate-report.json
```

`run` should:

1. Read the target file or directory.
2. Infer type when `--type auto`.
3. Run the selected gate.
4. Write output files to the report directory.
5. Exit non-zero when the status is `fail`.

`explain` should print the highest-priority findings from an existing report.

## Output Files

```text
.ai-output-gates/
  gate-report.json
  SUMMARY.md
  repair.md
  review-packet.md
  evidence/
```

## Quality Rules

- No external LLM/API calls in v0.1.
- No hidden telemetry.
- No secrets.
- Node built-ins only for the first version.
- Tests must cover all five gates.
- The package must run through GitHub npm exec.
- Publishing must include README, MIT license, topics, and v0.1.0 release.

## Non-Goals

- No guarantee that all artifacts become excellent.
- No human review UI.
- No browser automation in v0.1.
- No PDF rendering in v0.1; accept extracted text or Markdown first.
- No automatic modification of user artifacts in v0.1.

## Success Criteria

- Running the CLI on deliberately weak artifacts produces `fail` or `review`.
- Running it on minimal acceptable fixtures produces `pass`.
- `repair.md` gives specific instructions that an AI agent can act on.
- `review-packet.md` is concise enough to feed into a second AI pass.
- `npm run check` passes.
- `npm pack --dry-run` is clean.
- GitHub `npm exec --package github:ban10yuu/ai-output-gates#main -- ai-output-gates --help` works after publish.
