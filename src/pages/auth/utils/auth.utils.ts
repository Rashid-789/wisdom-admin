export function normalizeEmail(v: string) {
  return v.trim().toLowerCase();
}

export function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

