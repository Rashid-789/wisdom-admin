export type Currency = "PKR" | "USD" | "GBP";

export type PublishStatus = "draft" | "published";

export type BookSubject = {
  id: string;
  title: string;

  gradeLabel?: string; // e.g. "Grade 8th–9th"
  description?: string;

  thumbnailUrl?: string; // subject thumbnail

  status: PublishStatus;
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

export type SubBook = {
  id: string;

  subjectId: string;
  subjectTitle: string;

  title: string;
  author?: string;
  publisher?: string;
  description?: string;

  // pricing like app: "150k OR Rs.1500"
  tokenPrice?: number; // e.g. 150000
  moneyPrice?: number; // e.g. 1500
  currency: Currency; // mostly PKR

  // uploads
  pdfUrl?: string;     // storage url
  coverUrl?: string;   // storage url

  status: PublishStatus;
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

export type SubjectUpsertInput = {
  title: string;
  gradeLabel?: string;
  description?: string;
  status: PublishStatus;

  // upload (optional)
  thumbnail?: File | null;
};

export type SubBookUpsertInput = {
  title: string;
  author?: string;
  publisher?: string;
  description?: string;

  tokenPrice?: number;
  moneyPrice?: number;
  currency: Currency;

  status: PublishStatus;

  // uploads (optional)
  pdf?: File | null;     // MUST be PDF
  cover?: File | null;
};

export type ListQuery = {
  page: number;
  pageSize: number;
  search?: string;
  status?: "all" | PublishStatus;
};

export type ListResponse<T> = {
  rows: T[];
  total: number;
};