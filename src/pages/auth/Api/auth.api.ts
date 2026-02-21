import { signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../../app/utils/firebase";

import type { AuthSession, LoginInput } from "../Types/auth.types";
import { normalizeEmail } from "../utils/auth.utils";
import { buildAdminSession } from "../../../auth/firebaseSession";

export async function loginAdmin(input: LoginInput): Promise<AuthSession> {
  const email = normalizeEmail(input.email);
  const password = input.password;

  let cred;
  try {
    cred = await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("[auth] login failed:", error);
    throw error;
  }

  try {
    return await buildAdminSession(cred.user);
  } catch (error) {
    await signOut(auth);
    throw error;
  }
}

export async function logoutAdmin(): Promise<void> {
  await signOut(auth);
}

export async function sendAdminPasswordReset(email: string): Promise<void> {
  const e = normalizeEmail(email);
  if (!e) throw new Error("Email is required");
  await sendPasswordResetEmail(auth, e);
}
