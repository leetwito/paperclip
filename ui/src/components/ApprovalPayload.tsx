import { UserPlus, Lightbulb, ShieldAlert, ShieldCheck } from "lucide-react";
import { formatCents } from "../lib/utils";

export const typeLabel: Record<string, string> = {
  hire_agent: "Hire Agent",
  approve_ceo_strategy: "CEO Strategy",
  budget_override_required: "Budget Override",
  request_board_approval: "Board Approval",
};

/**
 * Short, claims-first phrase describing what the approval is asking.
 * Used as the heading suffix after a claim identifier (e.g. "CLM-1257 — coverage call needed").
 */
export const typeHeading: Record<string, string> = {
  hire_agent: "hire approval",
  approve_ceo_strategy: "CEO strategy approval",
  budget_override_required: "budget override",
  request_board_approval: "board approval",
};

function firstNonEmptyString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }
  return null;
}

export function approvalClaimIdentifier(payload?: Record<string, unknown> | null): string | null {
  return firstNonEmptyString(payload?.claimIdentifier);
}

export function approvalSubject(payload?: Record<string, unknown> | null): string | null {
  return firstNonEmptyString(
    payload?.question,
    payload?.title,
    payload?.name,
    payload?.summary,
    payload?.recommendedAction,
  );
}

/**
 * Claims-first title for an approval card.
 *
 * - When the payload carries a `claimIdentifier`, leads with the claim code:
 *   `"CLM-1257 — coverage call needed"`.
 * - When it doesn't, falls back to a sensible non-agent-first phrasing:
 *   - `hire_agent` → `"Hire — <name>"` (no claim context exists)
 *   - everything else → the payload subject if present, otherwise the kind heading.
 *
 * Never leads with an AI agent name.
 */
export function approvalClaimsFirstTitle(
  type: string,
  payload?: Record<string, unknown> | null,
): string {
  const claimId = approvalClaimIdentifier(payload);
  const subject = approvalSubject(payload);
  const kindHeading = typeHeading[type] ?? typeLabel[type] ?? type;

  if (claimId) {
    const suffix = subject ?? kindHeading;
    return `${claimId} — ${suffix}`;
  }

  if (type === "hire_agent") {
    const name = firstNonEmptyString(payload?.name);
    return name ? `Hire — ${name}` : "Hire approval";
  }

  return subject ?? kindHeading;
}

/** Build a contextual label for an approval, e.g. "Hire Agent: Designer" */
export function approvalLabel(type: string, payload?: Record<string, unknown> | null): string {
  const base = typeLabel[type] ?? type;
  const subject = approvalSubject(payload);
  if (subject) {
    return `${base}: ${subject}`;
  }
  return base;
}

export const typeIcon: Record<string, typeof UserPlus> = {
  hire_agent: UserPlus,
  approve_ceo_strategy: Lightbulb,
  budget_override_required: ShieldAlert,
  request_board_approval: ShieldCheck,
};

export const defaultTypeIcon = ShieldCheck;

function PayloadField({ label, value }: { label: string; value: unknown }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground w-20 sm:w-24 shrink-0 text-xs">{label}</span>
      <span>{String(value)}</span>
    </div>
  );
}

