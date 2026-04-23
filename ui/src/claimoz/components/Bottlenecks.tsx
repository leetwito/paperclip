import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";
import { MOCK_BOTTLENECKS } from "../lib/mockData";

// §5 Bottlenecks — v1 ships count-only (no root-cause reasoning block yet).
// The 2×2 grid is intentional: a VP should see where the system is stuck
// without reading long prose, with the SLA-at-risk count as the urgency cue.
export function Bottlenecks() {
  return (
    <section className="space-y-3">
      <header>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Bottlenecks
        </h2>
        <p className="text-xs text-muted-foreground/70 mt-0.5">
          Where claims are stuck · highest volume first
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-1 sm:gap-2">
        {MOCK_BOTTLENECKS.map((b) => (
          <div
            key={b.category}
            className="h-full px-4 py-4 sm:px-5 sm:py-5 rounded-lg border border-border"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-2xl sm:text-3xl font-semibold tracking-tight tabular-nums">
                  {b.claimCount}
                </p>
                <p className="text-sm font-medium mt-1">{b.category}</p>
                <p className="text-xs text-muted-foreground/70 mt-1.5">
                  claims blocked
                </p>
              </div>
              {b.slaAtRiskCount > 0 ? (
                <span
                  className={cn(
                    "shrink-0 inline-flex items-center gap-1 rounded-full",
                    "px-2 py-0.5 text-xs font-medium",
                    "bg-amber-500/15 text-amber-500 border border-amber-500/30",
                  )}
                  title={`${b.slaAtRiskCount} claims at SLA risk`}
                >
                  <AlertTriangle className="h-3 w-3" />
                  {b.slaAtRiskCount} at risk
                </span>
              ) : (
                <span className="shrink-0 text-xs text-muted-foreground/60">
                  on track
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
