
export type Currency = "PKR" | "USD" | "GBP";

export type BookFileType = "pdf" | "epub";

export type BookStatus = "draft" | "published";

export type Book = {
  id: string;
  title: string;

  author?: string;
  publisher?: string;

  description?: string;

  price: number;
  currency: Currency;

  fileType: BookFileType;
  fileUrl?: string;   // storage url
  coverUrl?: string;  // storage url

  // Linking (optional)
  subjectId?: string;
  subjectTitle?: string;

  courseId?: string;
  courseTitle?: string;

  status: BookStatus;
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

export type BookUpsertInput = {
  title: string;
  author?: string;
  publisher?: string;
  description?: string;

  price: number;
  currency: Currency;

  fileType: BookFileType;

  subjectId?: string;
  subjectTitle?: string;

  courseId?: string;
  courseTitle?: string;

  status: BookStatus;

  // Uploads (optional)
  file?: File | null;
  cover?: File | null;
};

export type BookOrderStatus = "paid" | "refunded" | "failed";

export type BookOrder = {
  id: string;
  bookId: string;
  bookTitle: string;

  userId: string;
  userName: string;
  userEmail?: string;

  amount: number;
  currency: Currency;

  status: BookOrderStatus;
  createdAt: string; // ISO
};

export type BookAccessSource = "order" | "manual";

export type BookAccess = {
  id: string;
  bookId: string;

  userId: string;
  userName: string;
  userEmail?: string;

  source: BookAccessSource;
  grantedAt: string; // ISO
};

export type ListQuery = {
  page: number;
  pageSize: number;
  search?: string;
  status?: "all" | BookStatus;
};

export type ListResponse<T> = {
  rows: T[];
  total: number;
};
