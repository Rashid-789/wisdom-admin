/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import { cn } from "../../utils/cn";
import Skeleton from "./Skeleton";
import EmptyState from "./EmptyState";

export type Column<T> = {
  key: string;
  header: React.ReactNode;
  className?: string;
  headerClassName?: string;
  cell?: (row: T) => React.ReactNode;
  accessor?: keyof T;
};

type Props<T> = {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onRowClick?: (row: T) => void;
};

function DataTable<T>({
  columns,
  rows,
  rowKey,
  isLoading,
  emptyTitle = "No data found",
  emptyDescription,
  onRowClick,
}: Props<T>) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!rows.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
      {/* ✅ Scroll container (mobile/tablet). Desktop stays identical. */}
      <div className="w-full overflow-x-auto overscroll-x-contain">
        <table className="w-full min-w-max border-collapse">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={cn(
                    "whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500",
                    c.headerClassName
                  )}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white">
            {rows.map((row) => {
              const clickable = !!onRowClick;
              return (
                <tr
                  key={rowKey(row)}
                  onClick={clickable ? () => onRowClick?.(row) : undefined}
                  className={cn("border-t border-slate-100", clickable && "cursor-pointer hover:bg-slate-50")}
                >
                  {columns.map((c) => {
                    const value = c.cell?.(row) ?? (c.accessor ? (row as any)[c.accessor] : null);

                    return (
                      <td
                        key={c.key}
                        className={cn(
                          "whitespace-nowrap px-4 py-3 text-sm text-slate-700",
                          c.className
                        )}
                      >
                        {value as any}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
