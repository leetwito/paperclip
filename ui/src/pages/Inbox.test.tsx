// @vitest-environment jsdom

import { act } from "react";
import type { ComponentProps } from "react";
import { createRoot } from "react-dom/client";
import type { Approval, Issue } from "@paperclipai/shared";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApprovalInboxRow, FailedRunInboxRow, InboxIssueMetaLeading, InboxIssueTrailingColumns } from "./Inbox";
import {
  filterInboxWorkItemsByPersona,
  getInboxWorkItems,
} from "@/lib/inbox";

vi.mock("@/lib/router", () => ({
  Link: ({ children, className, ...props }: ComponentProps<"a">) => (
    <a className={className} {...props}>{children}</a>
  ),
  useLocation: () => ({ pathname: "/", search: "", hash: "" }),
  useNavigate: () => () => {},
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

function createIssue(overrides: Partial<Issue> = {}): Issue {
  return {
    id: "issue-1",
    identifier: "PAP-904",
    companyId: "company-1",
    projectId: null,
    projectWorkspaceId: null,
    goalId: null,
    parentId: null,
    title: "Inbox item",
    description: null,
    status: "todo",
    priority: "medium",
    assigneeAgentId: null,
    assigneeUserId: null,
    createdByAgentId: null,
    createdByUserId: null,
    issueNumber: 904,
    requestDepth: 0,
    billingCode: null,
    assigneeAdapterOverrides: null,
    executionWorkspaceId: null,
    executionWorkspacePreference: null,
    executionWorkspaceSettings: null,
    checkoutRunId: null,
    executionRunId: null,
    executionAgentNameKey: null,
    executionLockedAt: null,
    startedAt: null,
    completedAt: null,
    cancelledAt: null,
    hiddenAt: null,
    createdAt: new Date("2026-03-11T00:00:00.000Z"),
    updatedAt: new Date("2026-03-11T00:00:00.000Z"),
    labels: [],
    labelIds: [],
    myLastTouchAt: null,
    lastExternalCommentAt: null,
    lastActivityAt: new Date("2026-03-11T00:00:00.000Z"),
    isUnreadForMe: false,
    ...overrides,
  };
}

describe("FailedRunInboxRow", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it("suppresses accent hover styling when selected", () => {
    const root = createRoot(container);
    const run = {
      id: "run-1",
      companyId: "company-1",
      agentId: "agent-1",
      invocationSource: "assignment",
      triggerDetail: null,
      status: "failed",
      error: "boom",
      wakeupRequestId: null,
      exitCode: null,
      signal: null,
      usageJson: null,
      resultJson: null,
      sessionIdBefore: null,
      sessionIdAfter: null,
      logStore: null,
      logRef: null,
      logBytes: null,
      logSha256: null,
      logCompressed: false,
      errorCode: null,
      externalRunId: null,
      processPid: null,
      processGroupId: null,
      processStartedAt: null,
      retryOfRunId: null,
      processLossRetryCount: 0,
      stdoutExcerpt: null,
      stderrExcerpt: null,
      contextSnapshot: null,
      startedAt: new Date("2026-03-11T00:00:00.000Z"),
      finishedAt: null,
      createdAt: new Date("2026-03-11T00:00:00.000Z"),
      updatedAt: new Date("2026-03-11T00:00:00.000Z"),
    } as const;

    act(() => {
      root.render(
        <FailedRunInboxRow
          run={run}
          issueById={new Map()}
          agentName="Agent"
          issueLinkState={null}
          onDismiss={() => {}}
          onRetry={() => {}}
          isRetrying={false}
          selected
        />,
      );
    });

    const link = container.querySelector("a");
    expect(link).not.toBeNull();
    expect(link?.className).toContain("hover:bg-transparent");
    expect(link?.className).not.toContain("hover:bg-accent/50");

    act(() => {
      root.unmount();
    });
  });
});

describe("InboxIssueMetaLeading", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it("keeps status and live accents visible", () => {
    const root = createRoot(container);

    act(() => {
      root.render(<InboxIssueMetaLeading issue={createIssue()} isLive />);
    });

    const statusIcon = container.querySelector('span[class*="border-blue-600"]');
    const liveBadge = container.querySelector('span[class*="px-1.5"][class*="bg-blue-500/10"]');
    const liveBadgeLabel = Array.from(container.querySelectorAll("span")).find(
      (node) => node.textContent === "Live" && node.className.includes("text-"),
    );
    const liveDot = container.querySelector('span[class*="bg-blue-500"]');
    const pulseRing = container.querySelector('span[class*="animate-pulse"]');

    expect(statusIcon).not.toBeNull();
    expect(statusIcon?.className).not.toContain("!border-muted-foreground");
    expect(statusIcon?.className).not.toContain("!text-muted-foreground");
    expect(liveBadge).not.toBeNull();
    expect(liveBadge?.className).toContain("bg-blue-500/10");
    expect(liveBadgeLabel).not.toBeNull();
    expect(liveBadgeLabel?.className).toContain("text-blue-600");
    expect(liveDot).not.toBeNull();
    expect(pulseRing).not.toBeNull();

    act(() => {
      root.unmount();
    });
  });
});

describe("InboxIssueTrailingColumns", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it("renders an empty tags cell when an issue has no labels", () => {
    const root = createRoot(container);

    act(() => {
      root.render(
        <InboxIssueTrailingColumns
          issue={createIssue({ labels: [], labelIds: [] })}
          columns={["labels"]}
          projectName={null}
          projectColor={null}
          workspaceName={null}
          assigneeName={null}
          currentUserId={null}
          parentIdentifier={null}
          parentTitle={null}
        />,
      );
    });

    expect(container.textContent).toBe("");

    act(() => {
      root.unmount();
    });
  });

  it("leaves the workspace cell blank when no explicit workspace label should be shown", () => {
    const root = createRoot(container);

    act(() => {
      root.render(
        <InboxIssueTrailingColumns
          issue={createIssue()}
          columns={["workspace"]}
          projectName={null}
          projectColor={null}
          workspaceName={null}
          assigneeName={null}
          currentUserId={null}
          parentIdentifier={null}
          parentTitle={null}
        />,
      );
    });

    expect(container.textContent).toBe("");

    act(() => {
      root.unmount();
    });
  });
});

