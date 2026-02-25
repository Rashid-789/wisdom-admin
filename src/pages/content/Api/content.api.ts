/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  collection,
  collectionGroup,
  deleteField,
  doc,
  documentId,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query as firestoreQuery,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  type DocumentData,
  type DocumentSnapshot,
  type QueryConstraint,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

import { db } from "../../../app/utils/firebase";
import type {
  BasicCourse,
  BasicSubjectCurriculum,
  BasicSubject,
  Chapter,
  Course,
  CourseCurriculum,
  Exercise,
  Lecture,
  ListQuery,
  ListResponse,
  PublishStatus,
  SkillSubject,
  SkillTopic,
  SpeedPoint,
  Subject,
  Topic,
  TopicVideo,
  VideoSource,
} from "../Types/content.types";

const BASIC_SUBJECTS_COLLECTION = "basicSubjects";
const SKILL_SUBJECTS_COLLECTION = "skillSubjects";
const CURRICULUM_COLLECTION = "curriculum";
const CURRICULUM_DOC_ID = "curriculum";
const LEGACY_CURRICULUMS_COLLECTION = "curriculums";

const FALLBACK_ISO_DATE = new Date(0).toISOString();

function normalizeLower(value: string): string {
  return value.trim().toLowerCase();
}

function trimOrUndefined(value: string | undefined): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function toIso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString();
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) return new Date(parsed).toISOString();
  }
  return FALLBACK_ISO_DATE;
}

function hasOwn(obj: object, key: PropertyKey): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

function normalizePagination(input: ListQuery): { page: number; pageSize: number; fetchLimit: number } {
  const page = Math.max(1, input.page);
  const pageSize = Math.max(1, input.pageSize);
  return { page, pageSize, fetchLimit: page * pageSize };
}

function paginateRows<T>(rows: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return rows.slice(start, start + pageSize);
}

function buildTitlePrefixConstraints(search?: string): QueryConstraint[] {
  const normalized = normalizeLower(search ?? "");
  if (!normalized) return [];
  return [
    where("titleLower", ">=", normalized),
    where("titleLower", "<=", `${normalized}\uf8ff`),
  ];
}

function buildOrderConstraints(searchConstraints: QueryConstraint[]): QueryConstraint[] {
  return searchConstraints.length > 0
    ? [orderBy("titleLower", "asc")]
    : [orderBy("createdAt", "desc")];
}

function extractIndexLink(message?: string): string | null {
  if (!message) return null;
  const match = message.match(/https:\/\/console\.firebase\.google\.com\S+/);
  return match ? match[0].replace(/[)"']+$/, "") : null;
}

function handleFirestoreError(error: unknown): never {
  const asFirebase = error as { code?: string; message?: string };
  if (asFirebase.code === "failed-precondition") {
    const indexLink = extractIndexLink(asFirebase.message);
    if (indexLink) {
      console.error("[content.api] Firestore composite index required:", indexLink);
    } else {
      console.error("[content.api] Firestore query likely needs an index:", asFirebase.message ?? error);
    }
  }
  if (error instanceof Error) throw error;
  throw new Error("Firestore request failed");
}

function isPublishStatus(value: unknown): value is PublishStatus {
  return value === "draft" || value === "published" || value === "scheduled";
}

function isVideoSource(value: unknown): value is VideoSource {
  return value === "upload" || value === "link";
}

function mapSpeedPoints(value: unknown): SpeedPoint[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item, idx) => {
      if (!item || typeof item !== "object") return null;
      const obj = item as Record<string, unknown>;
      const id = typeof obj.id === "string" ? obj.id : `sp_${idx + 1}`;
      const timeSec = typeof obj.timeSec === "number" ? Math.max(0, Math.floor(obj.timeSec)) : 0;
      const label = typeof obj.label === "string" ? obj.label : "";
      return { id, timeSec, label };
    })
    .filter((item): item is SpeedPoint => Boolean(item));
}

function mapTopicVideo(value: unknown): TopicVideo | undefined {
  if (!value || typeof value !== "object") return undefined;
  const obj = value as Record<string, unknown>;
  if (!isVideoSource(obj.source) || typeof obj.url !== "string") return undefined;
  const durationSec = typeof obj.durationSec === "number" ? Math.max(0, Math.floor(obj.durationSec)) : undefined;
  const storagePath = trimOrUndefined(typeof obj.storagePath === "string" ? obj.storagePath : undefined);
  return {
    source: obj.source,
    url: obj.url,
    durationSec,
    storagePath,
  };
}

