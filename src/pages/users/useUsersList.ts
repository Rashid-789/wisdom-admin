/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import type { UsersListQuery, UsersListResponse } from "./Types/users.types";
import { getUsersList } from "./Api/users.api";
import { useDebouncedValue } from "../../app/shared";

export function useUsersList() {
  const [page, setPage] = React.useState(1);
  const [pageSize] = React.useState(10);
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebouncedValue(search, 300);

  const [status, setStatus] = React.useState<UsersListQuery["status"]>("all");

  const [data, setData] = React.useState<UsersListResponse>({ rows: [], total: 0 });
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const query: UsersListQuery = React.useMemo(
    () => ({ page, pageSize, search: debouncedSearch, status }),
    [page, pageSize, debouncedSearch, status],
  );

  const load = React.useCallback(async () => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    try {
      const res = await getUsersList(query, controller.signal);
      setData(res);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setError(e instanceof Error ? e.message : "Failed to load users");
    } finally {
      setIsLoading(false);
    }

    return () => controller.abort();
  }, [query]);

  React.useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);

  React.useEffect(() => {
    load();
  }, [load]);

  return {
    data,
    isLoading,
    error,
    page,
    pageSize,
    setPage,
    search,
    setSearch,
    status,
    setStatus,
    refresh: load,
  };
}
