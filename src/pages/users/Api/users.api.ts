/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  updateDoc,
  where,
  serverTimestamp,
} from "firebase/firestore";
import type { FirebaseError } from "firebase/app";

import { db } from "../../../app/utils/firebase";
import type {
  UpsertUserInput,
  UserDetails,
  UsersListQuery,
  UsersListResponse,
  UserStatus,
} from "../Types/users.types";
import { mapUserDocToDetails, mapUserDocToRow, normalizeLower } from "../utils/users.firestore";

const USERS_COLLECTION = "user"; 

function friendlyFirebaseError(err: unknown) {
  const e = err as FirebaseError;
  if (e?.code === "failed-precondition") {
    return "Query failed. Please try again.";
  }
  if (e?.code === "permission-denied") {
    return "Permission denied. Check Firestore rules (admin role required).";
  }
  return e?.message ?? "Something went wrong.";
}

export async function getUsersList(q: UsersListQuery, signal?: AbortSignal): Promise<UsersListResponse> {
  if (signal?.aborted) throw new DOMException("Request aborted", "AbortError");

  const colRef = collection(db, USERS_COLLECTION);

  try {
    const fetchLimit = Math.min(200, Math.max(1, q.page * q.pageSize * 3));
    const listQuery = query(
      colRef,
      where("role", "==", "student"),
      limit(fetchLimit),
    );

    const snap = await getDocs(listQuery);
    if (signal?.aborted) throw new DOMException("Request aborted", "AbortError");

    let all = snap.docs.map(mapUserDocToRow);

    const status = q.status ?? "all";
    if (status !== "all") {
      all = all.filter((row) => row.status === status);
    }

    const search = q.search?.trim();
    if (search) {
      const s = normalizeLower(search);
      all = all.filter((row) => {
        const name = row.name ? normalizeLower(row.name) : "";
        const email = normalizeLower(row.email ?? "");
        return name.includes(s) || email.includes(s);
      });
    }

    const toMs = (iso: string) => {
      const t = Date.parse(iso);
      return Number.isNaN(t) ? 0 : t;
    };

    all.sort((a, b) => toMs(b.createdAt) - toMs(a.createdAt));

    const total = all.length;
    const start = (q.page - 1) * q.pageSize;
    const end = start + q.pageSize;
    const rows = all.slice(start, end);

    return { rows, total };
  } catch (err) {
    throw new Error(friendlyFirebaseError(err));
  }
}

export async function getUserDetails(id: string, signal?: AbortSignal): Promise<UserDetails> {
  if (signal?.aborted) throw new DOMException("Request aborted", "AbortError");

  try {
    const ref = doc(db, USERS_COLLECTION, id);
    const snap = await getDoc(ref);

    if (signal?.aborted) throw new DOMException("Request aborted", "AbortError");
    if (!snap.exists()) throw new Error("User not found");

    // Convert to QueryDocumentSnapshot shape for mapper
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fake = { id: snap.id, data: () => snap.data() } as any;

    return mapUserDocToDetails(fake);
  } catch (err) {
    throw new Error(friendlyFirebaseError(err));
  }
}

/**
 *  For now we DISABLE create user from client.
 * Reason: Creating Auth users + claims must be done via Cloud Functions (Admin SDK).
 * Later: implement callable function `adminCreateUser`.
 */
export async function createUserApi(_input: UpsertUserInput): Promise<UserDetails> {
  throw new Error("Add User is disabled for now. Enable via Cloud Function (adminCreateUser).");
}

/**
 * Allow safe profile edits in Firestore (name/phone/grade/avatar/status/etc).
 *  Role change is disabled in client (needs claims update via Cloud Function).
 */
export async function updateUserApi(id: string, input: Partial<UpsertUserInput>): Promise<UserDetails> {
  if ("role" in input) {
    throw new Error("Role change requires Cloud Function (updates custom claims).");
  }

  try {
    const ref = doc(db, USERS_COLLECTION, id);

    const patch: Record<string, unknown> = {
      ...input,
      updatedAt: serverTimestamp(),
    };

    // Maintain search fields for future prefix search
    if (typeof input.name === "string") patch.nameLower = normalizeLower(input.name);
    if (typeof input.email === "string") patch.emailLower = normalizeLower(input.email);

    await updateDoc(ref, patch);

    return await getUserDetails(id);
  } catch (err) {
    throw new Error(friendlyFirebaseError(err));
  }
}

/**
 *  Status update in Firestore only (Auth disable/ban will be later via Cloud Function).
 */
export async function setUserStatusApi(id: string, status: UserStatus): Promise<void> {
  try {
    const ref = doc(db, USERS_COLLECTION, id);
    await updateDoc(ref, { status, updatedAt: serverTimestamp() });
  } catch (err) {
    throw new Error(friendlyFirebaseError(err));
  }
}

/**
 * Admin reset password for another user must be Cloud Function (Admin SDK).
 * Keep placeholder for future.
 */
export async function resetUserPasswordApi(_id: string): Promise<void> {
  throw new Error("Reset password requires Cloud Function (adminResetPassword).");
}
