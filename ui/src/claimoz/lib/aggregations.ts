// Aggregation contract — every dashboard widget consumes a View from this file.
// Mock and live data sources both produce the same View shapes. Widgets never
// know the source.

import type { ActivityEvent, Issue } from "@paperclipai/shared";
import type { Claim, ClaimStatusBucket, TouchBucket } from "./claimMapper";
import type {
  AIInteraction,
  CSATResponse,
  Decision,
  ReserveAdequacyResult,
  ReserveSnapshot,
  ResolutionPath,
  SLATargets,
} from "./domain";

// §1 North Star
export interface NorthStarView {
  stpRate: number;
  stpRateDelta: number;
  csat: number;
  csatDelta: number;
  csatVariance: number;
  accuracy: number;
}

// §3 Status Distribution
export interface StatusDistributionView {
  cohort: { filedStart: string; filedEnd: string; total: number };
  buckets: Array<{ status: ClaimStatusBucket; count: number; pct: number }>;
}

// §5 Bottlenecks
export interface BottlenecksView {
  items: Array<{
    category: string;
    claimCount: number;
    slaAtRiskCount: number;
  }>;
}

// §9 Autonomy
export interface AutonomyView {
  doneClaims: number;
  buckets: Array<{ touches: TouchBucket; rate: number }>;
}

// §6 Reserves
export interface ReservesView {
  totalOutstanding: number;
  totalOutstandingDeltaWeek: number;
  avgPerClaim: number;
  avgPerClaimDeltaMonth: number;
  underReservedCount: number;
  underReservedAvgGap: number;
  adequacyPct: number;
  adequacyDeltaQuarterPp: number;
  aiUpdateLagMinutes: number;
  manualReviewLagDays: number;
  triggerBreakdown: Array<{ trigger: string; count: number }>;
  trend: Array<{ date: string; total: number }>;
}

// §7 Regulatory SLAs
export interface RegulatorySLAsView {
  rules: Array<{
    ruleType: string;
    label: string;
    deadlineDays: number;
    complianceRate: number;
    inBreachCount: number;
    cohortSize: number;
  }>;
  atRiskTotal: number;
}

// §8 Agent Performance
export interface AgentPerformanceView {
  agents: Array<{
    agentName: string;
    role: string;
    primaryStat: { value: string; label: string };
    kpis: Array<{ label: string; value: string }>;
    waiting: Array<{ reason: string; count: number; avgWait: string }>;
    accent: "blue" | "amber" | "violet" | "indigo";
  }>;
}

// §10 CSAT
export interface CSATView {
  score: number;
  scoreDelta: number;
  variance: number;
  responseCount: number;
  cohort: { start: string; end: string };
  sparkline: Array<{ date: string; score: number }>;
  byResolutionPath: Array<{ path: ResolutionPath; score: number }>;
  responses: CSATResponse[];
}

// §11 AI Interaction Acceptance
export interface AIAcceptanceView {
  audiences: Array<{
    audience: "policyholder" | "third_party";
    label: string;
    channels: Array<{
      channel: "voice" | "email" | "sms";
      color: string;
      points: Array<{ day: number; rate: number }>;
      currentRate: number;
    }>;
    annotations: Array<{ day: number; label: string; color: string }>;
  }>;
}

// §12 Decision Consistency
export interface DecisionConsistencyView {
  ai: { rate: number; sampleSize: number };
  human: { rate: number; sampleSize: number };
  gapPp: number;
}

// §4 Pipeline (Stage Occupancy Over Time)
export interface PipelineView {
  windowDays: number;
  stages: string[];
  series: Array<{ day: number; date: string; counts: Record<string, number> }>;
  slaMarkers: Array<{ day: number; ruleName: string }>;
}

// §2 Live Tasks Feed
export interface LiveTasksFeedView {
  events: Array<{
    id: string;
    relativeTime: string;
    executorType: "agent" | "human";
    claimId?: string;
    claimRef?: string;
    description: string;
    fromStatus?: string;
    toStatus?: string;
    stageBadge?: string;
  }>;
}

// Bundle returned by the dashboard data hook.
export interface DashboardData {
  northStar: NorthStarView;
  statusDistribution: StatusDistributionView;
  bottlenecks: BottlenecksView;
  autonomy: AutonomyView;
  reserves: ReservesView;
  regulatorySLAs: RegulatorySLAsView;
  agentPerformance: AgentPerformanceView;
  csat: CSATView;
  aiAcceptance: AIAcceptanceView;
  decisionConsistency: DecisionConsistencyView;
  pipeline: PipelineView;
  liveTasksFeed: LiveTasksFeedView;
}

// Live-source compute functions — signatures only. Real implementations land
// when we wire useDashboardData against Paperclip + materialized entities.
// Throwing now keeps the contract honest: live source is wired but unimplemented.
const NOT_IMPLEMENTED = "live data source not yet implemented; use VITE_CLAIMOZ_DATA_SOURCE=mock";

export function computeNorthStar(_claims: Claim[]): NorthStarView {
  throw new Error(NOT_IMPLEMENTED);
}
export function computeStatusDistribution(_claims: Claim[]): StatusDistributionView {
  throw new Error(NOT_IMPLEMENTED);
}
export function computeBottlenecks(_claims: Claim[], _issues: Issue[]): BottlenecksView {
  throw new Error(NOT_IMPLEMENTED);
}
export function computeAutonomy(_claims: Claim[], _events: ActivityEvent[]): AutonomyView {
  throw new Error(NOT_IMPLEMENTED);
}
export function computeReserves(
  _claims: Claim[],
  _snapshots: ReserveSnapshot[],
  _adequacy: ReserveAdequacyResult[],
): ReservesView {
  throw new Error(NOT_IMPLEMENTED);
}
export function computeRegulatorySLAs(
  _claims: Claim[],
  _issues: Issue[],
  _events: ActivityEvent[],
  _targets: SLATargets[],
): RegulatorySLAsView {
  throw new Error(NOT_IMPLEMENTED);
}
export function computeAgentPerformance(_issues: Issue[]): AgentPerformanceView {
  throw new Error(NOT_IMPLEMENTED);
}
export function computeCSAT(_claims: Claim[], _responses: CSATResponse[]): CSATView {
  throw new Error(NOT_IMPLEMENTED);
}
export function computeAIAcceptance(_interactions: AIInteraction[]): AIAcceptanceView {
  throw new Error(NOT_IMPLEMENTED);
}
export function computeDecisionConsistency(_decisions: Decision[]): DecisionConsistencyView {
  throw new Error(NOT_IMPLEMENTED);
}
export function computePipeline(_claims: Claim[], _windowDays: number): PipelineView {
  throw new Error(NOT_IMPLEMENTED);
}
export function computeLiveTasksFeed(_events: ActivityEvent[]): LiveTasksFeedView {
  throw new Error(NOT_IMPLEMENTED);
}
