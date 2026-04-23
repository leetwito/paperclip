import type {
  AIAcceptanceView,
  AgentPerformanceView,
  AutonomyView,
  BottlenecksView,
  CSATView,
  DashboardData,
  DecisionConsistencyView,
  LiveTasksFeedView,
  NorthStarView,
  PipelineView,
  RegulatorySLAsView,
  ReservesView,
  StatusDistributionView,
} from "./aggregations";

// Canonical v1 numbers per ClaimOz guidelines (Feb 1 – Mar 14 2026, 482 claims,
// ~310 done). These pre-baked Views satisfy the same contract that
// aggregations() produces over real data — only the source path differs.

export const MOCK_COHORT = {
  filedStart: "2026-02-01",
  filedEnd: "2026-03-14",
  totalClaims: 482,
  doneClaims: 310,
};

const NORTH_STAR: NorthStarView = {
  stpRate: 78,
  stpRateDelta: 3,
  csat: 4.3,
  csatDelta: 0.2,
  csatVariance: 0.4,
  accuracy: 94,
};

const STATUS_DISTRIBUTION: StatusDistributionView = {
  cohort: {
    filedStart: MOCK_COHORT.filedStart,
    filedEnd: MOCK_COHORT.filedEnd,
    total: MOCK_COHORT.totalClaims,
  },
  buckets: [
    { status: "Running", count: 289, pct: 60 },
    { status: "Awaiting Data", count: 97, pct: 20 },
    { status: "Waiting for Input", count: 63, pct: 13 },
    { status: "NOL", count: 33, pct: 7 },
  ],
};

const BOTTLENECKS: BottlenecksView = {
  items: [
    { category: "Repair shop estimate pending", claimCount: 18, slaAtRiskCount: 6 },
    { category: "Police report not received", claimCount: 7, slaAtRiskCount: 3 },
    { category: "Adjuster review required", claimCount: 4, slaAtRiskCount: 0 },
    { category: "Customer documentation missing", claimCount: 2, slaAtRiskCount: 0 },
  ],
};

const AUTONOMY: AutonomyView = {
  doneClaims: MOCK_COHORT.doneClaims,
  buckets: [
    { touches: 0, rate: 78 },
    { touches: 1, rate: 14 },
    { touches: 2, rate: 6 },
    { touches: "3+", rate: 2 },
  ],
};

const RESERVES: ReservesView = {
  totalOutstanding: 4_400_000,
  totalOutstandingDeltaWeek: 180_000,
  avgPerClaim: 9_980,
  avgPerClaimDeltaMonth: -120,
  underReservedCount: 24,
  underReservedAvgGap: 3_200,
  adequacyPct: 91,
  adequacyDeltaQuarterPp: 3,
  aiUpdateLagMinutes: 4,
  manualReviewLagDays: 3.2,
  triggerBreakdown: [
    { trigger: "Estimate received", count: 142 },
    { trigger: "Salvage appraisal", count: 38 },
    { trigger: "Medical bill update", count: 27 },
    { trigger: "Coverage change", count: 11 },
  ],
  trend: [
    { date: "2026-02-01", total: 4_180_000 },
    { date: "2026-02-08", total: 4_220_000 },
    { date: "2026-02-15", total: 4_240_000 },
    { date: "2026-02-22", total: 4_310_000 },
    { date: "2026-03-01", total: 4_330_000 },
    { date: "2026-03-08", total: 4_360_000 },
    { date: "2026-03-14", total: 4_400_000 },
  ],
};

// 37 at-risk total, distributed across the 3 rule types per guidelines.
const REGULATORY_SLAS: RegulatorySLAsView = {
  rules: [
    {
      ruleType: "first_contact",
      label: "First Contact",
      deadlineDays: 3,
      complianceRate: 96.7,
      inBreachCount: 16,
      cohortSize: 482,
    },
    {
      ruleType: "coverage_decision",
      label: "Coverage Decision",
      deadlineDays: 5,
      complianceRate: 94.4,
      inBreachCount: 14,
      cohortSize: 250,
    },
    {
      ruleType: "payment",
      label: "Payment",
      deadlineDays: 2,
      complianceRate: 96.4,
      inBreachCount: 7,
      cohortSize: 195,
    },
  ],
  atRiskTotal: 37,
};

