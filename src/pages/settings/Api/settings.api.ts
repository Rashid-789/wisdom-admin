import type {
  ChangePasswordInput,
  NotificationPrefs,
  SettingsSnapshot,
  UpdateAccountInput,
} from "../Types/settings.types";
import { DEFAULT_SETTINGS } from "../mock-data/settings.mock";

const LS_KEY = "wisdom_admin_settings_v1";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function loadFromStorage(): SettingsSnapshot {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as SettingsSnapshot) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveToStorage(snapshot: SettingsSnapshot) {
  localStorage.setItem(LS_KEY, JSON.stringify(snapshot));
}

/**
 * Firebase mapping (later):
 * - account:
 *   - Firebase Auth: displayName, photoURL, email
 *   - Firestore: username, role, etc
 * - avatar:
 *   - Firebase Storage upload (profiles/admins/{uid}/avatar.webp)
 */
export async function getSettingsSnapshot(): Promise<SettingsSnapshot> {
  await sleep(120);
  return loadFromStorage();
}

export async function updateAccount(input: UpdateAccountInput): Promise<void> {
  await sleep(180);
  const snap = loadFromStorage();
  const next = {
    ...snap,
    account: {
      ...snap.account,
      displayName: input.displayName.trim(),
      username: input.username.trim(),
    },
  };
  saveToStorage(next);
}

export async function uploadAvatar(file: File): Promise<string> {
  await sleep(250);

  // In real Firebase: upload to Storage and return downloadURL.
  // Here we just create an object URL for local preview persistence.
  const url = URL.createObjectURL(file);

  const snap = loadFromStorage();
  const next = { ...snap, account: { ...snap.account, avatarUrl: url } };
  saveToStorage(next);

  return url;
}

export async function deleteAvatar(): Promise<void> {
  await sleep(160);
  const snap = loadFromStorage();
  const next = { ...snap, account: { ...snap.account, avatarUrl: null } };
  saveToStorage(next);
}

export async function requestPasswordReset(email: string): Promise<void> {
  await sleep(200);
  // Firebase later: sendPasswordResetEmail(auth, email)
  // Here: mock only
  if (!email) throw new Error("Email missing");
}

export async function changePassword(input: ChangePasswordInput): Promise<void> {
  await sleep(240);
  // Firebase later:
  // - reauthenticateWithCredential
  // - updatePassword(auth.currentUser, input.newPassword)
  if (input.newPassword.length < 8) throw new Error("Password must be at least 8 characters");
}

export async function updateNotificationPrefs(prefs: NotificationPrefs): Promise<void> {
  await sleep(160);
  const snap = loadFromStorage();
  const next = { ...snap, notifications: prefs };
  saveToStorage(next);
}