function mapTopic(value: unknown, fallbackOrder: number): Topic {
  const obj = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const mapped: Topic = {
    id: typeof obj.id === "string" ? obj.id : `topic_${fallbackOrder}`,
    title: typeof obj.title === "string" ? obj.title : "",
    order: typeof obj.order === "number" ? obj.order : fallbackOrder,
    rewardTokens: typeof obj.rewardTokens === "number" ? obj.rewardTokens : 0,
    speedPoints: mapSpeedPoints(obj.speedPoints),
  };

  const video = mapTopicVideo(obj.video);
  if (video) mapped.video = video;

  if (typeof obj.transcript === "string") mapped.transcript = obj.transcript;

  if (typeof obj.lectureId === "string") mapped.lectureId = obj.lectureId;
  if (typeof obj.exerciseId === "string") mapped.exerciseId = obj.exerciseId;

  return mapped;
}

function mapChapter(value: unknown, fallbackOrder: number): Chapter {
  const obj = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const topicsRaw = Array.isArray(obj.topics) ? obj.topics : [];
  return {
    id: typeof obj.id === "string" ? obj.id : `chapter_${fallbackOrder}`,
    title: typeof obj.title === "string" ? obj.title : "",
    order: typeof obj.order === "number" ? obj.order : fallbackOrder,
    topics: topicsRaw.map((item, idx) => mapTopic(item, idx + 1)),
  };
}

function basicSubjectDoc(subjectId: string) {
  return doc(db, BASIC_SUBJECTS_COLLECTION, subjectId);
}

function basicCoursesCollection(subjectId: string) {
  return collection(db, BASIC_SUBJECTS_COLLECTION, subjectId, "courses");
}

function basicCourseDoc(subjectId: string, courseId: string) {
  return doc(db, BASIC_SUBJECTS_COLLECTION, subjectId, "courses", courseId);
}

export function curriculumDocRef(subjectId: string | undefined, courseId: string) {
  if (subjectId && subjectId.trim().length > 0) {
    return doc(
      db,
      BASIC_SUBJECTS_COLLECTION,
      subjectId,
      "courses",
      courseId,
      CURRICULUM_COLLECTION,
      CURRICULUM_DOC_ID
    );
  }
  return doc(db, LEGACY_CURRICULUMS_COLLECTION, courseId);
}

function basicSubjectCurriculumDoc(subjectId: string) {
  return doc(
    db,
    BASIC_SUBJECTS_COLLECTION,
    subjectId,
    CURRICULUM_COLLECTION,
    CURRICULUM_DOC_ID
  );
}

function basicCurriculumDoc(subjectId: string, courseId: string) {
  return curriculumDocRef(subjectId, courseId);
}

function skillSubjectDoc(subjectId: string) {
  return doc(db, SKILL_SUBJECTS_COLLECTION, subjectId);
}

function skillTopicsCollection(subjectId: string) {
  return collection(db, SKILL_SUBJECTS_COLLECTION, subjectId, "topics");
}

function skillTopicDoc(subjectId: string, topicId: string) {
  return doc(db, SKILL_SUBJECTS_COLLECTION, subjectId, "topics", topicId);
}

function mapBasicSubjectDoc(
  snapshot: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>
): BasicSubject {
  const data = snapshot.data();
  if (!data) throw new Error("Basic subject not found");
  return {
    id: snapshot.id,
    title: typeof data.title === "string" ? data.title : "",
    gradeRange: trimOrUndefined(typeof data.gradeRange === "string" ? data.gradeRange : undefined),
    status: isPublishStatus(data.status) ? data.status : "draft",
    scheduledFor: trimOrUndefined(
      typeof data.scheduledFor === "string" ? data.scheduledFor : undefined
    ),
    createdAt: toIso(data.createdAt),
  };
}

