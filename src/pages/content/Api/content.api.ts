
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  collection,
  deleteDoc,
  deleteField,
  doc,
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
  writeBatch,
  type DocumentData,
  type DocumentSnapshot,
  type QueryConstraint,
  type QueryDocumentSnapshot,
  type WriteBatch,
} from "firebase/firestore";

import { db } from "../../../app/utils/firebase";
import type {
  BasicCourse,
  BasicSubject,
  BasicSubjectCurriculum,
  Chapter,
  Course,
  CourseCurriculum,
  Exercise,
  ImageAsset,
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

export type CourseBucket = "basicCourse" | "skillCourse";
type SubjectCategory = "basic" | "skill";

type CourseLookup = {
  bucket: CourseBucket;
  category: SubjectCategory;
  courseId: string;
  docSnap: DocumentSnapshot<DocumentData>;
};

const COURSES_ROOT = "courses";
const BUCKET_BASIC: CourseBucket = "basicCourse";
const BUCKET_SKILL: CourseBucket = "skillCourse";
const SUBCOL_COURSES = "courses";
const SUBCOL_CHAPTERS = "chapters";
const SUBCOL_TOPICS = "topics";

const FALLBACK_ISO_DATE = new Date(0).toISOString();

function bucketFromCategory(category: SubjectCategory): CourseBucket {
  return category === "skill" ? BUCKET_SKILL : BUCKET_BASIC;
}

function categoryFromBucket(bucket: CourseBucket): SubjectCategory {
  return bucket === BUCKET_SKILL ? "skill" : "basic";
}

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

function buildOrderConstraints(searchConstraints: QueryConstraint[], fallback: "createdAt" | "order" = "createdAt"): QueryConstraint[] {
  if (searchConstraints.length > 0) return [orderBy("titleLower", "asc")];
  if (fallback === "order") return [orderBy("order", "asc")];
  return [orderBy("createdAt", "desc")];
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

function isSubjectCategory(value: unknown): value is SubjectCategory {
  return value === "basic" || value === "skill";
}

function cleanUndefinedDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => cleanUndefinedDeep(item)).filter((item) => item !== undefined);
  }

  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value)) {
      if (nested === undefined) continue;
      const cleaned = cleanUndefinedDeep(nested);
      if (cleaned !== undefined) result[key] = cleaned;
    }
    return result;
  }

  return value;
}

async function runBatchOps(ops: Array<(batch: WriteBatch) => void>): Promise<void> {
  const commits: Promise<void>[] = [];
  let batch = writeBatch(db);
  let count = 0;

  const flush = () => {
    commits.push(batch.commit());
    batch = writeBatch(db);
    count = 0;
  };

  for (const op of ops) {
    op(batch);
    count += 1;
    if (count >= 450) flush();
  }

  if (count > 0) flush();
  await Promise.all(commits);
}

function bucketDoc(bucket: CourseBucket) {
  return doc(db, COURSES_ROOT, bucket);
}

function bucketCoursesCol(bucket: CourseBucket) {
  return collection(db, COURSES_ROOT, bucket, SUBCOL_COURSES);
}

function courseDoc(bucket: CourseBucket, courseId: string) {
  return doc(db, COURSES_ROOT, bucket, SUBCOL_COURSES, courseId);
}

function bucketCourseRef(bucket: CourseBucket, courseId: string) {
  return doc(db, COURSES_ROOT, bucket, SUBCOL_COURSES, courseId);
}

function chaptersCol(bucket: CourseBucket, courseId: string) {
  return collection(db, COURSES_ROOT, bucket, SUBCOL_COURSES, courseId, SUBCOL_CHAPTERS);
}

function chapterDoc(bucket: CourseBucket, courseId: string, chapterId: string) {
  return doc(db, COURSES_ROOT, bucket, SUBCOL_COURSES, courseId, SUBCOL_CHAPTERS, chapterId);
}

function topicsCol(bucket: CourseBucket, courseId: string, chapterId: string) {
  return collection(
    db,
    COURSES_ROOT,
    bucket,
    SUBCOL_COURSES,
    courseId,
    SUBCOL_CHAPTERS,
    chapterId,
    SUBCOL_TOPICS
  );
}

