import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import {
  agents,
  agentWakeupRequests,
  companies,
  createDb,
  heartbeatRuns,
} from "@paperclipai/db";
import {
  getEmbeddedPostgresTestSupport,
  startEmbeddedPostgresTestDatabase,
} from "./helpers/embedded-postgres.js";
import { heartbeatService } from "../services/heartbeat.ts";

const embeddedPostgresSupport = await getEmbeddedPostgresTestSupport();
const describeEmbeddedPostgres = embeddedPostgresSupport.supported ? describe : describe.skip;

if (!embeddedPostgresSupport.supported) {
  console.warn(
    `Skipping scheduler-skips-humans embedded Postgres tests on this host: ${embeddedPostgresSupport.reason ?? "unsupported environment"}`,
  );
}

describeEmbeddedPostgres("scheduler excludes kind=human agents", () => {
  let db!: ReturnType<typeof createDb>;
  let tempDb: Awaited<ReturnType<typeof startEmbeddedPostgresTestDatabase>> | null = null;

  beforeAll(async () => {
    tempDb = await startEmbeddedPostgresTestDatabase("paperclip-scheduler-skips-humans-");
    db = createDb(tempDb.connectionString);
  }, 60_000);

  afterEach(async () => {
    // Use TRUNCATE ... CASCADE to clear everything that references companies
    // (runtime state, wakeup requests, run events, etc.) in a single step.
    await db.execute(
      sql`TRUNCATE TABLE companies RESTART IDENTITY CASCADE`,
    );
  });

  afterAll(async () => {
    await tempDb?.cleanup();
  });

  async function seedCompanyWithAiAndHuman() {
    const companyId = randomUUID();
    const aiAgentId = randomUUID();
    const humanAgentId = randomUUID();
    const issuePrefix = `T${companyId.replace(/-/g, "").slice(0, 6).toUpperCase()}`;

    await db.insert(companies).values({
      id: companyId,
      name: "Paperclip",
      issuePrefix,
      requireBoardApprovalForNewAgents: false,
    });

    // AI agent — idle, with heartbeat enabled so tickTimers should pick it up.
    await db.insert(agents).values({
      id: aiAgentId,
      companyId,
      name: "Builder",
      role: "engineer",
      kind: "ai",
      status: "idle",
      adapterType: "process",
      adapterConfig: {},
      runtimeConfig: {
        heartbeat: { enabled: true, intervalSec: 1, wakeOnDemand: true },
      },
      permissions: {},
      lastHeartbeatAt: new Date(Date.now() - 10 * 60 * 1000),
    });

    // Human agent — idle with an enabled heartbeat policy too. The scheduler
    // MUST still exclude it purely on the basis of kind=human.
    await db.insert(agents).values({
      id: humanAgentId,
      companyId,
      name: "VP of Claims",
      role: "ceo",
      kind: "human",
      status: "idle",
      adapterType: "process",
      adapterConfig: {},
      runtimeConfig: {
        heartbeat: { enabled: true, intervalSec: 1, wakeOnDemand: true },
      },
      permissions: {},
      lastHeartbeatAt: new Date(Date.now() - 10 * 60 * 1000),
    });

    return { companyId, aiAgentId, humanAgentId };
  }

  it("tickTimers does not enqueue a wakeup for kind=human agents", async () => {
    const { aiAgentId, humanAgentId } = await seedCompanyWithAiAndHuman();
    const heartbeat = heartbeatService(db);

    // Run the scheduler "tick". The AI agent should be eligible; the human
    // agent must be skipped regardless of status/heartbeat policy.
    await heartbeat.tickTimers();

    const wakeupRequests = await db.select().from(agentWakeupRequests);

    const humanRequests = wakeupRequests.filter((r) => r.agentId === humanAgentId);
    expect(humanRequests).toHaveLength(0);

    const aiRequests = wakeupRequests.filter((r) => r.agentId === aiAgentId);
    expect(aiRequests.length).toBeGreaterThan(0);
  }, 30_000);

  it("heartbeat.wakeup refuses on-demand wakeups for kind=human agents", async () => {
    const { humanAgentId } = await seedCompanyWithAiAndHuman();
    const heartbeat = heartbeatService(db);

    await expect(
      heartbeat.wakeup(humanAgentId, {
        source: "on_demand",
        triggerDetail: "system",
        reason: "manual_wake",
        contextSnapshot: {},
      }),
    ).rejects.toMatchObject({
      // Paperclip's `conflict(...)` helper produces a 409 HttpError.
      status: 409,
    });

    const runs = await db
      .select()
      .from(heartbeatRuns);
    expect(runs).toHaveLength(0);
  }, 30_000);
});
