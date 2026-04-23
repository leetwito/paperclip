import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { useDashboardData } from "../lib/useDashboardData";

interface KpiProps {
  value: string;
  label: string;
  trend?: "up" | "down" | "flat";
  delta?: string;
  subtitle?: string;
}

function TrendIcon({ trend }: { trend: "up" | "down" | "flat" }) {
  const Icon = trend === "up" ? ArrowUp : trend === "down" ? ArrowDown : Minus;
  const color =
    trend === "up" ? "text-emerald-500" : trend === "down" ? "text-rose-500" : "text-muted-foreground";
  return <Icon className={cn("h-3.5 w-3.5", color)} />;
}

function Kpi({ value, label, trend, delta, subtitle }: KpiProps) {
  return (
    <div className="h-full px-4 py-4 sm:px-5 sm:py-5 rounded-lg border border-border">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      <p className="text-3xl sm:text-4xl font-semibold tracking-tight tabular-nums mt-2">
        {value}
      </p>
      {(delta || subtitle) && (
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          {trend && <TrendIcon trend={trend} />}
          {delta && <span className="tabular-nums">{delta}</span>}
          {subtitle && <span className="text-muted-foreground/70">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}

export function NorthStarMetrics() {
  const { northStar: m } = useDashboardData();
  return (
    <section className="space-y-3">
      <header>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          North Star
        </h2>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-1 sm:gap-2">
        <Kpi
          value={`${m.stpRate}%`}
          label="STP Rate"
          trend={m.stpRateDelta > 0 ? "up" : m.stpRateDelta < 0 ? "down" : "flat"}
          delta={`${m.stpRateDelta > 0 ? "+" : ""}${m.stpRateDelta}pp`}
          subtitle="vs prior period"
        />
        <Kpi
          value={`${m.csat.toFixed(1)}/5`}
          label={`CSAT · ±${m.csatVariance.toFixed(1)}`}
          trend={m.csatDelta > 0 ? "up" : m.csatDelta < 0 ? "down" : "flat"}
          delta={`${m.csatDelta > 0 ? "+" : ""}${m.csatDelta.toFixed(1)}`}
          subtitle="vs prior period"
        />
        <Kpi value={`${m.accuracy}%`} label="AI Decision Accuracy" trend="flat" subtitle="stable" />
      </div>
    </section>
  );
}
