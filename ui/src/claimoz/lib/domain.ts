// Domain entities — first-class siblings of Paperclip's Issue/Project/Agent.
// These represent claims-domain concepts that don't live in Paperclip core.
// Each is materialized data; rules that produce them live in agent skills.

export type SLARuleType = "first_contact" | "coverage_decision" | "payment";

export interface SLATargets {
  claimId: string;
  computedAt: string;
  computedBySkillVersion: string;
  targets: Array<{
    ruleType: SLARuleType | string;
    deadlineAt: string;
    appliedRuleName: string;
    source?: string;
  }>;
}

export interface ReserveSnapshot {
  id: string;
  claimId: string;
  amount: number;
  updatedAt: string;
  trigger?: string;
}

export interface ReserveAdequacyResult {
  claimId: string;
  adequacyPct: number;
  category: "under_reserved" | "adequate" | "over_reserved";
  finalReserveAmount: number;
  finalSettlementAmount: number;
  thresholdSkillVersion: string;
  settledAt: string;
}

export type ResolutionPath = "autonomous" | "human_1touch" | "human_2plus";

export interface CSATResponse {
  id: string;
  claimId: string;
  score: number;
  comment?: string;
  respondedAt: string;
  resolutionPath: ResolutionPath;
  cycleDays: number;
}

export interface AIInteraction {
  id: string;
  claimId: string;
  audience: "policyholder" | "third_party";
  channel: "voice" | "email" | "sms";
  startedAt: string;
  acceptedByRecipient: boolean;
  deflectionReason?: string;
}

export interface Decision {
  id: string;
  claimId: string;
  issueId?: string;
  decisionType: string;
  actorType: "ai" | "human";
  decision: string;
  overriddenByHuman: boolean;
  decidedAt: string;
}
