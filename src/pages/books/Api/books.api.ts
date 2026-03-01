import {
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
  type QueryConstraint,
} from "firebase/firestore";

import { db } from "../../../app/utils/firebase";
import type {
  BookSubject,
  Currency,
  ListQuery,
  ListResponse,
  PublishStatus,
  SubjectUpsertInput,
  SubBook,
  SubBookUpsertInput,
} from "../Types/books.types";
import { tsToISO, uploadToStorage } from "../utils/books.firebase";

const BOOKS_COLLECTION = "books";
const SUB_BOOKS_COLLECTION = "subBooks";
const MAX_FETCH = 200;

function booksCol() {
  return collection(db, BOOKS_COLLECTION);
}

function subjectRef(subjectId: string) {
  return doc(db, BOOKS_COLLECTION, subjectId);
}

function subBooksCol(subjectId: string) {
  return collection(db, BOOKS_COLLECTION, subjectId, SUB_BOOKS_COLLECTION);
}

function subBookRef(subjectId: string, subBookId: string) {
  return doc(db, BOOKS_COLLECTION, subjectId, SUB_BOOKS_COLLECTION, subBookId);
}

function normalizeLower(value: string): string {
  return value.trim().toLowerCase();
}

function trimOrUndefined(value: string | undefined): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function cleanUndefined<T extends Record<string, unknown>>(value: T): T {
  const out: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    if (item !== undefined) {
      out[key] = item;
    }
  }
  return out as T;
}

function toKeywords(...parts: Array<string | undefined>): string[] {
  const keywords = new Set<string>();

  for (const part of parts) {
    if (!part) continue;
    const tokens = part
      .toLowerCase()
      .split(/[^a-z0-9]+/g)
      .map((token) => token.trim())
      .filter(Boolean);

    for (const token of tokens) {
      keywords.add(token);
    }
  }

  return Array.from(keywords);
}

function getFirstSearchToken(search?: string): string | undefined {
  return search
    ?.toLowerCase()
    .split(/[^a-z0-9]+/g)
    .map((token) => token.trim())
    .find(Boolean);
}

function paginate<T>(rows: T[], q: ListQuery): ListResponse<T> {
  const start = (q.page - 1) * q.pageSize;
  const end = start + q.pageSize;
  return { rows: rows.slice(start, end), total: rows.length };
}

function sortByUpdatedAtDesc<T extends { updatedAt: string }>(rows: T[]): T[] {
  return rows.slice().sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

function isPublishStatus(value: unknown): value is PublishStatus {
  return value === "draft" || value === "published";
}

function isCurrency(value: unknown): value is Currency {
  return value === "PKR" || value === "USD" || value === "GBP";
}

function isIndexError(error: unknown): boolean {
  const code = (error as { code?: string })?.code;
  return code === "failed-precondition" || code === "invalid-argument";
}

function extFromFile(file: File, fallback: string): string {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]+$/.test(fromName)) return fromName;

  const fromType = file.type.split("/").pop()?.toLowerCase();
  if (fromType && /^[a-z0-9]+$/.test(fromType)) return fromType;

  return fallback;
}

function isPdfFile(file: File): boolean {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  return type === "application/pdf" || name.endsWith(".pdf");
}

