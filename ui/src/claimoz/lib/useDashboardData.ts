import type { DashboardData } from "./aggregations";
import { MOCK_DASHBOARD } from "./mockData";

// Single source-of-truth hook for the VP Dashboard. Widgets call this and
// destructure the View they need. Toggle via VITE_CLAIMOZ_DATA_SOURCE=live
// once the live aggregations are implemented.

export function useDashboardData(): DashboardData {
  const source = import.meta.env.VITE_CLAIMOZ_DATA_SOURCE ?? "mock";
  if (source === "live") {
    throw new Error(
      "Live data source not yet implemented. Set VITE_CLAIMOZ_DATA_SOURCE=mock or unset.",
    );
  }
  return MOCK_DASHBOARD;
}
