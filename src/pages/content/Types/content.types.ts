
export type CourseCategory = "basic" | "skill";
export type PublishStatus = "draft" | "published" | "scheduled";
export type VideoSource = "upload" | "link";
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

  rewardTokens?: number;   
  lectureId?: string;   
  exerciseId?: string;
};

export type CourseCurriculum = {
  courseId: string;
  chapters: Chapter[];
};

export type SpeedPoint = {
  id: string;
  timeSec: number; 
  label: string;   
};

export type Lecture = {
  id: string;
  title: string;
  courseId?: string;
  durationSec?: number;
  videoUrl?: string;          
  videoSource?: VideoSource; 
  transcript?: string;
  speedPoints: SpeedPoint[];
  createdAt: string;
};

export type ExerciseKind = "mcq" | "short" | "long";

export type Exercise = {
  id: string;
  title: string;
  kind: ExerciseKind;
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

