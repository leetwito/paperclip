import { cn } from "@/lib/utils";
import type { ClaimStatusBucket } from "../lib/claimMapper";
import { MOCK_COHORT, MOCK_STATUS_COUNTS } from "../lib/mockData";

// Status colors map to Paperclip's existing status semantics where possible:
// Running ≈ in_progress (indigo), NOL ≈ todo (blue), Waiting for Input ≈ idle
// (amber), Awaiting Data ≈ neutral/parked.
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
  const total = MOCK_STATUS_COUNTS.reduce((sum, x) => sum + x.count, 0);

  return (
    <section className="space-y-3">
      <header>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Claim Status Distribution
        </h2>
        <p className="text-xs text-muted-foreground/70 mt-0.5">
          {total} claims in cohort · {MOCK_COHORT.filedStart} — {MOCK_COHORT.filedEnd}
        </p>
      </header>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-1 sm:gap-2">
        {MOCK_STATUS_COUNTS.map(({ status, count }) => {
          const styles = STATUS_STYLES[status as Exclude<ClaimStatusBucket, "Done">];
          if (!styles) return null;
          const pct = Math.round((count / total) * 100);
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
        {MOCK_STATUS_COUNTS.map(({ status, count }) => {
          const styles = STATUS_STYLES[status as Exclude<ClaimStatusBucket, "Done">];
          if (!styles) return null;
          const pct = (count / total) * 100;
          return (
            <div
              key={status}
              className={styles.swatchClass}
              style={{ width: `${pct}%` }}
              title={`${status}: ${count} (${Math.round(pct)}%)`}
            />
          );
        })}
      </div>
    </section>
  );
}
