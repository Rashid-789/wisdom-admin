import type { AuthSession, LoginInput } from "../Types/auth.types";
import { clearSession, readSession, writeSession } from "../auth.storage";
import { normalizeEmail } from "../utils/auth.utils";

/**
 * Firebase mapping (later):
 * - login: signInWithEmailAndPassword(auth, email, password)
 * - session token: await user.getIdToken()
 * - role:
 *    - Custom Claims OR Firestore /users/{uid}.role
 * - forgot password: sendPasswordResetEmail(auth, email)
 */

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function loginAdmin(input: LoginInput): Promise<AuthSession> {
  await sleep(300);

  const email = normalizeEmail(input.email);
  const password = input.password;

  // Demo guard (replace with Firebase):
  if (email !== "admin@domain.com" || password !== "admin12345") {
    throw new Error("Invalid email or password");
  }

  const session: AuthSession = {
    token: "mock-token",
    user: {
      uid: "admin_1",
      email,
      displayName: "Admin",
      role: "admin",
      avatarUrl: null,
    },
  };

  writeSession(session);
  return session;
}

export async function logoutAdmin(): Promise<void> {
  await sleep(120);
  clearSession();
}

export async function sendAdminPasswordReset(email: string): Promise<void> {
  await sleep(250);

  // Firebase: sendPasswordResetEmail(auth, email)
  if (!email) throw new Error("Email is required");
}

export async function getCurrentSession(): Promise<AuthSession | null> {
  await sleep(80);
  return readSession();
}

