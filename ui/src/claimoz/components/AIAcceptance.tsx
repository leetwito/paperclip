import {
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDashboardData } from "../lib/useDashboardData";
import type { AIAcceptanceView } from "../lib/aggregations";

type Audience = AIAcceptanceView["audiences"][number];

const CHANNEL_LABEL: Record<string, string> = {
  voice: "Voice",
  email: "Email",
  sms: "SMS",
};

function buildSeriesData(audience: Audience) {
  // Pivot from per-channel time series → one row per day with all channels.
  const days = audience.channels[0]?.points.map((p) => p.day) ?? [];
  return days.map((day) => {
    const row: Record<string, number> = { day };
    for (const ch of audience.channels) {
      const pt = ch.points.find((p) => p.day === day);
      if (pt) row[ch.channel] = pt.rate;
    }
    return row;
  });
}

function AudiencePanel({ audience }: { audience: Audience }) {
  const data = buildSeriesData(audience);
  return (
    <div className="px-4 py-4 sm:px-5 sm:py-5 rounded-lg border border-border">
      <div className="flex items-baseline justify-between mb-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {audience.label}
        </p>
        <div className="flex items-center gap-3 text-[11px]">
          {audience.channels.map((ch) => (
            <span key={ch.channel} className="inline-flex items-center gap-1.5 text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: ch.color }} />
              {CHANNEL_LABEL[ch.channel] ?? ch.channel}
              <span className="tabular-nums text-muted-foreground/80">{ch.currentRate}%</span>
            </span>
          ))}
        </div>
      </div>
      <div className="h-44 -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="day"
              tick={{ fill: "currentColor", fontSize: 10, opacity: 0.5 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(d) => `D${d}`}
            />
            <YAxis
              tick={{ fill: "currentColor", fontSize: 10, opacity: 0.5 }}
              axisLine={false}
              tickLine={false}
              width={32}
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={{ background: "rgba(15,17,25,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, fontSize: 12 }}
              labelStyle={{ color: "#94a3b8" }}
              labelFormatter={(d) => `Day ${d}`}
              formatter={((v: number) => `${v}%`) as never}
            />
            {audience.annotations.map((a) => (
              <ReferenceLine
                key={`${a.day}-${a.label}`}
                x={a.day}
                stroke={a.color}
                strokeDasharray="3 3"
                strokeOpacity={0.7}
                label={{
                  value: a.label,
                  position: "top",
                  fill: a.color,
                  fontSize: 9,
                  offset: 4,
                }}
              />
            ))}
            {audience.channels.map((ch) => (
              <Line
                key={ch.channel}
                type="monotone"
                dataKey={ch.channel}
                stroke={ch.color}
                strokeWidth={2}
                dot={false}
                name={CHANNEL_LABEL[ch.channel] ?? ch.channel}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function AIAcceptance() {
  const { aiAcceptance } = useDashboardData();

  return (
    <section className="space-y-3">
      <header>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          AI Interaction Acceptance
        </h2>
        <p className="text-xs text-muted-foreground/70 mt-0.5">
          Share of AI-initiated touchpoints completed without escalation to a human
        </p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-1 sm:gap-2">
        {aiAcceptance.audiences.map((a) => (
          <AudiencePanel key={a.audience} audience={a} />
        ))}
      </div>
    </section>
  );
}
