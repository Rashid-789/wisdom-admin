
export type CourseCategory = "basic" | "skill";
export type PublishStatus = "draft" | "published" | "scheduled";

export type Subject = {
  id: string;
  title: string;         // e.g. Applied Mathematics
  gradeRange?: string;   // e.g. Grade 8-9
  createdAt: string;     // ISO
};

export type Course = {
  id: string;
  subjectId: string;
  category: CourseCategory; // basic/skill
  title: string;
  description?: string;
  status: PublishStatus;
  scheduledFor?: string; // ISO (if scheduled)
  createdAt: string;     // ISO
};

export type Chapter = {
  id: string;
  title: string;
  order: number;
  topics: Topic[];
};

export type Topic = {
  id: string;
  title: string;
  order: number;
  lectureId?: string;   // optional
  exerciseId?: string;  // optional
};

export type CourseCurriculum = {
  courseId: string;
  chapters: Chapter[];
};

export type SpeedPoint = {
  id: string;
  timeSec: number; // timestamp in seconds
  label: string;   // e.g. "Derivatives rule"
};

export type Lecture = {
  id: string;
  title: string;
  courseId?: string; // library can be global, but usually linked
  durationSec?: number;
  videoUrl?: string; // later: Firebase Storage URL
  transcript?: string;
  speedPoints: SpeedPoint[];
  createdAt: string;
};

export type ExerciseKind = "mcq" | "short" | "long";

export type Exercise = {
  id: string;
  title: string;
  kind: ExerciseKind;
  // minimal builder structure (expand later)
  questions: Array<
    | { type: "mcq"; prompt: string; options: string[]; correctIndex: number }
    | { type: "short"; prompt: string; sampleAnswer?: string }
    | { type: "long"; prompt: string; rubric?: string }
  >;
  createdAt: string;
};

export type ListQuery = {
  page: number;
  pageSize: number;
  search?: string;
};

export type ListResponse<T> = {
  rows: T[];
  total: number;
};
