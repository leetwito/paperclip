import { Bot, User } from "lucide-react";
import { useDashboardData } from "../lib/useDashboardData";

export function DecisionConsistency() {
  const { decisionConsistency: d } = useDashboardData();

  return (
    <section className="space-y-3">
      <header>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Decision Consistency
        </h2>
        <p className="text-xs text-muted-foreground/70 mt-0.5">
          Share of decisions matching the gold-standard audit panel
        </p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-1 sm:gap-2">
        {/* AI bar */}
        <div className="px-4 py-4 sm:px-5 sm:py-5 rounded-lg border border-emerald-500/25 bg-emerald-500/5">
          <div className="flex items-center gap-2 mb-2">
            <Bot className="h-4 w-4 text-emerald-400" />
            <p className="text-xs font-medium text-emerald-300 uppercase tracking-wide">
              AI agents
            </p>
          </div>
          <p className="text-3xl sm:text-4xl font-semibold tracking-tight tabular-nums text-emerald-400">
            {d.ai.rate.toFixed(1)}%
          </p>
          <div className="mt-2 h-2 bg-emerald-500/15 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${d.ai.rate}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground/70 mt-2 tabular-nums">
            {d.ai.sampleSize.toLocaleString()} decisions audited
          </p>
        </div>

        {/* Human bar */}
        <div className="px-4 py-4 sm:px-5 sm:py-5 rounded-lg border border-amber-500/25 bg-amber-500/5">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 text-amber-400" />
            <p className="text-xs font-medium text-amber-300 uppercase tracking-wide">
              Human adjusters
            </p>
          </div>
          <p className="text-3xl sm:text-4xl font-semibold tracking-tight tabular-nums text-amber-400">
            {d.human.rate.toFixed(1)}%
          </p>
          <div className="mt-2 h-2 bg-amber-500/15 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full"
              style={{ width: `${d.human.rate}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground/70 mt-2 tabular-nums">
            {d.human.sampleSize.toLocaleString()} decisions audited
          </p>
        </div>

        {/* Context */}
        <div className="px-4 py-4 sm:px-5 sm:py-5 rounded-lg border border-border space-y-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              The gap
            </p>
            <p className="text-3xl sm:text-4xl font-semibold tracking-tight tabular-nums mt-1">
              +{d.gapPp.toFixed(1)}pp
            </p>
            <p className="text-xs text-muted-foreground/70 mt-0.5">
              AI decisions are {(d.ai.rate / d.human.rate * 100 - 100).toFixed(0)}% more consistent
            </p>
          </div>
          <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
            Same decision, same inputs — humans diverge under fatigue and ambiguity. AI
            agents apply policy uniformly, which protects both customers and reserves.
          </p>
        </div>
      </div>
    </section>
  );
}
