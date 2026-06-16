import type { Finding, GateContext, GateResult } from "./types.js";
import { extractHeadings, findFillerPhrases, stripHtml, wordCount } from "./text.js";

export function gateLandingPage(context: GateContext): GateResult {
  const findings: Finding[] = [];
  const text = stripHtml(context.text);
  const headings = extractHeadings(context.text);
  const words = wordCount(context.text);
  const filler = findFillerPhrases(context.text);
  const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(context.text)?.[1]?.trim();
  const ctaCount = (context.text.match(/<button|type=["']submit|contact|book|buy|get started|download|問い合わせ|申し込|購入|相談/gi) ?? []).length;
  const trustCount = (text.match(/testimonial|review|case study|trusted|導入|実績|お客様の声|返金|保証|資格|認定/gi) ?? []).length;
  const formCount = (context.text.match(/<form|input|textarea/gi) ?? []).length;
  const viewport = /<meta[^>]+name=["']viewport["']/i.test(context.text);

  if (!title) {
    findings.push({
      id: "lp.missing-title",
      severity: "medium",
      title: "Missing HTML title",
      repair: "Add a specific title that names the offer and audience.",
    });
  }

  if (headings.filter((heading) => heading.level === 1).length === 0) {
    findings.push({
      id: "lp.missing-h1",
      severity: "high",
      title: "Missing H1 / first-screen promise",
      repair: "Add one clear H1 that explains the offer, target user, and outcome.",
    });
  }

  if (ctaCount === 0) {
    findings.push({
      id: "lp.no-cta",
      severity: "high",
      title: "No CTA detected",
      repair: "Add a visible CTA button or link with a concrete action.",
    });
  }

  if (trustCount === 0) {
    findings.push({
      id: "lp.no-trust",
      severity: "medium",
      title: "No trust signal detected",
      repair: "Add proof such as testimonials, results, credentials, guarantee, or case studies.",
    });
  }

  if (!viewport && /<html|<body/i.test(context.text)) {
    findings.push({
      id: "lp.no-viewport",
      severity: "medium",
      title: "No mobile viewport meta tag",
      repair: "Add a viewport meta tag and verify the first screen on mobile.",
    });
  }

  if (words < 120) {
    findings.push({
      id: "lp.too-thin",
      severity: "medium",
      title: "Landing page copy is too thin",
      evidence: `${words} estimated words`,
      repair: "Add concrete offer details, objections, proof, and next steps.",
    });
  }

  if (filler.reduce((sum, entry) => sum + entry.count, 0) >= 4) {
    findings.push({
      id: "lp.generic-copy",
      severity: "medium",
      title: "Landing page copy sounds generic",
      evidence: filler.slice(0, 4).map((entry) => entry.phrase).join(", "),
      repair: "Replace generic business phrases with specific outcomes, proof, and concrete details.",
    });
  }

  return {
    summary: "Landing-page gate checks first-screen promise, CTA, trust, mobile metadata, and offer clarity.",
    metrics: {
      estimatedWords: words,
      headings: headings.length,
      ctaCount,
      trustSignals: trustCount,
      formElements: formCount,
      hasViewport: viewport,
      hasTitle: Boolean(title),
    },
    findings,
  };
}
