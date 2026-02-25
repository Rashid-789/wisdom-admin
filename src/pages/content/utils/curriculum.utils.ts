import type { BasicSubjectCurriculum, Chapter, CourseCurriculum } from "../Types/content.types";

export function normalizeCurriculumChapters(chapters: Chapter[]): Chapter[] {
  return chapters
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((chapter, chapterIndex) => ({
      ...chapter,
      order: chapterIndex + 1,
      topics: chapter.topics
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((topic, topicIndex) => ({
          ...topic,
          order: topicIndex + 1,
        })),
    }));
}

export function normalizeCourseCurriculum(value: CourseCurriculum): CourseCurriculum {
  return {
    ...value,
    chapters: normalizeCurriculumChapters(value.chapters),
  };
}

export function normalizeSubjectCurriculum(value: BasicSubjectCurriculum): BasicSubjectCurriculum {
  return {
    ...value,
    chapters: normalizeCurriculumChapters(value.chapters),
  };
}

export function curriculumSignature(chapters: Chapter[]): string {
  return JSON.stringify(normalizeCurriculumChapters(chapters));
}

export function getApiErrorMessage(error: unknown, fallback = "Request failed"): string {
  if (error instanceof Error && error.message.trim()) return error.message;
  if (typeof error === "string" && error.trim()) return error;
  return fallback;
}