function createApproval(overrides: Partial<Approval> = {}): Approval {
  return {
    id: "approval-1",
    companyId: "company-1",
    type: "hire_agent",
    requestedByAgentId: null,
    requestedByUserId: null,
    assigneeAgentId: "h-1",
    status: "pending",
    payload: {},
    decisionNote: null,
    decidedByUserId: null,
    decidedAt: null,
    createdAt: new Date("2026-03-11T00:00:00.000Z"),
    updatedAt: new Date("2026-03-11T00:00:00.000Z"),
    ...overrides,
  };
}

describe("ApprovalInboxRow", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it("renders claims-first title when payload has claimIdentifier", () => {
    const root = createRoot(container);
    const approval = createApproval({
      type: "approve_ceo_strategy",
      payload: {
        claimIdentifier: "CLM-PHASE1-E2E",
        question: "Approve $3,200 DV on CLM-PHASE1-E2E?",
      },
    });

    act(() => {
      root.render(
        <ApprovalInboxRow
          approval={approval}
          requesterName="Adjudicator"
          onApprove={() => {}}
          onReject={() => {}}
          isPending={false}
        />,
      );
    });

    const titleNode = container.querySelector(".font-medium");
    expect(titleNode).not.toBeNull();
    const titleText = titleNode?.textContent ?? "";
    // Must lead with the claim identifier, not the approval type.
    expect(titleText.startsWith("CLM-PHASE1-E2E")).toBe(true);
    expect(titleText.startsWith("CEO Strategy")).toBe(false);

    act(() => {
      root.unmount();
    });
  });

  it("falls back sensibly for hire_agent approvals without a claimIdentifier", () => {
    const root = createRoot(container);
    const approval = createApproval({
      type: "hire_agent",
      payload: { name: "Designer" },
    });

    act(() => {
      root.render(
        <ApprovalInboxRow
          approval={approval}
          requesterName={null}
          onApprove={() => {}}
          onReject={() => {}}
          isPending={false}
        />,
      );
    });

    const titleNode = container.querySelector(".font-medium");
    expect(titleNode).not.toBeNull();
    const titleText = titleNode?.textContent ?? "";
    // Non-agent-first; not blank.
    expect(titleText.length).toBeGreaterThan(0);
    expect(titleText).toContain("Designer");

    act(() => {
      root.unmount();
    });
  });
});

describe("Inbox persona filter (/inbox/:humanAgentId)", () => {
  it("keeps only approvals whose assigneeAgentId matches the persona", () => {
    const approvalForH1 = createApproval({ id: "approval-h1", assigneeAgentId: "h-1" });
    const approvalForH2 = createApproval({ id: "approval-h2", assigneeAgentId: "h-2" });
    const workItems = getInboxWorkItems({
      issues: [],
      approvals: [approvalForH1, approvalForH2],
    });

    const filtered = filterInboxWorkItemsByPersona(workItems, "h-1");

    expect(filtered).toHaveLength(1);
    expect(filtered[0].kind).toBe("approval");
    if (filtered[0].kind === "approval") {
      expect(filtered[0].approval.id).toBe("approval-h1");
      expect(filtered[0].approval.assigneeAgentId).toBe("h-1");
    }
  });

  it("keeps issues whose assigneeAgentId matches the persona and drops others", () => {
    const issueForH1 = createIssue({ id: "issue-h1", assigneeAgentId: "h-1" });
    const issueForH2 = createIssue({ id: "issue-h2", assigneeAgentId: "h-2" });
    const workItems = getInboxWorkItems({
      issues: [issueForH1, issueForH2],
      approvals: [],
    });

    const filtered = filterInboxWorkItemsByPersona(workItems, "h-1");

    expect(filtered).toHaveLength(1);
    expect(filtered[0].kind).toBe("issue");
    if (filtered[0].kind === "issue") {
      expect(filtered[0].issue.id).toBe("issue-h1");
    }
  });

  it("returns the input unchanged when humanAgentId is null/undefined", () => {
    const items = getInboxWorkItems({
      issues: [createIssue({ id: "issue-a", assigneeAgentId: "h-1" })],
      approvals: [createApproval({ id: "approval-a", assigneeAgentId: "h-2" })],
    });

    expect(filterInboxWorkItemsByPersona(items, null)).toBe(items);
    expect(filterInboxWorkItemsByPersona(items, undefined)).toBe(items);
  });
});
