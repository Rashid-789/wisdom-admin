
import type { DashboardOverview, TimeRange } from "../Types/dashboard.types";
import { buildDashboardMock } from "../mock-data/dashboard.mock";

/**
 * Firebase-ready API layer:
 * - Later replace this with Firestore queries / callable functions.
 * - Keep the signature stable so UI doesn't change.
 */
export async function getDashboardOverview(
  range: TimeRange,
  signal?: AbortSignal
): Promise<DashboardOverview> {
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 350));

  if (signal?.aborted) {
    throw new DOMException("Request aborted", "AbortError");
  }

  // TODO: replace with real implementation
  return buildDashboardMock(range);
}
