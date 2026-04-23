import type { Project } from "@paperclipai/shared";

export interface ClaimMetadata {
  claimId: string;
  claimType: string;
  policyHolder: string;
  policyNumber?: string;
  vehicle?: string;
  filedDate?: string;
  reserveAmount?: number;
  deductible?: number;
  statusLine?: string;
  currentStage?: string;
  category?: string;
}

// Paperclip's Project has no structured metadata column. We stash claim fields
// as a fenced JSON block in project.description so no DB migration is needed.
// Convention: ```claim\n{ ... }\n```
const FENCE_RE = /```claim\s*\n([\s\S]*?)\n```/;

export function parseClaimMetadata(project: Pick<Project, "description">): ClaimMetadata | null {
  if (!project.description) return null;
  const match = project.description.match(FENCE_RE);
  if (!match) return null;
  try {
    const raw = JSON.parse(match[1]) as Partial<ClaimMetadata>;
    if (!raw.claimId || !raw.claimType || !raw.policyHolder) return null;
    return raw as ClaimMetadata;
  } catch {
    return null;
  }
}

export function isClaimProject(project: Pick<Project, "description">): boolean {
  return parseClaimMetadata(project) !== null;
}
