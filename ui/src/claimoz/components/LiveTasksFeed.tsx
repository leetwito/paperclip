import { ArrowRight, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDashboardData } from "../lib/useDashboardData";

const STAGE_TONE: Record<string, string> = {
  Triage: "bg-sky-500/10 text-sky-300 border-sky-500/30",
  Investigation: "bg-violet-500/10 text-violet-300 border-violet-500/30",
  Coverage: "bg-blue-500/10 text-blue-300 border-blue-500/30",
  "Damage Assess": "bg-orange-500/10 text-orange-300 border-orange-500/30",
  Reserve: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  Settlement: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  Subro: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
};

const STATUS_TONE: Record<string, string> = {
  Running: "text-emerald-400",
  "Awaiting Data": "text-slate-400",
  "Waiting for Input": "text-amber-400",
  NOL: "text-blue-400",
  Done: "text-muted-foreground",
};

export function LiveTasksFeed() {
  const { liveTasksFeed } = useDashboardData();

  return (
    <section className="space-y-3">
      <header>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Live Tasks Feed
        </h2>
        <p className="text-xs text-muted-foreground/70 mt-0.5">
          Claim processing events in real time · agent and human
        </p>
      </header>

      <div className="rounded-lg border border-border overflow-hidden divide-y divide-border">
        {liveTasksFeed.events.map((e) => {
          const isHuman = e.executorType === "human";
          const Icon = isHuman ? User : Bot;
          const stageClass = e.stageBadge ? STAGE_TONE[e.stageBadge] ?? "bg-slate-500/10 text-slate-300 border-slate-500/30" : "";
          return (
            <div
              key={e.id}
              className={cn(
                "px-4 py-2.5 grid grid-cols-12 gap-3 items-center text-sm",
                isHuman && "bg-amber-500/5",
              )}
            >
              <span className="col-span-1 text-xs text-muted-foreground tabular-nums">
                {e.relativeTime}
              </span>

              <span className="col-span-1 flex items-center gap-1.5">
                <Icon className={cn("h-3.5 w-3.5", isHuman ? "text-amber-400" : "text-emerald-400")} />
              </span>

              {e.claimRef && (
                <span className="col-span-2 font-mono text-xs text-muted-foreground truncate">
                  {e.claimRef}
                </span>
              )}

              <span className={cn("text-muted-foreground/90 truncate", e.claimRef ? "col-span-5" : "col-span-7")}>
                {e.description}
              </span>

              {e.fromStatus && e.toStatus && (
                <span className="col-span-2 inline-flex items-center gap-1 text-xs">
                  <span className={STATUS_TONE[e.fromStatus] ?? "text-muted-foreground"}>
                    {e.fromStatus}
                  </span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground/60" />
                  <span className={STATUS_TONE[e.toStatus] ?? "text-muted-foreground"}>
                    {e.toStatus}
                  </span>
                </span>
              )}

              {e.stageBadge && (
                <span className={cn("col-span-1 inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-medium border whitespace-nowrap", stageClass)}>
                  {e.stageBadge}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
