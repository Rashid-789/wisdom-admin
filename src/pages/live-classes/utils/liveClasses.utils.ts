
export function formatTimeRange(startIso: string, endIso: string) {
  const s = new Date(startIso);
  const e = new Date(endIso);
  const date = s.toLocaleDateString();
  const start = s.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const end = e.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return `${date} • ${start} - ${end}`;
}

export function toDatetimeLocal(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromDatetimeLocal(v: string) {
  // local time -> ISO
  const d = new Date(v);
  return d.toISOString();
}
