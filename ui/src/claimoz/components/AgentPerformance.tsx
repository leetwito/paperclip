import { Bot, Brain, ShieldAlert, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useDashboardData } from "../lib/useDashboardData";

const ACCENT_STYLES: Record<
  string,
  { ring: string; tag: string; icon: string }
> = {
  blue: { ring: "border-blue-500/25", tag: "bg-blue-500/10 text-blue-300 border-blue-500/30", icon: "text-blue-400" },
  amber: { ring: "border-amber-500/25", tag: "bg-amber-500/10 text-amber-300 border-amber-500/30", icon: "text-amber-400" },
  violet: { ring: "border-violet-500/25", tag: "bg-violet-500/10 text-violet-300 border-violet-500/30", icon: "text-violet-400" },
  indigo: { ring: "border-indigo-500/25", tag: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30", icon: "text-indigo-400" },
};

const AGENT_ICON: Record<string, LucideIcon> = {
  "Adjuster Agent": Bot,
  "SIU Agent": ShieldAlert,
  "Subrogation Agent": Wallet,
  "AI Trainer Agent": Brain,
};

export function AgentPerformance() {
  const { agentPerformance } = useDashboardData();

  return (
    <section className="space-y-3">
      <header>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Agent Performance
        </h2>
        <p className="text-xs text-muted-foreground/70 mt-0.5">
          Per-agent throughput, accuracy proxies, and currently waiting reasons
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-1 sm:gap-2">
        {agentPerformance.agents.map((a) => {
          const styles = ACCENT_STYLES[a.accent];
          const Icon = AGENT_ICON[a.agentName] ?? Bot;
          return (
            <div
              key={a.agentName}
              className={`px-4 py-4 sm:px-5 sm:py-5 rounded-lg border ${styles.ring}`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${styles.icon}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{a.agentName}</p>
                    <p className="text-xs text-muted-foreground/70 truncate">{a.role}</p>
                  </div>
                </div>
                <span className={`shrink-0 inline-flex items-baseline gap-1 rounded-full px-2 py-0.5 text-xs font-medium border ${styles.tag}`}>
                  <span className="tabular-nums">{a.primaryStat.value}</span>
                  <span className="opacity-80">{a.primaryStat.label}</span>
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                {a.kpis.map((k) => (
                  <div key={k.label}>
                    <p className="text-base font-semibold tabular-nums">{k.value}</p>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground/70 mt-0.5">
                      {k.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-border/50 pt-3">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                  Currently waiting
                </p>
                <div className="space-y-1">
                  {a.waiting.map((w) => (
                    <div key={w.reason} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground/80 truncate pr-2">{w.reason}</span>
                      <span className="shrink-0 tabular-nums text-muted-foreground">
                        {w.count} · {w.avgWait}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
