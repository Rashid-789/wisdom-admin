export type LiveSessionStatus = "scheduled" | "live" | "ended" | "cancelled";

export type MeetingProvider = "manual" | "google_meet";

export type LiveSession = {
  id: string;

  title: string;

  // In future: link to your content module
  courseId?: string;
  courseTitle?: string;

  topicId?: string;
  topicTitle?: string;

  hostTeacherId?: string;
  hostTeacherName?: string;

  startAt: string; // ISO
  endAt: string; // ISO
  capacity: number;

  status: LiveSessionStatus;

  joinUrl?: string; // meeting link
  recordingUrl?: string; // optional

  // ✅ NEW: Google Calendar / Meet integration fields
  meetingProvider?: MeetingProvider; // "manual" (default) | "google_meet"
  calendarEventId?: string; // Google Calendar Event ID
  calendarEventLink?: string; // Google Calendar htmlLink

  createdAt: string; // ISO
};

export type AttendanceRow = {
  id: string;
  sessionId: string;
  userId: string;
  name: string;
  email?: string;
  joinedAt?: string; // ISO
  leftAt?: string; // ISO
};

export type ChatMessage = {
  id: string;
  sessionId: string;
  userId: string;
  userName: string;
  message: string;
  createdAt: string; // ISO

  flagged?: boolean;
  deleted?: boolean;
};

export type TeacherOption = {
  id: string;
  name: string;
  email?: string;
};

export type CourseOption = {
  id: string;
  title: string;
};

export type ListQuery = {
  page: number;
  pageSize: number;
  search?: string;
  status?: LiveSessionStatus | "all";
};

export type ListResponse<T> = {
  rows: T[];
  total: number;
};