const AGENT_PERFORMANCE: AgentPerformanceView = {
  agents: [
    {
      agentName: "Adjuster Agent",
      role: "End-to-end claim lifecycle",
      primaryStat: { value: "72%", label: "claims resolved" },
      kpis: [
        { label: "Tasks live", value: "214" },
        { label: "Avg completion", value: "1.8h" },
        { label: "Avg wait", value: "3.2h" },
      ],
      waiting: [
        { reason: "Awaiting customer reply", count: 38, avgWait: "2.1d" },
        { reason: "Awaiting repair shop", count: 18, avgWait: "1.4d" },
        { reason: "Adjuster review", count: 12, avgWait: "4h" },
      ],
      accent: "blue",
    },
    {
      agentName: "SIU Agent",
      role: "Fraud screening · EXIF · history",
      primaryStat: { value: "84%", label: "cleared without referral" },
      kpis: [
        { label: "Cases live", value: "47" },
        { label: "Referral rate", value: "16%" },
        { label: "Avg wait", value: "5.1h" },
      ],
      waiting: [
        { reason: "External database lookup", count: 9, avgWait: "3.2h" },
        { reason: "Reverse-image scan", count: 4, avgWait: "1.8h" },
      ],
      accent: "amber",
    },
    {
      agentName: "Subrogation Agent",
      role: "Recovery analysis pre-settlement",
      primaryStat: { value: "78%", label: "no subro identified" },
      kpis: [
        { label: "Cases live", value: "29" },
        { label: "Recovery ID'd", value: "$48k" },
        { label: "Avg wait", value: "2.7h" },
      ],
      waiting: [
        { reason: "Awaiting carrier reply", count: 6, avgWait: "1.2d" },
        { reason: "Police report retrieval", count: 3, avgWait: "8h" },
      ],
      accent: "violet",
    },
    {
      agentName: "AI Trainer Agent",
      role: "Pipeline monitoring · SOP improvement",
      primaryStat: { value: "157", label: "proposals created" },
      kpis: [
        { label: "Patterns active", value: "3" },
        { label: "Patterns pending", value: "8" },
        { label: "Patterns dismissed", value: "12" },
      ],
      waiting: [
        { reason: "Awaiting AI Trainer review", count: 8, avgWait: "1.4d" },
        { reason: "Awaiting more evidence", count: 5, avgWait: "3.1d" },
      ],
      accent: "indigo",
    },
  ],
};

const CSAT: CSATView = {
  score: 4.3,
  scoreDelta: 0.2,
  variance: 0.4,
  responseCount: 9,
  cohort: { start: MOCK_COHORT.filedStart, end: MOCK_COHORT.filedEnd },
  sparkline: [
    { date: "2026-02-04", score: 4.1 },
    { date: "2026-02-11", score: 4.2 },
    { date: "2026-02-18", score: 4.2 },
    { date: "2026-02-25", score: 4.3 },
    { date: "2026-03-04", score: 4.4 },
    { date: "2026-03-11", score: 4.3 },
  ],
  byResolutionPath: [
    { path: "autonomous", score: 4.6 },
    { path: "human_1touch", score: 4.2 },
    { path: "human_2plus", score: 3.5 },
  ],
  responses: [
    { id: "csat-1", claimId: "CLM-4821", score: 5, comment: "Fast and easy. Got my payment in two days.", respondedAt: "2026-03-12", resolutionPath: "autonomous", cycleDays: 4 },
    { id: "csat-2", claimId: "CLM-3204", score: 5, comment: "Smooth process, didn't have to call anyone.", respondedAt: "2026-03-10", resolutionPath: "autonomous", cycleDays: 3 },
    { id: "csat-3", claimId: "CLM-4109", score: 4, comment: "Quick, but the photo upload step was confusing.", respondedAt: "2026-03-08", resolutionPath: "autonomous", cycleDays: 5 },
    { id: "csat-4", claimId: "CLM-2847", score: 4, comment: "Adjuster called once, otherwise hands-off. Good.", respondedAt: "2026-03-07", resolutionPath: "human_1touch", cycleDays: 6 },
    { id: "csat-5", claimId: "CLM-5117", score: 4, comment: "Resolved well after one follow-up.", respondedAt: "2026-03-05", resolutionPath: "human_1touch", cycleDays: 7 },
    { id: "csat-6", claimId: "CLM-2991", score: 5, comment: "Great. Loved the SMS updates.", respondedAt: "2026-03-04", resolutionPath: "autonomous", cycleDays: 4 },
    { id: "csat-7", claimId: "CLM-3187", score: 3, comment: "Took multiple calls to sort out the deductible.", respondedAt: "2026-03-02", resolutionPath: "human_2plus", cycleDays: 11 },
    { id: "csat-8", claimId: "CLM-4002", score: 4, comment: "Mostly self-service. Settlement felt fair.", respondedAt: "2026-02-28", resolutionPath: "human_1touch", cycleDays: 8 },
    { id: "csat-9", claimId: "CLM-3955", score: 5, comment: "Honestly didn't expect it to be this seamless.", respondedAt: "2026-02-26", resolutionPath: "autonomous", cycleDays: 3 },
  ],
};

