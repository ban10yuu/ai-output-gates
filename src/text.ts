export type Heading = {
  level: number;
  text: string;
  line: number;
};

const fillerPhrases = [
  "in today's world",
  "it is important to note",
  "plays a crucial role",
  "there are many ways",
  "as we all know",
  "in conclusion",
  "overall",
  "various",
  "leverage",
  "optimize",
  "seamless",
  "cutting-edge",
  "重要です",
  "さまざま",
  "多くの人",
  "現代社会",
  "と言えるでしょう",
  "総じて",
];

export function stripHtml(input: string): string {
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export function wordCount(input: string): number {
  const text = stripHtml(input);
  const latin = text.match(/[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)*/g)?.length ?? 0;
  const cjk = text.match(/[\u3040-\u30ff\u3400-\u9fff]/g)?.length ?? 0;
  return latin + Math.ceil(cjk / 2);
}

export function extractHeadings(input: string): Heading[] {
  const headings: Heading[] = [];
  const lines = input.split(/\r?\n/);
  lines.forEach((line, index) => {
    const markdown = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (markdown) {
      headings.push({ level: markdown[1].length, text: markdown[2].trim(), line: index + 1 });
    }
  });
  for (const match of input.matchAll(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi)) {
    const before = input.slice(0, match.index ?? 0);
    headings.push({
      level: Number(match[1]),
      text: stripHtml(match[2]),
      line: before.split(/\r?\n/).length,
    });
  }
  return headings.sort((a, b) => a.line - b.line);
}

export function paragraphs(input: string): string[] {
  return input
    .replace(/<br\s*\/?>/gi, "\n")
    .split(/\n{2,}/)
    .map((paragraph) => stripHtml(paragraph).trim())
    .filter((paragraph) => paragraph.length > 0);
}

export function repeatedParagraphs(input: string): Array<{ paragraph: string; count: number }> {
  const counts = new Map<string, { paragraph: string; count: number }>();
  for (const paragraph of paragraphs(input)) {
    const normalized = paragraph.toLowerCase().replace(/\s+/g, " ").trim();
    if (normalized.length < 60) continue;
    const current = counts.get(normalized);
    counts.set(normalized, { paragraph, count: (current?.count ?? 0) + 1 });
  }
  return [...counts.values()].filter((entry) => entry.count > 1);
}

export function repeatedHeadings(headings: Heading[]): Array<{ heading: string; count: number }> {
  const counts = new Map<string, { heading: string; count: number }>();
  for (const heading of headings) {
    const normalized = heading.text.toLowerCase().replace(/\s+/g, " ").trim();
    const current = counts.get(normalized);
    counts.set(normalized, { heading: heading.text, count: (current?.count ?? 0) + 1 });
  }
  return [...counts.values()].filter((entry) => entry.count > 1);
}

export function findFillerPhrases(input: string): Array<{ phrase: string; count: number }> {
  const lower = stripHtml(input).toLowerCase();
  return fillerPhrases
    .map((phrase) => {
      const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const count = lower.match(new RegExp(escaped.toLowerCase(), "g"))?.length ?? 0;
      return { phrase, count };
    })
    .filter((entry) => entry.count > 0);
}

export function countMatches(input: string, pattern: RegExp): number {
  return [...input.matchAll(pattern)].length;
}

export function hasAny(input: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(input));
}

export function firstNonEmptyLine(input: string): string {
  return input.split(/\r?\n/).find((line) => line.trim().length > 0)?.trim() ?? "";
}
