import type { Plan, RefundRequest, Transaction } from "../Types/payments.types";

function iso(d: Date) {
  return d.toISOString();
}

export const TRANSACTIONS: Transaction[] = [
  {
    id: "t1",
    userId: "u1",
    userName: "Hassan",
    userEmail: "hassan@mail.com",
    type: "subscription",
    provider: "stripe",
    amount: 999,
    currency: "PKR",
    status: "paid",
    createdAt: iso(new Date(Date.now() - 8640_000 * 3)),
    providerInvoiceId: "in_123",
    planId: "p1",
    planName: "Standard Monthly",
  },
  {
    id: "t2",
    userId: "u2",
    userName: "Ayesha",
    userEmail: "ayesha@mail.com",
    type: "book",
    provider: "stripe",
    amount: 1500,
    currency: "PKR",
    status: "paid",
    createdAt: iso(new Date(Date.now() - 8640_000 * 2)),
    providerInvoiceId: "in_456",
    bookId: "b1",
    bookTitle: "Applied Mathematics — Grade 8-9",
  },
  {
    id: "t3",
    userId: "u3",
    userName: "Ali",
    userEmail: "ali@mail.com",
    type: "subscription",
    provider: "stripe",
    amount: 999,
    currency: "PKR",
    status: "failed",
    createdAt: iso(new Date(Date.now() - 8640_000 * 1)),
    providerInvoiceId: "in_999",
    planId: "p1",
    planName: "Standard Monthly",
  },
];

export const PLANS: Plan[] = [
  {
    id: "p1",
    name: "Standard Monthly",
    description: "Full access to courses + progress tracking",
    price: 999,
    currency: "PKR",
    interval: "monthly",
    status: "active",
    provider: "stripe",
    providerPlanId: "price_123",
    createdAt: iso(new Date(Date.now() - 8640_000 * 20)),
    updatedAt: iso(new Date(Date.now() - 8640_000 * 2)),
  },
  {
    id: "p2",
    name: "Standard Yearly",
    description: "Yearly subscription plan",
    price: 9990,
    currency: "PKR",
    interval: "yearly",
    status: "inactive",
    provider: "stripe",
    providerPlanId: "price_456",
    createdAt: iso(new Date(Date.now() - 8640_000 * 25)),
    updatedAt: iso(new Date(Date.now() - 8640_000 * 6)),
  },
];

// eslint-disable-next-line prefer-const
export let REFUNDS: RefundRequest[] = [
  {
    id: "r1",
    transactionId: "t2",
    amount: 1500,
    currency: "PKR",
    userId: "u2",
    userName: "Ayesha",
    userEmail: "ayesha@mail.com",
    reason: "Purchased by mistake",
    status: "requested",
    createdAt: iso(new Date(Date.now() - 8640_000 * 1)),
    updatedAt: iso(new Date(Date.now() - 8640_000 * 1)),
  },
];

