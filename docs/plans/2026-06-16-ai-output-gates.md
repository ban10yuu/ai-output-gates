# ai-output-gates Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build and publish `ai-output-gates`, a local-first CLI that runs artifact-specific quality gates and emits repair instructions for AI repair loops.

**Architecture:** Implement a TypeScript CLI with Node built-ins only. Gates share a common scoring/reporting model and produce `gate-report.json`, `SUMMARY.md`, `repair.md`, and `review-packet.md`. The first release supports `book`, `prose`, `landing-page`, `readme`, and `code`.

**Tech Stack:** Node.js 20+, TypeScript, `node:test`, GitHub CLI.

---

### Task 1: Package Scaffold

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `.gitignore`
- Create: `LICENSE`
- Create: `README.md`

**Steps:**
1. Add package metadata for `ai-output-gates`.
2. Add `bin` pointing to `./dist/src/cli.js`.
3. Add scripts: `build`, `test`, `check`, `prepare`.
4. Add README with GitHub npm exec usage and local-first promise.
5. Commit scaffold.

**Verify:**
- `node --check` is not applicable yet.
- `npm install` should create `package-lock.json`.

### Task 2: Core Types And Utilities

**Files:**
- Create: `src/types.ts`
- Create: `src/io.ts`
- Create: `src/text.ts`
- Test: `test/text.test.ts`

**Steps:**
1. Define `ArtifactType`, `GateStatus`, `Finding`, `GateReport`, and `GateContext`.
2. Implement file/directory reading helpers.
3. Implement text helpers: word count, heading extraction, paragraph extraction, repeated paragraph detection, filler phrase detection.
4. Add tests for text helpers.
5. Run `npm run check`.
6. Commit.

### Task 3: Gate Engine

**Files:**
- Create: `src/gates.ts`
- Create: `src/report.ts`
- Test: `test/gates.test.ts`

**Steps:**
1. Implement score calculation from findings.
2. Implement `runGate(context)` dispatcher.
3. Implement report writers for JSON, summary, repair brief, and review packet.
4. Add tests for report shape and status thresholds.
5. Run `npm run check`.
6. Commit.

### Task 4: Artifact-Specific Gates

**Files:**
- Create: `src/gate-book.ts`
- Create: `src/gate-prose.ts`
- Create: `src/gate-landing-page.ts`
- Create: `src/gate-readme.ts`
- Create: `src/gate-code.ts`
- Test: `test/artifact-gates.test.ts`

**Steps:**
1. Implement `book` checks: chapter structure, repeated headings, repeated paragraphs, thin sections, filler, unsupported claims, missing intro/conclusion.
2. Implement `prose` checks: audience, concrete examples, filler, repeated paragraphs, strong unsupported claims.
3. Implement `landing-page` checks: H1/title, promise, CTA, trust, forms/links, metadata, vague copy.
4. Implement `readme` checks: first-screen promise, install/use, examples, license, status, verification.
5. Implement `code` checks: package scripts, tests, build commands, source/test presence, secret-looking strings.
6. Add weak and acceptable fixtures in tests.
7. Run `npm run check`.
8. Commit.

### Task 5: CLI

**Files:**
- Create: `src/cli.ts`
- Test: `test/cli.test.ts`

**Steps:**
1. Implement `ai-output-gates --help`.
2. Implement `run <target> --type <type|auto> --out <dir>`.
3. Implement `explain <gate-report.json>`.
4. Ensure non-zero exit on `fail`.
5. Add CLI tests using temporary directories.
6. Run `npm run check`.
7. Commit.

### Task 6: Dogfood And Public-Ready Checks

**Files:**
- Modify: `README.md`
- Generated during verification: `.ai-output-gates/` only if ignored

**Steps:**
1. Run the CLI against its own README as `readme`.
2. Run the CLI against a weak book fixture and confirm `repair.md`.
3. Run `npm pack --dry-run`.
4. Run secret scan.
5. Confirm no `.github/workflows`.
6. Commit any doc fixes.

### Task 7: Publish

**Files:**
- None unless publish docs need a tweak.

**Steps:**
1. Confirm `ban10yuu/ai-output-gates` does not exist.
2. Create public GitHub repo and push.
3. Add topics: `ai`, `quality-gate`, `codex`, `claude-code`, `cli`, `typescript`, `local-first`.
4. Create `v0.1.0` release.
5. Verify public repo metadata.
6. Run GitHub npm exec smoke test.
