import React from "react";
import { Card, CardContent, Select, Input, Button } from "../../../../app/shared";
import type { Course, PublishStatus } from "../../Types/content.types";
import { updateCourse } from "../../Api/content.api";

export default function PublishingTab({
  course,
  onCourseUpdated,
}: {
  course: Course;
  onCourseUpdated: (c: Course) => void;
}) {
  const [status, setStatus] = React.useState<PublishStatus>(course.status);
  const [scheduledFor, setScheduledFor] = React.useState(course.scheduledFor ?? "");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    setStatus(course.status);
    setScheduledFor(course.scheduledFor ?? "");
  }, [course]);

  return (
    <Card>
      <CardContent className="p-4 sm:p-6 space-y-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">Publishing</p>
          <p className="text-sm text-slate-500">Control visibility for student app.</p>
        </div>

        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as PublishStatus)}
          options={[
            { label: "Draft", value: "draft" },
            { label: "Published", value: "published" },
            { label: "Scheduled", value: "scheduled" },
          ]}
        />

        {status === "scheduled" ? (
          <Input
            label="Schedule date/time (ISO or datetime-local)"
            value={scheduledFor}
            onChange={(e) => setScheduledFor(e.target.value)}
            placeholder="2026-01-01T10:00:00Z"
          />
        ) : null}

        <Button
          isLoading={saving}
          onClick={async () => {
            setSaving(true);
            try {
              const updated = await updateCourse(course.id, {
                status,
                scheduledFor: status === "scheduled" ? scheduledFor || undefined : undefined,
              });
              onCourseUpdated(updated);
            } finally {
              setSaving(false);
            }
          }}
        >
          Save Publishing
        </Button>

        <div className="rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-600">
          Notes:
          <ul className="mt-2 list-disc pl-5">
            <li>Draft courses are hidden in student app</li>
            <li>Published appear immediately</li>
            <li>Scheduled will become published at scheduled time (backend/cron later)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

