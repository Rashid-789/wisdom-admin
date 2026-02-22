import React from "react";
import type { UserDetails } from "./Types/users.types";
import { getUserDetails } from "./Api/users.api";

export function useUserDetails(userId: string | null) {
  const [data, setData] = React.useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async (id: string, signal?: AbortSignal) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getUserDetails(id, signal);
      setData(res);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setError(e instanceof Error ? e.message : "Failed to load user");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!userId) {
      setData(null);
      setError(null);
      return;
    }
    const controller = new AbortController();
    load(userId, controller.signal);
    return () => controller.abort();
  }, [userId, load]);

  return { data, isLoading, error, setData, reload: load };
}