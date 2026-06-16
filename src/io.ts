import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import type { SourceFile } from "./types.js";

const ignoredDirectories = new Set([
  ".git",
  "node_modules",
  "dist",
  "coverage",
  ".next",
  "build",
  ".ai-output-gates",
]);

const readableExtensions = new Set([
  ".md",
  ".mdx",
  ".txt",
  ".html",
  ".htm",
  ".json",
  ".jsonl",
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".css",
  ".py",
  ".sh",
  ".yml",
  ".yaml",
  ".toml",
]);

export async function exists(filePath: string): Promise<boolean> {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function readTarget(target: string): Promise<SourceFile[]> {
  const resolved = path.resolve(target);
  const info = await stat(resolved);
  if (info.isDirectory()) {
    const files = await walkReadable(resolved);
    return Promise.all(files.map((file) => readSourceFile(resolved, file)));
  }
  return [await readSourceFile(path.dirname(resolved), resolved)];
}

async function walkReadable(root: string, files: string[] = []): Promise<string[]> {
  for (const entry of await readdir(root, { withFileTypes: true })) {
    if (ignoredDirectories.has(entry.name)) continue;
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      await walkReadable(fullPath, files);
      continue;
    }
    if (readableExtensions.has(path.extname(entry.name).toLowerCase()) || entry.name === "README") {
      files.push(fullPath);
    }
  }
  return files;
}

async function readSourceFile(root: string, filePath: string): Promise<SourceFile> {
  const content = await readFile(filePath, "utf8");
  const bytes = Buffer.byteLength(content, "utf8");
  return {
    path: filePath,
    relativePath: path.relative(root, filePath) || path.basename(filePath),
    content,
    bytes,
  };
}

export async function writeTextFile(filePath: string, content: string): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, content, "utf8");
}

export function combineText(files: SourceFile[]): string {
  return files.map((file) => `\n\n--- ${file.relativePath} ---\n\n${file.content}`).join("\n");
}
