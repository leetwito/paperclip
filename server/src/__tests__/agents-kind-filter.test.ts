import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const companyId = "22222222-2222-4222-8222-222222222222";
const aiAgentId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const humanAgentId = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

const aiAgent = {
  id: aiAgentId,
  companyId,
  name: "Builder",
  urlKey: "builder",
  role: "engineer",
  title: "Builder",
  kind: "ai",
  icon: null,
  status: "idle",
  reportsTo: null,
  capabilities: null,
  adapterType: "process",
  adapterConfig: {},
  runtimeConfig: {},
  budgetMonthlyCents: 0,
  spentMonthlyCents: 0,
  pauseReason: null,
  pausedAt: null,
  permissions: { canCreateAgents: false },
  lastHeartbeatAt: null,
  metadata: null,
  createdAt: new Date("2026-04-01T00:00:00.000Z"),
  updatedAt: new Date("2026-04-01T00:00:00.000Z"),
};

const humanAgent = {
  ...aiAgent,
  id: humanAgentId,
  name: "VP of Claims",
  urlKey: "vp-of-claims",
  role: "ceo",
  title: "VP of Claims",
  kind: "human",
};

const mockAgentService = vi.hoisted(() => ({
  list: vi.fn(),
  getById: vi.fn(),
  getChainOfCommand: vi.fn(),
  resolveByReference: vi.fn(),
}));

const mockAccessService = vi.hoisted(() => ({
  canUser: vi.fn(),
  hasPermission: vi.fn(),
  getMembership: vi.fn(),
  ensureMembership: vi.fn(),
  listPrincipalGrants: vi.fn(),
  setPrincipalPermission: vi.fn(),
}));

const mockApprovalService = vi.hoisted(() => ({ create: vi.fn(), getById: vi.fn() }));
const mockBudgetService = vi.hoisted(() => ({ upsertPolicy: vi.fn() }));
const mockHeartbeatService = vi.hoisted(() => ({
  listTaskSessions: vi.fn(),
  resetRuntimeSession: vi.fn(),
  getRun: vi.fn(),
  cancelRun: vi.fn(),
}));
const mockIssueApprovalService = vi.hoisted(() => ({ linkManyForApproval: vi.fn() }));
const mockIssueService = vi.hoisted(() => ({ list: vi.fn() }));
const mockSecretService = vi.hoisted(() => ({
  normalizeAdapterConfigForPersistence: vi.fn(),
  resolveAdapterConfigForRuntime: vi.fn(),
}));
const mockAgentInstructionsService = vi.hoisted(() => ({ materializeManagedBundle: vi.fn() }));
const mockCompanySkillService = vi.hoisted(() => ({
  listRuntimeSkillEntries: vi.fn(),
  resolveRequestedSkillKeys: vi.fn(),
}));
const mockWorkspaceOperationService = vi.hoisted(() => ({}));
const mockLogActivity = vi.hoisted(() => vi.fn());
const mockTrackAgentCreated = vi.hoisted(() => vi.fn());
const mockGetTelemetryClient = vi.hoisted(() => vi.fn());

vi.mock("@paperclipai/shared/telemetry", () => ({
  trackAgentCreated: mockTrackAgentCreated,
  trackErrorHandlerCrash: vi.fn(),
}));

vi.mock("../telemetry.js", () => ({
  getTelemetryClient: mockGetTelemetryClient,
}));

vi.mock("../services/index.js", () => ({
  agentService: () => mockAgentService,
  agentInstructionsService: () => mockAgentInstructionsService,
  accessService: () => mockAccessService,
  approvalService: () => mockApprovalService,
  companySkillService: () => mockCompanySkillService,
  budgetService: () => mockBudgetService,
  heartbeatService: () => mockHeartbeatService,
  issueApprovalService: () => mockIssueApprovalService,
  issueService: () => mockIssueService,
  logActivity: mockLogActivity,
  secretService: () => mockSecretService,
  syncInstructionsBundleConfigFromFilePath: vi.fn((_agent, config) => config),
  workspaceOperationService: () => mockWorkspaceOperationService,
}));

function createDbStub() {
  return {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          then: vi.fn().mockResolvedValue([
            { id: companyId, name: "Paperclip", requireBoardApprovalForNewAgents: false },
          ]),
        }),
      }),
    }),
  };
}

async function createApp() {
  const [{ agentRoutes }, { errorHandler }] = await Promise.all([
    import("../routes/agents.js"),
    import("../middleware/index.js"),
  ]);
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    (req as any).actor = {
      type: "board",
      userId: "board-user",
      source: "local_implicit",
      isInstanceAdmin: true,
      companyIds: [companyId],
    };
    next();
  });
  app.use("/api", agentRoutes(createDbStub() as any));
  app.use(errorHandler);
  return app;
}

describe("GET /companies/:companyId/agents — ?kind filter", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockGetTelemetryClient.mockReturnValue({ track: vi.fn() });
    mockAccessService.canUser.mockResolvedValue(true);

    mockAgentService.list.mockImplementation(
      async (_companyId: string, opts?: { kind?: "ai" | "human" }) => {
        const all = [aiAgent, humanAgent];
        if (!opts?.kind) return all;
        return all.filter((a) => a.kind === opts.kind);
      },
    );
  });

  it("returns only human agents when ?kind=human is provided", async () => {
    const res = await request(await createApp()).get(
      `/api/companies/${companyId}/agents?kind=human`,
    );

    expect(res.status).toBe(200);
    expect(mockAgentService.list).toHaveBeenCalledWith(companyId, { kind: "human" });
    expect(res.body).toHaveLength(1);
    expect(res.body[0].id).toBe(humanAgentId);
    expect(res.body[0].kind).toBe("human");
  });

  it("returns only AI agents when ?kind=ai is provided", async () => {
    const res = await request(await createApp()).get(
      `/api/companies/${companyId}/agents?kind=ai`,
    );

    expect(res.status).toBe(200);
    expect(mockAgentService.list).toHaveBeenCalledWith(companyId, { kind: "ai" });
    expect(res.body).toHaveLength(1);
    expect(res.body[0].id).toBe(aiAgentId);
    expect(res.body[0].kind).toBe("ai");
  });

  it("returns all agents when no kind filter is provided", async () => {
    const res = await request(await createApp()).get(`/api/companies/${companyId}/agents`);

    expect(res.status).toBe(200);
    expect(mockAgentService.list).toHaveBeenCalledWith(companyId, { kind: undefined });
    expect(res.body).toHaveLength(2);
    const ids = res.body.map((a: { id: string }) => a.id).sort();
    expect(ids).toEqual([aiAgentId, humanAgentId].sort());
  });

  it("ignores invalid kind values and returns all agents", async () => {
    const res = await request(await createApp()).get(
      `/api/companies/${companyId}/agents?kind=bogus`,
    );

    expect(res.status).toBe(200);
    expect(mockAgentService.list).toHaveBeenCalledWith(companyId, { kind: undefined });
    expect(res.body).toHaveLength(2);
  });
});