function topicDoc(bucket: CourseBucket, courseId: string, chapterId: string, topicId: string) {
  return doc(
    db,
    COURSES_ROOT,
    bucket,
    SUBCOL_COURSES,
    courseId,
    SUBCOL_CHAPTERS,
    chapterId,
    SUBCOL_TOPICS,
    topicId
  );
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

function mapImageAsset(value: unknown): ImageAsset | undefined {
  if (!value || typeof value !== "object") return undefined;
  const obj = value as Record<string, unknown>;
  if (!isVideoSource(obj.source) || typeof obj.url !== "string") return undefined;
  const storagePath = trimOrUndefined(typeof obj.storagePath === "string" ? obj.storagePath : undefined);
  return { source: obj.source, url: obj.url, storagePath };
}

function mapTopicVideo(value: unknown): TopicVideo | undefined {
  const base = mapImageAsset(value);
  if (!base) return undefined;
  if (!value || typeof value !== "object") return undefined;
  const obj = value as Record<string, unknown>;
  const durationSec = typeof obj.durationSec === "number" ? Math.max(0, Math.floor(obj.durationSec)) : undefined;
  return { source: base.source, url: base.url, durationSec, storagePath: base.storagePath };
}

function mapTopicDoc(
  snapshot: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>,
  fallbackOrder: number
): Topic {
  const data = snapshot.data() ?? {};
  return {
    id: snapshot.id,
    title: typeof data.title === "string" ? data.title : "",
    order: typeof data.order === "number" ? data.order : fallbackOrder,
    rewardTokens: typeof data.rewardTokens === "number" ? data.rewardTokens : 0,
    video: mapTopicVideo(data.video),
    thumbnail: mapImageAsset(data.thumbnail),
    transcript: typeof data.transcript === "string" ? data.transcript : undefined,
    speedPoints: mapSpeedPoints(data.speedPoints),
    lectureId: typeof data.lectureId === "string" ? data.lectureId : undefined,
    exerciseId: typeof data.exerciseId === "string" ? data.exerciseId : undefined,
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt ?? data.createdAt),
  } as Topic;
}

function mapChapterDoc(snapshot: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>, fallbackOrder: number): Chapter {
  const data = snapshot.data() ?? {};
  return {
    id: snapshot.id,
    title: typeof data.title === "string" ? data.title : "",
    order: typeof data.order === "number" ? data.order : fallbackOrder,
    topics: [],
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt ?? data.createdAt),
  } as Chapter;
}

function mapCourseDoc(
  snapshot: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>,
  fallbackCategory?: SubjectCategory
): Course {
  const data = snapshot.data() ?? {};
  const category = isSubjectCategory(data.category) ? data.category : fallbackCategory ?? "basic";

  return {
    id: snapshot.id,
    category,
    title: typeof data.title === "string" ? data.title : "",
    description: trimOrUndefined(typeof data.description === "string" ? data.description : undefined),
    status: isPublishStatus(data.status) ? data.status : "draft",
    scheduledFor: trimOrUndefined(typeof data.scheduledFor === "string" ? data.scheduledFor : undefined),
    coverImage: trimOrUndefined(typeof data.coverImage === "string" ? data.coverImage : undefined),
    coverImageSource: isVideoSource(data.coverImageSource) ? data.coverImageSource : undefined,
    gradeRange: trimOrUndefined(typeof data.gradeRange === "string" ? data.gradeRange : undefined),
    lecturerName: trimOrUndefined(typeof data.lecturerName === "string" ? data.lecturerName : undefined),
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt ?? data.createdAt),
  } as Course;
}

