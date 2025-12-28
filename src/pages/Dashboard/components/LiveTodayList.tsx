
import React from "react";
import { Badge, Card, CardContent, EmptyState } from "../../../app/shared";
import type { LiveSessionToday, LiveStatus } from "../Types/dashboard.types";
import { cn } from "../../../app/utils/cn";

function statusTone(s: LiveStatus) {
  if (s === "live") return "success";
  if (s === "scheduled") return "warning";
  return "default";
}

function formatTimeRange(startIso: string, endIso: string) {
  const s = new Date(startIso);
  const e = new Date(endIso);
  const fmt = (d: Date) => d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  return `${fmt(s)} - ${fmt(e)}`;
}

type Props = {
  rows: LiveSessionToday[];
  isLoading?: boolean;
};

const LiveTodayList: React.FC<Props> = ({ rows, isLoading }) => {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-3">
            <div className="h-12 w-full animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-12 w-full animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-12 w-full animate-pulse rounded-2xl bg-slate-100" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!rows.length) {
    return <EmptyState title="No live classes today" description="Scheduled sessions will appear here." />;
  }

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-3">
          {rows.map((s) => {
            const pct = s.capacity ? Math.round((s.attendees / s.capacity) * 100) : 0;

            return (
              <div
                key={s.id}
                className="rounded-2xl border border-slate-100 bg-white p-4 hover:bg-slate-50 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">{s.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {formatTimeRange(s.startTime, s.endTime)} • {s.teacherName}
                    </p>
                  </div>

                  <Badge tone={statusTone(s.status)} className="shrink-0">
                    {s.status}
                  </Badge>
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>
                      {s.attendees}/{s.capacity} attendees
                    </span>
                    <span>{pct}%</span>
                  </div>
                  <div className="mt-1 h-2 w-full rounded-full bg-slate-100">
                    <div
                      className={cn("h-2 rounded-full bg-slate-900")}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveTodayList;
