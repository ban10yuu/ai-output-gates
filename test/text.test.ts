import assert from "node:assert/strict";
import test from "node:test";
import { extractHeadings, findFillerPhrases, repeatedParagraphs, stripHtml, wordCount } from "../src/text.js";

test("stripHtml removes markup while preserving visible copy", () => {
  assert.equal(stripHtml("<h1>Hello</h1><p>A&amp;B&nbsp;works</p>"), "Hello A&B works");
});

test("wordCount counts latin words and Japanese characters", () => {
  assert.equal(wordCount("hello world"), 2);
  assert.equal(wordCount("こんにちは世界"), 4);
});

test("extractHeadings reads markdown and html headings", () => {
  const headings = extractHeadings("# Title\n\n## Chapter One\n<h2>HTML Part</h2>");
  assert.deepEqual(headings.map((heading) => heading.text), ["Title", "Chapter One", "HTML Part"]);
});

test("repeatedParagraphs ignores tiny text but catches copied blocks", () => {
  const paragraph = "This is a long paragraph with enough specific words to count as repeated material in a generated artifact.";
  assert.equal(repeatedParagraphs(`${paragraph}\n\nshort\n\n${paragraph}`).length, 1);
});

test("findFillerPhrases reports generic AI language", () => {
  const filler = findFillerPhrases("In today's world, it is important to note that various teams optimize leverage.");
  assert.ok(filler.some((entry) => entry.phrase === "in today's world"));
  assert.ok(filler.some((entry) => entry.phrase === "various"));
});
