export type PublishStatus = "draft" | "published" | "scheduled";
export type VideoSource = "upload" | "link";
export type CourseCategory = "basic" | "skill";

export type SpeedPoint = {
  id: string;
  timeSec: number;
  label: string;
};

export type TopicVideo = {
  source: VideoSource;
  url: string;
  durationSec?: number;
  storagePath?: string;
};

export type Topic = {
  id: string;
  title: string;
  order: number;
  rewardTokens?: number;
  video?: TopicVideo;
  transcript?: string;
  speedPoints?: SpeedPoint[];

  // Legacy compatibility.
  lectureId?: string;
  exerciseId?: string;
};

export type Chapter = {
  id: string;
  title: string;
  order: number;
  topics: Topic[];
};

export type CourseCurriculum = {
  courseId: string;
  chapters: Chapter[];
  updatedAt?: string;
};

export type BasicSubjectCurriculum = {
  subjectId: string;
  chapters: Chapter[];
  updatedAt?: string;
};

export type BasicSubject = {
  id: string;
  title: string;
  gradeRange?: string;
  status: PublishStatus;
  scheduledFor?: string;
  createdAt: string;
};

export type BasicCourse = {
  id: string;
  subjectId: string;
  title: string;
  description?: string;
  status: PublishStatus;
  scheduledFor?: string;
  createdAt: string;
};

export type SkillSubject = {
  id: string;
  title: string;
  lecturerName?: string;
  coverImage?: string;
  createdAt: string;
};

export type SkillTopic = {
  id: string;
  subjectId: string;
  title: string;
  rewardTokens?: number;
  video: TopicVideo;
  transcript?: string;
  speedPoints?: SpeedPoint[];
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

// Legacy aliases for still-existing files. New code should use Basic*/Skill* types.
export type Subject = BasicSubject;
export type Course = BasicCourse & { category: CourseCategory };

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
