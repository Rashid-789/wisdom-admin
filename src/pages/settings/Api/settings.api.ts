/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  ChangePasswordInput,
  NotificationPrefs,
  SettingsSnapshot,
  UpdateAccountInput,
} from "../Types/settings.types";
import { DEFAULT_SETTINGS } from "../mock-data/settings.mock";

import { auth, db, storage } from "../../../app/utils/firebase";

import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateEmail,
  updatePassword,
  updateProfile,
} from "firebase/auth";

import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";

import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";

function requireUser() {
  const u = auth.currentUser;
  if (!u) throw new Error("Not signed in");
  return u;
}

function normalizeUsername(v: string) {
  return v.trim().toLowerCase();
}

function safeFileName(name: string) {
  return name.replace(/[^\w.\-]+/g, "_");
}

function adminDoc(uid: string) {
  return doc(db, "admins", uid);
}

export async function getSettingsSnapshot(): Promise<SettingsSnapshot> {
  const u = requireUser();
  const uid = u.uid;

  const snap = await getDoc(adminDoc(uid));
  if (!snap.exists()) {
    throw new Error(`Admin profile missing. Create admins/${uid} in Firestore.`);
  }

  const admin = snap.data() as any;

  const email = u.email ?? admin?.email ?? DEFAULT_SETTINGS.account.email;
  const displayName =
    u.displayName ?? admin?.displayName ?? admin?.name ?? DEFAULT_SETTINGS.account.displayName;
  const avatarUrl = u.photoURL ?? admin?.avatarUrl ?? DEFAULT_SETTINGS.account.avatarUrl;

  const username =
    admin?.username ??
    normalizeUsername((email || "admin").split("@")[0]) ??
    DEFAULT_SETTINGS.account.username;

  const notifications: NotificationPrefs =
    admin?.notifications ?? DEFAULT_SETTINGS.notifications;

  return {
    account: {
      id: uid,
      email,
      displayName,
      username,
      avatarUrl: avatarUrl ?? null,
    },
    notifications,
  };
}

export async function updateAccount(input: UpdateAccountInput): Promise<void> {
  const u = requireUser();
  const uid = u.uid;

  const nextDisplayName = input.displayName.trim();
  const nextUsername = normalizeUsername(input.username);

  if (nextDisplayName.length < 2) throw new Error("Display name is too short.");
  if (nextUsername.length < 3) throw new Error("Username is too short.");

  // 1) Update Auth displayName (topbar)
  if ((u.displayName ?? "") !== nextDisplayName) {
    await updateProfile(u, { displayName: nextDisplayName });
  }

  // 2) Update admin doc
  await updateDoc(adminDoc(uid), {
    displayName: nextDisplayName,
    name: nextDisplayName,
    username: nextUsername,
    email: u.email ?? "",
    updatedAt: serverTimestamp(),
  });
}

export async function updateAccountEmail(params: {
  nextEmail: string;
  currentPassword?: string;
}): Promise<void> {
  const u = requireUser();
  const uid = u.uid;

  const nextEmail = params.nextEmail.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)) {
    throw new Error("Please enter a valid email.");
  }

  // Try without reauth first
  try {
    await updateEmail(u, nextEmail);
  } catch (err: any) {
    if (String(err?.code) === "auth/requires-recent-login") {
      if (!params.currentPassword) {
        // UI will open modal and retry with password
        const e = new Error("REAUTH_REQUIRED");
        (e as any).code = "auth/requires-recent-login";
        throw e;
      }

      const cred = EmailAuthProvider.credential(u.email ?? "", params.currentPassword);
      await reauthenticateWithCredential(u, cred);
      await updateEmail(u, nextEmail);
    } else {
      throw err;
    }
  }

  // Optional: email verification
  try {
    await sendEmailVerification(u);
  } catch {
    // ignore
  }

  // persist in admin doc
  await updateDoc(
    adminDoc(uid),
    { email: nextEmail, updatedAt: serverTimestamp() },
  );
}

export async function uploadAvatar(file: File): Promise<string> {
  const u = requireUser();
  const uid = u.uid;

  const allowed = ["image/png", "image/jpeg", "image/webp"];
  if (!allowed.includes(file.type)) throw new Error("Please upload PNG, JPG, or WEBP");
  const maxBytes = 3 * 1024 * 1024;
  if (file.size > maxBytes) throw new Error("Max file size is 3MB");

  // read current avatarPath (to delete old file)
  const pSnap = await getDoc(adminDoc(uid));
  const prevPath = pSnap.exists() ? String((pSnap.data() as any)?.avatarPath ?? "") : "";

  const path = `admin/profile/image/${uid}/${Date.now()}-${safeFileName(file.name)}`;
  const storageRef = ref(storage, path);

  // upload
  await uploadBytes(storageRef, file, { contentType: file.type });
  const url = await getDownloadURL(storageRef);

  // delete previous (best effort)
  if (prevPath) {
    try {
      await deleteObject(ref(storage, prevPath));
    } catch {
      // ignore
    }
  }

  // update auth + firestore
  await updateProfile(u, { photoURL: url });
  await updateDoc(
    adminDoc(uid),
    { avatarUrl: url, avatarPath: path, updatedAt: serverTimestamp() },
  );

  return url;
}

export async function deleteAvatar(): Promise<void> {
  const u = requireUser();
  const uid = u.uid;

  const pSnap = await getDoc(adminDoc(uid));
  const prevPath = pSnap.exists() ? String((pSnap.data() as any)?.avatarPath ?? "") : "";

  if (prevPath) {
    try {
      await deleteObject(ref(storage, prevPath));
    } catch {
      // ignore
    }
  }

  await updateProfile(u, { photoURL: null });
  await updateDoc(
    adminDoc(uid),
    { avatarUrl: null, avatarPath: null, updatedAt: serverTimestamp() },
  );
}

export async function requestPasswordReset(email: string): Promise<void> {
  const e = email.trim().toLowerCase();
  if (!e) throw new Error("Email missing");
  await sendPasswordResetEmail(auth, e);
}

export async function changePassword(input: ChangePasswordInput): Promise<void> {
  const u = requireUser();

  const currentPassword = input.currentPassword.trim();
  const newPassword = input.newPassword;

  if (newPassword.length < 8) throw new Error("Password must be at least 8 characters");
  if (!u.email) throw new Error("No email on auth user");

  const cred = EmailAuthProvider.credential(u.email, currentPassword);
  await reauthenticateWithCredential(u, cred);
  await updatePassword(u, newPassword);
}

export async function updateNotificationPrefs(prefs: NotificationPrefs): Promise<void> {
  const u = requireUser();
  const uid = u.uid;

  await updateDoc(
    adminDoc(uid),
    { notifications: prefs, updatedAt: serverTimestamp() },
  );
}
