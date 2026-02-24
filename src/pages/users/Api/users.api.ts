/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import type { FirebaseError } from "firebase/app";
import { httpsCallable } from "firebase/functions";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";

import { db, functions, storage } from "../../../app/utils/firebase";
import type {
  UpsertUserInput,
  UserDetails,
  UsersListQuery,
  UsersListResponse,
  UserStatus,
} from "../Types/users.types";
import { mapUserDocToDetails, mapUserDocToRow, normalizeLower } from "../utils/users.firestore";

const USERS_COLLECTION = "user"; 

const NULLIFY_FIELDS = new Set([
  "grade",
  "phone",
  "avatarUrl",
  "avatarPath",
  "verified",
  "gender",
  "age",
]);

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

function cleanFirestorePatch(obj: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  Object.entries(obj).forEach(([key, value]) => {
    if (value === undefined) return;
    if (value === "" && NULLIFY_FIELDS.has(key)) {
      out[key] = null;
      return;
    }
    out[key] = value;
  });
  return out;
}

export async function getUsersList(q: UsersListQuery, signal?: AbortSignal): Promise<UsersListResponse> {
  if (signal?.aborted) throw new DOMException("Request aborted", "AbortError");

  const colRef = collection(db, USERS_COLLECTION);

  try {
    const fetchLimit = Math.min(200, Math.max(1, q.page * q.pageSize * 3));
    const listQuery = query(
      colRef,
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

export async function createUserApi(
  _input: UpsertUserInput & { password?: string }
): Promise<{ uid: string; tempPassword?: string }> {
  // Create via Cloud Function (Admin SDK) so Auth user + claims are set correctly.
  const input = _input as UpsertUserInput & { password?: string };
  try {
    const callable = httpsCallable(functions, "adminCreateUser");
    const res = await callable(input);
    const data = res.data as { uid: string; tempPassword?: string };
    return data;
  } catch (err) {
    throw new Error(friendlyFirebaseError(err));
  }
}

export async function uploadUserAvatar(params: {
  file: File;
  userId: string;
}): Promise<{ url: string; path: string }> {
  const { file, userId } = params;
  const safeName = file.name.replace(/\s+/g, "-");
  const path = `users/profile/image/${userId}/${Date.now()}-${safeName}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return { url, path };
}

export async function deleteUserAvatar(path: string): Promise<void> {
  if (!path) return;
  try {
    await deleteObject(ref(storage, path));
  } catch {
    // best-effort
  }
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

    const patch = cleanFirestorePatch({ ...input });

    // Maintain search fields for future prefix search
    if (typeof input.name === "string") patch.nameLower = normalizeLower(input.name);
    if (typeof input.email === "string") patch.emailLower = normalizeLower(input.email);

    patch.updatedAt = serverTimestamp();

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
    const patch = cleanFirestorePatch({ status, updatedAt: serverTimestamp() });
    await updateDoc(ref, patch);
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
