import type { Finding, GateContext, GateResult } from "./types.js";
import { findFillerPhrases, paragraphs, repeatedParagraphs, wordCount } from "./text.js";

export function gateProse(context: GateContext): GateResult {
  const findings: Finding[] = [];
  const words = wordCount(context.text);
  const paras = paragraphs(context.text);
  const repeated = repeatedParagraphs(context.text);
  const filler = findFillerPhrases(context.text);
  const fillerCount = filler.reduce((sum, entry) => sum + entry.count, 0);

  if (words < 250) {
    findings.push({
      id: "prose.too-short",
      severity: "medium",
      title: "Prose is too short to evaluate as a finished artifact",
      evidence: `${words} estimated words`,
      repair: "Expand the piece enough to show argument, examples, and conclusion.",
    });
  }

  if (!/(for|reader|audience|persona|対象|読者|お客様|クライアント)/i.test(context.text)) {
    findings.push({
      id: "prose.no-audience",
      severity: "medium",
      title: "Audience is unclear",
      repair: "State who the piece is for and what they should gain.",
    });
  }

  if (!/(for example|case study|具体例|例えば|事例|実例)/i.test(context.text)) {
    findings.push({
      id: "prose.no-examples",
      severity: "medium",
      title: "No concrete examples found",
      repair: "Add at least one concrete example, scenario, or before/after.",
    });
  }

  if (repeated.length > 0) {
    findings.push({
      id: "prose.repeated-paragraphs",
      severity: "high",
      title: "Repeated paragraphs found",
      evidence: repeated[0].paragraph.slice(0, 120),
      repair: "Remove duplicated text and replace it with new substance.",
    });
  }

  if (fillerCount >= 4) {
    findings.push({
      id: "prose.filler",
      severity: "medium",
      title: "Generic filler phrases found",
      evidence: filler.slice(0, 4).map((entry) => `${entry.phrase} (${entry.count})`).join(", "),
      repair: "Rewrite filler into specific observations or actionable guidance.",
    });
  }

  return {
    summary: "Prose gate checks audience, examples, repetition, and filler.",
    metrics: {
      estimatedWords: words,
      paragraphs: paras.length,
      repeatedParagraphs: repeated.length,
      fillerPhrases: fillerCount,
    },
    findings,
  };
}
