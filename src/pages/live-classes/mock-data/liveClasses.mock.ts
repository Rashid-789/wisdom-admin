/* eslint-disable prefer-const */

import type { LiveSession, AttendanceRow, ChatMessage, TeacherOption, CourseOption } from "../Types/liveClasses.types";

function iso(d: Date) {
  return d.toISOString();
}

export const TEACHERS: TeacherOption[] = [
  { id: "t1", name: "Sarah Ahmed", email: "sarah@domain.com" },
  { id: "t2", name: "Ali Khan", email: "ali@domain.com" },
];

export const COURSES: CourseOption[] = [
  { id: "c1", title: "Trigonometry" },
  { id: "c2", title: "Physics Basics" },
];

export let LIVE_SESSIONS: LiveSession[] = [
  {
    id: "ls1",
    title: "Trigonometry — Live Q&A",
    courseId: "c1",
    courseTitle: "Trigonometry",
    topicId: "tp1",
    topicTitle: "Sin / Cos / Tan",
    hostTeacherId: "t1",
    hostTeacherName: "Sarah Ahmed",
    startAt: iso(new Date(Date.now() + 3600_000 * 5)),
    endAt: iso(new Date(Date.now() + 3600_000 * 6)),
    capacity: 50,
    status: "scheduled",
    joinUrl: "https://meet.example.com/live/trig-qa",
    recordingUrl: "",
    createdAt: iso(new Date(Date.now() - 8640_000)),
  },
  {
    id: "ls2",
    title: "Physics — Motion (Live)",
    courseId: "c2",
    courseTitle: "Physics Basics",
    hostTeacherId: "t2",
    hostTeacherName: "Ali Khan",
    startAt: iso(new Date(Date.now() - 3600_000)),
    endAt: iso(new Date(Date.now() + 1800_000)),
    capacity: 100,
    status: "live",
    joinUrl: "https://meet.example.com/live/physics-motion",
    recordingUrl: "",
    createdAt: iso(new Date(Date.now() - 8640_000 * 3)),
  },
];


export let ATTENDANCE: AttendanceRow[] = [
  { id: "a1", sessionId: "ls2", userId: "u1", name: "Hassan", email: "hassan@mail.com", joinedAt: iso(new Date(Date.now() - 3000_000)) },
  { id: "a2", sessionId: "ls2", userId: "u2", name: "Ayesha", email: "ayesha@mail.com", joinedAt: iso(new Date(Date.now() - 2500_000)) },
];

export let CHAT: ChatMessage[] = [
  { id: "m1", sessionId: "ls2", userId: "u1", userName: "Hassan", message: "Sir please repeat the formula.", createdAt: iso(new Date(Date.now() - 2200_000)) },
  { id: "m2", sessionId: "ls2", userId: "u2", userName: "Ayesha", message: "Thank you!", createdAt: iso(new Date(Date.now() - 2100_000)) },
];