function assertValidPrice(value: number | undefined, field: string): void {
  if (value === undefined) return;
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${field} must be >= 0`);
  }
}

function mapBookSubjectDoc(
  snapshot: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>
): BookSubject {
  const data = snapshot.data() ?? {};

  return {
    id: snapshot.id,
    title: typeof data.title === "string" ? data.title : "",
    gradeLabel: trimOrUndefined(typeof data.gradeLabel === "string" ? data.gradeLabel : undefined),
    description: trimOrUndefined(typeof data.description === "string" ? data.description : undefined),
    thumbnailUrl: trimOrUndefined(typeof data.thumbnailUrl === "string" ? data.thumbnailUrl : undefined),
    status: isPublishStatus(data.status) ? data.status : "draft",
    createdAt: tsToISO(data.createdAt),
    updatedAt: tsToISO(data.updatedAt ?? data.createdAt),
  };
}

function mapSubBookDoc(
  snapshot: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>
): SubBook {
  const data = snapshot.data() ?? {};

  return {
    id: snapshot.id,
    subjectId: typeof data.subjectId === "string" ? data.subjectId : "",
    subjectTitle: typeof data.subjectTitle === "string" ? data.subjectTitle : "",
    title: typeof data.title === "string" ? data.title : "",
    author: trimOrUndefined(typeof data.author === "string" ? data.author : undefined),
    publisher: trimOrUndefined(typeof data.publisher === "string" ? data.publisher : undefined),
    description: trimOrUndefined(typeof data.description === "string" ? data.description : undefined),
    tokenPrice: typeof data.tokenPrice === "number" ? data.tokenPrice : undefined,
    moneyPrice: typeof data.moneyPrice === "number" ? data.moneyPrice : undefined,
    currency: isCurrency(data.currency) ? data.currency : "PKR",
    pdfUrl: trimOrUndefined(typeof data.pdfUrl === "string" ? data.pdfUrl : undefined),
    coverUrl: trimOrUndefined(typeof data.coverUrl === "string" ? data.coverUrl : undefined),
    status: isPublishStatus(data.status) ? data.status : "draft",
    createdAt: tsToISO(data.createdAt),
    updatedAt: tsToISO(data.updatedAt ?? data.createdAt),
  };
}

function filterByStatusAndToken<T extends { status: PublishStatus }>(
  rows: T[],
  status: ListQuery["status"],
  token: string | undefined,
  getKeywords: (row: T) => string[]
): T[] {
  return rows.filter((row) => {
    const statusOk = status && status !== "all" ? row.status === status : true;
    const searchOk = token ? getKeywords(row).includes(token) : true;
    return statusOk && searchOk;
  });
}

async function runSafeSubjectListQuery(constraints: QueryConstraint[]) {
  try {
    return await getDocs(query(booksCol(), ...constraints));
  } catch (error) {
    if (!isIndexError(error)) throw error;
    return getDocs(query(booksCol(), orderBy("updatedAt", "desc"), limit(MAX_FETCH)));
  }
}

async function runSafeSubBookListQuery(subjectId: string, constraints: QueryConstraint[]) {
  try {
    return await getDocs(query(subBooksCol(subjectId), ...constraints));
  } catch (error) {
    if (!isIndexError(error)) throw error;
    return getDocs(query(subBooksCol(subjectId), orderBy("updatedAt", "desc"), limit(MAX_FETCH)));
  }
}

async function syncSubBookSubjectTitles(subjectId: string, subjectTitle: string): Promise<void> {
  const snap = await getDocs(subBooksCol(subjectId));
  if (snap.empty) return;

  let batch = writeBatch(db);
  let count = 0;
  const commits: Promise<void>[] = [];

  const flush = () => {
    commits.push(batch.commit());
    batch = writeBatch(db);
    count = 0;
  };

  for (const row of snap.docs) {
    batch.update(row.ref, {
      subjectTitle,
      updatedAt: serverTimestamp(),
    });
    count += 1;

    if (count >= 450) {
      flush();
    }
  }

  if (count > 0) flush();
  await Promise.all(commits);
}

/* -------------------------------------------------------------------------- */
/* Subjects                                                                   */
/* -------------------------------------------------------------------------- */
export async function listBookSubjects(q: ListQuery): Promise<ListResponse<BookSubject>> {
  const searchToken = getFirstSearchToken(q.search);

  const constraints: QueryConstraint[] = [
    orderBy("updatedAt", "desc"),
    limit(MAX_FETCH),
  ];

  if (q.status && q.status !== "all") {
    constraints.unshift(where("status", "==", q.status));
  }
  if (searchToken) {
    constraints.unshift(where("keywords", "array-contains", searchToken));
  }

  const snap = await runSafeSubjectListQuery(constraints);

  const mapped = sortByUpdatedAtDesc(snap.docs.map((row) => mapBookSubjectDoc(row)));
  const filtered = filterByStatusAndToken(
    mapped,
    q.status,
    searchToken,
    (row) => toKeywords(row.title, row.gradeLabel, row.description)
  );

  return paginate(filtered, q);
}

export async function getBookSubject(id: string): Promise<BookSubject> {
  const snap = await getDoc(subjectRef(id));
  if (!snap.exists()) throw new Error("Subject not found");
  return mapBookSubjectDoc(snap);
}

export async function createBookSubject(input: SubjectUpsertInput): Promise<BookSubject> {
  const subjectDocRef = doc(booksCol());
  const subjectId = subjectDocRef.id;

  const title = input.title.trim();
  const gradeLabel = trimOrUndefined(input.gradeLabel);
  const description = trimOrUndefined(input.description);

  let thumbnailUrl: string | undefined;
  if (input.thumbnail) {
    const ext = extFromFile(input.thumbnail, "jpg");
    const path = `books/${subjectId}/thumbnail.${ext}`;
    thumbnailUrl = await uploadToStorage(path, input.thumbnail);
  }

  await setDoc(subjectDocRef, {
    ...cleanUndefined({
      title,
      gradeLabel,
      description,
      thumbnailUrl,
      status: input.status,
      titleLower: normalizeLower(title),
      keywords: toKeywords(title, gradeLabel, description),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
  });

  const saved = await getDoc(subjectDocRef);
  if (!saved.exists()) throw new Error("Subject not found");
  return mapBookSubjectDoc(saved);
}

export async function updateBookSubject(id: string, patch: SubjectUpsertInput): Promise<BookSubject> {
  const ref = subjectRef(id);

  const title = patch.title.trim();
  const gradeLabel = trimOrUndefined(patch.gradeLabel);
  const description = trimOrUndefined(patch.description);

  const payload: Record<string, unknown> = {
    title,
    gradeLabel: gradeLabel ?? deleteField(),
    description: description ?? deleteField(),
    status: patch.status,
    titleLower: normalizeLower(title),
    keywords: toKeywords(title, gradeLabel, description),
    updatedAt: serverTimestamp(),
  };

  if (patch.thumbnail) {
    const ext = extFromFile(patch.thumbnail, "jpg");
    const path = `books/${id}/thumbnail.${ext}`;
    payload.thumbnailUrl = await uploadToStorage(path, patch.thumbnail);
  }

  await updateDoc(ref, payload);
  await syncSubBookSubjectTitles(id, title);

  const updated = await getDoc(ref);
  if (!updated.exists()) throw new Error("Subject not found");
  return mapBookSubjectDoc(updated);
}

/* -------------------------------------------------------------------------- */
/* SubBooks                                                                   */
/* -------------------------------------------------------------------------- */
export async function listSubBooks(subjectId: string, q: ListQuery): Promise<ListResponse<SubBook>> {
  const searchToken = getFirstSearchToken(q.search);

  const constraints: QueryConstraint[] = [
    orderBy("updatedAt", "desc"),
    limit(MAX_FETCH),
  ];

  if (q.status && q.status !== "all") {
    constraints.unshift(where("status", "==", q.status));
  }
  if (searchToken) {
    constraints.unshift(where("keywords", "array-contains", searchToken));
  }

  const snap = await runSafeSubBookListQuery(subjectId, constraints);

  const mapped = sortByUpdatedAtDesc(snap.docs.map((row) => mapSubBookDoc(row)));
  const filtered = filterByStatusAndToken(
    mapped,
    q.status,
    searchToken,
    (row) => toKeywords(row.title, row.author, row.publisher, row.subjectTitle)
  );

  return paginate(filtered, q);
}

export async function getSubBook(subjectId: string, subBookId: string): Promise<SubBook> {
  const snap = await getDoc(subBookRef(subjectId, subBookId));
  if (!snap.exists()) throw new Error("Book not found");
  return mapSubBookDoc(snap);
}

export async function createSubBook(subjectId: string, input: SubBookUpsertInput): Promise<SubBook> {
  const subject = await getBookSubject(subjectId);

  assertValidPrice(input.tokenPrice, "tokenPrice");
  assertValidPrice(input.moneyPrice, "moneyPrice");

  if (!input.pdf) {
    throw new Error("PDF is required");
  }
  if (!isPdfFile(input.pdf)) {
    throw new Error("PDF is required");
  }

  const subRef = doc(subBooksCol(subjectId));
  const subBookId = subRef.id;

  const pdfUrl = await uploadToStorage(
    `books/${subjectId}/subBooks/${subBookId}/book.pdf`,
    input.pdf
  );

  let coverUrl: string | undefined;
  if (input.cover) {
    const ext = extFromFile(input.cover, "jpg");
    coverUrl = await uploadToStorage(
      `books/${subjectId}/subBooks/${subBookId}/cover.${ext}`,
      input.cover
    );
  }

  const title = input.title.trim();
  const author = trimOrUndefined(input.author);
  const publisher = trimOrUndefined(input.publisher);
  const description = trimOrUndefined(input.description);

  await setDoc(subRef, {
    ...cleanUndefined({
      subjectId,
      subjectTitle: subject.title,
      title,
      author,
      publisher,
      description,
      tokenPrice: typeof input.tokenPrice === "number" ? input.tokenPrice : undefined,
      moneyPrice: typeof input.moneyPrice === "number" ? input.moneyPrice : undefined,
      currency: input.currency,
      pdfUrl,
      coverUrl,
      status: input.status,
      titleLower: normalizeLower(title),
      keywords: toKeywords(title, author, publisher, description, subject.title),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
  });

  const saved = await getDoc(subRef);
  if (!saved.exists()) throw new Error("Book not found");
  return mapSubBookDoc(saved);
}

export async function updateSubBook(
  subjectId: string,
  subBookId: string,
  patch: SubBookUpsertInput
): Promise<SubBook> {
  const ref = subBookRef(subjectId, subBookId);

  assertValidPrice(patch.tokenPrice, "tokenPrice");
  assertValidPrice(patch.moneyPrice, "moneyPrice");

  if (patch.pdf && !isPdfFile(patch.pdf)) {
    throw new Error("PDF is required");
  }

  const subject = await getBookSubject(subjectId);

  const title = patch.title.trim();
  const author = trimOrUndefined(patch.author);
  const publisher = trimOrUndefined(patch.publisher);
  const description = trimOrUndefined(patch.description);

  const payload: Record<string, unknown> = {
    subjectId,
    subjectTitle: subject.title,
    title,
    author: author ?? deleteField(),
    publisher: publisher ?? deleteField(),
    description: description ?? deleteField(),
    tokenPrice: typeof patch.tokenPrice === "number" ? patch.tokenPrice : deleteField(),
    moneyPrice: typeof patch.moneyPrice === "number" ? patch.moneyPrice : deleteField(),
    currency: patch.currency,
    status: patch.status,
    titleLower: normalizeLower(title),
    keywords: toKeywords(title, author, publisher, description, subject.title),
    updatedAt: serverTimestamp(),
  };

  if (patch.pdf) {
    payload.pdfUrl = await uploadToStorage(
      `books/${subjectId}/subBooks/${subBookId}/book.pdf`,
      patch.pdf
    );
  }

  if (patch.cover) {
    const ext = extFromFile(patch.cover, "jpg");
    payload.coverUrl = await uploadToStorage(
      `books/${subjectId}/subBooks/${subBookId}/cover.${ext}`,
      patch.cover
    );
  }

  await updateDoc(ref, payload);

  const updated = await getDoc(ref);
  if (!updated.exists()) throw new Error("Book not found");
  return mapSubBookDoc(updated);
}
