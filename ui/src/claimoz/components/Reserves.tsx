import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Brain, Clock } from "lucide-react";
import { useDashboardData } from "../lib/useDashboardData";

function formatUSDK(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${Math.round(n / 1_000)}k`;
  return `$${n}`;
}

function formatUSDLong(n: number): string {
  return `$${n.toLocaleString("en-US")}`;
}

function deltaLabel(n: number, unit: "$" | "pp" = "$"): string {
  const sign = n > 0 ? "+" : "";
  return unit === "$" ? `${sign}${formatUSDK(n)}` : `${sign}${n}pp`;
}

export function Reserves() {
  const { reserves: r } = useDashboardData();

  return (
    <section className="space-y-3">
      <header>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Reserves
        </h2>
        <p className="text-xs text-muted-foreground/70 mt-0.5">
          Outstanding capital set aside · adequacy across the cohort
        </p>
      </header>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-1 sm:gap-2">
        <KpiCard
          value={formatUSDK(r.totalOutstanding)}
          label="Total Outstanding"
          delta={`${deltaLabel(r.totalOutstandingDeltaWeek)} vs last week`}
        />
        <KpiCard
          value={formatUSDLong(r.avgPerClaim)}
          label="Avg / Claim"
          delta={`${deltaLabel(r.avgPerClaimDeltaMonth)} vs last month`}
        />
        <KpiCard
          value={String(r.underReservedCount)}
          label="Under-reserved Claims"
          delta={`avg gap ${formatUSDK(r.underReservedAvgGap)}`}
          tone="amber"
        />
        <KpiCard
          value={`${r.adequacyPct}%`}
          label="Reserve Adequacy"
          delta={`${deltaLabel(r.adequacyDeltaQuarterPp, "pp")} vs last quarter`}
          tone="emerald"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-1 sm:gap-2">
        <div className="xl:col-span-2 px-4 py-4 sm:px-5 sm:py-5 rounded-lg border border-border">
          <div className="flex items-baseline justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Reserves trend · cohort
            </p>
            <p className="text-xs text-muted-foreground/70 tabular-nums">
              {formatUSDK(r.trend[0]?.total ?? 0)} → {formatUSDK(r.trend[r.trend.length - 1]?.total ?? 0)}
            </p>
          </div>
          <div className="h-32 -mx-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={r.trend} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="reservesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tick={{ fill: "currentColor", fontSize: 10, opacity: 0.5 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(d: string) => d.slice(5)}
                />
                <YAxis
                  tick={{ fill: "currentColor", fontSize: 10, opacity: 0.5 }}
                  axisLine={false}
                  tickLine={false}
                  width={48}
                  tickFormatter={(v: number) => formatUSDK(v)}
                  domain={["dataMin - 50000", "dataMax + 50000"]}
                />
                <Tooltip
                  contentStyle={{ background: "rgba(15,17,25,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, fontSize: 12 }}
                  labelStyle={{ color: "#94a3b8" }}
                  formatter={((v: number) => formatUSDK(v)) as never}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#818cf8"
                  strokeWidth={2}
                  fill="url(#reservesGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="px-4 py-4 sm:px-5 sm:py-5 rounded-lg border border-indigo-500/30 bg-indigo-500/5">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-4 w-4 text-indigo-400" />
            <p className="text-xs font-medium text-indigo-300 uppercase tracking-wide">
              AI Reserve Intelligence
            </p>
          </div>

          <div className="flex items-baseline gap-2 mb-1">
            <p className="text-2xl sm:text-3xl font-semibold tracking-tight tabular-nums">
              {r.aiUpdateLagMinutes}
            </p>
            <p className="text-xs text-muted-foreground">min avg update lag</p>
          </div>
          <p className="text-xs text-muted-foreground/70 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            vs {r.manualReviewLagDays}d manual review
          </p>

          <div className="mt-3 space-y-1">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              Update triggers (cohort)
            </p>
            {r.triggerBreakdown.map((t) => (
              <div key={t.trigger} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground/80">{t.trigger}</span>
                <span className="tabular-nums text-muted-foreground">{t.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function KpiCard({
  value,
  label,
  delta,
  tone = "default",
}: {
  value: string;
  label: string;
  delta?: string;
  tone?: "default" | "amber" | "emerald";
}) {
  const valueClass =
    tone === "amber" ? "text-amber-400" : tone === "emerald" ? "text-emerald-400" : "";
  return (
    <div className="h-full px-4 py-4 sm:px-5 sm:py-5 rounded-lg border border-border">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      <p
        className={`text-2xl sm:text-3xl font-semibold tracking-tight tabular-nums mt-2 ${valueClass}`}
      >
        {value}
      </p>
      {delta && (
        <p className="text-xs text-muted-foreground/70 mt-1.5">{delta}</p>
      )}
    </div>
  );
}
