import assert from "node:assert/strict";
import test from "node:test";
import { createContext, inferArtifactType, runGate } from "../src/gates.js";
import { calculateScore, calculateStatus } from "../src/report.js";
import type { ConcreteArtifactType, SourceFile } from "../src/types.js";

test("calculateScore and calculateStatus make severe findings non-pass", () => {
  const score = calculateScore([
    { id: "x", severity: "medium", title: "Medium", repair: "Fix it." },
    { id: "y", severity: "high", title: "High", repair: "Fix it." },
  ]);

  assert.equal(score, 63);
  assert.equal(calculateStatus(score, []), "fail");
  assert.equal(calculateStatus(100, [{ id: "z", severity: "critical", title: "Critical", repair: "Fix it." }]), "fail");
});

test("inferArtifactType detects common target shapes", () => {
  assert.equal(inferArtifactType("README.md", [source("README.md", "# Tool")], "# Tool"), "readme");
  assert.equal(inferArtifactType("index.html", [source("index.html", "<html><h1>Offer</h1></html>")], "<html><h1>Offer</h1></html>"), "landing-page");
  assert.equal(inferArtifactType("project", [source("package.json", "{}"), source("src/index.ts", "")], ""), "code");
  assert.equal(inferArtifactType("essay.md", [source("essay.md", "Plain text")], "Plain text"), "prose");
});

test("runGate returns a complete report", () => {
  const context = contextFor("readme", [source("README.md", "# Demo\n\nNo API key. Run it locally.\n\n## Usage\n\n```bash\nnpm test\n```\n\n## Status\n\nAlpha.\n\n## License\n\nMIT\n")]);
  const report = runGate(context);

  assert.equal(report.artifactType, "readme");
  assert.equal(report.status, "pass");
  assert.equal(report.version, "0.1.0");
  assert.ok(report.generatedAt);
});

function contextFor(type: ConcreteArtifactType, files: SourceFile[]) {
  return createContext(`/tmp/${type}`, type, files);
}

function source(relativePath: string, content: string): SourceFile {
  return {
    path: `/tmp/${relativePath}`,
    relativePath,
    content,
    bytes: Buffer.byteLength(content),
  };
}
