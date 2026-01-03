import type {
  LiveSession,
  AttendanceRow,
  ChatMessage,
  TeacherOption,
  CourseOption,
  ListQuery,
  ListResponse,
} from "../Types/liveClasses.types";

import { LIVE_SESSIONS, ATTENDANCE, CHAT, TEACHERS, COURSES } from "../mock-data/liveClasses.mock";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function paginate<T>(rows: T[], q: ListQuery): ListResponse<T> {
  const start = (q.page - 1) * q.pageSize;
  const end = start + q.pageSize;
  return { rows: rows.slice(start, end), total: rows.length };
}

function matchSearch(rows: LiveSession[], search?: string) {
  const s = search?.trim().toLowerCase();
  if (!s) return rows;
  return rows.filter((r) => {
    const hay = `${r.title} ${r.courseTitle ?? ""} ${r.topicTitle ?? ""} ${r.hostTeacherName ?? ""}`.toLowerCase();
    return hay.includes(s);
  });
}

/* -------------------------------------------------------------------------- */
/* Options (teachers/courses)                                                  */
/* -------------------------------------------------------------------------- */
export async function listTeacherOptions(): Promise<TeacherOption[]> {
  await sleep(120);
  return TEACHERS;
}

export async function listCourseOptions(): Promise<CourseOption[]> {
  await sleep(120);
  return COURSES;
}

/* -------------------------------------------------------------------------- */
/* Sessions                                                                     */
/* -------------------------------------------------------------------------- */
export async function listLiveSessions(q: ListQuery): Promise<ListResponse<LiveSession>> {
  await sleep(180);

  let rows = [...LIVE_SESSIONS].sort((a, b) => a.startAt.localeCompare(b.startAt)); // upcoming first

  if (q.status && q.status !== "all") {
    rows = rows.filter((r) => r.status === q.status);
  }

  rows = matchSearch(rows, q.search);

  return paginate(rows, q);
}

export async function getLiveSession(id: string): Promise<LiveSession> {
  await sleep(150);
  const hit = LIVE_SESSIONS.find((x) => x.id === id);
  if (!hit) throw new Error("Live session not found");
  return hit;
}

export async function createLiveSession(input: Omit<LiveSession, "id" | "createdAt">): Promise<LiveSession> {
  await sleep(200);
  const row: LiveSession = {
    ...input,
    id: `ls_${Math.random().toString(16).slice(2)}`,
    createdAt: new Date().toISOString(),
  };
  LIVE_SESSIONS.unshift(row);
  return row;
}

export async function updateLiveSession(id: string, patch: Partial<LiveSession>): Promise<LiveSession> {
  await sleep(200);
  const idx = LIVE_SESSIONS.findIndex((x) => x.id === id);
  if (idx < 0) throw new Error("Live session not found");
  LIVE_SESSIONS[idx] = { ...LIVE_SESSIONS[idx], ...patch };
  return LIVE_SESSIONS[idx];
}

/* -------------------------------------------------------------------------- */
/* Attendance                                                                   */
/* -------------------------------------------------------------------------- */
export async function listAttendance(sessionId: string): Promise<AttendanceRow[]> {
  await sleep(160);
  return ATTENDANCE.filter((a) => a.sessionId === sessionId).sort((a, b) => (a.joinedAt ?? "").localeCompare(b.joinedAt ?? ""));
}

/* -------------------------------------------------------------------------- */
/* Chat moderation                                                              */
/* -------------------------------------------------------------------------- */
export async function listChatMessages(sessionId: string): Promise<ChatMessage[]> {
  await sleep(160);
  return CHAT.filter((m) => m.sessionId === sessionId).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function flagMessage(messageId: string, flagged: boolean): Promise<ChatMessage> {
  await sleep(120);
  const idx = CHAT.findIndex((m) => m.id === messageId);
  if (idx < 0) throw new Error("Message not found");
  CHAT[idx] = { ...CHAT[idx], flagged };
  return CHAT[idx];
}

export async function deleteMessage(messageId: string): Promise<ChatMessage> {
  await sleep(120);
  const idx = CHAT.findIndex((m) => m.id === messageId);
  if (idx < 0) throw new Error("Message not found");
  CHAT[idx] = { ...CHAT[idx], deleted: true };
  return CHAT[idx];
}

/* -------------------------------------------------------------------------- */
/* Google Meet (Calendar)                                                      */
/* -------------------------------------------------------------------------- */
export { createGoogleMeetEvent, updateGoogleMeetEvent } from "./liveclass.api";
export type { GoogleMeetUpsertInput, GoogleMeetUpsertResponse } from "./liveclass.api";

