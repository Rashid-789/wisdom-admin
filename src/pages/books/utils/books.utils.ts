
import type { Currency } from "../Types/books.types";

export function formatMoney(amount: number, currency: Currency) {
  const cur = currency === "PKR" ? "Rs." : currency;
  return `${cur} ${amount.toLocaleString()}`;
}

export function fileToObjectUrl(file?: File | null) {
  if (!file) return "";
  return URL.createObjectURL(file);
}
