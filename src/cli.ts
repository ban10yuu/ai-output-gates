#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import path from "node:path";
import { readTarget } from "./io.js";
import { createContext, runGate } from "./gates.js";
import { summaryMarkdown, writeReportFiles } from "./report.js";
import { artifactTypes, type ArtifactType, type GateReport } from "./types.js";

const helpText = `ai-output-gates

Artifact-specific quality gates for AI-generated work.

Usage:
  ai-output-gates run <target> [--type auto|book|prose|landing-page|readme|code] [--out .ai-output-gates] [--json]
  ai-output-gates explain <gate-report.json>
  ai-output-gates --help
  ai-output-gates --version

Examples:
  ai-output-gates run manuscript.md --type book
  ai-output-gates run landing.html --type landing-page --out reports/lp
  ai-output-gates explain .ai-output-gates/gate-report.json

Exit codes:
  0 pass
  1 review or fail
`;

export async function main(argv = process.argv.slice(2)): Promise<number> {
  const first = argv[0];

  if (!first || first === "--help" || first === "-h" || first === "help") {
    process.stdout.write(helpText);
    return 0;
  }

  if (first === "--version" || first === "-v") {
    process.stdout.write("0.1.0\n");
    return 0;
  }

  if (first === "run") {
    return runCommand(argv.slice(1));
  }

  if (first === "explain") {
    return explainCommand(argv.slice(1));
  }

  process.stderr.write(`Unknown command: ${first}\n\n${helpText}`);
  return 1;
}

async function runCommand(args: string[]): Promise<number> {
  const target = firstPositional(args);
  if (!target) {
    process.stderr.write("Missing target.\n\n" + helpText);
    return 1;
  }

  const type = parseArtifactType(flagValue(args, "--type") ?? "auto");
  if (!type) {
    process.stderr.write(`Invalid --type. Expected one of: ${artifactTypes.join(", ")}\n`);
    return 1;
  }

  const outDir = path.resolve(flagValue(args, "--out") ?? ".ai-output-gates");
  const printJson = hasFlag(args, "--json");
  const files = await readTarget(target);
  const context = createContext(target, type, files);
  const report = runGate(context);

  await writeReportFiles(report, outDir);

  if (printJson) {
    process.stdout.write(JSON.stringify(report, null, 2) + "\n");
  } else {
    process.stdout.write(`${report.status.toUpperCase()} ${report.score}/100 ${report.artifactType}\n`);
    process.stdout.write(`Report: ${path.join(outDir, "gate-report.json")}\n`);
    process.stdout.write(`Repair brief: ${path.join(outDir, "repair.md")}\n`);
  }

  return report.status === "pass" ? 0 : 1;
}

async function explainCommand(args: string[]): Promise<number> {
  const reportPath = firstPositional(args);
  if (!reportPath) {
    process.stderr.write("Missing gate-report.json path.\n\n" + helpText);
    return 1;
  }

  const report = JSON.parse(await readFile(reportPath, "utf8")) as GateReport;
  process.stdout.write(summaryMarkdown(report));
  return report.status === "pass" ? 0 : 1;
}

function parseArtifactType(value: string): ArtifactType | undefined {
  return artifactTypes.includes(value as ArtifactType) ? (value as ArtifactType) : undefined;
}

function firstPositional(args: string[]): string | undefined {
  for (const arg of args) {
    if (!arg.startsWith("-")) return arg;
  }
  return undefined;
}

function flagValue(args: string[], flag: string): string | undefined {
  const equalsPrefix = `${flag}=`;
  const equalsArg = args.find((arg) => arg.startsWith(equalsPrefix));
  if (equalsArg) return equalsArg.slice(equalsPrefix.length);

  const index = args.indexOf(flag);
  if (index === -1) return undefined;
  const value = args[index + 1];
  if (!value || value.startsWith("-")) return undefined;
  return value;
}

function hasFlag(args: string[], flag: string): boolean {
  return args.includes(flag);
}

main().then((code) => {
  process.exitCode = code;
}).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`ai-output-gates failed: ${message}\n`);
  process.exitCode = 1;
});
