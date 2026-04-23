import type { ActivityEvent, Issue, Project } from "@paperclipai/shared";
import { parseClaimMetadata, type ClaimMetadata } from "./metadataSchema";

export type ClaimStatusBucket = "Running" | "NOL" | "Waiting for Input" | "Awaiting Data" | "Done";

export type Executor = "agent" | "system" | "ai_voice" | "human_adjuster";

export interface Claim {
  id: string;
  projectId: string;
  status: ClaimStatusBucket;
  metadata: ClaimMetadata;
  issues: Issue[];
}

export const CLAIM_STATUS_BUCKETS: ClaimStatusBucket[] = [
  "Running",
  "NOL",
  "Waiting for Input",
  "Awaiting Data",
  "Done",
];

// ClaimOz ships 4 live buckets + Done. Paperclip's project/issue statuses don't
// map 1:1 so we derive:
//   Done                → project completed/cancelled
//   NOL                 → project backlog/planned (claim filed, agent hasn't started)
//   Waiting for Input   → any blocked issue assigned to a user
//   Awaiting Data       → any blocked issue not assigned to a user (agent-waited)
//   Running             → fallback (agent actively processing)
export function deriveClaimStatus(project: Project, issues: Issue[]): ClaimStatusBucket {
  if (project.status === "completed" || project.status === "cancelled") return "Done";
  if (project.status === "backlog" || project.status === "planned") return "NOL";

  const blocked = issues.filter((i) => i.status === "blocked");
  if (blocked.some((i) => i.assigneeUserId)) return "Waiting for Input";
  if (blocked.length > 0) return "Awaiting Data";
  return "Running";
}

export function toClaim(project: Project, issues: Issue[]): Claim | null {
  const metadata = parseClaimMetadata(project);
  if (!metadata) return null;
  return {
    id: metadata.claimId,
    projectId: project.id,
    status: deriveClaimStatus(project, issues),
    metadata,
    issues,
  };
}

export function toClaims(projects: Project[], issuesByProject: Map<string, Issue[]>): Claim[] {
  const claims: Claim[] = [];
  for (const p of projects) {
    const claim = toClaim(p, issuesByProject.get(p.id) ?? []);
    if (claim) claims.push(claim);
  }
  return claims;
}

// Autonomy metric: count distinct human user actors that touched an entity.
// An issue with 0 user actors is "zero-touch"; the distribution across claims
// is the honest v1 signal.
export function countHumanTouches(events: Pick<ActivityEvent, "actorType" | "actorId">[]): number {
  const users = new Set<string>();
  for (const e of events) if (e.actorType === "user") users.add(e.actorId);
  return users.size;
}

export type TouchBucket = 0 | 1 | 2 | "3+";

export function touchBucket(count: number): TouchBucket {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  return "3+";
}

export function executorOf(issue: Issue, events: Pick<ActivityEvent, "actorType" | "entityType" | "entityId">[] = []): Executor {
  const touched = events.some((e) => e.entityType === "issue" && e.entityId === issue.id && e.actorType === "user");
  if (touched) return "human_adjuster";
  if (issue.assigneeAgentId) return "agent";
  return "system";
}
