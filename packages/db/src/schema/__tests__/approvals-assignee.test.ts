import { describe, it, expect } from "vitest";
import { approvals } from "../approvals.js";

describe("approvals schema", () => {
  it("has an 'assigneeAgentId' column that is not null", () => {
    const col = (approvals as unknown as { assigneeAgentId?: { notNull: boolean } }).assigneeAgentId;
    expect(col).toBeDefined();
    expect(col?.notNull).toBe(true);
  });
});
