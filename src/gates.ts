import path from "node:path";
import { gateBook } from "./gate-book.js";
import { gateCode } from "./gate-code.js";
import { gateLandingPage } from "./gate-landing-page.js";
import { gateProse } from "./gate-prose.js";
import { gateReadme } from "./gate-readme.js";
import { combineText } from "./io.js";
import type { ArtifactType, ConcreteArtifactType, GateContext, GateReport, SourceFile } from "./types.js";
import { buildReport } from "./report.js";
import { extractHeadings } from "./text.js";

export function createContext(target: string, requestedType: ArtifactType, files: SourceFile[]): GateContext {
  const text = combineText(files);
  const artifactType = requestedType === "auto" ? inferArtifactType(target, files, text) : requestedType;
  return {
    target: path.resolve(target),
    artifactType,
    files,
    text,
  };
}

export function runGate(context: GateContext): GateReport {
  const result = (() => {
    switch (context.artifactType) {
      case "book":
        return gateBook(context);
      case "prose":
        return gateProse(context);
      case "landing-page":
        return gateLandingPage(context);
      case "readme":
        return gateReadme(context);
      case "code":
        return gateCode(context);
    }
  })();
  return buildReport(context, result);
}

export function inferArtifactType(target: string, files: SourceFile[], text: string): ConcreteArtifactType {
  const base = path.basename(target).toLowerCase();
  const ext = path.extname(base);
  if (base === "readme.md" || base === "readme") return "readme";
  if (files.some((file) => file.relativePath === "package.json" || file.relativePath.startsWith("src/"))) return "code";
  if (ext === ".html" || ext === ".htm" || /<html|<body|<h1|<button|<form/i.test(text)) return "landing-page";
  const headings = extractHeadings(text);
  const chapterLike = headings.filter((heading) => /chapter|第.+章|^章|lesson|part/i.test(heading.text)).length;
  if (chapterLike >= 3 || headings.length >= 8) return "book";
  return "prose";
}
