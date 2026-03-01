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

export type ImageAsset = {
  source: VideoSource;
  url: string;
  storagePath?: string;
};

export type Topic = {
  id: string;
  title: string;
  order: number;
  rewardTokens?: number;
  video?: TopicVideo;
  thumbnail?: ImageAsset;
  transcript?: string;
  speedPoints?: SpeedPoint[];
  createdAt?: string;
  updatedAt?: string;

  // Legacy compatibility.
  lectureId?: string;
  exerciseId?: string;
};

export type Chapter = {
  id: string;
  title: string;
  order: number;
  topics: Topic[];
  createdAt?: string;
  updatedAt?: string;
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
  coverImage?: string;
  coverImageSource?: VideoSource;
  createdAt: string;
  updatedAt?: string;
  category?: CourseCategory;
};

export type BasicCourse = {
  id: string;
  title: string;
  description?: string;
  status: PublishStatus;
  scheduledFor?: string;
  coverImage?: string;
  coverImageSource?: VideoSource;
  gradeRange?: string;
  lecturerName?: string;
  // Legacy compatibility fields (no longer primary in new model).
  subjectId?: string;
  subjectTitle?: string;
  createdAt: string;
  updatedAt?: string;
};

export type SkillSubject = {
  id: string;
  title: string;
  lecturerName?: string;
  coverImage?: string;
  coverImageSource?: VideoSource;
  createdAt: string;
  updatedAt?: string;
  category?: CourseCategory;
};

export type SkillTopic = {
  id: string;
  subjectId: string;
  title: string;
  rewardTokens?: number;
  video: TopicVideo;
  thumbnail?: ImageAsset;
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
export type SubjectOption = Pick<BasicSubject, "id" | "title"> & {
  category?: CourseCategory;
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
