// @vitest-environment jsdom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Agent } from "@paperclipai/shared";
import { ActingAsProvider } from "../context/ActingAsContext";
import { ActingAsSwitcher } from "./ActingAsSwitcher";

const mockAgentsApi = vi.hoisted(() => ({
  list: vi.fn(),
}));

vi.mock("../api/agents", () => ({
  agentsApi: mockAgentsApi,
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

function makeHuman(id: string, name: string): Agent {
  return {
    id,
    companyId: "co-1",
    name,
    urlKey: name.toLowerCase(),
    role: "general",
    kind: "human",
    title: null,
    icon: null,
    status: "active",
    reportsTo: null,
    capabilities: null,
    adapterType: "claude_code",
    adapterConfig: {},
    runtimeConfig: {},
    budgetMonthlyCents: 0,
    spentMonthlyCents: 0,
    pauseReason: null,
    pausedAt: null,
    permissions: { canCreateAgents: false },
    lastHeartbeatAt: null,
    metadata: null,
    createdAt: new Date("2026-04-08T00:00:00.000Z"),
    updatedAt: new Date("2026-04-08T00:00:00.000Z"),
  } as Agent;
}

let container: HTMLDivElement | null = null;
let root: Root | null = null;

beforeEach(() => {
  localStorage.clear();
  mockAgentsApi.list.mockReset();
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  container?.remove();
  container = null;
  root = null;
});

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

async function flush() {
  for (let i = 0; i < 20; i++) {
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });
  }
}

describe("ActingAsSwitcher", () => {
  it("queries agentsApi.list with kind=human", async () => {
    mockAgentsApi.list.mockResolvedValue([
      makeHuman("h-1", "Adjuster"),
      makeHuman("h-2", "Supervisor"),
    ]);
    const qc = makeQueryClient();
    act(() => {
      root!.render(
        <QueryClientProvider client={qc}>
          <ActingAsProvider companyId="co-1">
            <ActingAsSwitcher companyId="co-1" userName="Lee" />
          </ActingAsProvider>
        </QueryClientProvider>,
      );
    });
    await flush();
    expect(mockAgentsApi.list).toHaveBeenCalledWith("co-1", { kind: "human" });
  });

  it("renders 'Acting as …' label when no persona selected", async () => {
    mockAgentsApi.list.mockResolvedValue([]);
    const qc = makeQueryClient();
    act(() => {
      root!.render(
        <QueryClientProvider client={qc}>
          <ActingAsProvider companyId="co-1">
            <ActingAsSwitcher companyId="co-1" userName="Lee" />
          </ActingAsProvider>
        </QueryClientProvider>,
      );
    });
    await flush();
    const trigger = container?.querySelector('[data-testid="acting-as-trigger"]');
    expect(trigger?.textContent).toContain("Acting as");
  });

  it("renders 'Lee → Adjuster' when persona pre-seeded via localStorage", async () => {
    localStorage.setItem("paperclip:acting-as:co-1", "h-1");
    mockAgentsApi.list.mockResolvedValue([
      makeHuman("h-1", "Adjuster"),
      makeHuman("h-2", "Supervisor"),
    ]);
    const qc = makeQueryClient();
    act(() => {
      root!.render(
        <QueryClientProvider client={qc}>
          <ActingAsProvider companyId="co-1">
            <ActingAsSwitcher companyId="co-1" userName="Lee" />
          </ActingAsProvider>
        </QueryClientProvider>,
      );
    });
    await flush();
    const trigger = container?.querySelector('[data-testid="acting-as-trigger"]');
    expect(trigger?.textContent).toContain("Lee → Adjuster");
  });
});
