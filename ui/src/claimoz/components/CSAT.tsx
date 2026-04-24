import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { useDashboardData } from "../lib/useDashboardData";

const PATH_LABEL: Record<string, string> = {
  autonomous: "Autonomous (zero touch)",
  human_1touch: "Human · 1-touch",
  human_2plus: "Human · 2+ touches",
};

const PATH_COLOR: Record<string, string> = {
  autonomous: "bg-emerald-500",
  human_1touch: "bg-amber-500",
  human_2plus: "bg-rose-500",
};

function scoreColor(score: number): string {
  if (score >= 4) return "text-emerald-400";
  if (score >= 3) return "text-amber-400";
  return "text-rose-400";
}

export function CSAT() {
  const { csat } = useDashboardData();
  const trend = csat.scoreDelta > 0 ? "up" : csat.scoreDelta < 0 ? "down" : "flat";
  const TrendIcon = trend === "up" ? ArrowUp : trend === "down" ? ArrowDown : Minus;
  const trendClass =
    trend === "up" ? "text-emerald-500" : trend === "down" ? "text-rose-500" : "text-muted-foreground";

  return (
    <section className="space-y-3">
      <header>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          CSAT
        </h2>
        <p className="text-xs text-muted-foreground/70 mt-0.5">
          {csat.responseCount} responses in cohort · higher autonomy = higher CSAT
        </p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-1 sm:gap-2">
        {/* Score + sparkline */}
        <div className="px-4 py-4 sm:px-5 sm:py-5 rounded-lg border border-border">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Rolling score · ±{csat.variance.toFixed(1)}
          </p>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-3xl sm:text-4xl font-semibold tracking-tight tabular-nums">
              {csat.score.toFixed(1)}/5
            </p>
            <span className={`inline-flex items-center gap-0.5 text-xs ${trendClass}`}>
              <TrendIcon className="h-3 w-3" />
              <span className="tabular-nums">
                {csat.scoreDelta > 0 ? "+" : ""}
                {csat.scoreDelta.toFixed(1)}
              </span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground/70 mt-0.5">vs prior period</p>
          <div className="h-20 mt-3 -mx-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={csat.sparkline} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <XAxis
                  dataKey="date"
                  tick={{ fill: "currentColor", fontSize: 9, opacity: 0.5 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(d: string) => d.slice(5)}
                />
                <YAxis hide domain={[3.5, 5]} />
                <Tooltip
                  contentStyle={{ background: "rgba(15,17,25,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, fontSize: 12 }}
                  labelStyle={{ color: "#94a3b8" }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 2, fill: "#10b981" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* By resolution path */}
        <div className="xl:col-span-2 px-4 py-4 sm:px-5 sm:py-5 rounded-lg border border-border">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            By resolution path
          </p>
          <div className="mt-3 space-y-2.5">
            {csat.byResolutionPath.map((p) => (
              <div key={p.path}>
                <div className="flex items-baseline justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{PATH_LABEL[p.path] ?? p.path}</span>
                  <span className="tabular-nums font-semibold">{p.score.toFixed(1)}/5</span>
                </div>
                <div className="h-2 bg-border/40 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${PATH_COLOR[p.path] ?? "bg-slate-400"} rounded-full`}
                    style={{ width: `${(p.score / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            <p className="text-[11px] text-muted-foreground/70 mt-2 italic">
              Higher autonomy correlates with higher satisfaction.
            </p>
          </div>
        </div>
      </div>

      {/* Survey responses */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="px-4 py-2.5 bg-accent/20 border-b border-border">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            All survey responses · {csat.responseCount} in cohort
          </p>
        </div>
        <div className="divide-y divide-border">
          {csat.responses.map((r) => (
            <div key={r.id} className="px-4 py-3 grid grid-cols-12 gap-3 items-baseline text-sm">
              <span className="col-span-2 font-mono text-xs text-muted-foreground truncate">
                {r.claimId}
              </span>
              <span className={`col-span-1 font-semibold tabular-nums ${scoreColor(r.score)}`}>
                {r.score}/5
              </span>
              <span className="col-span-7 text-muted-foreground/90 truncate">
                "{r.comment}"
              </span>
              <span className="col-span-2 text-right text-xs text-muted-foreground/70">
                {PATH_LABEL[r.resolutionPath]?.split(" ")[0] ?? r.resolutionPath} · {r.cycleDays}d
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
