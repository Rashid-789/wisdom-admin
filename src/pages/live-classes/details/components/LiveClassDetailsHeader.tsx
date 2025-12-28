
import React from "react";
import { Card, CardContent, Button } from "../../../../app/shared";
import type { LiveSession } from "../../Types/liveClasses.types";
import { formatTimeRange } from "../../utils/liveClasses.utils";
import { updateLiveSession } from "../../Api/liveClasses.api";

/**
 * Header shows summary + quick status changes
 * Later: permissions (Super Admin / Admin) can gate actions.
 */
export default function LiveClassDetailsHeader({
  session,
  onChanged,
}: {
  session: LiveSession;
  onChanged: () => void;
}) {
  const [saving, setSaving] = React.useState(false);

  return (
    <Card>
      <CardContent className="p-4 sm:p-6 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold text-slate-900">{session.title}</h2>
          <p className="text-sm text-slate-500">{formatTimeRange(session.startAt, session.endAt)}</p>
          <p className="mt-1 text-xs text-slate-500">
            Host: {session.hostTeacherName ?? "-"} • Course: {session.courseTitle ?? "-"} {session.topicTitle ? `• Topic: ${session.topicTitle}` : ""}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            isLoading={saving}
            onClick={async () => {
              setSaving(true);
              try {
                await updateLiveSession(session.id, { status: "live" });
                onChanged();
              } finally {
                setSaving(false);
              }
            }}
          >
            Mark Live
          </Button>

          <Button
            variant="outline"
            isLoading={saving}
            onClick={async () => {
              setSaving(true);
              try {
                await updateLiveSession(session.id, { status: "ended" });
                onChanged();
              } finally {
                setSaving(false);
              }
            }}
          >
            End Session
          </Button>

          <Button
            variant="outline"
            isLoading={saving}
            onClick={async () => {
              setSaving(true);
              try {
                await updateLiveSession(session.id, { status: "cancelled" });
                onChanged();
              } finally {
                setSaving(false);
              }
            }}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
