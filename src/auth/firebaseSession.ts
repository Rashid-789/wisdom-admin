import type { User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import type { AuthSession } from "../pages/auth/Types/auth.types";
import { db } from "../app/utils/firebase";

export type AdminRole = "admin" | "super_admin";

export function isAdminRole(v: unknown): v is AdminRole {
  return v === "admin" || v === "super_admin";
}

export async function buildAdminSession(user: User): Promise<AuthSession> {
  const email = user.email ?? "";
  if (!email) throw new Error("Auth user has no email");

  // DO NOT force refresh here (can cause extra token-change events)
  const idTokenResult = await user.getIdTokenResult();
  const roleFromClaims = (idTokenResult.claims as Record<string, unknown>)?.role;

  let role: AdminRole | undefined = isAdminRole(roleFromClaims)
    ? (roleFromClaims as AdminRole)
    : undefined;

  if (!role) {
    try {
      const directSnap = await getDoc(doc(db, "admins", user.uid));
      if (directSnap.exists()) {
        const data = directSnap.data() as { role?: unknown } | undefined;
        if (isAdminRole(data?.role)) {
          role = data!.role as AdminRole;
        }
      } else if (import.meta.env.DEV) {
        console.warn(`[admin] Missing admin registry doc: user/${user.uid}`);
      }
    } catch (error) {
      if (typeof error === "object" && error && "code" in error) {
        const code = String((error as { code?: string }).code);
        if (code === "permission-denied") {
          throw new Error(
            "Firestore rules are blocking admin verification. Ensure /admins/<uid> is readable and rules are published."
          );
        }
      }
      throw error;
    }
  }

  if (!role) {
    throw new Error("Not authorized: admin access required");
  }

  return {
    token: idTokenResult.token,
    user: {
      uid: user.uid,
      email,
      displayName: user.displayName ?? "Admin",
      role,
      avatarUrl: user.photoURL ?? null,
    },
  };
}
