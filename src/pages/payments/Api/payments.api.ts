import type {
  ListQuery,
  ListResponse,
  Plan,
  PlanUpsertInput,
  RefundRequest,
  Transaction,
} from "../Types/payments.types";

import { PLANS, REFUNDS, TRANSACTIONS } from "../Mock data/payments.mock";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function paginate<T>(rows: T[], q: ListQuery): ListResponse<T> {
  const start = (q.page - 1) * q.pageSize;
  const end = start + q.pageSize;
  return { rows: rows.slice(start, end), total: rows.length };
}

function includesSearch(hay: string, s?: string) {
  const q = s?.trim().toLowerCase();
  if (!q) return true;
  return hay.toLowerCase().includes(q);
}

/* -------------------------------------------------------------------------- */
/* Transactions                                                                */
/* -------------------------------------------------------------------------- */
export async function listTransactions(q: ListQuery): Promise<ListResponse<Transaction>> {
  await sleep(160);

  let rows = [...TRANSACTIONS].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  if (q.search?.trim()) {
    rows = rows.filter((t) => {
      const hay = `${t.userName} ${t.userEmail ?? ""} ${t.type} ${t.status} ${t.bookTitle ?? ""} ${t.planName ?? ""} ${t.providerInvoiceId ?? ""}`;
      return includesSearch(hay, q.search);
    });
  }

  return paginate(rows, q);
}

export async function getInvoiceHtml(invoiceId: string): Promise<string> {
  await sleep(120);

  // NOTE (Stripe/Firebase): You’d fetch hosted invoice url or HTML from provider.
  return `
    <div style="font-family: ui-sans-serif; padding: 16px;">
      <h2 style="margin: 0 0 8px;">Invoice ${invoiceId}</h2>
      <p style="margin: 0 0 12px; color: #475569;">This is a mock invoice preview.</p>
      <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px;">
        <p style="margin: 0;">Line items will be shown here.</p>
      </div>
    </div>
  `;
}

/* -------------------------------------------------------------------------- */
/* Plans                                                                       */
/* -------------------------------------------------------------------------- */
export async function listPlans(q: ListQuery): Promise<ListResponse<Plan>> {
  await sleep(160);

  let rows = [...PLANS].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  if (q.search?.trim()) {
    rows = rows.filter((p) => includesSearch(`${p.name} ${p.description ?? ""} ${p.interval} ${p.status}`, q.search));
  }

  return paginate(rows, q);
}

export async function createPlan(input: PlanUpsertInput): Promise<Plan> {
  await sleep(200);

  const now = new Date().toISOString();
  const row: Plan = {
    id: `p_${Math.random().toString(16).slice(2)}`,
    name: input.name.trim(),
    description: input.description?.trim() || undefined,
    price: Number(input.price) || 0,
    currency: input.currency,
    interval: input.interval,
    status: input.status,
    provider: input.provider,
    providerPlanId: input.providerPlanId?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (PLANS as any).unshift(row);
  return row;
}

export async function updatePlan(id: string, input: PlanUpsertInput): Promise<Plan> {
  await sleep(200);

  const idx = PLANS.findIndex((p) => p.id === id);
  if (idx < 0) throw new Error("Plan not found");

  const next: Plan = {
    ...PLANS[idx],
    name: input.name.trim(),
    description: input.description?.trim() || undefined,
    price: Number(input.price) || 0,
    currency: input.currency,
    interval: input.interval,
    status: input.status,
    provider: input.provider,
    providerPlanId: input.providerPlanId?.trim() || undefined,
    updatedAt: new Date().toISOString(),
  };

  PLANS[idx] = next;
  return next;
}

/* -------------------------------------------------------------------------- */
/* Refunds                                                                     */
/* -------------------------------------------------------------------------- */
export async function listRefunds(q: ListQuery): Promise<ListResponse<RefundRequest>> {
  await sleep(160);

  let rows = [...REFUNDS].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  if (q.search?.trim()) {
    rows = rows.filter((r) => includesSearch(`${r.userName} ${r.userEmail ?? ""} ${r.status} ${r.transactionId}`, q.search));
  }

  return paginate(rows, q);
}

export async function updateRefundStatus(
  id: string,
  status: RefundRequest["status"],
  note?: string
): Promise<RefundRequest> {
  await sleep(180);

  const idx = REFUNDS.findIndex((r) => r.id === id);
  if (idx < 0) throw new Error("Refund request not found");

  const next: RefundRequest = {
    ...REFUNDS[idx],
    status,
    reason: note ?? REFUNDS[idx].reason,
    updatedAt: new Date().toISOString(),
  };

  REFUNDS[idx] = next;

  // Optional: if refund approved/processed, also update transaction status in your real backend.
  return next;
}

