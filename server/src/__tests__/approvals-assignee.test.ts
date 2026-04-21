import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockApprovalService = vi.hoisted(() => ({
  list: vi.fn(),
  getById: vi.fn(),
  create: vi.fn(),
  approve: vi.fn(),
  reject: vi.fn(),
  requestRevision: vi.fn(),
  resubmit: vi.fn(),
  listComments: vi.fn(),
  addComment: vi.fn(),
}));

const mockHeartbeatService = vi.hoisted(() => ({
  wakeup: vi.fn(),
}));

const mockIssueApprovalService = vi.hoisted(() => ({
  listIssuesForApproval: vi.fn(),
  linkManyForApproval: vi.fn(),
}));

const mockSecretService = vi.hoisted(() => ({
  normalizeHireApprovalPayloadForPersistence: vi.fn(),
}));

const mockLogActivity = vi.hoisted(() => vi.fn());

vi.mock("../services/index.js", () => ({
  approvalService: () => mockApprovalService,
  heartbeatService: () => mockHeartbeatService,
  issueApprovalService: () => mockIssueApprovalService,
  logActivity: mockLogActivity,
  secretService: () => mockSecretService,
}));

async function createAgentApp() {
  const [{ approvalRoutes }, { errorHandler }] = await Promise.all([
    import("../routes/approvals.js"),
    import("../middleware/index.js"),
  ]);
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    (req as any).actor = {
      type: "agent",
      agentId: "agent-1",
      companyId: "company-1",
      source: "api_key",
      isInstanceAdmin: false,
    };
    next();
  });
  app.use("/api", approvalRoutes({} as any));
  app.use(errorHandler);
  return app;
}

const CEO_AGENT_ID = "77777777-7777-4777-8777-777777777777";

describe("POST /companies/:companyId/approvals — assigneeAgentId validation", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockIssueApprovalService.listIssuesForApproval.mockResolvedValue([]);
    mockIssueApprovalService.linkManyForApproval.mockResolvedValue(undefined);
    mockLogActivity.mockResolvedValue(undefined);
  });

  it("returns 400 when assigneeAgentId is missing", async () => {
    const app = await createAgentApp();
    const res = await request(app)
      .post("/api/companies/company-1/approvals")
      .send({
        type: "request_board_approval",
        payload: { title: "Approve hosting spend" },
      });

    expect(res.status).toBe(400);
    expect(mockApprovalService.create).not.toHaveBeenCalled();
  }, 15000);

  it("returns 201 with assigneeAgentId populated when a valid agent id is provided", async () => {
    mockApprovalService.create.mockImplementation(async (_companyId: string, data: any) => ({
      id: "approval-1",
      companyId: "company-1",
      type: data.type,
      requestedByAgentId: data.requestedByAgentId ?? null,
      requestedByUserId: data.requestedByUserId ?? null,
      assigneeAgentId: data.assigneeAgentId,
      status: "pending",
      payload: data.payload ?? {},
      decisionNote: null,
      decidedByUserId: null,
      decidedAt: null,
      createdAt: new Date("2026-04-21T00:00:00.000Z"),
      updatedAt: new Date("2026-04-21T00:00:00.000Z"),
    }));

    const res = await request(await createAgentApp())
      .post("/api/companies/company-1/approvals")
      .send({
        type: "request_board_approval",
        assigneeAgentId: CEO_AGENT_ID,
        payload: { title: "Approve hosting spend" },
      });

    expect(res.status).toBe(201);
    expect(res.body.assigneeAgentId).toBe(CEO_AGENT_ID);
    expect(mockApprovalService.create).toHaveBeenCalledWith(
      "company-1",
      expect.objectContaining({
        type: "request_board_approval",
        assigneeAgentId: CEO_AGENT_ID,
        status: "pending",
      }),
    );
  });
});
