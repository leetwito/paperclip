import { Area, AreaChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useDashboardData } from "../lib/useDashboardData";

// 8 stages — palette goes cool → warm to suggest movement through the pipeline.
const STAGE_COLORS: Record<string, string> = {
  FNOL: "#0ea5e9",
  Triage: "#22d3ee",
  Investigation: "#a78bfa",
  Coverage: "#3b82f6",
  "Damage Assessment": "#f97316",
  Reserve: "#f59e0b",
  Negotiation: "#fbbf24",
  Settlement: "#10b981",
};

export function Pipeline() {
  const { pipeline } = useDashboardData();

  // Recharts AreaChart wants flat rows: { day, FNOL, Triage, ... }
  const data = pipeline.series.map((p) => ({
    day: p.day,
    date: p.date,
    ...p.counts,
  }));

  return (
    <section className="space-y-3">
      <header className="flex items-baseline justify-between">
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Pipeline · Stage Occupancy
          </h2>
          <p className="text-xs text-muted-foreground/70 mt-0.5">
            Cohort distribution across stages over the last {pipeline.windowDays} days post-FNOL
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-[10px] text-muted-foreground/80 flex-wrap justify-end max-w-md">
          {pipeline.stages.map((s) => (
            <span key={s} className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: STAGE_COLORS[s] ?? "#94a3b8" }} />
              {s}
            </span>
          ))}
        </div>
      </header>

      <div className="px-4 py-4 sm:px-5 sm:py-5 rounded-lg border border-border">
        <div className="h-72 -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="day"
                tick={{ fill: "currentColor", fontSize: 10, opacity: 0.5 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(d) => `D+${d}`}
              />
              <YAxis
                tick={{ fill: "currentColor", fontSize: 10, opacity: 0.5 }}
                axisLine={false}
                tickLine={false}
                width={36}
              />
              <Tooltip
                contentStyle={{ background: "rgba(15,17,25,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, fontSize: 12 }}
                labelStyle={{ color: "#94a3b8" }}
                labelFormatter={(d) => `Day ${d} since FNOL`}
              />
              {pipeline.slaMarkers.map((m) => (
                <ReferenceLine
                  key={`${m.day}-${m.ruleName}`}
                  x={m.day}
                  stroke="#ef4444"
                  strokeDasharray="3 3"
                  strokeOpacity={0.7}
                  label={{
                    value: m.ruleName,
                    position: "top",
                    fill: "#ef4444",
                    fontSize: 9,
                    offset: 4,
                  }}
                />
              ))}
              {pipeline.stages.map((stage) => (
                <Area
                  key={stage}
                  type="monotone"
                  dataKey={stage}
                  stackId="1"
                  stroke={STAGE_COLORS[stage] ?? "#94a3b8"}
                  fill={STAGE_COLORS[stage] ?? "#94a3b8"}
                  fillOpacity={0.55}
                  strokeWidth={1}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
