// @vitest-environment jsdom

import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import {
  ApprovalPayloadRenderer,
  approvalClaimsFirstTitle,
  approvalLabel,
} from "./ApprovalPayload";

// ApprovalCard imports a Link from @/lib/router which depends on CompanyContext.
// Mock it so the card can render standalone in the test environment.
vi.mock("@/lib/router", () => ({
  Link: ({ children, ...props }: { children: ReactNode; [key: string]: unknown }) => (
    <a {...(props as Record<string, unknown>)}>{children}</a>
  ),
}));

import { ApprovalCard } from "./ApprovalCard";
import type { Approval } from "@paperclipai/shared";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

describe("approvalLabel", () => {
  it("uses payload titles for generic board approvals", () => {
    expect(
      approvalLabel("request_board_approval", {
        title: "Reply with an ASCII frog",
      }),
    ).toBe("Board Approval: Reply with an ASCII frog");
  });
});

describe("ApprovalPayloadRenderer", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it("renders request_board_approval payload fields without falling back to raw JSON", () => {
    const root = createRoot(container);

    act(() => {
      root.render(
        <ApprovalPayloadRenderer
          type="request_board_approval"
          payload={{
            title: "Reply with an ASCII frog",
            summary: "Board asked for approval before posting the frog.",
            recommendedAction: "Approve the frog reply.",
            nextActionOnApproval: "Post the frog comment on the issue.",
            risks: ["The frog might be too powerful."],
            proposedComment: "(o)<",
          }}
        />,
      );
    });

    expect(container.textContent).toContain("Reply with an ASCII frog");
    expect(container.textContent).toContain("Board asked for approval before posting the frog.");
    expect(container.textContent).toContain("Approve the frog reply.");
    expect(container.textContent).toContain("Post the frog comment on the issue.");
    expect(container.textContent).toContain("The frog might be too powerful.");
    expect(container.textContent).toContain("(o)<");
    expect(container.textContent).not.toContain("\"recommendedAction\"");

    act(() => {
      root.unmount();
    });
  });

  it("can hide the repeated title when the card header already shows it", () => {
    const root = createRoot(container);

    act(() => {
      root.render(
        <ApprovalPayloadRenderer
          type="request_board_approval"
          hidePrimaryTitle
          payload={{
            title: "Reply with an ASCII frog",
            summary: "Board asked for approval before posting the frog.",
          }}
        />,
      );
    });

    expect(container.textContent).toContain("Board asked for approval before posting the frog.");
    expect(container.textContent).not.toContain("TitleReply with an ASCII frog");

    act(() => {
      root.unmount();
    });
  });

  it("renders Recommendation label and rationale, never 'Proposal'", () => {
    const root = createRoot(container);

    act(() => {
      root.render(
        <ApprovalPayloadRenderer
          type="request_board_approval"
          payload={{
            claimIdentifier: "CLM-1257",
            question: "Should we approve the $3,200 DV adjustment?",
            recommendation: "Approve as-is",
            rationale: "Report supports the adjustment and sits within policy limits.",
          }}
        />,
      );
    });

    expect(container.textContent).toContain("Recommendation");
    expect(container.textContent).toContain("Approve as-is");
    expect(container.textContent).toContain("Rationale");
    expect(container.textContent).toContain("Report supports the adjustment");
    expect(container.textContent).not.toMatch(/Proposal/i);
    expect(container.textContent).not.toMatch(/Proposed comment/i);

    act(() => {
      root.unmount();
    });
  });
});

describe("approvalClaimsFirstTitle", () => {
  it("leads with the claim identifier when present", () => {
    const title = approvalClaimsFirstTitle("request_board_approval", {
      claimIdentifier: "CLM-1257",
      question: "Should we approve the $3,200 DV adjustment?",
    });
    expect(title.startsWith("CLM-1257")).toBe(true);
    expect(title).toContain("Should we approve");
  });

  it("falls back to 'Hire — <name>' for hire_agent approvals without a claim", () => {
    const title = approvalClaimsFirstTitle("hire_agent", { name: "Designer" });
    expect(title).toBe("Hire — Designer");
  });

  it("falls back to kind heading when no claim identifier and no subject", () => {
    const title = approvalClaimsFirstTitle("approve_ceo_strategy", {});
    expect(title).toBe("CEO strategy approval");
  });

  it("never leads with an AI agent name", () => {
    const title = approvalClaimsFirstTitle("request_board_approval", {
      summary: "Summary body",
    });
    expect(title.startsWith("AI")).toBe(false);
  });
});

function makeApproval(overrides: Partial<Approval> & { payload: Record<string, unknown>; type: string }): Approval {
  return {
    id: "a-1",
    companyId: "c-1",
    status: "pending",
    decisionNote: null,
    decidedAt: null,
    decidedByAgentId: null,
    requestedByAgentId: "ai-adjudicator",
    assigneeAgentId: "vp-claims",
    issueId: null,
    createdAt: "2026-04-01T00:00:00.000Z",
    updatedAt: "2026-04-01T00:00:00.000Z",
    ...overrides,
  } as Approval;
}

describe("ApprovalCard claims-first copy", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it("renders a claims-first heading when the payload has a claimIdentifier", () => {
    const approval = makeApproval({
      type: "request_board_approval",
      payload: {
        claimIdentifier: "CLM-1257",
        question: "Should we approve the $3,200 DV adjustment?",
        recommendation: "Approve as-is",
        rationale: "Report supports.",
      },
    });
    const root = createRoot(container);

    act(() => {
      root.render(<ApprovalCard approval={approval} requesterAgent={null} />);
    });

    const heading = container.querySelector("h3");
    expect(heading).not.toBeNull();
    expect(heading!.textContent ?? "").toMatch(/^CLM-1257/);

    act(() => {
      root.unmount();
    });
  });

  it("uses 'Recommendation' — never 'Proposal' — in the rationale section", () => {
    const approval = makeApproval({
      type: "request_board_approval",
      payload: {
        claimIdentifier: "CLM-1257",
        question: "Should we approve the $3,200 DV adjustment?",
        recommendation: "Approve as-is",
        rationale: "Report supports.",
      },
    });
    const root = createRoot(container);

    act(() => {
      root.render(<ApprovalCard approval={approval} requesterAgent={null} />);
    });

    expect(container.textContent).toContain("Recommendation");
    expect(container.textContent).not.toMatch(/Proposal/i);

    act(() => {
      root.unmount();
    });
  });

  it("does not lead with an AI agent name when no claim identifier is present", () => {
    const approval = makeApproval({
      type: "request_board_approval",
      payload: {
        summary: "Board asked for approval before posting the frog.",
      },
    });
    const root = createRoot(container);

    act(() => {
      root.render(<ApprovalCard approval={approval} requesterAgent={null} />);
    });

    const heading = container.querySelector("h3");
    expect(heading).not.toBeNull();
    expect(heading!.textContent ?? "").not.toMatch(/^AI/);

    act(() => {
      root.unmount();
    });
  });
});