function SkillList({ values }: { values: unknown }) {
  if (!Array.isArray(values)) return null;
  const items = values
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);
  if (items.length === 0) return null;

  return (
    <div className="flex items-start gap-2">
      <span className="text-muted-foreground w-20 sm:w-24 shrink-0 text-xs pt-0.5">Skills</span>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span
            key={item}
            className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export function HireAgentPayload({ payload }: { payload: Record<string, unknown> }) {
  return (
    <div className="mt-3 space-y-1.5 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground w-20 sm:w-24 shrink-0 text-xs">Name</span>
        <span className="font-medium">{String(payload.name ?? "—")}</span>
      </div>
      <PayloadField label="Role" value={payload.role} />
      <PayloadField label="Title" value={payload.title} />
      <PayloadField label="Icon" value={payload.icon} />
      {!!payload.capabilities && (
        <div className="flex items-start gap-2">
          <span className="text-muted-foreground w-20 sm:w-24 shrink-0 text-xs pt-0.5">Capabilities</span>
          <span className="text-muted-foreground">{String(payload.capabilities)}</span>
        </div>
      )}
      {!!payload.adapterType && (
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground w-20 sm:w-24 shrink-0 text-xs">Adapter</span>
          <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
            {String(payload.adapterType)}
          </span>
        </div>
      )}
      <SkillList values={payload.desiredSkills} />
    </div>
  );
}

export function CeoStrategyPayload({ payload }: { payload: Record<string, unknown> }) {
  const plan = payload.plan ?? payload.description ?? payload.strategy ?? payload.text;
  return (
    <div className="mt-3 space-y-1.5 text-sm">
      <PayloadField label="Title" value={payload.title} />
      {!!plan && (
        <div className="mt-2 rounded-md bg-muted/40 px-3 py-2 text-sm text-muted-foreground whitespace-pre-wrap font-mono text-xs max-h-48 overflow-y-auto">
          {String(plan)}
        </div>
      )}
      {!plan && (
        <pre className="mt-2 rounded-md bg-muted/40 px-3 py-2 text-xs text-muted-foreground overflow-x-auto max-h-48">
          {JSON.stringify(payload, null, 2)}
        </pre>
      )}
    </div>
  );
}

export function BudgetOverridePayload({ payload }: { payload: Record<string, unknown> }) {
  const budgetAmount = typeof payload.budgetAmount === "number" ? payload.budgetAmount : null;
  const observedAmount = typeof payload.observedAmount === "number" ? payload.observedAmount : null;
  return (
    <div className="mt-3 space-y-1.5 text-sm">
      <PayloadField label="Scope" value={payload.scopeName ?? payload.scopeType} />
      <PayloadField label="Window" value={payload.windowKind} />
      <PayloadField label="Metric" value={payload.metric} />
      {(budgetAmount !== null || observedAmount !== null) ? (
        <div className="rounded-md bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          Limit {budgetAmount !== null ? formatCents(budgetAmount) : "—"} · Observed {observedAmount !== null ? formatCents(observedAmount) : "—"}
        </div>
      ) : null}
      {!!payload.guidance && (
        <p className="text-muted-foreground">{String(payload.guidance)}</p>
      )}
    </div>
  );
}

export function BoardApprovalPayload({
  payload,
  hideTitle = false,
}: {
  payload: Record<string, unknown>;
  hideTitle?: boolean;
}) {
  const nextPayload = hideTitle ? { ...payload, title: undefined } : payload;
  return (
    <BoardApprovalPayloadContent payload={nextPayload} />
  );
}

function BoardApprovalPayloadContent({ payload }: { payload: Record<string, unknown> }) {
  const risks = Array.isArray(payload.risks)
    ? payload.risks
        .filter((value): value is string => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean)
    : [];
  const title = firstNonEmptyString(payload.title);
  const summary = firstNonEmptyString(payload.summary);
  const question = firstNonEmptyString(payload.question);
  // New claims-first payload carries `recommendation` + `rationale`.
  // Legacy payloads used `recommendedAction`; render either under a single
  // "Recommendation" label — never "Proposal".
  const recommendation = firstNonEmptyString(payload.recommendation, payload.recommendedAction);
  const rationale = firstNonEmptyString(payload.rationale);
  const nextActionOnApproval = firstNonEmptyString(payload.nextActionOnApproval);
  const recommendedComment = firstNonEmptyString(payload.recommendedComment, payload.proposedComment);

  return (
    <div className="mt-4 space-y-3.5 text-sm">
      {title && (
        <div className="space-y-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">Title</p>
          <p className="font-medium leading-6 text-foreground">{title}</p>
        </div>
      )}
      {question && (
        <div className="space-y-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">Question</p>
          <p className="leading-6 text-foreground/90">{question}</p>
        </div>
      )}
      {summary && (
        <div className="space-y-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">Summary</p>
          <p className="leading-6 text-foreground/90">{summary}</p>
        </div>
      )}
      {recommendation && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3.5 py-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-amber-700 dark:text-amber-300">
            Recommendation
          </p>
          <p className="mt-1 leading-6 text-foreground">{recommendation}</p>
        </div>
      )}
      {rationale && (
        <div className="space-y-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">Rationale</p>
          <p className="leading-6 text-foreground/90">{rationale}</p>
        </div>
      )}
      {nextActionOnApproval && (
        <div className="rounded-lg border border-border/60 bg-background/60 px-3.5 py-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">On approval</p>
          <p className="mt-1 leading-6 text-foreground">{nextActionOnApproval}</p>
        </div>
      )}
      {risks.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">Risks</p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {risks.map((risk) => (
              <li key={risk} className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-muted-foreground/60" />
                <span className="leading-6">{risk}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {recommendedComment && (
        <div className="space-y-1.5">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            Recommended comment
          </p>
          <pre className="max-h-48 overflow-auto rounded-lg border border-border/60 bg-muted/50 px-3.5 py-3 font-mono text-xs leading-5 text-muted-foreground whitespace-pre-wrap">
            {recommendedComment}
          </pre>
        </div>
      )}
    </div>
  );
}

export function ApprovalPayloadRenderer({
  type,
  payload,
  hidePrimaryTitle = false,
}: {
  type: string;
  payload: Record<string, unknown>;
  hidePrimaryTitle?: boolean;
}) {
  if (type === "hire_agent") return <HireAgentPayload payload={payload} />;
  if (type === "budget_override_required") return <BudgetOverridePayload payload={payload} />;
  if (type === "request_board_approval") {
    return <BoardApprovalPayload payload={payload} hideTitle={hidePrimaryTitle} />;
  }
  return <CeoStrategyPayload payload={payload} />;
}
