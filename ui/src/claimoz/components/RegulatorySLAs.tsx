import { AlertTriangle, ShieldCheck } from "lucide-react";
import { useDashboardData } from "../lib/useDashboardData";

function toneFor(rate: number): { ringClass: string; valueClass: string; iconClass: string } {
  if (rate >= 95) return { ringClass: "border-emerald-500/30 bg-emerald-500/5", valueClass: "text-emerald-400", iconClass: "text-emerald-400" };
  if (rate >= 90) return { ringClass: "border-amber-500/30 bg-amber-500/5", valueClass: "text-amber-400", iconClass: "text-amber-400" };
  return { ringClass: "border-rose-500/30 bg-rose-500/5", valueClass: "text-rose-400", iconClass: "text-rose-400" };
}

export function RegulatorySLAs() {
  const { regulatorySLAs } = useDashboardData();

  return (
    <section className="space-y-3">
      <header className="flex items-baseline justify-between">
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Regulatory SLAs
          </h2>
          <p className="text-xs text-muted-foreground/70 mt-0.5">
            Compliance against deadlines applied at claim creation
          </p>
        </div>
        {regulatorySLAs.atRiskTotal > 0 && (
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 transition-colors"
          >
            <AlertTriangle className="h-3 w-3" />
            {regulatorySLAs.atRiskTotal} at risk
            <span className="text-amber-400/70 ml-1">→ View all</span>
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-1 sm:gap-2">
        {regulatorySLAs.rules.map((r) => {
          const tone = toneFor(r.complianceRate);
          return (
            <div
              key={r.ruleType}
              className={`h-full px-4 py-4 sm:px-5 sm:py-5 rounded-lg border ${tone.ringClass}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {r.label}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-0.5">
                    ≤{r.deadlineDays}d deadline
                  </p>
                </div>
                <ShieldCheck className={`h-4 w-4 shrink-0 ${tone.iconClass}`} />
              </div>

              <p className={`text-3xl sm:text-4xl font-semibold tracking-tight tabular-nums mt-3 ${tone.valueClass}`}>
                {r.complianceRate.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">compliance</p>

              <div className="mt-3 pt-3 border-t border-border/50 flex items-baseline justify-between text-xs">
                <span className="text-muted-foreground/70">In breach</span>
                <span className="tabular-nums text-muted-foreground">
                  {r.inBreachCount} / {r.cohortSize} claims
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
