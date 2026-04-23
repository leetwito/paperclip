import { cn } from "@/lib/utils";
import type { ClaimStatusBucket } from "../lib/claimMapper";
import { useDashboardData } from "../lib/useDashboardData";

const STATUS_STYLES: Record<
  Exclude<ClaimStatusBucket, "Done">,
  { label: string; swatchClass: string }
> = {
  Running: { label: "Running", swatchClass: "bg-indigo-500" },
  "Awaiting Data": { label: "Awaiting Data", swatchClass: "bg-slate-400" },
  "Waiting for Input": { label: "Waiting for Input", swatchClass: "bg-amber-500" },
  NOL: { label: "NOL", swatchClass: "bg-blue-500" },
};

export function StatusDistribution() {
  const { statusDistribution } = useDashboardData();
  const { cohort, buckets } = statusDistribution;

  return (
    <section className="space-y-3">
      <header>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Claim Status Distribution
        </h2>
        <p className="text-xs text-muted-foreground/70 mt-0.5">
          {cohort.total} claims in cohort · {cohort.filedStart} — {cohort.filedEnd}
        </p>
      </header>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-1 sm:gap-2">
        {buckets.map(({ status, count, pct }) => {
          const styles = STATUS_STYLES[status as Exclude<ClaimStatusBucket, "Done">];
          if (!styles) return null;
          return (
            <div
              key={status}
              className="h-full px-4 py-4 sm:px-5 sm:py-5 rounded-lg border border-border"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-2xl sm:text-3xl font-semibold tracking-tight tabular-nums">
                    {count}
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground mt-1">
                    {styles.label}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1.5">
                    {pct}% of cohort
                  </p>
                </div>
                <span
                  className={cn("h-2.5 w-2.5 rounded-full shrink-0 mt-2", styles.swatchClass)}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div
        className="flex h-2 w-full overflow-hidden rounded-sm border border-border"
        role="img"
        aria-label="Claim status distribution"
      >
        {buckets.map(({ status, pct }) => {
          const styles = STATUS_STYLES[status as Exclude<ClaimStatusBucket, "Done">];
          if (!styles) return null;
          return (
            <div
              key={status}
              className={styles.swatchClass}
              style={{ width: `${pct}%` }}
              title={`${status}: ${pct}%`}
            />
          );
        })}
      </div>
    </section>
  );
}
