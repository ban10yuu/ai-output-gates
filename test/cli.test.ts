import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import test from "node:test";
import type { GateReport } from "../src/types.js";

const cliPath = path.resolve("dist/src/cli.js");

test("CLI shows help", async () => {
  const result = await runCli(["--help"]);
  assert.equal(result.code, 0);
  assert.match(result.stdout, /ai-output-gates run <target>/);
});

test("CLI writes report and repair brief for failing artifact", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "ai-output-gates-"));
  const manuscript = path.join(dir, "book.md");
  const outDir = path.join(dir, "report");
  await writeFile(manuscript, "# Book\n\nA thin draft.", "utf8");

  const result = await runCli(["run", manuscript, "--type", "book", "--out", outDir]);
  assert.equal(result.code, 1);
  assert.match(result.stdout, /FAIL/);

  const report = JSON.parse(await readFile(path.join(outDir, "gate-report.json"), "utf8")) as GateReport;
  assert.equal(report.status, "fail");
  assert.equal(report.artifactType, "book");

  const repair = await readFile(path.join(outDir, "repair.md"), "utf8");
  assert.match(repair, /Required Repairs/);
});

test("CLI returns zero when README passes", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "ai-output-gates-"));
  const readme = path.join(dir, "README.md");
  const outDir = path.join(dir, "report");
  await writeFile(readme, "# Demo\n\nNo API key. No telemetry. Run locally.\n\n## Usage\n\n```bash\nnpm test\n```\n\n## Status\n\nAlpha.\n\n## License\n\nMIT\n", "utf8");

  const result = await runCli(["run", readme, "--type", "readme", "--out", outDir, "--json"]);
  assert.equal(result.code, 0);
  assert.match(result.stdout, /"status": "pass"/);
});

test("CLI explain prints markdown summary", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "ai-output-gates-"));
  const reportPath = path.join(dir, "gate-report.json");
  await writeFile(reportPath, JSON.stringify({
    version: "0.1.0",
    generatedAt: "2026-06-16T00:00:00.000Z",
    target: "/tmp/demo.md",
    artifactType: "prose",
    status: "pass",
    score: 100,
    summary: "Clean.",
    metrics: { words: 300 },
    findings: [],
  }), "utf8");

  const result = await runCli(["explain", reportPath]);
  assert.equal(result.code, 0);
  assert.match(result.stdout, /AI Output Gate Summary/);
});

test("CLI loop can repair through a user-supplied command without human UI", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "ai-output-gates-"));
  const readme = path.join(dir, "README.md");
  const outDir = path.join(dir, "loop-report");
  const repairScript = path.join(dir, "repair.cjs");
  await writeFile(readme, "# Demo\n\nSomething vague.", "utf8");

  const repaired = "# Demo\\n\\nNo API key. No telemetry. Run locally.\\n\\n## Usage\\n\\n```bash\\nnpm test\\n```\\n\\n## Status\\n\\nAlpha.\\n\\n## License\\n\\nMIT\\n";
  await writeFile(repairScript, `require("fs").writeFileSync(process.env.AI_OUTPUT_GATES_TARGET, ${JSON.stringify(repaired)});\n`, "utf8");
  const repairCommand = `${process.execPath} ${repairScript}`;

  const result = await runCli([
    "loop",
    readme,
    "--type",
    "readme",
    "--out",
    outDir,
    "--max-rounds",
    "2",
    "--repair-command",
    repairCommand,
  ]);

  assert.equal(result.code, 0);
  assert.match(result.stdout, /ROUND 1: REVIEW|ROUND 1: FAIL/);
  assert.match(result.stdout, /ROUND 2: PASS/);

  const finalReport = JSON.parse(await readFile(path.join(outDir, "round-2", "gate-report.json"), "utf8")) as GateReport;
  assert.equal(finalReport.status, "pass");
});

function runCli(args: string[]): Promise<{ code: number | null; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [cliPath, ...args], {
      cwd: process.cwd(),
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("close", (code) => {
      resolve({ code, stdout, stderr });
    });
  });
}
