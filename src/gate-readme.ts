import type { Finding, GateContext, GateResult } from "./types.js";

export function gateReadme(context: GateContext): GateResult {
  const findings: Finding[] = [];
  const text = context.text;
  const firstScreen = text.slice(0, 800);
  const codeFence = /```[\s\S]*?```/.test(text);

  if (!/^#\s+\S+/m.test(text)) {
    findings.push({
      id: "readme.no-title",
      severity: "high",
      title: "README has no H1 title",
      repair: "Add a clear H1 with the project name.",
    });
  }

  if (!/(No API key|No telemetry|local|Run|Use|Install|Why|何ができる|使い方)/i.test(firstScreen)) {
    findings.push({
      id: "readme.weak-first-screen",
      severity: "high",
      title: "First screen does not explain value quickly",
      repair: "Move the value proposition and first command into the top of the README.",
    });
  }

  if (!/##\s*(Install|Usage|Use|Quickstart|使い方|インストール)/i.test(text)) {
    findings.push({
      id: "readme.no-usage",
      severity: "medium",
      title: "README lacks install or usage section",
      repair: "Add a copyable install/usage section.",
    });
  }

  if (!codeFence) {
    findings.push({
      id: "readme.no-example",
      severity: "medium",
      title: "README has no copyable code example",
      repair: "Add at least one real command in a fenced code block.",
    });
  }

  if (!/license/i.test(text)) {
    findings.push({
      id: "readme.no-license",
      severity: "medium",
      title: "README does not mention license",
      repair: "Add a license section.",
    });
  }

  if (!/status|alpha|beta|roadmap|limitations|制限|状態/i.test(text)) {
    findings.push({
      id: "readme.no-status",
      severity: "low",
      title: "README does not state status or limitations",
      repair: "Add an honest status or limitations section.",
    });
  }

  if (!/npm run check|npm test|pytest|cargo test|go test|bash scripts\/verify|検証/i.test(text)) {
    findings.push({
      id: "readme.no-verification",
      severity: "medium",
      title: "README does not explain how to verify locally",
      repair: "Add the local verification command.",
    });
  }

  return {
    summary: "README gate checks first-screen clarity, examples, license, status, and verification.",
    metrics: {
      hasTitle: /^#\s+\S+/m.test(text),
      hasCodeFence: codeFence,
      length: text.length,
    },
    findings,
  };
}
