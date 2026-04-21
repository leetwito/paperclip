import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const companyId = "company-1";
const aiAgentId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const humanAgentId = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const aiIssueId = "11111111-1111-4111-8111-111111111111";
const humanIssueId = "22222222-2222-4222-8222-222222222222";

const aiAgent = {
  id: aiAgentId,
  companyId,
  name: "Builder",
  kind: "ai",
  role: "engineer",
  status: "idle",
};

const humanAgent = {
  id: humanAgentId,
  companyId,
  name: "VP of Claims",
  kind: "human",
  role: "ceo",
  status: "idle",
};

const mockIssueService = vi.hoisted(() => ({
  getById: vi.fn(),
  checkout: vi.fn(),
  assertCheckoutOwner: vi.fn(),
  findMentionedAgents: vi.fn(),
  getRelationSummaries: vi.fn(),
  listWakeableBlockedDependents: vi.fn(),
  getWakeableParentAfterChildCompletion: vi.fn(),
}));

const mockAgentService = vi.hoisted(() => ({
  getById: vi.fn(),
}));

const mockHeartbeatService = vi.hoisted(() => ({
  wakeup: vi.fn(async () => undefined),
  reportRunActivity: vi.fn(async () => undefined),
  getRun: vi.fn(async () => null),
  getActiveRunForAgent: vi.fn(async () => null),
  cancelRun: vi.fn(async () => null),
}));

const mockProjectService = vi.hoisted(() => ({
  getById: vi.fn(async () => null),
}));

const mockExecutionWorkspaceService = vi.hoisted(() => ({
  getById: vi.fn(async () => null),
}));

vi.mock("../services/index.js", () => ({
  accessService: () => ({
    canUser: vi.fn(async () => false),
    hasPermission: vi.fn(async () => false),
  }),
  agentService: () => mockAgentService,
  documentService: () => ({}),
  executionWorkspaceService: () => mockExecutionWorkspaceService,
  feedbackService: () => ({
    listIssueVotesForUser: vi.fn(async () => []),
    saveIssueVote: vi.fn(async () => ({ vote: null, consentEnabledNow: false, sharingEnabled: false })),
  }),
  goalService: () => ({}),
  heartbeatService: () => mockHeartbeatService,
  instanceSettingsService: () => ({
    get: vi.fn(async () => ({
      id: "instance-settings-1",
      general: {
        censorUsernameInLogs: false,
        feedbackDataSharingPreference: "prompt",
      },
    })),
    listCompanyIds: vi.fn(async () => [companyId]),
  }),
  issueApprovalService: () => ({}),
  issueService: () => mockIssueService,
  logActivity: vi.fn(async () => undefined),
  projectService: () => mockProjectService,
  routineService: () => ({
    syncRunStatusForIssue: vi.fn(async () => undefined),
  }),
  workProductService: () => ({}),
}));

async function createApp() {
  const [{ issueRoutes }, { errorHandler }] = await Promise.all([
    import("../routes/issues.js"),
    import("../middleware/index.js"),
  ]);
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    (req as any).actor = {
      type: "board",
      userId: "local-board",
      companyIds: [companyId],
      source: "local_implicit",
      isInstanceAdmin: false,
    };
    next();
  });
  app.use("/api", issueRoutes({} as any, {} as any));
  app.use(errorHandler);
  return app;
}

describe("POST /issues/:id/checkout — kind=human guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIssueService.assertCheckoutOwner.mockResolvedValue({ adoptedFromRunId: null });
    mockIssueService.findMentionedAgents.mockResolvedValue([]);
    mockIssueService.getRelationSummaries.mockResolvedValue({ blockedBy: [], blocks: [] });
    mockIssueService.listWakeableBlockedDependents.mockResolvedValue([]);
    mockIssueService.getWakeableParentAfterChildCompletion.mockResolvedValue(null);
  });

  it("rejects checkout targeting a human agent with 422 and a human-mentioning error", async () => {
    mockIssueService.getById.mockResolvedValue({
      id: humanIssueId,
      companyId,
      status: "todo",
      assigneeAgentId: humanAgentId,
      executionWorkspaceId: null,
      projectId: null,
    });
    mockAgentService.getById.mockImplementation(async (id: string) => {
      if (id === humanAgentId) return humanAgent;
      if (id === aiAgentId) return aiAgent;
      return null;
    });

    const res = await request(await createApp())
      .post(`/api/issues/${humanIssueId}/checkout`)
      .send({ agentId: humanAgentId, expectedStatuses: ["todo"] });

    expect(res.status).toBe(422);
    expect(typeof res.body?.error).toBe("string");
    expect(res.body.error.toLowerCase()).toContain("human");
    expect(mockIssueService.checkout).not.toHaveBeenCalled();
  });

  it("still allows checkout targeting an AI agent", async () => {
    mockIssueService.getById.mockResolvedValue({
      id: aiIssueId,
      companyId,
      status: "todo",
      assigneeAgentId: aiAgentId,
      executionWorkspaceId: null,
      projectId: null,
    });
    mockAgentService.getById.mockImplementation(async (id: string) => {
      if (id === aiAgentId) return aiAgent;
      if (id === humanAgentId) return humanAgent;
      return null;
    });
    mockIssueService.checkout.mockResolvedValue({
      id: aiIssueId,
      companyId,
      status: "in_progress",
      assigneeAgentId: aiAgentId,
    });

    const res = await request(await createApp())
      .post(`/api/issues/${aiIssueId}/checkout`)
      .send({ agentId: aiAgentId, expectedStatuses: ["todo"] });

    expect(res.status).toBeLessThan(400);
    expect(mockIssueService.checkout).toHaveBeenCalled();
  });
});
