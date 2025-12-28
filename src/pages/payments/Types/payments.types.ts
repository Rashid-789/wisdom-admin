export type Currency = "PKR" | "USD" | "GBP";

export type PaymentProvider = "stripe" | "manual" | "other";

export type TransactionStatus = "paid" | "pending" | "failed" | "refunded";

export type TransactionType = "subscription" | "book" | "token_topup" | "other";

export type Transaction = {
  id: string;

  userId: string;
  userName: string;
  userEmail?: string;

  type: TransactionType;
  provider: PaymentProvider;

  amount: number;
  currency: Currency;

  status: TransactionStatus;
  createdAt: string; // ISO

  providerInvoiceId?: string;
  providerPaymentId?: string;

  // Helpful metadata for admin UI
  bookId?: string;
  bookTitle?: string;

  planId?: string;
  planName?: string;
};

export type PlanInterval = "monthly" | "yearly";

export type PlanStatus = "active" | "inactive";

export type Plan = {
  id: string;
  name: string;
  description?: string;

  price: number;
  currency: Currency;
  interval: PlanInterval;

  status: PlanStatus;
  createdAt: string; // ISO
  updatedAt: string; // ISO

  provider: PaymentProvider;
  providerPlanId?: string; // e.g. Stripe priceId
};

export type PlanUpsertInput = {
  name: string;
  description?: string;

  price: number;
  currency: Currency;
  interval: PlanInterval;

  status: PlanStatus;
  provider: PaymentProvider;

  providerPlanId?: string;
};

export type RefundStatus = "requested" | "approved" | "rejected" | "processed";

export type RefundRequest = {
  id: string;

  transactionId: string;
  amount: number;
  currency: Currency;

  userId: string;
  userName: string;
  userEmail?: string;

  reason?: string;

  status: RefundStatus;
  createdAt: string; // ISO
  updatedAt: string; // ISO
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

