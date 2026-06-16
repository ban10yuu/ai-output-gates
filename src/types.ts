export const artifactTypes = ["auto", "book", "prose", "landing-page", "readme", "code"] as const;

export type ArtifactType = (typeof artifactTypes)[number];
export type ConcreteArtifactType = Exclude<ArtifactType, "auto">;
export type GateStatus = "pass" | "review" | "fail";
export type FindingSeverity = "low" | "medium" | "high" | "critical";

export type SourceFile = {
  path: string;
  relativePath: string;
  content: string;
  bytes: number;
};

export type GateContext = {
  target: string;
  artifactType: ConcreteArtifactType;
  files: SourceFile[];
  text: string;
};

export type Finding = {
  id: string;
  severity: FindingSeverity;
  title: string;
  location?: string;
  evidence?: string;
  repair: string;
};

export type GateReport = {
  version: string;
  generatedAt: string;
  target: string;
  artifactType: ConcreteArtifactType;
  status: GateStatus;
  score: number;
  summary: string;
  metrics: Record<string, number | string | boolean>;
  findings: Finding[];
};

export type GateResult = {
  summary: string;
  metrics: Record<string, number | string | boolean>;
  findings: Finding[];
};
