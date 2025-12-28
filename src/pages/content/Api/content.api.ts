
import type {
  Subject,
  Course,
  CourseCurriculum,
  Lecture,
  Exercise,
  ListQuery,
  ListResponse,
  PublishStatus,
} from "../Types/content.types";

import { SUBJECTS, COURSES, CURRICULUM, LECTURES, EXERCISES } from "../mock-data/content.mock";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function paginate<T>(rows: T[], q: ListQuery): ListResponse<T> {
  const start = (q.page - 1) * q.pageSize;
  const end = start + q.pageSize;
  return { rows: rows.slice(start, end), total: rows.length };
}

function matchSearch<T extends { title?: string; name?: string }>(rows: T[], search?: string) {
  const s = search?.trim().toLowerCase();
  if (!s) return rows;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return rows.filter((r: any) => (r.title ?? r.name ?? "").toLowerCase().includes(s));
}

/* -------------------------------------------------------------------------- */
/* Subjects                                                                    */
/* -------------------------------------------------------------------------- */
export async function listSubjects(q: ListQuery): Promise<ListResponse<Subject>> {
  await sleep(180);
  const rows = matchSearch([...SUBJECTS].sort((a, b) => b.createdAt.localeCompare(a.createdAt)), q.search);
  return paginate(rows, q);
}

export async function createSubject(input: Pick<Subject, "title" | "gradeRange">): Promise<Subject> {
  await sleep(180);
  const newRow: Subject = {
    id: `s_${Math.random().toString(16).slice(2)}`,
    title: input.title,
    gradeRange: input.gradeRange,
    createdAt: new Date().toISOString(),
  };
  SUBJECTS.unshift(newRow);
  return newRow;
}

export async function updateSubject(id: string, patch: Partial<Pick<Subject, "title" | "gradeRange">>): Promise<Subject> {
  await sleep(180);
  const idx = SUBJECTS.findIndex((s) => s.id === id);
  if (idx < 0) throw new Error("Subject not found");
  SUBJECTS[idx] = { ...SUBJECTS[idx], ...patch };
  return SUBJECTS[idx];
}

/* -------------------------------------------------------------------------- */
/* Courses                                                                      */
/* -------------------------------------------------------------------------- */
export async function listCourses(q: ListQuery & { subjectId?: string; status?: PublishStatus | "all" }) {
  await sleep(200);
  let rows = [...COURSES].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  if (q.subjectId) rows = rows.filter((c) => c.subjectId === q.subjectId);
  if (q.status && q.status !== "all") rows = rows.filter((c) => c.status === q.status);

  rows = matchSearch(rows, q.search);
  return paginate(rows, q);
}

export async function getCourse(courseId: string): Promise<Course> {
  await sleep(160);
  const c = COURSES.find((x) => x.id === courseId);
  if (!c) throw new Error("Course not found");
  return c;
}

export async function createCourse(input: Omit<Course, "id" | "createdAt">): Promise<Course> {
  await sleep(220);
  const newRow: Course = { ...input, id: `c_${Math.random().toString(16).slice(2)}`, createdAt: new Date().toISOString() };
  COURSES.unshift(newRow);

  // Ensure curriculum record exists
  if (!CURRICULUM.find((x) => x.courseId === newRow.id)) {
    CURRICULUM.push({ courseId: newRow.id, chapters: [] });
  }

  return newRow;
}

export async function updateCourse(courseId: string, patch: Partial<Course>): Promise<Course> {
  await sleep(220);
  const idx = COURSES.findIndex((c) => c.id === courseId);
  if (idx < 0) throw new Error("Course not found");
  COURSES[idx] = { ...COURSES[idx], ...patch };
  return COURSES[idx];
}

/* -------------------------------------------------------------------------- */
/* Curriculum                                                                   */
/* -------------------------------------------------------------------------- */
export async function getCurriculum(courseId: string): Promise<CourseCurriculum> {
  await sleep(160);
  const c = CURRICULUM.find((x) => x.courseId === courseId);
  if (!c) return { courseId, chapters: [] };
  return c;
}

export async function saveCurriculum(courseId: string, next: CourseCurriculum): Promise<CourseCurriculum> {
  await sleep(180);
  const idx = CURRICULUM.findIndex((x) => x.courseId === courseId);
  if (idx < 0) {
    CURRICULUM.push(next);
    return next;
  }
  CURRICULUM[idx] = next;
  return CURRICULUM[idx];
}

/* -------------------------------------------------------------------------- */
/* Lectures                                                                     */
/* -------------------------------------------------------------------------- */
export async function listLectures(q: ListQuery & { courseId?: string }) {
  await sleep(200);
  let rows = [...LECTURES].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (q.courseId) rows = rows.filter((l) => l.courseId === q.courseId);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rows = matchSearch(rows as any, q.search);
  return paginate(rows, q);
}

export async function upsertLecture(input: Partial<Lecture> & { title: string }): Promise<Lecture> {
  await sleep(220);

  if (input.id) {
    const idx = LECTURES.findIndex((l) => l.id === input.id);
    if (idx < 0) throw new Error("Lecture not found");
    LECTURES[idx] = { ...LECTURES[idx], ...input } as Lecture;
    return LECTURES[idx];
  }

  const newRow: Lecture = {
    id: `l_${Math.random().toString(16).slice(2)}`,
    title: input.title,
    courseId: input.courseId,
    durationSec: input.durationSec ?? 0,
    videoUrl: input.videoUrl ?? "",
    transcript: input.transcript ?? "",
    speedPoints: input.speedPoints ?? [],
    createdAt: new Date().toISOString(),
  };
  LECTURES.unshift(newRow);
  return newRow;
}

/* -------------------------------------------------------------------------- */
/* Exercises                                                                    */
/* -------------------------------------------------------------------------- */
export async function listExercises(q: ListQuery) {
  await sleep(200);
  let rows = [...EXERCISES].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rows = matchSearch(rows as any, q.search);
  return paginate(rows, q);
}

export async function upsertExercise(input: Partial<Exercise> & Pick<Exercise, "title" | "kind" | "questions">): Promise<Exercise> {
  await sleep(220);

  if (input.id) {
    const idx = EXERCISES.findIndex((e) => e.id === input.id);
    if (idx < 0) throw new Error("Exercise not found");
    EXERCISES[idx] = { ...EXERCISES[idx], ...input } as Exercise;
    return EXERCISES[idx];
  }

  const newRow: Exercise = {
    id: `e_${Math.random().toString(16).slice(2)}`,
    title: input.title,
    kind: input.kind,
    questions: input.questions,
    createdAt: new Date().toISOString(),
  };
  EXERCISES.unshift(newRow);
  return newRow;
}
