import path from "node:path";
import type { Finding, GateReport, GateResult, GateStatus, GateContext } from "./types.js";
import { writeTextFile } from "./io.js";

const severityPenalty = {
  low: 5,
  medium: 12,
  high: 25,
  critical: 40,
} as const;

export function buildReport(context: GateContext, result: GateResult): GateReport {
  const score = calculateScore(result.findings);
  const status = calculateStatus(score, result.findings);
  return {
    version: "0.1.0",
    generatedAt: new Date().toISOString(),
    target: context.target,
    artifactType: context.artifactType,
    status,
    score,
    summary: result.summary,
    metrics: result.metrics,
    findings: result.findings,
  };
}

export function calculateScore(findings: Finding[]): number {
  const penalty = findings.reduce((sum, finding) => sum + severityPenalty[finding.severity], 0);
  return Math.max(0, 100 - penalty);
}

export function calculateStatus(score: number, findings: Finding[]): GateStatus {
  if (findings.some((finding) => finding.severity === "critical")) return "fail";
  if (score < 70) return "fail";
  if (score < 85) return "review";
  if (findings.some((finding) => finding.severity === "high")) return "review";
  return "pass";
}

export async function writeReportFiles(report: GateReport, outDir: string): Promise<void> {
  await writeTextFile(path.join(outDir, "gate-report.json"), JSON.stringify(report, null, 2) + "\n");
  await writeTextFile(path.join(outDir, "SUMMARY.md"), summaryMarkdown(report));
  await writeTextFile(path.join(outDir, "repair.md"), repairMarkdown(report));
  await writeTextFile(path.join(outDir, "review-packet.md"), reviewPacketMarkdown(report));
  await writeTextFile(path.join(outDir, "visual-inspection.md"), visualInspectionMarkdown(report));
}

export function summaryMarkdown(report: GateReport): string {
  const lines = [
    "# AI Output Gate Summary",
    "",
    `- Target: \`${report.target}\``,
    `- Type: \`${report.artifactType}\``,
    `- Status: \`${report.status}\``,
    `- Score: \`${report.score}/100\``,
    "",
    "## Summary",
    "",
    report.summary,
    "",
    "## Findings",
    "",
  ];
  if (report.findings.length === 0) {
    lines.push("No findings.");
  } else {
    report.findings.forEach((finding, index) => {
      lines.push(`${index + 1}. **${finding.severity.toUpperCase()}** ${finding.title}`);
      if (finding.location) lines.push(`   - Location: \`${finding.location}\``);
      if (finding.evidence) lines.push(`   - Evidence: ${finding.evidence}`);
      lines.push(`   - Repair: ${finding.repair}`);
    });
  }
  lines.push("", "## Metrics", "");
  for (const [key, value] of Object.entries(report.metrics)) {
    lines.push(`- ${key}: \`${String(value)}\``);
  }
  return lines.join("\n") + "\n";
}

export function repairMarkdown(report: GateReport): string {
  const lines = [
    "# Repair Brief For The Generating Agent",
    "",
    "Do not rewrite blindly. Fix only the issues below, preserve the user's intent, and run the gate again after repair.",
    "",
    `Artifact type: \`${report.artifactType}\``,
    `Current status: \`${report.status}\``,
    `Current score: \`${report.score}/100\``,
    "",
  ];
  if (report.findings.length === 0) {
    lines.push("No repairs required. Keep the artifact unchanged unless the user asks for improvement.");
  } else {
    lines.push("## Required Repairs", "");
    report.findings.forEach((finding, index) => {
      lines.push(`${index + 1}. ${finding.title}`);
      lines.push(`   - Severity: ${finding.severity}`);
      if (finding.location) lines.push(`   - Location: ${finding.location}`);
      if (finding.evidence) lines.push(`   - Evidence: ${finding.evidence}`);
      lines.push(`   - Action: ${finding.repair}`);
      lines.push("");
    });
  }
  lines.push("## Completion Rule", "", "Return only after the same gate passes or explain the remaining failed checks.");
  return lines.join("\n") + "\n";
}

export function reviewPacketMarkdown(report: GateReport): string {
  const topFindings = report.findings.slice(0, 10);
  return [
    "# AI Reviewer Packet",
    "",
    "You are reviewing an AI-generated artifact before it reaches a human. Be strict. Look for low-quality output a human would reject.",
    "",
    `Artifact type: \`${report.artifactType}\``,
    `Gate status: \`${report.status}\``,
    `Gate score: \`${report.score}/100\``,
    "",
    "## What The Local Gate Found",
    "",
    topFindings.length
      ? topFindings.map((finding, index) => `${index + 1}. ${finding.severity.toUpperCase()}: ${finding.title} - ${finding.repair}`).join("\n")
      : "No local findings. Still inspect for logic, taste, coherence, and user-value issues.",
    "",
    "## Reviewer Instructions",
    "",
    "- Do not approve generic filler.",
    "- Do not approve unsupported strong claims.",
    "- Do not approve missing structure or unclear audience.",
    "- Produce concrete repair instructions, not encouragement.",
  ].join("\n") + "\n";
}

export function visualInspectionMarkdown(report: GateReport): string {
  const instructions = visualInstructions(report.artifactType);
  return [
    "# AI Visual Inspection Packet",
    "",
    "This is for an AI reviewer or repair agent before the artifact reaches a human. Do not ask for human approval.",
    "",
    `Artifact type: \`${report.artifactType}\``,
    `Target: \`${report.target}\``,
    `Gate status: \`${report.status}\``,
    `Gate score: \`${report.score}/100\``,
    "",
    "## Visual Checks",
    "",
    ...instructions.map((instruction) => `- ${instruction}`),
    "",
    "## Decision Rule",
    "",
    "If the rendered artifact looks broken, generic, hard to scan, or misaligned with the user's intent, return concrete repair instructions and run the gate again.",
  ].join("\n") + "\n";
}

function visualInstructions(type: GateReport["artifactType"]): string[] {
  switch (type) {
    case "book":
      return [
        "Render or preview the manuscript as pages or a reader view before approval.",
        "Scan the first page, table-of-contents shape, chapter openings, repeated headings, and closing section.",
        "Reject walls of undifferentiated text, missing chapter hierarchy, placeholder titles, and page-breaking issues.",
      ];
    case "prose":
      return [
        "Preview the final text in the medium where it will be delivered.",
        "Check whether the opening tells the reader why this exists and whether examples are visually easy to find.",
        "Reject copy that looks like a generic block of text with no scannable structure.",
      ];
    case "landing-page":
      return [
        "Open the page in desktop and mobile widths before approval.",
        "Check that the first viewport shows one clear promise, a visible CTA, and no overlapping or clipped text.",
        "Reject pages that look like stock copy, have weak contrast, hide the action, or break on mobile.",
      ];
    case "readme":
      return [
        "Preview the README as rendered Markdown.",
        "Check that the first screen shows the project name, value, and a copyable first command.",
        "Reject README files that require scrolling before the reader can understand what to run.",
      ];
    case "code":
      return [
        "Inspect generated reports, CLI output, and any screenshots or rendered UI produced by the code.",
        "Check that failure output is readable, commands are copyable, and error messages point to the next action.",
        "Reject code deliverables that pass tests but leave the user without an obvious way to verify behavior.",
      ];
  }
}
