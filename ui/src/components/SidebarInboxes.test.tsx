// @vitest-environment jsdom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Agent } from "@paperclipai/shared";
import { SidebarInboxes } from "./SidebarInboxes";

const mockAgentsApi = vi.hoisted(() => ({
  list: vi.fn(),
}));

vi.mock("../api/agents", () => ({
  agentsApi: mockAgentsApi,
}));

// useInboxBadge pulls from many APIs; stub it out so tests stay focused.
vi.mock("../hooks/useInboxBadge", () => ({
  useInboxBadge: () => ({ inbox: 0, failedRuns: 0 }),
}));

vi.mock("../context/SidebarContext", () => ({
  useSidebar: () => ({ isMobile: false, setSidebarOpen: () => {} }),
}));

// NavLink uses useCompany() to resolve company-prefixed paths; stub it.
vi.mock("@/context/CompanyContext", () => ({
  useCompany: () => ({ selectedCompany: null, selectedCompanyId: "co-1" }),
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

function makeHuman(id: string, name: string, reportsTo: string | null = null): Agent {
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
    reportsTo,
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

function render(ui: React.ReactNode) {
  const qc = makeQueryClient();
  act(() => {
    root!.render(
      <QueryClientProvider client={qc}>
        <MemoryRouter>{ui}</MemoryRouter>
      </QueryClientProvider>,
    );
  });
}

describe("SidebarInboxes", () => {
  it("renders 'Inbox' parent plus one child row per human agent", async () => {
    mockAgentsApi.list.mockResolvedValue([
      makeHuman("h-vp", "VPClaims", null),
      makeHuman("h-adj", "Adjuster", "h-vp"),
      makeHuman("h-tr", "Trainer", "h-vp"),
    ]);
    render(<SidebarInboxes companyId="co-1" />);
    await flush();

    const parent = container?.querySelector('a[href="/inbox"]');
    expect(parent?.textContent).toContain("Inbox");

    const vp = container?.querySelector('a[href="/inbox/h-vp"]');
    const adj = container?.querySelector('a[href="/inbox/h-adj"]');
    const tr = container?.querySelector('a[href="/inbox/h-tr"]');
    expect(vp?.textContent).toContain("VPClaims");
    expect(adj?.textContent).toContain("Adjuster");
    expect(tr?.textContent).toContain("Trainer");
  });

  it("renders only the 'Inbox' parent when no human agents exist", async () => {
    mockAgentsApi.list.mockResolvedValue([]);
    render(<SidebarInboxes companyId="co-1" />);
    await flush();

    const parent = container?.querySelector('a[href="/inbox"]');
    expect(parent?.textContent).toContain("Inbox");

    const children = container?.querySelectorAll('a[href^="/inbox/"]');
    expect(children?.length ?? 0).toBe(0);
  });

  it("sorts children by reportsTo-depth (null first), then by name", async () => {
    // Deliberate unsorted input: two shallow (reportsTo=null) + two deep, mixed names.
    mockAgentsApi.list.mockResolvedValue([
      makeHuman("h-trainer", "Trainer", "h-vp"),
      makeHuman("h-vp", "VPClaims", null),
      makeHuman("h-ceo", "CEOAssistant", null),
      makeHuman("h-adjuster", "Adjuster", "h-vp"),
    ]);
    render(<SidebarInboxes companyId="co-1" />);
    await flush();

    const childLinks = Array.from(
      container?.querySelectorAll('a[href^="/inbox/"]') ?? [],
    ) as HTMLAnchorElement[];
    const names = childLinks.map((a) => a.textContent?.trim());

    // Expected order: shallow (null reportsTo) alphabetical, then deep alphabetical.
    //   CEOAssistant, VPClaims, Adjuster, Trainer
    expect(names).toEqual(["CEOAssistant", "VPClaims", "Adjuster", "Trainer"]);
  });
});
