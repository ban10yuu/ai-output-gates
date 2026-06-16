import type { Finding, GateContext, GateResult } from "./types.js";

export function gateCode(context: GateContext): GateResult {
  const findings: Finding[] = [];
  const packageFile = context.files.find((file) => file.relativePath === "package.json");
  const sourceFiles = context.files.filter((file) => /^(src|lib|app)\//.test(file.relativePath));
  const testFiles = context.files.filter((file) => /(^|\/)(test|tests|__tests__)\//.test(file.relativePath) || /\.test\./.test(file.relativePath));
  const readme = context.files.find((file) => /^README/i.test(file.relativePath));

  if (!packageFile && sourceFiles.length === 0) {
    findings.push({
      id: "code.no-recognized-project",
      severity: "high",
      title: "No recognizable code project structure",
      repair: "Add a package manifest or clear source directory before treating this as deliverable code.",
    });
  }

  if (packageFile) {
    try {
      const pkg = JSON.parse(packageFile.content) as { scripts?: Record<string, string>; bin?: unknown };
      if (!pkg.scripts?.test && !pkg.scripts?.check) {
        findings.push({
          id: "code.no-test-script",
          severity: "high",
          title: "No test or check script in package.json",
          repair: "Add a repeatable test/check command and run it before completion.",
        });
      }
      if (!pkg.scripts?.build && sourceFiles.some((file) => file.relativePath.endsWith(".ts"))) {
        findings.push({
          id: "code.no-build-script",
          severity: "medium",
          title: "TypeScript source exists but no build script",
          repair: "Add a build script or explain why build is not required.",
        });
      }
    } catch {
      findings.push({
        id: "code.invalid-package-json",
        severity: "critical",
        title: "package.json is invalid JSON",
        repair: "Fix package.json so tooling can run.",
      });
    }
  }

  if (sourceFiles.length > 0 && testFiles.length === 0) {
    findings.push({
      id: "code.no-tests",
      severity: "high",
      title: "Source files exist but no tests were found",
      repair: "Add at least focused tests for the changed behavior.",
    });
  }

  if (!readme) {
    findings.push({
      id: "code.no-readme",
      severity: "medium",
      title: "No README found",
      repair: "Add a README with purpose, usage, and verification commands.",
    });
  }

  const secretLike = context.files.flatMap((file) => {
    const matches = file.content.match(/AIza[0-9A-Za-z_-]{20,}|sk-[A-Za-z0-9_-]{20,}|ghp_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,}|BEGIN (RSA|OPENSSH|EC|DSA)? ?PRIVATE KEY/g) ?? [];
    return matches.map((match) => ({ file: file.relativePath, match }));
  });
  if (secretLike.length > 0) {
    findings.push({
      id: "code.secret-looking-string",
      severity: "critical",
      title: "Secret-looking string found",
      evidence: secretLike.map((item) => item.file).slice(0, 5).join(", "),
      repair: "Remove secrets from source, rotate exposed credentials, and load values from environment variables.",
    });
  }

  return {
    summary: "Code gate checks project structure, tests, build scripts, README, and secret-looking strings.",
    metrics: {
      files: context.files.length,
      sourceFiles: sourceFiles.length,
      testFiles: testFiles.length,
      hasPackageJson: Boolean(packageFile),
      hasReadme: Boolean(readme),
      secretLikeMatches: secretLike.length,
    },
    findings,
  };
}
