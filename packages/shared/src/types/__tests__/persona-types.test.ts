import { describe, it, expectTypeOf } from "vitest";
import type { Agent } from "../agent.js";
import type { Approval } from "../approval.js";
import type { AgentKind } from "../../constants.js";

describe("persona types", () => {
  it("Agent.kind is AgentKind", () => {
    expectTypeOf<Agent["kind"]>().toEqualTypeOf<AgentKind>();
  });

  it("Approval.assigneeAgentId is string (non-null)", () => {
    expectTypeOf<Approval["assigneeAgentId"]>().toEqualTypeOf<string>();
  });
});
