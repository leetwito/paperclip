import { describe, it, expect } from "vitest";
import { agents } from "../agents.js";

describe("agents schema", () => {
  it("has a 'kind' column with default 'ai'", () => {
    const col = (agents as unknown as { kind?: { default: unknown; notNull?: boolean } }).kind;
    expect(col).toBeDefined();
    expect(col?.default).toBe("ai");
  });
});
