/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import { Drawer, Card, CardContent, Input, Select, Button } from "../../../../app/shared";

import type { LiveSession, LiveSessionStatus, TeacherOption, CourseOption } from "../../Types/liveClasses.types";
import { createLiveSession, updateLiveSession, listTeacherOptions, listCourseOptions } from "../../Api/liveClasses.api";
import { fromDatetimeLocal, toDatetimeLocal } from "../../utils/liveClasses.utils";

/**
 * Drawer for Create/Edit session
 * - Keeps state isolated and clean
 * - Later replace teacher/course options from Firebase collections
 */
type Props = {
  open: boolean;
  session: LiveSession | null;
  onClose: () => void;
  onSaved: () => void;
};

export default function LiveClassFormDrawer({ open, session, onClose, onSaved }: Props) {
  const isEdit = !!session;

  const [teachers, setTeachers] = React.useState<TeacherOption[]>([]);
  const [courses, setCourses] = React.useState<CourseOption[]>([]);

  const [title, setTitle] = React.useState(session?.title ?? "");
  const [hostTeacherId, setHostTeacherId] = React.useState(session?.hostTeacherId ?? "");
  const [courseId, setCourseId] = React.useState(session?.courseId ?? "");
  const [topicTitle, setTopicTitle] = React.useState(session?.topicTitle ?? "");

  const [startAt, setStartAt] = React.useState(session?.startAt ? toDatetimeLocal(session.startAt) : toDatetimeLocal(new Date().toISOString()));
  const [endAt, setEndAt] = React.useState(session?.endAt ? toDatetimeLocal(session.endAt) : toDatetimeLocal(new Date(Date.now() + 3600_000).toISOString()));

  const [capacity, setCapacity] = React.useState(String(session?.capacity ?? 50));
  const [status, setStatus] = React.useState<LiveSessionStatus>(session?.status ?? "scheduled");
  const [joinUrl, setJoinUrl] = React.useState(session?.joinUrl ?? "");

  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    (async () => {
      const [t, c] = await Promise.all([listTeacherOptions(), listCourseOptions()]);
      setTeachers(t);
      setCourses(c);
    })();
  }, [open]);

  React.useEffect(() => {
    setTitle(session?.title ?? "");
    setHostTeacherId(session?.hostTeacherId ?? "");
    setCourseId(session?.courseId ?? "");
    setTopicTitle(session?.topicTitle ?? "");
    setStartAt(session?.startAt ? toDatetimeLocal(session.startAt) : toDatetimeLocal(new Date().toISOString()));
    setEndAt(session?.endAt ? toDatetimeLocal(session.endAt) : toDatetimeLocal(new Date(Date.now() + 3600_000).toISOString()));
    setCapacity(String(session?.capacity ?? 50));
    setStatus(session?.status ?? "scheduled");
    setJoinUrl(session?.joinUrl ?? "");
  }, [session, open]);

  const canSave = title.trim().length > 2 && startAt && endAt && Number(capacity) > 0;

  const selectedTeacher = teachers.find((t) => t.id === hostTeacherId);
  const selectedCourse = courses.find((c) => c.id === courseId);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Live Session" : "Create Live Session"}
      description="Set host, course/topic and schedule time & capacity."
    >
      <Card>
        <CardContent className="p-4 space-y-3">
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Trigonometry — Live Q&A" />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Select
              label="Host Teacher"
              value={hostTeacherId}
              onChange={(e) => setHostTeacherId(e.target.value)}
              options={[
                { label: "Select teacher", value: "" },
                ...teachers.map((t) => ({ label: t.name, value: t.id })),
              ]}
            />
            <Select
              label="Course"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              options={[
                { label: "Select course", value: "" },
                ...courses.map((c) => ({ label: c.title, value: c.id })),
              ]}
            />
          </div>

          <Input label="Topic (optional)" value={topicTitle} onChange={(e) => setTopicTitle(e.target.value)} placeholder="Sin / Cos / Tan" />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-sm font-medium text-slate-900">Start</p>
              <input
                type="datetime-local"
                className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
              />
            </div>
            <div>
              <p className="mb-1 text-sm font-medium text-slate-900">End</p>
              <input
                type="datetime-local"
                className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input label="Capacity" value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="50" />
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as LiveSessionStatus)}
              options={[
                { label: "Scheduled", value: "scheduled" },
                { label: "Live", value: "live" },
                { label: "Ended", value: "ended" },
                { label: "Cancelled", value: "cancelled" },
              ]}
            />
          </div>

          <Input label="Join URL (optional)" value={joinUrl} onChange={(e) => setJoinUrl(e.target.value)} placeholder="https://meet.google.com/..." />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button
              isLoading={saving}
              disabled={!canSave}
              onClick={async () => {
                setSaving(true);
                try {
                  const payload = {
                    title: title.trim(),
                    hostTeacherId: hostTeacherId || undefined,
                    hostTeacherName: selectedTeacher?.name,
                    courseId: courseId || undefined,
                    courseTitle: selectedCourse?.title,
                    topicTitle: topicTitle.trim() || undefined,
                    startAt: fromDatetimeLocal(startAt),
                    endAt: fromDatetimeLocal(endAt),
                    capacity: Number(capacity) || 0,
                    status,
                    joinUrl: joinUrl.trim() || undefined,
                    recordingUrl: session?.recordingUrl ?? "",
                  };

                  if (isEdit) await updateLiveSession(session!.id, payload as any);
                  else await createLiveSession(payload as any);

                  onSaved();
                } finally {
                  setSaving(false);
                }
              }}
            >
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
    </Drawer>
  );
}
