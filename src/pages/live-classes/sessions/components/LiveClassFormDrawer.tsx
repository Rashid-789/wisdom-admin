/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Drawer, Card, CardContent, Input, Select, Button } from "../../../../app/shared";

import type {
  LiveSession,
  LiveSessionStatus,
  TeacherOption,
  CourseOption,
} from "../../Types/liveClasses.types";

import {
  createLiveSession,
  updateLiveSession,
  listTeacherOptions,
  listCourseOptions,
  createGoogleMeetEvent,
  updateGoogleMeetEvent,
  type GoogleMeetUpsertInput,
} from "../../Api/liveClasses.api";

import { fromDatetimeLocal, toDatetimeLocal } from "../../utils/liveClasses.utils";

type Props = {
  open: boolean;
  session: LiveSession | null;
  onClose: () => void;
  onSaved: () => void;
};

function getTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return undefined;
  }
}

export default function LiveClassFormDrawer({ open, session, onClose, onSaved }: Props) {
  const isEdit = !!session;

  const [teachers, setTeachers] = React.useState<TeacherOption[]>([]);
  const [courses, setCourses] = React.useState<CourseOption[]>([]);

  const [title, setTitle] = React.useState(session?.title ?? "");
  const [hostTeacherId, setHostTeacherId] = React.useState(session?.hostTeacherId ?? "");
  const [courseId, setCourseId] = React.useState(session?.courseId ?? "");
  const [topicTitle, setTopicTitle] = React.useState(session?.topicTitle ?? "");

  const [startAt, setStartAt] = React.useState(
    session?.startAt ? toDatetimeLocal(session.startAt) : toDatetimeLocal(new Date().toISOString())
  );
  const [endAt, setEndAt] = React.useState(
    session?.endAt
      ? toDatetimeLocal(session.endAt)
      : toDatetimeLocal(new Date(Date.now() + 3600_000).toISOString())
  );

  const [capacity, setCapacity] = React.useState(String(session?.capacity ?? 50));
  const [status, setStatus] = React.useState<LiveSessionStatus>(session?.status ?? "scheduled");
  const [joinUrl, setJoinUrl] = React.useState(session?.joinUrl ?? "");

  // ✅ NEW: Google Calendar / Meet
  const [useGoogleMeet, setUseGoogleMeet] = React.useState<boolean>(!!session?.calendarEventId);
  const [calendarEventId, setCalendarEventId] = React.useState(session?.calendarEventId ?? "");
  const [calendarEventLink, setCalendarEventLink] = React.useState(session?.calendarEventLink ?? "");
  const [meetError, setMeetError] = React.useState<string | null>(null);

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
    setEndAt(
      session?.endAt
        ? toDatetimeLocal(session.endAt)
        : toDatetimeLocal(new Date(Date.now() + 3600_000).toISOString())
    );
    setCapacity(String(session?.capacity ?? 50));
    setStatus(session?.status ?? "scheduled");
    setJoinUrl(session?.joinUrl ?? "");

    // ✅ new fields
    setUseGoogleMeet(!!session?.calendarEventId);
    setCalendarEventId(session?.calendarEventId ?? "");
    setCalendarEventLink(session?.calendarEventLink ?? "");
    setMeetError(null);
  }, [session, open]);

  const selectedTeacher = teachers.find((t) => t.id === hostTeacherId);
  const selectedCourse = courses.find((c) => c.id === courseId);

  const startIso = startAt ? fromDatetimeLocal(startAt) : "";
  const endIso = endAt ? fromDatetimeLocal(endAt) : "";

  const isTimeValid =
    !!startIso &&
    !!endIso &&
    new Date(endIso).getTime() > new Date(startIso).getTime();

  const capNum = Number(capacity);

  const canSave =
    title.trim().length > 2 &&
    !!startAt &&
    !!endAt &&
    isTimeValid &&
    Number.isFinite(capNum) &&
    capNum > 0;

  function buildMeetDescription() {
    const lines: string[] = [];
    if (selectedCourse?.title) lines.push(`Course: ${selectedCourse.title}`);
    if (topicTitle.trim()) lines.push(`Topic: ${topicTitle.trim()}`);
    if (selectedTeacher?.name) lines.push(`Host: ${selectedTeacher.name}`);
    lines.push(`Capacity: ${capNum || 0}`);
    lines.push("");
    lines.push("Created from Admin Panel");
    return lines.join("\n");
  }

  async function ensureGoogleMeet(): Promise<{ meetUrl: string; eventId: string; htmlLink?: string }> {
    const payload: GoogleMeetUpsertInput = {
      summary: title.trim(),
      description: buildMeetDescription(),
      startAt: startIso,
      endAt: endIso,
      timeZone: getTimeZone(),
    };

    // If we already have an event, update it (edit flow)
    if (calendarEventId) {
      const updated = await updateGoogleMeetEvent(calendarEventId, payload);
      return { meetUrl: updated.meetUrl, eventId: updated.eventId, htmlLink: updated.htmlLink };
    }

    // Otherwise create a new event (create flow)
    const created = await createGoogleMeetEvent(payload);
    return { meetUrl: created.meetUrl, eventId: created.eventId, htmlLink: created.htmlLink };
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Live Session" : "Create Live Session"}
      description="Set host, course/topic and schedule time & capacity."
    >
      <Card>
        <CardContent className="space-y-3 p-4">
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Trigonometry — Live Q&A"
          />

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

          <Input
            label="Topic (optional)"
            value={topicTitle}
            onChange={(e) => setTopicTitle(e.target.value)}
            placeholder="Sin / Cos / Tan"
          />

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

          {!isTimeValid ? (
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-3 text-xs text-amber-800">
              End time must be after start time.
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label="Capacity"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="50"
            />
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

          {/* ✅ Google Meet toggle */}
          <div className="rounded-2xl border border-slate-100 bg-white p-3">
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-slate-300"
                checked={useGoogleMeet}
                onChange={(e) => setUseGoogleMeet(e.target.checked)}
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900">
                  Auto-create Google Meet link (Google Calendar)
                </p>
                <p className="text-xs text-slate-500">
                  On Save, we will create/update a Google Calendar event and fill Join URL automatically.
                </p>

                {calendarEventLink ? (
                  <a
                    href={calendarEventLink}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block text-xs font-medium text-slate-700 underline underline-offset-2"
                  >
                    Open calendar event
                  </a>
                ) : null}
              </div>
            </label>

            {meetError ? (
              <div className="mt-2 rounded-xl border border-red-100 bg-red-50 p-2 text-xs text-red-700">
                {meetError}
              </div>
            ) : null}
          </div>

          {/* Join URL */}
          <Input
            label="Join URL (optional)"
            value={joinUrl}
            onChange={(e) => setJoinUrl(e.target.value)}
            placeholder="https://meet.google.com/..."
            disabled={useGoogleMeet}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>

            <Button
              isLoading={saving}
              disabled={!canSave}
              onClick={async () => {
                setSaving(true);
                setMeetError(null);

                try {
                  let finalJoinUrl = joinUrl.trim() || undefined;
                  let finalEventId = calendarEventId || undefined;
                  let finalEventLink = calendarEventLink || undefined;

                  // ✅ Create/Update Meet automatically (if enabled)
                  if (useGoogleMeet) {
                    const meet = await ensureGoogleMeet();

                    finalJoinUrl = meet.meetUrl?.trim() || undefined;
                    finalEventId = meet.eventId;
                    finalEventLink = meet.htmlLink;

                    // keep UI in sync
                    setJoinUrl(meet.meetUrl || "");
                    setCalendarEventId(meet.eventId);
                    setCalendarEventLink(meet.htmlLink || "");
                  }

                  const payload = {
                    title: title.trim(),
                    hostTeacherId: hostTeacherId || undefined,
                    hostTeacherName: selectedTeacher?.name,
                    courseId: courseId || undefined,
                    courseTitle: selectedCourse?.title,
                    topicTitle: topicTitle.trim() || undefined,
                    startAt: startIso,
                    endAt: endIso,
                    capacity: Number.isFinite(capNum) ? capNum : 0,
                    status,
                    joinUrl: finalJoinUrl,
                    recordingUrl: session?.recordingUrl ?? "",

                    // ✅ NEW: store calendar event data in your DB
                    // (make sure backend schema/controller allows these fields)
                    calendarEventId: finalEventId,
                    calendarEventLink: finalEventLink,
                  };

                  if (isEdit) await updateLiveSession(session!.id, payload as any);
                  else await createLiveSession(payload as any);

                  onSaved();
                } catch (e: any) {
                  // if Google meet failed, show readable error
                  const msg = e?.message ? String(e.message) : "Something went wrong";
                  setMeetError(msg);
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
