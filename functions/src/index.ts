import { randomInt } from "crypto";
import * as admin from "firebase-admin";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";

admin.initializeApp();

setGlobalOptions({ region: "us-central1" });

type UserRole = "student" | "teacher" | "admin" | "super_admin";
type UserStatus = "active" | "disabled" | "banned";

type CreateUserInput = {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  status: UserStatus;
  grade?: string | null;
  phone?: string | null;
  age?: string | number | null;
  gender?: string | null;
  verified?: boolean | null;
  avatarUrl?: string | null;
};

const ROLE_SET = new Set<UserRole>(["student", "teacher", "admin", "super_admin"]);
const STATUS_SET = new Set<UserStatus>(["active", "disabled", "banned"]);

function assertAdmin(auth: { uid: string; token: Record<string, unknown> } | null) {
  if (!auth) {
    throw new HttpsError("unauthenticated", "Authentication required.");
  }
  const role = String(auth.token.role ?? "");
  if (role !== "admin" && role !== "super_admin") {
    throw new HttpsError("permission-denied", "Admin access required.");
  }
}

function generatePassword(length = 12) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += chars[randomInt(0, chars.length)];
  }
  return out;
}

function normalizeLower(v: string) {
  return v.trim().toLowerCase();
}

function cleanDoc(obj: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  Object.entries(obj).forEach(([key, value]) => {
    if (value === undefined) return;
    if (value === "") {
      out[key] = null;
      return;
    }
    out[key] = value;
  });
  return out;
}

export const adminCreateUser = onCall(async (request) => {
  assertAdmin(request.auth);

  const input = request.data as CreateUserInput;
  if (!input?.name || !input?.email || !input?.role || !input?.status) {
    throw new HttpsError("invalid-argument", "Missing required fields.");
  }

  const role = input.role;
  const status = input.status;

  if (!ROLE_SET.has(role)) {
    throw new HttpsError("invalid-argument", "Invalid role.");
  }
  if (!STATUS_SET.has(status)) {
    throw new HttpsError("invalid-argument", "Invalid status.");
  }

  const email = normalizeLower(input.email);
  const displayName = input.name.trim();
  if (!displayName || !email) {
    throw new HttpsError("invalid-argument", "Name and email are required.");
  }

  const tempPassword = input.password?.trim() || generatePassword(12);

  const user = await admin.auth().createUser({
    email,
    password: tempPassword,
    displayName,
    disabled: status !== "active",
  });

  await admin.auth().setCustomUserClaims(user.uid, { role });

  const docRef = admin.firestore().collection("user").doc(user.uid);
  const payload = cleanDoc({
    uid: user.uid,
    email,
    name: displayName,
    nameLower: normalizeLower(displayName),
    emailLower: normalizeLower(email),
    role,
    status,
    grade: input.grade ?? null,
    phone: input.phone ?? null,
    age: input.age ?? null,
    gender: input.gender ?? null,
    verified: input.verified ?? null,
    avatarUrl: input.avatarUrl ?? null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    lastLoginAt: null,
    onboarded: false,
  });

  await docRef.set(payload, { merge: true });

  return {
    uid: user.uid,
    tempPassword: input.password ? undefined : tempPassword,
  };
});