async function ensureBucketDoc(bucket: CourseBucket): Promise<void> {
  await setDoc(
    bucketDoc(bucket),
    {
      bucket,
      category: categoryFromBucket(bucket),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

async function resolveCourseBucket(courseId: string): Promise<{ bucket: CourseBucket; snap: DocumentSnapshot<DocumentData> }> {
  const [basicSnap, skillSnap] = await Promise.all([
    getDoc(bucketCourseRef(BUCKET_BASIC, courseId)),
    getDoc(bucketCourseRef(BUCKET_SKILL, courseId)),
  ]);

  if (basicSnap.exists()) return { bucket: BUCKET_BASIC, snap: basicSnap };
  if (skillSnap.exists()) return { bucket: BUCKET_SKILL, snap: skillSnap };
  throw new Error("Course not found");
}

async function findCourseDocById(courseId: string): Promise<CourseLookup> {
  const { bucket, snap } = await resolveCourseBucket(courseId);
  if (!snap.exists()) throw new Error("Course not found");

  const data = snap.data() ?? {};
  const category = isSubjectCategory(data.category) ? data.category : categoryFromBucket(bucket);

  return {
    bucket,
    category,
    courseId: snap.id,
    docSnap: snap,
  };
}

function toTopicPayload(topic: Topic): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    title: topic.title,
    titleLower: normalizeLower(topic.title),
    order: topic.order,
    rewardTokens: typeof topic.rewardTokens === "number" ? topic.rewardTokens : 0,
    speedPoints: Array.isArray(topic.speedPoints) ? topic.speedPoints : [],
    updatedAt: serverTimestamp(),
  };

  if (topic.video) payload.video = topic.video;
  if (topic.thumbnail) payload.thumbnail = topic.thumbnail;
  if (typeof topic.transcript === "string") payload.transcript = topic.transcript;
  if (typeof topic.lectureId === "string") payload.lectureId = topic.lectureId;
  if (typeof topic.exerciseId === "string") payload.exerciseId = topic.exerciseId;

  return cleanUndefinedDeep(payload) as Record<string, unknown>;
}

function toChapterPayload(chapter: Pick<Chapter, "title" | "order">): Record<string, unknown> {
  return {
    title: chapter.title,
    titleLower: normalizeLower(chapter.title),
    order: chapter.order,
    updatedAt: serverTimestamp(),
  };
}
export async function listCoursesByBucket(
  bucket: CourseBucket,
  query: ListQuery & { status?: PublishStatus | "all" }
): Promise<ListResponse<Course>> {
  try {
    const { page, pageSize, fetchLimit } = normalizePagination(query);
    const colRef = bucketCoursesCol(bucket);

    const filters: QueryConstraint[] = [];
    if (query.status && query.status !== "all") {
      filters.push(where("status", "==", query.status));
    }

    const searchConstraints = buildTitlePrefixConstraints(query.search);
    const orderConstraints = buildOrderConstraints(searchConstraints);

    const listQuery = firestoreQuery(colRef, ...filters, ...searchConstraints, ...orderConstraints, limit(fetchLimit));
    const countQuery = firestoreQuery(colRef, ...filters, ...searchConstraints);

    const [listSnap, countSnap] = await Promise.all([getDocs(listQuery), getCountFromServer(countQuery)]);
    const allRows = listSnap.docs.map((docSnap) => mapCourseDoc(docSnap, categoryFromBucket(bucket)));

    return {
      rows: paginateRows(allRows, page, pageSize),
      total: countSnap.data().count,
    };
  } catch (error) {
    return handleFirestoreError(error);
  }
}

export async function getCourseById(courseId: string): Promise<Course> {
  try {
    const resolved = await findCourseDocById(courseId);
    return mapCourseDoc(resolved.docSnap, resolved.category);
  } catch (error) {
    return handleFirestoreError(error);
  }
}

export async function createCourseInBucket(
  bucket: CourseBucket,
  input: Pick<
    Course,
    "title" | "description" | "status" | "scheduledFor" | "coverImage" | "coverImageSource" | "category" | "gradeRange" | "lecturerName"
  >
): Promise<Course> {
  try {
    await ensureBucketDoc(bucket);

    const ref = doc(bucketCoursesCol(bucket));
    const category = input.category ?? categoryFromBucket(bucket);
    const title = input.title.trim();
    const description = trimOrUndefined(input.description);
    const scheduledFor = trimOrUndefined(input.scheduledFor);
    const coverImage = trimOrUndefined(input.coverImage);
    const gradeRange = trimOrUndefined(input.gradeRange);
    const lecturerName = trimOrUndefined(input.lecturerName);

    const payload: Record<string, unknown> = {
      title,
      titleLower: normalizeLower(title),
      category,
      status: isPublishStatus(input.status) ? input.status : "draft",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (description) payload.description = description;
    if (scheduledFor) payload.scheduledFor = scheduledFor;
    if (coverImage) payload.coverImage = coverImage;
    if (coverImage && isVideoSource(input.coverImageSource)) {
      payload.coverImageSource = input.coverImageSource;
    }

    if (category === "basic" && gradeRange) payload.gradeRange = gradeRange;
    if (category === "skill" && lecturerName) payload.lecturerName = lecturerName;

    await setDoc(ref, payload);
    return await getCourseById(ref.id);
  } catch (error) {
    return handleFirestoreError(error);
  }
}

export async function updateCourseInBucket(
  bucket: CourseBucket,
  courseId: string,
  patch: Partial<
    Pick<
      Course,
      "title" | "description" | "status" | "scheduledFor" | "coverImage" | "coverImageSource" | "gradeRange" | "lecturerName"
    >
  >
): Promise<Course> {
  try {
    const ref = courseDoc(bucket, courseId);
    const payload: Record<string, unknown> = { updatedAt: serverTimestamp() };

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

    if (hasOwn(patch, "coverImage")) {
      const coverImage = trimOrUndefined(patch.coverImage);
      payload.coverImage = coverImage ?? deleteField();
      if (!coverImage) payload.coverImageSource = deleteField();
    }

    if (hasOwn(patch, "coverImageSource")) {
      payload.coverImageSource = isVideoSource(patch.coverImageSource)
        ? patch.coverImageSource
        : deleteField();
    }

    if (hasOwn(patch, "gradeRange")) {
      const gradeRange = trimOrUndefined(patch.gradeRange);
      payload.gradeRange = gradeRange ?? deleteField();
    }

    if (hasOwn(patch, "lecturerName")) {
      const lecturerName = trimOrUndefined(patch.lecturerName);
      payload.lecturerName = lecturerName ?? deleteField();
    }

    await updateDoc(ref, payload);
    return await getCourseById(courseId);
  } catch (error) {
    return handleFirestoreError(error);
  }
}

export async function deleteCourseCascade(bucket: CourseBucket, courseId: string): Promise<void> {
  try {
    const chaptersSnap = await getDocs(firestoreQuery(chaptersCol(bucket, courseId)));
    const ops: Array<(batch: WriteBatch) => void> = [];

    for (const chapter of chaptersSnap.docs) {
      const topicsSnap = await getDocs(firestoreQuery(topicsCol(bucket, courseId, chapter.id)));
      for (const topic of topicsSnap.docs) {
        ops.push((batch) => batch.delete(topicDoc(bucket, courseId, chapter.id, topic.id)));
      }
      ops.push((batch) => batch.delete(chapterDoc(bucket, courseId, chapter.id)));
    }

    ops.push((batch) => batch.delete(courseDoc(bucket, courseId)));
    await runBatchOps(ops);

    console.info("[content.api] course cascade deleted", {
      bucket,
      courseId,
      chapterCount: chaptersSnap.size,
    });
  } catch (error) {
    return handleFirestoreError(error);
  }
}

export async function listChapters(bucket: CourseBucket, courseId: string): Promise<Chapter[]> {
  try {
    const snap = await getDocs(firestoreQuery(chaptersCol(bucket, courseId), orderBy("order", "asc")));
    return snap.docs.map((docSnap, idx) => mapChapterDoc(docSnap, idx + 1));
  } catch (error) {
    return handleFirestoreError(error);
  }
}

export async function getChapter(bucket: CourseBucket, courseId: string, chapterId: string): Promise<Chapter> {
  try {
    const snap = await getDoc(chapterDoc(bucket, courseId, chapterId));
    if (!snap.exists()) throw new Error("Chapter not found");
    return mapChapterDoc(snap, 1);
  } catch (error) {
    return handleFirestoreError(error);
  }
}

export async function countChapterTopics(bucket: CourseBucket, courseId: string, chapterId: string): Promise<number> {
  try {
    const count = await getCountFromServer(topicsCol(bucket, courseId, chapterId));
    return count.data().count;
  } catch (error) {
    return handleFirestoreError(error);
  }
}

export async function upsertChapter(
  bucket: CourseBucket,
  courseId: string,
  input: Pick<Chapter, "id" | "title" | "order">
): Promise<Chapter> {
  try {
    const chapterId = input.id?.trim() || doc(chaptersCol(bucket, courseId)).id;
    const ref = chapterDoc(bucket, courseId, chapterId);
    const existing = await getDoc(ref);

    const payload = toChapterPayload({ title: input.title.trim(), order: input.order });
    if (!existing.exists()) payload.createdAt = serverTimestamp();

    await setDoc(ref, payload, { merge: true });
    return await getChapter(bucket, courseId, chapterId);
  } catch (error) {
    return handleFirestoreError(error);
  }
}

export async function deleteChapterCascade(bucket: CourseBucket, courseId: string, chapterId: string): Promise<void> {
  try {
    const topicsSnap = await getDocs(firestoreQuery(topicsCol(bucket, courseId, chapterId)));
    const ops: Array<(batch: WriteBatch) => void> = [];

    for (const topic of topicsSnap.docs) {
      ops.push((batch) => batch.delete(topicDoc(bucket, courseId, chapterId, topic.id)));
    }

    ops.push((batch) => batch.delete(chapterDoc(bucket, courseId, chapterId)));
    await runBatchOps(ops);
  } catch (error) {
    return handleFirestoreError(error);
  }
}

export async function listTopics(
  bucket: CourseBucket,
  courseId: string,
  chapterId: string,
  query?: ListQuery
): Promise<ListResponse<Topic>> {
  try {
    const normalized = query ?? { page: 1, pageSize: 100, search: "" };
    const { page, pageSize, fetchLimit } = normalizePagination(normalized);

    const colRef = topicsCol(bucket, courseId, chapterId);
    const searchConstraints = buildTitlePrefixConstraints(normalized.search);
    const orderConstraints = buildOrderConstraints(searchConstraints, "order");

    const listQuery = firestoreQuery(colRef, ...searchConstraints, ...orderConstraints, limit(fetchLimit));
    const countQuery = firestoreQuery(colRef, ...searchConstraints);

    const [listSnap, countSnap] = await Promise.all([getDocs(listQuery), getCountFromServer(countQuery)]);
    const allRows = listSnap.docs.map((docSnap, idx) => mapTopicDoc(docSnap, idx + 1));

    return {
      rows: paginateRows(allRows, page, pageSize),
      total: countSnap.data().count,
    };
  } catch (error) {
    return handleFirestoreError(error);
  }
}

export async function upsertTopic(
  bucket: CourseBucket,
  courseId: string,
  chapterId: string,
  input: Topic
): Promise<Topic> {
  try {
    const topicId = input.id?.trim() || doc(topicsCol(bucket, courseId, chapterId)).id;
    const ref = topicDoc(bucket, courseId, chapterId, topicId);
    const existing = await getDoc(ref);

    const payload = toTopicPayload({ ...input, id: topicId });
    if (!existing.exists()) payload.createdAt = serverTimestamp();

    await setDoc(ref, payload, { merge: true });

    const saved = await getDoc(ref);
    if (!saved.exists()) throw new Error("Topic not found");
    return mapTopicDoc(saved, input.order ?? 1);
  } catch (error) {
    return handleFirestoreError(error);
  }
}

export async function deleteTopic(
  bucket: CourseBucket,
  courseId: string,
  chapterId: string,
  topicId: string
): Promise<void> {
  try {
    await deleteDoc(topicDoc(bucket, courseId, chapterId, topicId));
  } catch (error) {
    return handleFirestoreError(error);
  }
}

async function loadCourseCurriculum(bucket: CourseBucket, courseId: string): Promise<CourseCurriculum> {
  const chapters = await listChapters(bucket, courseId);
  const withTopics: Chapter[] = await Promise.all(
    chapters.map(async (chapter) => {
      const topics = await listTopics(bucket, courseId, chapter.id, { page: 1, pageSize: 500, search: "" });
      return {
        ...chapter,
        topics: topics.rows,
      };
    })
  );

  const c = await getCourseById(courseId);

  return {
    courseId,
    chapters: withTopics,
    updatedAt: c.updatedAt,
  };
}
/* -------------------------------------------------------------------------- */
/* Compatibility wrappers (old surface)                                       */
/* -------------------------------------------------------------------------- */

export async function listCourses(
  query: ListQuery & { subjectId?: string; status?: PublishStatus | "all"; category?: "basic" | "skill" | "all" }
): Promise<ListResponse<Course>> {
  try {
    const { page, pageSize } = normalizePagination(query);

    if (query.category === "basic") {
      return listCoursesByBucket(BUCKET_BASIC, query);
    }

    if (query.category === "skill") {
      return listCoursesByBucket(BUCKET_SKILL, query);
    }

    const [basic, skill] = await Promise.all([
      listCoursesByBucket(BUCKET_BASIC, { ...query, page: 1, pageSize: 5000 }),
      listCoursesByBucket(BUCKET_SKILL, { ...query, page: 1, pageSize: 5000 }),
    ]);

    const merged = [...basic.rows, ...skill.rows].sort((a, b) => {
      return Date.parse(b.createdAt) - Date.parse(a.createdAt);
    });

    return {
      rows: paginateRows(merged, page, pageSize),
      total: merged.length,
    };
  } catch (error) {
    return handleFirestoreError(error);
  }
}

export async function getCourse(courseId: string): Promise<Course> {
  return getCourseById(courseId);
}

export async function createCourse(input: Omit<Course, "id" | "createdAt">): Promise<Course> {
  const category: SubjectCategory = input.category === "skill" ? "skill" : "basic";
  const bucket = bucketFromCategory(category);
  return createCourseInBucket(bucket, {
    title: input.title,
    description: input.description,
    status: input.status,
    scheduledFor: input.scheduledFor,
    coverImage: input.coverImage,
    coverImageSource: input.coverImageSource,
    category,
    gradeRange: input.gradeRange,
    lecturerName: input.lecturerName,
  });
}

export async function updateCourse(courseId: string, patch: Partial<Course>): Promise<Course> {
  const current = await findCourseDocById(courseId);

  if (patch.category && patch.category !== current.category) {
    throw new Error("Changing course category is not supported.");
  }

  return updateCourseInBucket(current.bucket, courseId, {
    title: patch.title,
    description: patch.description,
    status: patch.status,
    scheduledFor: patch.scheduledFor,
    coverImage: patch.coverImage,
    coverImageSource: patch.coverImageSource,
    gradeRange: patch.gradeRange,
    lecturerName: patch.lecturerName,
  });
}

export async function deleteCourse(
  category: SubjectCategory,
  _legacyCourseOrSubjectId: string,
  maybeCourseId?: string
): Promise<void> {
  const courseId = maybeCourseId ?? _legacyCourseOrSubjectId;
  await deleteCourseCascade(bucketFromCategory(category), courseId);
}

export async function deleteSubject(_category: SubjectCategory, _legacySubjectId: string): Promise<void> {
  return;
}

export async function getCurriculum(courseId: string): Promise<CourseCurriculum> {
  const resolved = await findCourseDocById(courseId);
  return loadCourseCurriculum(resolved.bucket, courseId);
}

export async function saveCurriculum(courseId: string, next: CourseCurriculum): Promise<CourseCurriculum> {
  const resolved = await findCourseDocById(courseId);
  const bucket = resolved.bucket;

  const existingChapters = await listChapters(bucket, courseId);
  const existingMap = new Map(existingChapters.map((chapter) => [chapter.id, chapter]));

  for (const chapter of next.chapters) {
    await upsertChapter(bucket, courseId, {
      id: chapter.id,
      title: chapter.title,
      order: chapter.order,
    });

    const existingTopics = await listTopics(bucket, courseId, chapter.id, { page: 1, pageSize: 5000, search: "" });
    const nextTopicIds = new Set(chapter.topics.map((topic) => topic.id));

    for (const old of existingTopics.rows) {
      if (!nextTopicIds.has(old.id)) {
        await deleteTopic(bucket, courseId, chapter.id, old.id);
      }
    }

    for (const topic of chapter.topics) {
      await upsertTopic(bucket, courseId, chapter.id, topic);
    }

    existingMap.delete(chapter.id);
  }

  for (const removedChapterId of existingMap.keys()) {
    await deleteChapterCascade(bucket, courseId, removedChapterId);
  }

  await updateDoc(courseDoc(bucket, courseId), {
    updatedAt: serverTimestamp(),
    curriculumUpdatedAt: serverTimestamp(),
  });

  return getCurriculum(courseId);
}

export async function listBasicCourses(
  _legacySubjectId: string,
  query: ListQuery & { status?: PublishStatus | "all" }
): Promise<ListResponse<BasicCourse>> {
  return listCoursesByBucket(BUCKET_BASIC, query);
}

export async function getBasicCourse(_legacySubjectId: string, courseId: string): Promise<BasicCourse> {
  const course = await getCourseById(courseId);
  if (course.category !== "basic") throw new Error("Basic course not found");
  return course;
}

export async function createBasicCourse(
  _legacySubjectId: string,
  input: Pick<Course, "title" | "description" | "status" | "scheduledFor" | "coverImage" | "coverImageSource" | "gradeRange">
): Promise<BasicCourse> {
  return createCourseInBucket(BUCKET_BASIC, {
    ...input,
    category: "basic",
  });
}

export async function updateBasicCourse(
  _legacySubjectId: string,
  courseId: string,
  patch: Partial<Pick<Course, "title" | "description" | "status" | "scheduledFor" | "coverImage" | "coverImageSource" | "gradeRange">>
): Promise<BasicCourse> {
  return updateCourseInBucket(BUCKET_BASIC, courseId, patch);
}

export async function listSkillCourses(
  _legacySubjectId: string,
  query: ListQuery & { status?: PublishStatus | "all" }
): Promise<ListResponse<BasicCourse>> {
  return listCoursesByBucket(BUCKET_SKILL, query);
}

export async function getSkillCourse(_legacySubjectId: string, courseId: string): Promise<BasicCourse> {
  const course = await getCourseById(courseId);
  if (course.category !== "skill") throw new Error("Skill course not found");
  return course;
}

export async function createSkillCourse(
  _legacySubjectId: string,
  input: Pick<Course, "title" | "description" | "status" | "scheduledFor" | "coverImage" | "coverImageSource" | "lecturerName">
): Promise<BasicCourse> {
  return createCourseInBucket(BUCKET_SKILL, {
    ...input,
    category: "skill",
  });
}

export async function updateSkillCourse(
  _legacySubjectId: string,
  courseId: string,
  patch: Partial<Pick<Course, "title" | "description" | "status" | "scheduledFor" | "coverImage" | "coverImageSource" | "lecturerName">>
): Promise<BasicCourse> {
  return updateCourseInBucket(BUCKET_SKILL, courseId, patch);
}

export async function listCourseChapters(
  category: SubjectCategory,
  _legacySubjectId: string,
  courseId: string,
  query: ListQuery
): Promise<ListResponse<Chapter>> {
  const all = await listChapters(bucketFromCategory(category), courseId);
  const { page, pageSize } = normalizePagination(query);
  const filtered = query.search
    ? all.filter((chapter) => chapter.title.toLowerCase().includes(query.search!.toLowerCase()))
    : all;

  return {
    rows: paginateRows(filtered, page, pageSize),
    total: filtered.length,
  };
}

export async function upsertCourseChapter(
  category: SubjectCategory,
  _legacySubjectId: string,
  courseId: string,
  input: Pick<Chapter, "id" | "title" | "order">
): Promise<Chapter> {
  return upsertChapter(bucketFromCategory(category), courseId, input);
}

export async function deleteCourseChapter(
  category: SubjectCategory,
  _legacySubjectId: string,
  courseId: string,
  chapterId: string
): Promise<void> {
  return deleteChapterCascade(bucketFromCategory(category), courseId, chapterId);
}

export async function listChapterTopics(
  category: SubjectCategory,
  _legacySubjectId: string,
  courseId: string,
  chapterId: string,
  query: ListQuery
): Promise<ListResponse<Topic>> {
  return listTopics(bucketFromCategory(category), courseId, chapterId, query);
}

export async function upsertChapterTopic(
  category: SubjectCategory,
  _legacySubjectId: string,
  courseId: string,
  chapterId: string,
  input: Topic
): Promise<Topic> {
  return upsertTopic(bucketFromCategory(category), courseId, chapterId, input);
}

export async function deleteChapterTopic(
  category: SubjectCategory,
  _legacySubjectId: string,
  courseId: string,
  chapterId: string,
  topicId: string
): Promise<void> {
  return deleteTopic(bucketFromCategory(category), courseId, chapterId, topicId);
}

/* -------------------------------------------------------------------------- */
/* Legacy subject wrappers (kept for compile compatibility)                   */
/* -------------------------------------------------------------------------- */

function mapBasicCourseToSubject(course: Course): BasicSubject {
  return {
    id: course.id,
    title: course.title,
    gradeRange: course.gradeRange,
    status: course.status,
    scheduledFor: course.scheduledFor,
    coverImage: course.coverImage,
    coverImageSource: course.coverImageSource,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
    category: "basic",
  };
}

function mapSkillCourseToSubject(course: Course): SkillSubject {
  return {
    id: course.id,
    title: course.title,
    lecturerName: course.lecturerName,
    coverImage: course.coverImage,
    coverImageSource: course.coverImageSource,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
    category: "skill",
  };
}

export async function listBasicSubjects(query: ListQuery): Promise<ListResponse<BasicSubject>> {
  const res = await listCoursesByBucket(BUCKET_BASIC, query);
  return {
    rows: res.rows.map(mapBasicCourseToSubject),
    total: res.total,
  };
}

export async function getBasicSubject(subjectId: string): Promise<BasicSubject> {
  const course = await getCourseById(subjectId);
  if (course.category !== "basic") throw new Error("Basic course not found");
  return mapBasicCourseToSubject(course);
}

export async function createBasicSubject(
  input: Pick<BasicSubject, "title" | "gradeRange" | "coverImage" | "coverImageSource">
): Promise<BasicSubject> {
  const created = await createCourseInBucket(BUCKET_BASIC, {
    title: input.title,
    description: undefined,
    status: "draft",
    scheduledFor: undefined,
    coverImage: input.coverImage,
    coverImageSource: input.coverImageSource,
    category: "basic",
    gradeRange: input.gradeRange,
    lecturerName: undefined,
  });
  return mapBasicCourseToSubject(created);
}

export async function updateBasicSubject(
  subjectId: string,
  patch: Partial<Pick<BasicSubject, "title" | "gradeRange" | "status" | "scheduledFor" | "coverImage" | "coverImageSource">>
): Promise<BasicSubject> {
  const updated = await updateCourseInBucket(BUCKET_BASIC, subjectId, {
    title: patch.title,
    status: patch.status,
    scheduledFor: patch.scheduledFor,
    coverImage: patch.coverImage,
    coverImageSource: patch.coverImageSource,
    gradeRange: patch.gradeRange,
  });
  return mapBasicCourseToSubject(updated);
}

export async function listSkillSubjects(query: ListQuery): Promise<ListResponse<SkillSubject>> {
  const res = await listCoursesByBucket(BUCKET_SKILL, query);
  return {
    rows: res.rows.map(mapSkillCourseToSubject),
    total: res.total,
  };
}

export async function getSkillSubject(subjectId: string): Promise<SkillSubject> {
  const course = await getCourseById(subjectId);
  if (course.category !== "skill") throw new Error("Skill course not found");
  return mapSkillCourseToSubject(course);
}

export async function createSkillSubject(
  input: Pick<SkillSubject, "title" | "lecturerName" | "coverImage" | "coverImageSource">
): Promise<SkillSubject> {
  const created = await createCourseInBucket(BUCKET_SKILL, {
    title: input.title,
    description: undefined,
    status: "draft",
    scheduledFor: undefined,
    coverImage: input.coverImage,
    coverImageSource: input.coverImageSource,
    category: "skill",
    gradeRange: undefined,
    lecturerName: input.lecturerName,
  });
  return mapSkillCourseToSubject(created);
}

export async function updateSkillSubject(
  subjectId: string,
  patch: Partial<Pick<SkillSubject, "title" | "lecturerName" | "coverImage" | "coverImageSource">>
): Promise<SkillSubject> {
  const updated = await updateCourseInBucket(BUCKET_SKILL, subjectId, {
    title: patch.title,
    coverImage: patch.coverImage,
    coverImageSource: patch.coverImageSource,
    lecturerName: patch.lecturerName,
  });
  return mapSkillCourseToSubject(updated);
}

export async function listSubjects(query: ListQuery): Promise<ListResponse<Subject>> {
  return listBasicSubjects(query);
}

export async function getSubject(subjectId: string): Promise<Subject> {
  return getBasicSubject(subjectId);
}

export async function createSubject(input: Pick<Subject, "title" | "gradeRange">): Promise<Subject> {
  return createBasicSubject(input as Pick<BasicSubject, "title" | "gradeRange" | "coverImage" | "coverImageSource">);
}

export async function updateSubject(id: string, patch: Partial<Pick<Subject, "title" | "gradeRange">>): Promise<Subject> {
  return updateBasicSubject(id, patch as Partial<Pick<BasicSubject, "title" | "gradeRange">>);
}

export async function getBasicSubjectCurriculum(subjectId: string): Promise<BasicSubjectCurriculum> {
  const curriculum = await getCurriculum(subjectId);
  return {
    subjectId,
    chapters: curriculum.chapters,
    updatedAt: curriculum.updatedAt,
  };
}

export async function saveBasicSubjectCurriculum(
  subjectId: string,
  next: BasicSubjectCurriculum | CourseCurriculum
): Promise<BasicSubjectCurriculum> {
  const saved = await saveCurriculum(subjectId, {
    courseId: subjectId,
    chapters: next.chapters,
  });
  return {
    subjectId,
    chapters: saved.chapters,
    updatedAt: saved.updatedAt,
  };
}

/* -------------------------------------------------------------------------- */
/* Removed legacy flows                                                       */
/* -------------------------------------------------------------------------- */

function removedFlowError(flowName: string): Error {
  return new Error(`[content.api] ${flowName} flow was removed.`);
}

export async function listLectures(_query: ListQuery & { courseId?: string }): Promise<ListResponse<Lecture>> {
  return { rows: [], total: 0 };
}

export async function getLecture(_lectureId: string): Promise<Lecture> {
  throw removedFlowError("Lectures");
}

export async function upsertLecture(_input: Partial<Lecture> & { title: string }): Promise<Lecture> {
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

export async function listSkillTopics(_subjectId: string, _query: ListQuery): Promise<ListResponse<SkillTopic>> {
  return { rows: [], total: 0 };
}

export async function getSkillTopic(_subjectId: string, _topicId: string): Promise<SkillTopic> {
  throw removedFlowError("SkillTopics");
}

export async function createSkillTopic(
  _subjectId?: string,
  _input?: Partial<SkillTopic>,
  _options?: { topicId?: string }
): Promise<SkillTopic> {
  throw removedFlowError("SkillTopics");
}

export async function updateSkillTopic(
  _subjectId?: string,
  _topicId?: string,
  _patch?: Partial<SkillTopic>
): Promise<SkillTopic> {
  throw removedFlowError("SkillTopics");
}