function mapBasicCourseDoc(
  snapshot: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>,
  subjectId: string
): BasicCourse {
  const data = snapshot.data();
  if (!data) throw new Error("Basic course not found");
  return {
    id: snapshot.id,
    subjectId,
    title: typeof data.title === "string" ? data.title : "",
    description: trimOrUndefined(typeof data.description === "string" ? data.description : undefined),
    status: isPublishStatus(data.status) ? data.status : "draft",
    scheduledFor: trimOrUndefined(
      typeof data.scheduledFor === "string" ? data.scheduledFor : undefined
    ),
    createdAt: toIso(data.createdAt),
  };
}

function mapSkillSubjectDoc(
  snapshot: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>
): SkillSubject {
  const data = snapshot.data();
  if (!data) throw new Error("Skill subject not found");
  return {
    id: snapshot.id,
    title: typeof data.title === "string" ? data.title : "",
    lecturerName: trimOrUndefined(
      typeof data.lecturerName === "string" ? data.lecturerName : undefined
    ),
    coverImage: trimOrUndefined(typeof data.coverImage === "string" ? data.coverImage : undefined),
    createdAt: toIso(data.createdAt),
  };
}

function mapSkillTopicDoc(
  snapshot: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>,
  subjectId: string
): SkillTopic {
  const data = snapshot.data();
  if (!data) throw new Error("Skill topic not found");
  const video = mapTopicVideo(data.video) ?? { source: "link", url: "" };
  return {
    id: snapshot.id,
    subjectId,
    title: typeof data.title === "string" ? data.title : "",
    rewardTokens: typeof data.rewardTokens === "number" ? data.rewardTokens : 0,
    video,
    transcript: typeof data.transcript === "string" ? data.transcript : undefined,
    speedPoints: mapSpeedPoints(data.speedPoints),
    createdAt: toIso(data.createdAt),
  };
}

/* -------------------------------------------------------------------------- */
/* Basic Subjects                                                             */
/* -------------------------------------------------------------------------- */
export async function listBasicSubjects(query: ListQuery): Promise<ListResponse<BasicSubject>> {
  try {
    const { page, pageSize, fetchLimit } = normalizePagination(query);
    const colRef = collection(db, BASIC_SUBJECTS_COLLECTION);
    const searchConstraints = buildTitlePrefixConstraints(query.search);
    const orderConstraints = buildOrderConstraints(searchConstraints);
    const listQuery = firestoreQuery(colRef, ...searchConstraints, ...orderConstraints, limit(fetchLimit));
    const countQuery = firestoreQuery(colRef, ...searchConstraints);

    const [listSnap, countSnap] = await Promise.all([
      getDocs(listQuery),
      getCountFromServer(countQuery),
    ]);

    const allRows = listSnap.docs.map(mapBasicSubjectDoc);
    return {
      rows: paginateRows(allRows, page, pageSize),
      total: countSnap.data().count,
    };
  } catch (error) {
    return handleFirestoreError(error);
  }
}

export async function getBasicSubject(subjectId: string): Promise<BasicSubject> {
  try {
    const ref = basicSubjectDoc(subjectId);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error("Basic subject not found");
    return mapBasicSubjectDoc(snap);
  } catch (error) {
    return handleFirestoreError(error);
  }
}

export async function createBasicSubject(
  input: Pick<BasicSubject, "title" | "gradeRange">
): Promise<BasicSubject> {
  try {
    const ref = doc(collection(db, BASIC_SUBJECTS_COLLECTION));
    const title = input.title.trim();
    const gradeRange = trimOrUndefined(input.gradeRange);
    const payload: Record<string, unknown> = {
      title,
      titleLower: normalizeLower(title),
      status: "draft",
      createdAt: serverTimestamp(),
    };
    if (gradeRange) payload.gradeRange = gradeRange;

    await setDoc(ref, payload);
    const savedSnap = await getDoc(ref);
    if (!savedSnap.exists()) throw new Error("Basic subject not found");
    return mapBasicSubjectDoc(savedSnap);
  } catch (error) {
    return handleFirestoreError(error);
  }
}