// Per guidelines: voice is hardest channel, 3rd parties materially lower than
// policyholders, feature-launch annotations show what drove improvements.
const AI_ACCEPTANCE: AIAcceptanceView = {
  audiences: [
    {
      audience: "policyholder",
      label: "Policyholders",
      channels: [
        {
          channel: "voice",
          color: "#f97316",
          points: [
            { day: 1, rate: 55 }, { day: 2, rate: 56 }, { day: 3, rate: 56 }, { day: 4, rate: 57 },
            { day: 5, rate: 58 }, { day: 6, rate: 58 }, { day: 7, rate: 59 }, { day: 8, rate: 61 },
            { day: 9, rate: 62 }, { day: 10, rate: 62 }, { day: 11, rate: 64 }, { day: 12, rate: 65 },
            { day: 13, rate: 65 }, { day: 14, rate: 65 },
          ],
          currentRate: 65,
        },
        {
          channel: "email",
          color: "#3b82f6",
          points: [
            { day: 1, rate: 91 }, { day: 2, rate: 91 }, { day: 3, rate: 92 }, { day: 4, rate: 92 },
            { day: 5, rate: 93 }, { day: 6, rate: 93 }, { day: 7, rate: 93 }, { day: 8, rate: 94 },
            { day: 9, rate: 94 }, { day: 10, rate: 94 }, { day: 11, rate: 94 }, { day: 12, rate: 94 },
            { day: 13, rate: 94 }, { day: 14, rate: 94 },
          ],
          currentRate: 94,
        },
        {
          channel: "sms",
          color: "#06b6d4",
          points: [
            { day: 1, rate: 87 }, { day: 2, rate: 87 }, { day: 3, rate: 88 }, { day: 4, rate: 88 },
            { day: 5, rate: 89 }, { day: 6, rate: 89 }, { day: 7, rate: 90 }, { day: 8, rate: 90 },
            { day: 9, rate: 90 }, { day: 10, rate: 91 }, { day: 11, rate: 91 }, { day: 12, rate: 91 },
            { day: 13, rate: 91 }, { day: 14, rate: 91 },
          ],
          currentRate: 91,
        },
      ],
      annotations: [
        { day: 4, label: "Handoff launch", color: "#94a3b8" },
        { day: 8, label: "Call-back sched.", color: "#f97316" },
        { day: 11, label: "Voice tone v2", color: "#f97316" },
      ],
    },
    {
      audience: "third_party",
      label: "3rd Parties",
      channels: [
        {
          channel: "voice",
          color: "#f97316",
          points: [
            { day: 1, rate: 30 }, { day: 2, rate: 30 }, { day: 3, rate: 31 }, { day: 4, rate: 31 },
            { day: 5, rate: 32 }, { day: 6, rate: 33 }, { day: 7, rate: 33 }, { day: 8, rate: 35 },
            { day: 9, rate: 35 }, { day: 10, rate: 36 }, { day: 11, rate: 37 }, { day: 12, rate: 37 },
            { day: 13, rate: 38 }, { day: 14, rate: 38 },
          ],
          currentRate: 38,
        },
        {
          channel: "email",
          color: "#3b82f6",
          points: [
            { day: 1, rate: 68 }, { day: 2, rate: 68 }, { day: 3, rate: 69 }, { day: 4, rate: 69 },
            { day: 5, rate: 70 }, { day: 6, rate: 71 }, { day: 7, rate: 71 }, { day: 8, rate: 72 },
            { day: 9, rate: 72 }, { day: 10, rate: 73 }, { day: 11, rate: 73 }, { day: 12, rate: 74 },
            { day: 13, rate: 74 }, { day: 14, rate: 74 },
          ],
          currentRate: 74,
        },
        {
          channel: "sms",
          color: "#06b6d4",
          points: [
            { day: 1, rate: 63 }, { day: 2, rate: 63 }, { day: 3, rate: 64 }, { day: 4, rate: 65 },
            { day: 5, rate: 65 }, { day: 6, rate: 66 }, { day: 7, rate: 66 }, { day: 8, rate: 67 },
            { day: 9, rate: 68 }, { day: 10, rate: 68 }, { day: 11, rate: 69 }, { day: 12, rate: 69 },
            { day: 13, rate: 70 }, { day: 14, rate: 70 },
          ],
          currentRate: 70,
        },
      ],
      annotations: [
        { day: 5, label: "Repair-shop portal", color: "#94a3b8" },
        { day: 10, label: "Voice retry policy", color: "#f97316" },
      ],
    },
  ],
};

