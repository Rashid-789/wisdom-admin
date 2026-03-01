/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Currency, SubBook } from "../Types/books.types";

export function formatMoney(amount: number, currency: Currency) {
  const cur = currency === "PKR" ? "Rs." : currency;
  return `${cur}${amount.toLocaleString()}`;
}

export function formatTokens(tokens: number) {
  // show like app: "150k"
  if (tokens >= 1000) return `${Math.round(tokens / 1000)}k`;
  return `${tokens}`;
}

export function formatSubBookPrice(b: SubBook) {
  const parts: string[] = [];

  if (typeof b.tokenPrice === "number" && b.tokenPrice > 0) {
    parts.push(`${formatTokens(b.tokenPrice)}`);
  }
  if (typeof b.moneyPrice === "number" && b.moneyPrice > 0) {
    parts.push(`${formatMoney(b.moneyPrice, b.currency)}`);
  }

  if (!parts.length) return "—";
  if (parts.length === 1) return parts[0];
  return `${parts[0]} or ${parts[1]}`;
}

export function fileToObjectUrl(file?: File | null) {
  if (!file) return "";
  return URL.createObjectURL(file);
}

export function makeId(prefix: string) {
  // browser-safe uuid
  const anyCrypto = globalThis.crypto as any;
  const id =
    typeof anyCrypto?.randomUUID === "function"
      ? anyCrypto.randomUUID()
      : Math.random().toString(16).slice(2) + Date.now().toString(16);

  return `${prefix}_${id}`;
}