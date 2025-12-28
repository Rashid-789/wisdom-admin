import type { Currency, TransactionStatus } from "../Types/payments.types";

export function formatMoney(amount: number, currency: Currency) {
  const cur = currency === "PKR" ? "Rs." : currency;
  return `${cur} ${amount.toLocaleString()}`;
}

export function statusPillClass(status: TransactionStatus) {
  switch (status) {
    case "paid":
      return "border-emerald-100 bg-emerald-50 text-emerald-700";
    case "pending":
      return "border-amber-100 bg-amber-50 text-amber-700";
    case "failed":
      return "border-rose-100 bg-rose-50 text-rose-700";
    case "refunded":
      return "border-slate-100 bg-slate-50 text-slate-700";
    default:
      return "border-slate-100 bg-slate-50 text-slate-700";
  }
}

