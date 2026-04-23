import { cn } from "@/lib/utils";
import type { TouchBucket } from "../lib/claimMapper";
import { useDashboardData } from "../lib/useDashboardData";

const BUCKET_STYLES: Record<
  string,
  { label: string; barClass: string; subtitle: string }
> = {
  "0": { label: "Zero-touch", barClass: "bg-emerald-500", subtitle: "fully autonomous" },
  "1": { label: "One-touch", barClass: "bg-amber-500", subtitle: "single handoff" },
  "2": { label: "Two-touch", barClass: "bg-orange-500", subtitle: "two handoffs" },
  "3+": { label: "Three+ touches", barClass: "bg-rose-500", subtitle: "escalated" },
};

function bucketKey(t: TouchBucket): string {
  return String(t);
}

export function AutonomyDistribution() {
  const { autonomy } = useDashboardData();
  const { doneClaims, buckets } = autonomy;
  const total = buckets.reduce((sum, x) => sum + x.rate, 0);

  return (
    <section className="space-y-3">
      <header>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Autonomy Distribution
        </h2>
        <p className="text-xs text-muted-foreground/70 mt-0.5">
          {doneClaims} done claims · share resolved by touch count
        </p>
      </header>

      <div
        className="flex h-8 w-full overflow-hidden rounded-md border border-border"
        role="img"
        aria-label="Autonomy touch-count distribution"
      >
        {buckets.map(({ touches, rate }) => {
          const styles = BUCKET_STYLES[bucketKey(touches)];
          if (!styles) return null;
          return (
            <div
              key={bucketKey(touches)}
              className={cn(
                styles.barClass,
                "flex items-center justify-center text-xs font-medium text-white/90 tabular-nums",
              )}
              style={{ width: `${(rate / total) * 100}%` }}
              title={`${styles.label}: ${rate}%`}
            >
              {rate >= 6 ? `${rate}%` : ""}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-1 sm:gap-2">
        {buckets.map(({ touches, rate }) => {
          const styles = BUCKET_STYLES[bucketKey(touches)];
          if (!styles) return null;
          return (
            <div
              key={bucketKey(touches)}
              className="h-full px-4 py-4 sm:px-5 sm:py-5 rounded-lg border border-border"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-2xl sm:text-3xl font-semibold tracking-tight tabular-nums">
                    {rate}%
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground mt-1">
                    {styles.label}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1.5">
                    {styles.subtitle}
                  </p>
                </div>
                <span
                  className={cn("h-2.5 w-2.5 rounded-full shrink-0 mt-2", styles.barClass)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
