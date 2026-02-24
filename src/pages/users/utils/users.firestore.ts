import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import type { UserDetails, UserRow, UserRole, UserStatus } from "../Types/users.types";

function toIso(v: unknown): string | null {
  // Firestore Timestamp has toDate()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (v && typeof (v as any).toDate === "function") return (v as any).toDate().toISOString();
  if (typeof v === "string") return v;
  return null;
}

function asRole(v: unknown): UserRole {
  if (v === "student" || v === "teacher" || v === "admin" || v === "super_admin") return v;
  return "student"; // safe default for legacy docs
}

function asStatus(v: unknown): UserStatus {
  if (v === "active" || v === "disabled" || v === "banned") return v;
  return "active"; // safe default if missing
}

export function mapUserDocToRow(snap: QueryDocumentSnapshot<DocumentData>): UserRow {
  const d = snap.data();

  const createdAt = toIso(d.createdAt) ?? new Date(0).toISOString();
  const name = (d.name ?? d.displayName ?? null) as string | null;

  return {
    id: snap.id,
    uid: d.uid ?? snap.id,
    name,
    email: (d.email ?? "") as string,
    avatarUrl: (d.avatarUrl ?? d.photoURL ?? null) as string | null,
    role: asRole(d.role),
    status: asStatus(d.status),
    createdAt,
    grade: (d.grade ?? null) as string | null,
    verified: (d.verified ?? null) as boolean | null,
  };
}

export function mapUserDocToDetails(snap: QueryDocumentSnapshot<DocumentData>): UserDetails {
  const row = mapUserDocToRow(snap);
  const d = snap.data();

  return {
    ...row,
    phone: (d.phone ?? null) as string | null,
    gender: (d.gender ?? null) as string | null,
    age: (d.age ?? null) as string | number | null,
    avatarPath: (d.avatarPath ?? null) as string | null,
    onboarded: (d.onboarded ?? null) as boolean | null,
    lastLoginAt: toIso(d.lastLoginAt),
    updatedAt: toIso(d.updatedAt),
  };
}

export function normalizeLower(v: string) {
  return v.trim().toLowerCase();
}
