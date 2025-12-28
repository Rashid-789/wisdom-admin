
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../../app/shared";
import type { LiveSession } from "../../Types/liveClasses.types";
import { paths } from "../../../../app/routes/paths";

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

type Props = {
  sessions: LiveSession[];
  isLoading?: boolean;
};

export default function CalendarView({ sessions, isLoading }: Props) {
  const nav = useNavigate();
  const [cursor, setCursor] = React.useState(() => new Date());

  const monthStart = startOfMonth(cursor);
  const monthEnd = endOfMonth(cursor);

  // Build grid starting Sunday
  const gridStart = addDays(monthStart, -monthStart.getDay());
  const gridEnd = addDays(monthEnd, 6 - monthEnd.getDay());

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const days: Date[] = [];
  for (let d = gridStart; d <= gridEnd; d = addDays(d, 1)) days.push(d);

  const byDay = React.useMemo(() => {
    return days.map((day) => {
      const daySessions = sessions.filter((s) => sameDay(new Date(s.startAt), day));
      return { day, daySessions };
    });
  }, [days, sessions]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {cursor.toLocaleString([], { month: "long", year: "numeric" })}
          </p>
          <p className="text-sm text-slate-500">Monthly calendar view</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCursor(new Date())}>Today</Button>
          <Button variant="outline" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>Prev</Button>
          <Button variant="outline" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>Next</Button>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-7">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((w) => (
            <div key={w} className="hidden sm:block text-xs font-semibold text-slate-500 px-2">{w}</div>
          ))}

          {byDay.map(({ day, daySessions }) => {
            const inMonth = day.getMonth() === cursor.getMonth();
            return (
              <div
                key={day.toISOString()}
                className={`min-h-[92px] rounded-2xl border p-2 ${inMonth ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50"}`}
              >
                <div className="flex items-center justify-between">
                  <p className={`text-xs font-semibold ${inMonth ? "text-slate-800" : "text-slate-400"}`}>
                    {day.getDate()}
                  </p>
                  {daySessions.length > 0 ? (
                    <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-white">
                      {daySessions.length}
                    </span>
                  ) : null}
                </div>

                <div className="mt-2 space-y-1">
                  {daySessions.slice(0, 2).map((s) => (
                    <button
                      key={s.id}
                      className="block w-full truncate rounded-xl bg-slate-900/5 px-2 py-1 text-left text-xs text-slate-700 hover:bg-slate-900/10"
                      onClick={() => nav(paths.admin.liveClasses.detail(s.id))}
                      title={s.title}
                    >
                      {new Date(s.startAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} • {s.title}
                    </button>
                  ))}
                  {daySessions.length > 2 ? (
                    <p className="text-[11px] text-slate-500">+{daySessions.length - 2} more</p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
