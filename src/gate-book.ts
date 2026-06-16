import type { Finding, GateContext, GateResult } from "./types.js";
import { extractHeadings, findFillerPhrases, repeatedHeadings, repeatedParagraphs, wordCount } from "./text.js";

export function gateBook(context: GateContext): GateResult {
  const findings: Finding[] = [];
  const headings = extractHeadings(context.text);
  const words = wordCount(context.text);
  const chapterHeadings = headings.filter((heading) => /chapter|第.+章|^章|lesson|part/i.test(heading.text));
  const repeated = repeatedParagraphs(context.text);
  const duplicateHeadings = repeatedHeadings(headings);
  const filler = findFillerPhrases(context.text);

  if (words < 1200) {
    findings.push({
      id: "book.too-short",
      severity: "high",
      title: "Book manuscript is too short to be treated as a finished book",
      evidence: `${words} estimated words`,
      repair: "Expand the manuscript with real chapters, examples, transitions, and reader-facing substance before calling it complete.",
    });
  } else if (words < 3000) {
    findings.push({
      id: "book.thin",
      severity: "medium",
      title: "Book manuscript is thin",
      evidence: `${words} estimated words`,
      repair: "Add more concrete sections, examples, and chapter-level development.",
    });
  }

  if (chapterHeadings.length < 3) {
    findings.push({
      id: "book.chapter-shape",
      severity: "high",
      title: "Book does not have enough chapter-like structure",
      evidence: `${chapterHeadings.length} chapter-like headings`,
      repair: "Add a real table-of-contents shape with at least three meaningful chapters or parts.",
    });
  }

  if (!/introduction|はじめに|序章/i.test(context.text)) {
    findings.push({
      id: "book.missing-introduction",
      severity: "medium",
      title: "Missing introduction",
      repair: "Add an introduction that states the reader promise, target reader, and how to use the book.",
    });
  }

  if (!/conclusion|おわりに|まとめ|final/i.test(context.text)) {
    findings.push({
      id: "book.missing-conclusion",
      severity: "medium",
      title: "Missing conclusion or closing section",
      repair: "Add a closing section that summarizes the transformation and next action for the reader.",
    });
  }

  if (duplicateHeadings.length > 0) {
    findings.push({
      id: "book.repeated-headings",
      severity: "medium",
      title: "Repeated headings make the structure look machine-made",
      evidence: duplicateHeadings.slice(0, 3).map((entry) => `${entry.heading} (${entry.count})`).join(", "),
      repair: "Merge duplicate sections or rename them with distinct reader outcomes.",
    });
  }

  if (repeated.length > 0) {
    findings.push({
      id: "book.repeated-paragraphs",
      severity: "high",
      title: "Repeated paragraphs found",
      evidence: repeated.slice(0, 2).map((entry) => `${entry.count}x ${entry.paragraph.slice(0, 80)}...`).join(" | "),
      repair: "Remove repeated paragraphs and replace them with new examples or analysis.",
    });
  }

  const fillerCount = filler.reduce((sum, entry) => sum + entry.count, 0);
  if (fillerCount >= 6) {
    findings.push({
      id: "book.filler",
      severity: "medium",
      title: "Too much generic filler language",
      evidence: filler.slice(0, 5).map((entry) => `${entry.phrase} (${entry.count})`).join(", "),
      repair: "Replace generic filler with concrete claims, examples, scenes, or instructions.",
    });
  }

  if (/(guarantee|always|never|100%|絶対|必ず|完全に)/i.test(context.text) && !/(source|出典|evidence|根拠|study|調査)/i.test(context.text)) {
    findings.push({
      id: "book.unsupported-strong-claims",
      severity: "medium",
      title: "Strong claims appear without support",
      repair: "Either add evidence/source context or soften the claim.",
    });
  }

  return {
    summary: "Book gate checks structure, repetition, filler, and reader-facing completeness.",
    metrics: {
      estimatedWords: words,
      headings: headings.length,
      chapterLikeHeadings: chapterHeadings.length,
      repeatedParagraphs: repeated.length,
      fillerPhrases: fillerCount,
    },
    findings,
  };
}