export async function updateBasicSubject(
  subjectId: string,
  patch: Partial<Pick<BasicSubject, "title" | "gradeRange" | "status" | "scheduledFor">>
): Promise<BasicSubject> {
  try {
    const ref = basicSubjectDoc(subjectId);
    const payload: Record<string, unknown> = {};
    if (hasOwn(patch, "title") && typeof patch.title === "string") {
      const title = patch.title.trim();
      payload.title = title;
      payload.titleLower = normalizeLower(title);
    }
    if (hasOwn(patch, "gradeRange")) {
      const gradeRange = trimOrUndefined(patch.gradeRange);
      payload.gradeRange = gradeRange ?? deleteField();
    }
    if (hasOwn(patch, "status") && isPublishStatus(patch.status)) {
      payload.status = patch.status;
    }
    if (hasOwn(patch, "scheduledFor")) {
      const scheduledFor = trimOrUndefined(patch.scheduledFor);
      payload.scheduledFor = scheduledFor ?? deleteField();
    }
    if (Object.keys(payload).length > 0) {
      await updateDoc(ref, payload);
    }
    return await getBasicSubject(subjectId);
  } catch (error) {
    return handleFirestoreError(error);
  }
}

/* -------------------------------------------------------------------------- */
/* Basic Courses + Curriculum                                                 */
/* -------------------------------------------------------------------------- */
export async function listBasicCourses(
  subjectId: string,
  query: ListQuery & { status?: PublishStatus | "all" }
): Promise<ListResponse<BasicCourse>> {
  try {
    const { page, pageSize, fetchLimit } = normalizePagination(query);
    const colRef = basicCoursesCollection(subjectId);
    const filters: QueryConstraint[] = [];
    if (query.status && query.status !== "all") {
      filters.push(where("status", "==", query.status));
    }

    const searchConstraints = buildTitlePrefixConstraints(query.search);
    const orderConstraints = buildOrderConstraints(searchConstraints);
    const listQuery = firestoreQuery(
      colRef,
      ...filters,
      ...searchConstraints,
      ...orderConstraints,
      limit(fetchLimit)
    );
    const countQuery = firestoreQuery(colRef, ...filters, ...searchConstraints);

    const [listSnap, countSnap] = await Promise.all([
      getDocs(listQuery),
      getCountFromServer(countQuery),
    ]);

    const allRows = listSnap.docs.map((snap) => mapBasicCourseDoc(snap, subjectId));
    return {
      rows: paginateRows(allRows, page, pageSize),
      total: countSnap.data().count,
    };
  } catch (error) {
    return handleFirestoreError(error);
  }
}

export async function getBasicCourse(subjectId: string, courseId: string): Promise<BasicCourse> {
  try {
    const ref = basicCourseDoc(subjectId, courseId);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error("Basic course not found");
    return mapBasicCourseDoc(snap, subjectId);
  } catch (error) {
    return handleFirestoreError(error);
  }
}

export async function createBasicCourse(
  subjectId: string,
  input: Pick<BasicCourse, "title" | "description" | "status" | "scheduledFor">
): Promise<BasicCourse> {
  try {
    const ref = doc(basicCoursesCollection(subjectId));
    const title = input.title.trim();
    const description = trimOrUndefined(input.description);
    const scheduledFor = trimOrUndefined(input.scheduledFor);

    const payload: Record<string, unknown> = {
      title,
      titleLower: normalizeLower(title),
      status: isPublishStatus(input.status) ? input.status : "draft",
      createdAt: serverTimestamp(),
    };
    if (description) payload.description = description;
    if (scheduledFor) payload.scheduledFor = scheduledFor;

    await setDoc(ref, payload);
    await setDoc(
      curriculumDocRef(subjectId, ref.id),
      {
        courseId: ref.id,
        chapters: [],
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return await getBasicCourse(subjectId, ref.id);
  } catch (error) {
    return handleFirestoreError(error);
  }
}

export async function updateBasicCourse(
  subjectId: string,
  courseId: string,
  patch: Partial<Pick<BasicCourse, "title" | "description" | "status" | "scheduledFor">>
): Promise<BasicCourse> {
  try {
    const ref = basicCourseDoc(subjectId, courseId);
    const payload: Record<string, unknown> = {};
    if (hasOwn(patch, "title") && typeof patch.title === "string") {
      const title = patch.title.trim();
      payload.title = title;
      payload.titleLower = normalizeLower(title);
    }
    if (hasOwn(patch, "description")) {
      const description = trimOrUndefined(patch.description);
      payload.description = description ?? deleteField();
    }
    if (hasOwn(patch, "status") && isPublishStatus(patch.status)) {
      payload.status = patch.status;
    }
    if (hasOwn(patch, "scheduledFor")) {
      const scheduledFor = trimOrUndefined(patch.scheduledFor);
      payload.scheduledFor = scheduledFor ?? deleteField();
    }
    if (Object.keys(payload).length > 0) {
      await updateDoc(ref, payload);
    }
    return await getBasicCourse(subjectId, courseId);
  } catch (error) {
    return handleFirestoreError(error);
  }
}

function mapCurriculumChapters(value: unknown): Chapter[] {
  const raw = Array.isArray(value) ? value : [];
  return raw.map((item, idx) => mapChapter(item, idx + 1));
}

function cleanUndefinedDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value
      .map((item) => cleanUndefinedDeep(item))
      .filter((item) => item !== undefined);
  }

  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value)) {
      if (nested === undefined) continue;
      const cleaned = cleanUndefinedDeep(nested);
      if (cleaned !== undefined) {
        result[key] = cleaned;
      }
    }
    return result;
  }

  return value;
}