const DECISION_CONSISTENCY: DecisionConsistencyView = {
  ai: { rate: 99.9, sampleSize: 1850 },
  human: { rate: 75.0, sampleSize: 412 },
  gapPp: 24.9,
};

// Stage occupancy snapshots over a 14-day window post-FNOL.
const PIPELINE_STAGES = [
  "FNOL", "Triage", "Investigation", "Coverage", "Damage Assessment",
  "Reserve", "Negotiation", "Settlement",
];
const PIPELINE: PipelineView = {
  windowDays: 14,
  stages: PIPELINE_STAGES,
  series: Array.from({ length: 14 }, (_, i) => {
    const day = i + 1;
    const dateMs = new Date("2026-03-01").getTime() + i * 86_400_000;
    const date = new Date(dateMs).toISOString().slice(0, 10);
    const counts: Record<string, number> = {};
    counts.FNOL = Math.max(0, 60 - day * 4);
    counts.Triage = Math.max(0, 50 - Math.abs(day - 2) * 5);
    counts.Investigation = Math.max(0, 70 - Math.abs(day - 4) * 7);
    counts.Coverage = Math.max(0, 65 - Math.abs(day - 5) * 6);
    counts["Damage Assessment"] = Math.max(0, 80 - Math.abs(day - 7) * 6);
    counts.Reserve = Math.max(0, 55 - Math.abs(day - 8) * 5);
    counts.Negotiation = Math.max(0, 50 - Math.abs(day - 10) * 5);
    counts.Settlement = Math.max(0, 40 - Math.abs(day - 12) * 4);
    return { day, date, counts };
  }),
  slaMarkers: [
    { day: 3, ruleName: "First Contact ≤3d" },
    { day: 5, ruleName: "Coverage Decision ≤5d" },
  ],
};

const LIVE_TASKS_FEED: LiveTasksFeedView = {
  events: [
    { id: "e1", relativeTime: "just now", executorType: "agent", claimId: "CLM-4821", claimRef: "CLM-4821", description: "Reserve updated to $18,700 after estimate received", fromStatus: "Awaiting Data", toStatus: "Running", stageBadge: "Reserve" },
    { id: "e2", relativeTime: "1m ago", executorType: "agent", claimId: "CLM-3204", claimRef: "CLM-3204", description: "Coverage decision rendered — accident covered", fromStatus: "Running", toStatus: "Running", stageBadge: "Coverage" },
    { id: "e3", relativeTime: "3m ago", executorType: "human", claimId: "CLM-3187", claimRef: "CLM-3187", description: "Sarah K. approved $5,200 settlement offer", fromStatus: "Waiting for Input", toStatus: "Running", stageBadge: "Settlement" },
    { id: "e4", relativeTime: "4m ago", executorType: "agent", claimId: "CLM-2991", claimRef: "CLM-2991", description: "Voice call to policyholder completed — payment confirmed", fromStatus: "Running", toStatus: "Done", stageBadge: "Settlement" },
    { id: "e5", relativeTime: "6m ago", executorType: "agent", claimId: "CLM-5117", claimRef: "CLM-5117", description: "SIU cleared after EXIF check", fromStatus: "Running", toStatus: "Running", stageBadge: "Investigation" },
    { id: "e6", relativeTime: "8m ago", executorType: "human", claimId: "CLM-4109", claimRef: "CLM-4109", description: "Mike R. requested repair shop estimate", fromStatus: "Running", toStatus: "Awaiting Data", stageBadge: "Damage Assess" },
    { id: "e7", relativeTime: "11m ago", executorType: "agent", claimId: "CLM-2847", claimRef: "CLM-2847", description: "FNOL parsed and triaged", fromStatus: "NOL", toStatus: "Running", stageBadge: "Triage" },
    { id: "e8", relativeTime: "14m ago", executorType: "agent", claimId: "CLM-4002", claimRef: "CLM-4002", description: "Subrogation evaluation complete — no recovery", fromStatus: "Running", toStatus: "Running", stageBadge: "Subro" },
  ],
};

export const MOCK_DASHBOARD: DashboardData = {
  northStar: NORTH_STAR,
  statusDistribution: STATUS_DISTRIBUTION,
  bottlenecks: BOTTLENECKS,
  autonomy: AUTONOMY,
  reserves: RESERVES,
  regulatorySLAs: REGULATORY_SLAS,
  agentPerformance: AGENT_PERFORMANCE,
  csat: CSAT,
  aiAcceptance: AI_ACCEPTANCE,
  decisionConsistency: DECISION_CONSISTENCY,
  pipeline: PIPELINE,
  liveTasksFeed: LIVE_TASKS_FEED,
};
