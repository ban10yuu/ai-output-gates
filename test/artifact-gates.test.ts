import assert from "node:assert/strict";
import test from "node:test";
import { createContext, runGate } from "../src/gates.js";
import type { ConcreteArtifactType, SourceFile } from "../src/types.js";

test("book gate rejects manuscript-shaped filler and accepts structured depth", () => {
  const weak = run("book", [source("book.md", "# Book\n\nThis will change everything. Absolutely.")]);
  assert.equal(weak.status, "fail");
  assert.ok(weak.findings.some((finding) => finding.id === "book.too-short"));

  const strong = run("book", [source("book.md", goodBook())]);
  assert.equal(strong.status, "pass");
});

test("prose gate requires audience and examples", () => {
  const weak = run("prose", [source("essay.md", "This is useful. This is useful. This is useful.")]);
  assert.notEqual(weak.status, "pass");

  const strong = run("prose", [source("essay.md", goodProse())]);
  assert.equal(strong.status, "pass");
});

test("landing-page gate requires first screen, CTA, proof, and mobile metadata", () => {
  const weak = run("landing-page", [source("landing.html", "<html><body><p>Welcome</p></body></html>")]);
  assert.equal(weak.status, "fail");

  const strong = run("landing-page", [source("landing.html", goodLandingPage())]);
  assert.equal(strong.status, "pass");
});

test("README gate requires value, usage, verification, status, and license", () => {
  const weak = run("readme", [source("README.md", "# Tool\n\nSomething.")]);
  assert.notEqual(weak.status, "pass");

  const strong = run("readme", [source("README.md", goodReadme())]);
  assert.equal(strong.status, "pass");
});

test("code gate requires tests and flags secret-looking strings", () => {
  const fakeSecret = "sk-" + "a".repeat(28);
  const weak = run("code", [
    source("package.json", JSON.stringify({ scripts: { build: "tsc" } })),
    source("src/index.ts", `export const apiKey = '${fakeSecret}';\n`),
    source("README.md", "# Code\n"),
  ]);
  assert.equal(weak.status, "fail");
  assert.ok(weak.findings.some((finding) => finding.id === "code.secret-looking-string"));

  const strong = run("code", [
    source("package.json", JSON.stringify({ scripts: { build: "tsc", test: "node --test" } })),
    source("src/index.ts", "export function add(a: number, b: number) { return a + b; }\n"),
    source("test/index.test.ts", "import test from 'node:test';\n"),
    source("README.md", "# Code\n\n## Usage\n\n```bash\nnpm test\n```\n"),
  ]);
  assert.equal(strong.status, "pass");
});

function run(type: ConcreteArtifactType, files: SourceFile[]) {
  return runGate(createContext(`/tmp/${type}`, type, files));
}

function source(relativePath: string, content: string): SourceFile {
  return {
    path: `/tmp/${relativePath}`,
    relativePath,
    content,
    bytes: Buffer.byteLength(content),
  };
}

function goodBook(): string {
  return [
    "# Practical Agent Quality",
    "",
    "## Introduction",
    "",
    body("The reader is a builder who receives AI drafts and needs a calm inspection routine before delivery.", 65),
    "",
    "## Chapter 1: Define The Promise",
    "",
    body("This chapter turns a vague request into a visible promise with a target reader, a success condition, and a boundary.", 95),
    "",
    "## Chapter 2: Inspect The Shape",
    "",
    body("The reviewer checks whether the structure carries the promise from opening to closing without copied sections or empty claims.", 95),
    "",
    "## Chapter 3: Repair Before Delivery",
    "",
    body("The agent receives specific repair instructions, edits only the broken parts, and runs the same gate again before returning.", 95),
    "",
    "## Conclusion",
    "",
    body("The closing section asks the reader to keep one repeatable habit: inspect the artifact, repair the concrete issue, and verify again.", 65),
  ].join("\n");
}

function goodProse(): string {
  return [
    "This note is for solo founders who ask an AI assistant to produce customer-facing work and want fewer embarrassing drafts.",
    body("For example, a founder might request a landing page and receive polished wording with no price, no proof, and no clear next step.", 55),
    body("The useful response is not to ask the model to be better in general. The useful response is to insert a small inspection routine that names the target reader, checks for specific examples, and rejects repeated filler.", 65),
    body("After the inspection, the agent repairs only the missing evidence or structure. That makes the loop cheaper, easier to trust, and less dependent on the human noticing every weak sentence.", 55),
  ].join("\n\n");
}

function goodLandingPage(): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Agent Output Gate for Solo Builders</title>
</head>
<body>
  <main>
    <h1>Catch weak AI deliverables before your client sees them</h1>
    <p>Agent Output Gate gives solo builders a local quality check for manuscripts, landing pages, README files, and small code projects.</p>
    <p>It is built for teams that already use Codex or Claude Code and need a repeatable repair brief instead of another manual review meeting.</p>
    <p>Case study: a launch page with no CTA, no trust signal, and repeated generic paragraphs was rejected in seconds and repaired before delivery.</p>
    <p>Trusted by internal tool builders who want proof, clear structure, and a copyable next step in every generated artifact.</p>
    <button>Download the local gate</button>
  </main>
</body>
</html>`;
}

function goodReadme(): string {
  return `# Demo Gate

No API key. No telemetry. Run locally to inspect AI-generated work before delivery.

## Usage

\`\`\`bash
npm test
\`\`\`

## Status

Alpha. The checks are intentionally strict and local-first.

## License

MIT
`;
}

function body(sentence: string, repeats: number): string {
  return Array.from({ length: repeats }, (_, index) => `${sentence} Step ${index + 1} adds a concrete check, an example, and a repair action for the reader.`).join(" ");
}