function toFirestoreCurriculumChapters(chapters: Chapter[]): Chapter[] {
  const cleaned = cleanUndefinedDeep(chapters);
  return Array.isArray(cleaned) ? (cleaned as Chapter[]) : [];
}

function countTopics(chapters: Chapter[]): number {
  return chapters.reduce((sum, chapter) => sum + chapter.topics.length, 0);
}

async function migrateLegacyBasicCourseCurriculum(
  subjectId: string
): Promise<BasicSubjectCurriculum | null> {
  const coursesSnap = await getDocs(firestoreQuery(basicCoursesCollection(subjectId), limit(1)));
  const firstCourse = coursesSnap.docs[0];
  if (!firstCourse) return null;

  const oldCurriculumSnap = await getDoc(basicCurriculumDoc(subjectId, firstCourse.id));
  if (!oldCurriculumSnap.exists()) return null;

  const oldData = oldCurriculumSnap.data();
  const chapters = mapCurriculumChapters(oldData.chapters);
  await setDoc(
    basicSubjectCurriculumDoc(subjectId),
    {
      subjectId,
      chapters,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  console.info(
    "[content.api] Migrated legacy basic course curriculum to subject-level curriculum:",
    subjectId
  );

  return {
    subjectId,
    chapters,
    updatedAt: toIso(oldData.updatedAt),
  };
}

export async function getBasicSubjectCurriculum(subjectId: string): Promise<BasicSubjectCurriculum> {
  try {
    const ref = basicSubjectCurriculumDoc(subjectId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      return {
        subjectId: typeof data.subjectId === "string" ? data.subjectId : subjectId,
        chapters: mapCurriculumChapters(data.chapters),
        updatedAt: toIso(data.updatedAt),
      };
    }

    const migrated = await migrateLegacyBasicCourseCurriculum(subjectId);
    if (migrated) return migrated;

    return { subjectId, chapters: [] };
  } catch (error) {
    return handleFirestoreError(error);
  }
}

export async function saveBasicSubjectCurriculum(
  subjectId: string,
  next: BasicSubjectCurriculum | CourseCurriculum
): Promise<BasicSubjectCurriculum> {
  try {
    const chapters = mapCurriculumChapters(next.chapters);
    await setDoc(
      basicSubjectCurriculumDoc(subjectId),
      {
        subjectId,
        chapters: toFirestoreCurriculumChapters(chapters),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    console.info("[curriculum] saved", {
      subjectId,
      courseId: null,
      chaptersCount: chapters.length,
      topicsCount: countTopics(chapters),
    });

    return await getBasicSubjectCurriculum(subjectId);
  } catch (error) {
    return handleFirestoreError(error);
  }
}

// Deprecated: old course-level curriculum flow.
export async function getBasicCurriculum(subjectId: string, courseId: string): Promise<CourseCurriculum> {
  try {
    const primarySnap = await getDoc(curriculumDocRef(subjectId, courseId));
    if (primarySnap.exists()) {
      const data = primarySnap.data();
      return {
        courseId: typeof data.courseId === "string" ? data.courseId : courseId,
        chapters: mapCurriculumChapters(data.chapters),
        updatedAt: toIso(data.updatedAt),
      };
    }

    const legacySnap = await getDoc(curriculumDocRef(undefined, courseId));
    if (legacySnap.exists()) {
      const data = legacySnap.data();
      const chapters = mapCurriculumChapters(data.chapters);
      await setDoc(
        curriculumDocRef(subjectId, courseId),
        {
          courseId,
          chapters: toFirestoreCurriculumChapters(chapters),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      return {
        courseId: typeof data.courseId === "string" ? data.courseId : courseId,
        chapters,
        updatedAt: toIso(data.updatedAt),
      };
    }

    return { courseId, chapters: [] };
  } catch (error) {
    return handleFirestoreError(error);
  }
}

// Deprecated: old course-level curriculum flow.
export async function saveBasicCurriculum(
  subjectId: string,
  courseId: string,
  next: CourseCurriculum
): Promise<CourseCurriculum> {
  try {
    const chapters = mapCurriculumChapters(next.chapters);
    const payload = {
      courseId,
      chapters: toFirestoreCurriculumChapters(chapters),
      updatedAt: serverTimestamp(),
    };

    await setDoc(curriculumDocRef(subjectId, courseId), payload, { merge: true });

    console.info("[curriculum] saved", {
      subjectId,
      courseId,
      chaptersCount: chapters.length,
      topicsCount: countTopics(chapters),
    });

    return await getBasicCurriculum(subjectId, courseId);
  } catch (error) {
    return handleFirestoreError(error);
  }
}

/* -------------------------------------------------------------------------- */
/* Skill Subjects                                                             */
/* -------------------------------------------------------------------------- */
export async function listSkillSubjects(query: ListQuery): Promise<ListResponse<SkillSubject>> {
  try {
    const { page, pageSize, fetchLimit } = normalizePagination(query);
    const colRef = collection(db, SKILL_SUBJECTS_COLLECTION);
    const searchConstraints = buildTitlePrefixConstraints(query.search);
    const orderConstraints = buildOrderConstraints(searchConstraints);
    const listQuery = firestoreQuery(colRef, ...searchConstraints, ...orderConstraints, limit(fetchLimit));
    const countQuery = firestoreQuery(colRef, ...searchConstraints);

    const [listSnap, countSnap] = await Promise.all([
      getDocs(listQuery),
      getCountFromServer(countQuery),
    ]);

    const allRows = listSnap.docs.map(mapSkillSubjectDoc);
    return {
      rows: paginateRows(allRows, page, pageSize),
      total: countSnap.data().count,
    };
  } catch (error) {
    return handleFirestoreError(error);
  }
}

export async function getSkillSubject(subjectId: string): Promise<SkillSubject> {
  try {
    const ref = skillSubjectDoc(subjectId);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error("Skill subject not found");
    return mapSkillSubjectDoc(snap);
  } catch (error) {
    return handleFirestoreError(error);
  }
}

export async function createSkillSubject(
  input: Pick<SkillSubject, "title" | "lecturerName" | "coverImage">
): Promise<SkillSubject> {
  try {
    const ref = doc(collection(db, SKILL_SUBJECTS_COLLECTION));
    const title = input.title.trim();
    const lecturerName = trimOrUndefined(input.lecturerName);
    const coverImage = trimOrUndefined(input.coverImage);
    const payload: Record<string, unknown> = {
      title,
      titleLower: normalizeLower(title),
      createdAt: serverTimestamp(),
    };
    if (lecturerName) payload.lecturerName = lecturerName;
    if (coverImage) payload.coverImage = coverImage;

    await setDoc(ref, payload);
    return await getSkillSubject(ref.id);
  } catch (error) {
    return handleFirestoreError(error);
  }
}

export async function updateSkillSubject(
  subjectId: string,
  patch: Partial<Pick<SkillSubject, "title" | "lecturerName" | "coverImage">>
): Promise<SkillSubject> {
  try {
    const ref = skillSubjectDoc(subjectId);
    const payload: Record<string, unknown> = {};
    if (hasOwn(patch, "title") && typeof patch.title === "string") {
      const title = patch.title.trim();
      payload.title = title;
      payload.titleLower = normalizeLower(title);
    }
    if (hasOwn(patch, "lecturerName")) {
      const lecturerName = trimOrUndefined(patch.lecturerName);
      payload.lecturerName = lecturerName ?? deleteField();
    }
    if (hasOwn(patch, "coverImage")) {
      const coverImage = trimOrUndefined(patch.coverImage);
      payload.coverImage = coverImage ?? deleteField();
    }
    if (Object.keys(payload).length > 0) {
      await updateDoc(ref, payload);
    }
    return await getSkillSubject(subjectId);
  } catch (error) {
    return handleFirestoreError(error);
  }
}

/* -------------------------------------------------------------------------- */
/* Skill Topics                                                               */
/* -------------------------------------------------------------------------- */
export async function listSkillTopics(
  subjectId: string,
  query: ListQuery
): Promise<ListResponse<SkillTopic>> {
  try {
    const { page, pageSize, fetchLimit } = normalizePagination(query);
    const colRef = skillTopicsCollection(subjectId);
    const searchConstraints = buildTitlePrefixConstraints(query.search);
    const orderConstraints = buildOrderConstraints(searchConstraints);
    const listQuery = firestoreQuery(colRef, ...searchConstraints, ...orderConstraints, limit(fetchLimit));
    const countQuery = firestoreQuery(colRef, ...searchConstraints);

    const [listSnap, countSnap] = await Promise.all([
      getDocs(listQuery),
      getCountFromServer(countQuery),
    ]);

    const allRows = listSnap.docs.map((snap) => mapSkillTopicDoc(snap, subjectId));
    return {
      rows: paginateRows(allRows, page, pageSize),
      total: countSnap.data().count,
    };
  } catch (error) {
    return handleFirestoreError(error);
  }
}

export async function getSkillTopic(subjectId: string, topicId: string): Promise<SkillTopic> {
  try {
    const ref = skillTopicDoc(subjectId, topicId);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error("Skill topic not found");
    return mapSkillTopicDoc(snap, subjectId);
  } catch (error) {
    return handleFirestoreError(error);
  }
}

export async function createSkillTopic(
  subjectId: string,
  input: Pick<SkillTopic, "title" | "rewardTokens" | "video" | "transcript" | "speedPoints">,
  options?: { topicId?: string }
): Promise<SkillTopic> {
  try {
    const ref = options?.topicId
      ? skillTopicDoc(subjectId, options.topicId)
      : doc(skillTopicsCollection(subjectId));
    const title = input.title.trim();
    const transcript = trimOrUndefined(input.transcript);
    const payload: Record<string, unknown> = {
      title,
      titleLower: normalizeLower(title),
      rewardTokens: typeof input.rewardTokens === "number" ? input.rewardTokens : 0,
      video: input.video,
      speedPoints: Array.isArray(input.speedPoints) ? input.speedPoints : [],
      createdAt: serverTimestamp(),
    };
    if (transcript) payload.transcript = transcript;

    await setDoc(ref, payload);
    return await getSkillTopic(subjectId, ref.id);
  } catch (error) {
    return handleFirestoreError(error);
  }
}

export async function updateSkillTopic(
  subjectId: string,
  topicId: string,
  patch: Partial<Pick<SkillTopic, "title" | "rewardTokens" | "video" | "transcript" | "speedPoints">>
): Promise<SkillTopic> {
  try {
    const ref = skillTopicDoc(subjectId, topicId);
    const payload: Record<string, unknown> = {};
    if (hasOwn(patch, "title") && typeof patch.title === "string") {
      const title = patch.title.trim();
      payload.title = title;
      payload.titleLower = normalizeLower(title);
    }
    if (hasOwn(patch, "rewardTokens")) {
      payload.rewardTokens = typeof patch.rewardTokens === "number" ? patch.rewardTokens : 0;
    }
    if (hasOwn(patch, "video") && patch.video) {
      payload.video = patch.video;
    }
    if (hasOwn(patch, "transcript")) {
      const transcript = trimOrUndefined(patch.transcript);
      payload.transcript = transcript ?? deleteField();
    }
    if (hasOwn(patch, "speedPoints")) {
      payload.speedPoints = Array.isArray(patch.speedPoints) ? patch.speedPoints : [];
    }
    if (Object.keys(payload).length > 0) {
      await updateDoc(ref, payload);
    }
    return await getSkillTopic(subjectId, topicId);
  } catch (error) {
    return handleFirestoreError(error);
  }
}

/* -------------------------------------------------------------------------- */
/* Legacy API compatibility (deprecated)                                      */
/* -------------------------------------------------------------------------- */
async function findBasicCourseDocByCourseId(courseId: string) {
  const snap = await getDocs(
    firestoreQuery(collectionGroup(db, "courses"), where(documentId(), "==", courseId), limit(1))
  );
  const docSnap = snap.docs[0];
  if (!docSnap) throw new Error("Course not found");
  const subjectId = docSnap.ref.parent.parent?.id;
  return { subjectId, docSnap };
}

export async function listSubjects(query: ListQuery): Promise<ListResponse<Subject>> {
  return listBasicSubjects(query);
}

export async function getSubject(subjectId: string): Promise<Subject> {
  return getBasicSubject(subjectId);
}

export async function createSubject(input: Pick<Subject, "title" | "gradeRange">): Promise<Subject> {
  return createBasicSubject(input);
}

export async function updateSubject(
  id: string,
  patch: Partial<Pick<Subject, "title" | "gradeRange">>
): Promise<Subject> {
  return updateBasicSubject(id, patch);
}

export async function listCourses(
  query: ListQuery & { subjectId?: string; status?: PublishStatus | "all"; category?: "basic" | "skill" | "all" }
): Promise<ListResponse<Course>> {
  if (query.category === "skill") {
    return { rows: [], total: 0 };
  }
  if (!query.subjectId) {
    return { rows: [], total: 0 };
  }
  const res = await listBasicCourses(query.subjectId, {
    page: query.page,
    pageSize: query.pageSize,
    search: query.search,
    status: query.status,
  });
  return {
    rows: res.rows.map((row) => ({ ...row, category: "basic" })),
    total: res.total,
  };
}

export async function getCourse(courseId: string): Promise<Course> {
  const { subjectId } = await findBasicCourseDocByCourseId(courseId);
  if (!subjectId) throw new Error("Course subject context not found");
  const course = await getBasicCourse(subjectId, courseId);
  return { ...course, category: "basic" };
}

export async function createCourse(input: Omit<Course, "id" | "createdAt">): Promise<Course> {
  if (input.category && input.category !== "basic") {
    throw new Error("Legacy createCourse supports only basic courses.");
  }
  const created = await createBasicCourse(input.subjectId, {
    title: input.title,
    description: input.description,
    status: input.status,
    scheduledFor: input.scheduledFor,
  });
  return { ...created, category: "basic" };
}

export async function updateCourse(courseId: string, patch: Partial<Course>): Promise<Course> {
  const resolvedSubjectId: string | undefined =
    typeof patch.subjectId === "string" && patch.subjectId.trim().length > 0
      ? patch.subjectId
      : (await findBasicCourseDocByCourseId(courseId)).subjectId;
  if (!resolvedSubjectId) throw new Error("Course subject context not found");

  const updated = await updateBasicCourse(resolvedSubjectId, courseId, {
    title: patch.title,
    description: patch.description,
    status: patch.status,
    scheduledFor: patch.scheduledFor,
  });
  return { ...updated, category: "basic" };
}

export async function getCurriculum(courseId: string): Promise<CourseCurriculum> {
  const { subjectId } = await findBasicCourseDocByCourseId(courseId);
  return getBasicCurriculum(subjectId ?? "", courseId);
}

export async function saveCurriculum(courseId: string, next: CourseCurriculum): Promise<CourseCurriculum> {
  const { subjectId } = await findBasicCourseDocByCourseId(courseId);
  return saveBasicCurriculum(subjectId ?? "", courseId, next);
}

function removedFlowError(flowName: string): Error {
  return new Error(`[content.api] ${flowName} flow was removed. Use skillSubjects/{id}/topics instead.`);
}

export async function listLectures(
  _query: ListQuery & { courseId?: string }
): Promise<ListResponse<Lecture>> {
  return { rows: [], total: 0 };
}

export async function getLecture(_lectureId: string): Promise<Lecture> {
  throw removedFlowError("Lectures");
}

export async function upsertLecture(
  _input: Partial<Lecture> & { title: string }
): Promise<Lecture> {
  throw removedFlowError("Lectures");
}

export async function listExercises(_query: ListQuery): Promise<ListResponse<Exercise>> {
  return { rows: [], total: 0 };
}

export async function upsertExercise(
  _input: Partial<Exercise> & Pick<Exercise, "title" | "kind" | "questions">
): Promise<Exercise> {
  throw removedFlowError("Exercises");
}
