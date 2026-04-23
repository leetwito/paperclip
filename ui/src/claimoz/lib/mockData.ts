import type { ClaimStatusBucket, TouchBucket } from "./claimMapper";

// Canonical v1 cohort per ClaimOz guidelines (Feb 1 – Mar 14 2026, 482 claims,
// ~310 done). These numbers drive every widget on the VP Dashboard in mock mode
// and are intentionally hardcoded — live-data sourcing comes later via a
// separate useLiveClaims() implementation.

export interface ClaimCohort {
  filedStart: string;
  filedEnd: string;
  totalClaims: number;
  doneClaims: number;
}

export interface StatusCount {
  status: ClaimStatusBucket;
  count: number;
}

export interface NorthStarMetrics {
  stpRate: number;
  stpRateDelta: number;
  csat: number;
  csatDelta: number;
  csatVariance: number;
  accuracy: number;
}

export interface Bottleneck {
  category: string;
  claimCount: number;
  slaAtRiskCount: number;
}

export interface AutonomyBucket {
  touches: TouchBucket;
  rate: number;
}

export const MOCK_COHORT: ClaimCohort = {
  filedStart: "2026-02-01",
  filedEnd: "2026-03-14",
  totalClaims: 482,
  doneClaims: 310,
};

export const MOCK_STATUS_COUNTS: StatusCount[] = [
  { status: "Running", count: 289 },
  { status: "Awaiting Data", count: 97 },
  { status: "Waiting for Input", count: 63 },
  { status: "NOL", count: 33 },
];

export const MOCK_NORTH_STAR: NorthStarMetrics = {
  stpRate: 78,
  stpRateDelta: 3,
  csat: 4.3,
  csatDelta: 0.2,
  csatVariance: 0.4,
  accuracy: 94,
};

export const MOCK_BOTTLENECKS: Bottleneck[] = [
  { category: "Repair shop estimate pending", claimCount: 18, slaAtRiskCount: 6 },
  { category: "Police report not received", claimCount: 7, slaAtRiskCount: 3 },
  { category: "Adjuster review required", claimCount: 4, slaAtRiskCount: 0 },
  { category: "Customer documentation missing", claimCount: 2, slaAtRiskCount: 0 },
];

export const MOCK_AUTONOMY: AutonomyBucket[] = [
  { touches: 0, rate: 78 },
  { touches: 1, rate: 14 },
  { touches: 2, rate: 6 },
  { touches: "3+", rate: 2 },
];
