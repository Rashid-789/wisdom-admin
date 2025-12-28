
import React from "react";
import type { DashboardOverview, TimeRange } from "./Types/dashboard.types";
import { getDashboardOverview } from "./Api/dashboard.api";

export function useDashboardData(initialRange: TimeRange = "7d") {
  const [range, setRange] = React.useState<TimeRange>(initialRange);
  const [data, setData] = React.useState<DashboardOverview | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async (nextRange: TimeRange, signal?: AbortSignal) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await getDashboardOverview(nextRange, signal);
      setData(res);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setError(e instanceof Error ? e.message : "Failed to load dashboard");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const controller = new AbortController();
    load(range, controller.signal);
    return () => controller.abort();
  }, [range, load]);

  const refresh = React.useCallback(() => {
    const controller = new AbortController();
    load(range, controller.signal);
    return () => controller.abort();
  }, [load, range]);

  return { range, setRange, data, isLoading, error, refresh };
}
