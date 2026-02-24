import * as React from "react";
import {
  collection,
  DocumentSnapshot,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  startAt,
  where,
  type QueryConstraint,
} from "firebase/firestore";

import { db } from "../../../app/utils/firebase";
import type { UserRow, UsersListQuery } from "../Types/users.types";
import { mapUserDocToRow, normalizeLower } from "../utils/users.firestore";

type Params = {
  status?: UsersListQuery["status"];
  search?: string;
};

type CursorMode = "startAt" | "startAfter" | "none";

export function useUsersPagination({ status = "all", search = "" }: Params) {
  const [pageSize, setPageSize] = React.useState(10);
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageStarts, setPageStarts] = React.useState<DocumentSnapshot[]>([]);
  const [lastDoc, setLastDoc] = React.useState<DocumentSnapshot | null>(null);

  const [rows, setRows] = React.useState<UserRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [hasNext, setHasNext] = React.useState(false);

  const runIdRef = React.useRef(0);

  const loadPage = React.useCallback(
    async (targetIndex: number, cursorDoc: DocumentSnapshot | null, mode: CursorMode) => {
      const runId = ++runIdRef.current;
      setLoading(true);
      setError(null);

      try {
        const constraints: QueryConstraint[] = [];
        if (status && status !== "all") {
          constraints.push(where("status", "==", status));
        }

        constraints.push(orderBy("createdAt", "desc"));

        if (mode === "startAt" && cursorDoc) {
          constraints.push(startAt(cursorDoc));
        }
        if (mode === "startAfter" && cursorDoc) {
          constraints.push(startAfter(cursorDoc));
        }

        constraints.push(limit(pageSize + 1));

        const q = query(collection(db, "user"), ...constraints);
        const snap = await getDocs(q);
        if (runId !== runIdRef.current) return;

        const docs = snap.docs;
        const nextAvailable = docs.length > pageSize;
        const pageDocs = nextAvailable ? docs.slice(0, pageSize) : docs;

        let mapped = pageDocs.map(mapUserDocToRow);

        const trimmedSearch = search.trim();
        if (trimmedSearch) {
          const s = normalizeLower(trimmedSearch);
          mapped = mapped.filter((row) => {
            const name = row.name ? normalizeLower(row.name) : "";
            const email = normalizeLower(row.email ?? "");
            return name.includes(s) || email.includes(s);
          });
        }

        setRows(mapped);
        setHasNext(nextAvailable);

        const firstDoc = pageDocs[0] ?? null;
        const last = pageDocs.length > 0 ? pageDocs[pageDocs.length - 1] : null;
        setLastDoc(last);

        if (firstDoc) {
          setPageStarts((prev) => {
            const next = [...prev];
            next[targetIndex] = firstDoc;
            return next;
          });
        }

        setPageIndex(targetIndex);
      } catch (e) {
        if (runId !== runIdRef.current) return;
        setError(e instanceof Error ? e.message : "Failed to load users");
      } finally {
        if (runId === runIdRef.current) setLoading(false);
      }
    },
    [pageSize, search, status]
  );

  const resetPagination = React.useCallback(() => {
    setPageIndex(0);
    setPageStarts([]);
    setLastDoc(null);
    void loadPage(0, null, "none");
  }, [loadPage]);

  const nextPage = React.useCallback(() => {
    if (loading || !hasNext) return;
    const nextIndex = pageIndex + 1;
    void loadPage(nextIndex, lastDoc, "startAfter");
  }, [hasNext, lastDoc, loadPage, loading, pageIndex]);

  const prevPage = React.useCallback(() => {
    if (loading || pageIndex === 0) return;
    const prevIndex = pageIndex - 1;
    const startDoc = pageStarts[prevIndex] ?? null;
    void loadPage(prevIndex, startDoc, startDoc ? "startAt" : "none");
  }, [loadPage, loading, pageIndex, pageStarts]);

  const refresh = React.useCallback(() => {
    const cursor = pageIndex === 0 ? null : pageStarts[pageIndex] ?? null;
    void loadPage(pageIndex, cursor, cursor ? "startAt" : "none");
  }, [loadPage, pageIndex, pageStarts]);

  React.useEffect(() => {
    resetPagination();
  }, [resetPagination]);

  const hasPrev = pageIndex > 0;

  return {
    rows,
    loading,
    error,
    pageSize,
    setPageSize,
    pageIndex,
    hasNext,
    hasPrev,
    nextPage,
    prevPage,
    resetPagination,
    refresh,
  };
}
