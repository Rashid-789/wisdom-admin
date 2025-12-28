import { useNavigate } from "react-router-dom";
import { Drawer, Button, Card, CardContent } from "../../../../app/shared";
import type { LiveSession } from "../../Types/liveClasses.types";
import { formatTimeRange } from "../../utils/liveClasses.utils";
import { paths } from "../../../../app/routes/paths";

type Props = {
  open: boolean;
  date: Date | null;
  sessions: LiveSession[];

  onClose: () => void;

  /**
   * Hook point for creating session from calendar day.
   * We keep it as a callback so later you can open your existing LiveClassFormDrawer
   * and prefill start/end.
   */
  onCreateForDay?: (date: Date) => void;
};

function formatDayTitle(d: Date) {
  return d.toLocaleDateString([], {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function CalendarDayDrawer({
  open,
  date,
  sessions,
  onClose,
  onCreateForDay,
}: Props) {
  const nav = useNavigate();

  const title = date ? formatDayTitle(date) : "Day";
  const description =
    sessions.length > 0
      ? `${sessions.length} session${sessions.length === 1 ? "" : "s"} scheduled`
      : "No sessions scheduled";

  return (
    <Drawer open={open} onClose={onClose} title={title} description={description}>
      <div className="space-y-3">
        <div className="flex items-center justify-end">
          <Button
            onClick={() => {
              if (!date) return;
              onCreateForDay?.(date);
            }}
            disabled={!date}
          >
            Create Session
          </Button>
        </div>

        {sessions.length === 0 ? (
          <Card>
            <CardContent className="p-4 text-sm text-slate-600">
              No live classes for this day.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {sessions.map((s) => (
              <button
                key={s.id}
                className="w-full text-left"
                onClick={() => nav(paths.admin.liveClasses.detail(s.id))}
              >
                <Card className="transition hover:shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {s.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatTimeRange(s.startAt, s.endAt)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Host: {s.hostTeacherName ?? "-"} • Course:{" "}
                          {s.courseTitle ?? "-"}
                        </p>
                      </div>

                      <span
                        className={[
                          "shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium",
                          s.status === "live"
                            ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                            : s.status === "scheduled"
                            ? "border-slate-100 bg-slate-50 text-slate-700"
                            : s.status === "ended"
                            ? "border-indigo-100 bg-indigo-50 text-indigo-700"
                            : "border-rose-100 bg-rose-50 text-rose-700",
                        ].join(" ")}
                      >
                        {s.status}
                      </span>
                    </div>

                    <div className="mt-3 flex justify-end">
                      <span className="text-xs font-medium text-slate-700">
                        View Details →
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        )}
      </div>
    </Drawer>
  );
}
