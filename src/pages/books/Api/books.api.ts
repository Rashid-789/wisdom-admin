import type {
  Book,
  BookAccess,
  BookOrder,
  BookUpsertInput,
  ListQuery,
  ListResponse,
} from "../Types/books.types";

import { BOOKS, BOOK_ACCESS, BOOK_ORDERS } from "../mock-data/books.mock";
import { fileToObjectUrl } from "../utils/books.utils";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function paginate<T>(rows: T[], q: ListQuery): ListResponse<T> {
  const start = (q.page - 1) * q.pageSize;
  const end = start + q.pageSize;
  return { rows: rows.slice(start, end), total: rows.length };
}

function matchSearch(rows: Book[], search?: string) {
  const s = search?.trim().toLowerCase();
  if (!s) return rows;
  return rows.filter((b) => {
    const hay = `${b.title} ${b.author ?? ""} ${b.publisher ?? ""} ${b.subjectTitle ?? ""} ${b.courseTitle ?? ""}`.toLowerCase();
    return hay.includes(s);
  });
}

/* -------------------------------------------------------------------------- */
/* Books                                                                        */
/* -------------------------------------------------------------------------- */
export async function listBooks(q: ListQuery): Promise<ListResponse<Book>> {
  await sleep(160);

  let rows = [...BOOKS].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  if (q.status && q.status !== "all") {
    rows = rows.filter((b) => b.status === q.status);
  }

  rows = matchSearch(rows, q.search);

  return paginate(rows, q);
}

export async function getBook(id: string): Promise<Book> {
  await sleep(120);
  const hit = BOOKS.find((b) => b.id === id);
  if (!hit) throw new Error("Book not found");
  return hit;
}

export async function createBook(input: BookUpsertInput): Promise<Book> {
  await sleep(200);

  // NOTE (Firebase): upload input.file + input.cover to Storage, store URLs in Firestore.
  const fileUrl = input.file ? fileToObjectUrl(input.file) : "";
  const coverUrl = input.cover ? fileToObjectUrl(input.cover) : "";

  const now = new Date().toISOString();
  const row: Book = {
    id: `b_${Math.random().toString(16).slice(2)}`,
    title: input.title.trim(),
    author: input.author?.trim() || undefined,
    publisher: input.publisher?.trim() || undefined,
    description: input.description?.trim() || undefined,

    price: Number(input.price) || 0,
    currency: input.currency,

    fileType: input.fileType,
    fileUrl,
    coverUrl,

    subjectId: input.subjectId,
    subjectTitle: input.subjectTitle,

    courseId: input.courseId,
    courseTitle: input.courseTitle,

    status: input.status,
    createdAt: now,
    updatedAt: now,
  };

  BOOKS.unshift(row);
  return row;
}

export async function updateBook(id: string, patch: BookUpsertInput): Promise<Book> {
  await sleep(200);

  const idx = BOOKS.findIndex((b) => b.id === id);
  if (idx < 0) throw new Error("Book not found");

  // NOTE (Firebase): upload if new files exist and replace urls.
  const fileUrl = patch.file ? fileToObjectUrl(patch.file) : undefined;
  const coverUrl = patch.cover ? fileToObjectUrl(patch.cover) : undefined;

  const next: Book = {
    ...BOOKS[idx],
    title: patch.title.trim(),
    author: patch.author?.trim() || undefined,
    publisher: patch.publisher?.trim() || undefined,
    description: patch.description?.trim() || undefined,

    price: Number(patch.price) || 0,
    currency: patch.currency,

    fileType: patch.fileType,

    subjectId: patch.subjectId,
    subjectTitle: patch.subjectTitle,

    courseId: patch.courseId,
    courseTitle: patch.courseTitle,

    status: patch.status,

    fileUrl: fileUrl ?? BOOKS[idx].fileUrl,
    coverUrl: coverUrl ?? BOOKS[idx].coverUrl,

    updatedAt: new Date().toISOString(),
  };

  BOOKS[idx] = next;
  return next;
}

/* -------------------------------------------------------------------------- */
/* Orders + Access                                                              */
/* -------------------------------------------------------------------------- */
export async function listBookOrders(q: ListQuery): Promise<ListResponse<BookOrder>> {
  await sleep(160);

  let rows = [...BOOK_ORDERS].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const s = q.search?.trim().toLowerCase();
  if (s) {
    rows = rows.filter((o) => {
      const hay = `${o.bookTitle} ${o.userName} ${o.userEmail ?? ""}`.toLowerCase();
      return hay.includes(s);
    });
  }

  return paginate(rows, q);
}

export async function listBookAccess(bookId: string): Promise<BookAccess[]> {
  await sleep(120);
  return BOOK_ACCESS.filter((a) => a.bookId === bookId).sort((a, b) => b.grantedAt.localeCompare(a.grantedAt));
}

export async function grantBookAccess(bookId: string, input: { userId: string; userName: string; userEmail?: string }): Promise<BookAccess> {
  await sleep(140);

  const row: BookAccess = {
    id: `acc_${Math.random().toString(16).slice(2)}`,
    bookId,
    userId: input.userId,
    userName: input.userName,
    userEmail: input.userEmail,
    source: "manual",
    grantedAt: new Date().toISOString(),
  };

  BOOK_ACCESS.unshift(row);
  return row;
}

export async function revokeBookAccess(accessId: string): Promise<void> {
  await sleep(120);
  const idx = BOOK_ACCESS.findIndex((a) => a.id === accessId);
  if (idx >= 0) BOOK_ACCESS.splice(idx, 1);
}
