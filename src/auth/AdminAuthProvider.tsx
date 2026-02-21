/* eslint-disable react-refresh/only-export-components */
import React from "react";
import { onIdTokenChanged, signOut } from "firebase/auth";
import toast from "react-hot-toast";

import type { AuthSession, LoginInput } from "../pages/auth/Types/auth.types";
import { loginAdmin, logoutAdmin, sendAdminPasswordReset } from "../pages/auth/Api/auth.api";
import { auth } from "../app/utils/firebase";
import { buildAdminSession } from "./firebaseSession";

type AdminAuthContextValue = {
  loading: boolean;
  session: AuthSession | null;
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  sendReset: (email: string) => Promise<void>;
};

const AdminAuthContext = React.createContext<AdminAuthContextValue | null>(null);

const NOT_AUTHORIZED_ERROR = "Not authorized: admin access required";
const ACCESS_DENIED_MESSAGE =
  "Access denied: admin permissions required (Create admins/<uid> doc in Firestore)";
const TOAST_DEDUPE_WINDOW_MS = 1500;
const AUTH_OP_WINDOW_MS = 1500;

function isNotAuthorizedError(error: unknown) {
  return error instanceof Error && error.message === NOT_AUTHORIZED_ERROR;
}

function getErrorCode(error: unknown) {
  if (typeof error === "object" && error && "code" in error) {
    return String((error as { code?: string }).code);
  }
  return undefined;
}

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error && "message" in error) {
    return String((error as { message?: string }).message);
  }
  return undefined;
}

function withDevCode(message: string, code?: string) {
  if (import.meta.env.DEV && code) {
    return `${message} (code: ${code})`;
  }
  return message;
}

function getReadableAuthError(error: unknown) {
  if (isNotAuthorizedError(error)) return ACCESS_DENIED_MESSAGE;

  const code = getErrorCode(error);
  switch (code) {
    case "auth/invalid-api-key":
      return withDevCode(
        "Firebase API key is invalid. Check VITE_FIREBASE_API_KEY and restart dev server.",
        code
      );
    case "auth/unauthorized-domain":
      return withDevCode(
        "This domain is not authorized in Firebase Auth settings. Add it in Firebase Console → Auth → Settings → Authorized domains.",
        code
      );
    case "auth/operation-not-allowed":
      return withDevCode(
        "Email/password sign-in is disabled. Enable it in Firebase Console → Auth → Sign-in method.",
        code
      );
    case "auth/user-disabled":
      return withDevCode("This account is disabled in Firebase.", code);
    case "auth/invalid-argument":
      return withDevCode("Auth misconfiguration. Verify firebaseConfig values.", code);
    case "auth/internal-error":
      return withDevCode("Firebase internal error. Try again.", code);
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return withDevCode("Invalid email or password.", code);
    case "auth/invalid-email":
      return withDevCode("Please enter a valid email address.", code);
    case "auth/too-many-requests":
      return withDevCode("Too many attempts. Please try again later.", code);
    case "auth/network-request-failed":
      return withDevCode("Network error. Check your connection and try again.", code);
    case "permission-denied":
      return "Firestore rules are blocking admin verification. Ensure /admins/<uid> is readable and rules are published.";
    default:
      break;
  }

  const message = getErrorMessage(error);
  if (message) {
    return withDevCode(message, code);
  }

  return withDevCode("Unable to sign in. Please try again.", code);
}

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = React.useState(true);
  const [session, setSession] = React.useState<AuthSession | null>(null);
  const hasSessionRef = React.useRef(false);

  // Suppress listener work during explicit login/logout (prevents double checks + double toasts)
  const authOpRef = React.useRef(false);
  const authOpTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Simple toast dedupe (important for StrictMode + token-change cascades)
  const lastToastRef = React.useRef<{ msg: string; at: number }>({ msg: "", at: 0 });
  const toastOnce = React.useCallback((type: "success" | "error", msg: string) => {
    const now = Date.now();
    if (lastToastRef.current.msg === msg && now - lastToastRef.current.at < TOAST_DEDUPE_WINDOW_MS) {
      return;
    }
    lastToastRef.current = { msg, at: now };
    if (type === "success") {
      toast.success(msg);
    } else {
      toast.error(msg);
    }
  }, []);

  const markAuthOp = React.useCallback(() => {
    authOpRef.current = true;
    if (authOpTimerRef.current) {
      clearTimeout(authOpTimerRef.current);
    }
    authOpTimerRef.current = setTimeout(() => {
      authOpRef.current = false;
      authOpTimerRef.current = null;
    }, AUTH_OP_WINDOW_MS);
  }, []);

  React.useEffect(() => {
    const unsub = onIdTokenChanged(auth, async (fbUser) => {
      // If user signed out
      if (!fbUser) {
        setSession(null);
        hasSessionRef.current = false;
        setLoading(false);
        return;
      }

      // During manual login/logout, let the action handler own the flow
      if (authOpRef.current) return;

      setLoading(true);
      try {
        const s = await buildAdminSession(fbUser);
        setSession(s);
        if (!hasSessionRef.current) {
          toastOnce("success", "Welcome back, Admin");
        }
        hasSessionRef.current = true;
      } catch (error) {
        setSession(null);
        hasSessionRef.current = false;
        toastOnce("error", getReadableAuthError(error));

        try {
          markAuthOp();
          await signOut(auth);
        } catch {
          // ignore
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [markAuthOp, toastOnce]);

  const login = React.useCallback(async (input: LoginInput) => {
    setLoading(true);
    markAuthOp();
    try {
      const s = await loginAdmin(input); // includes admin verification
      setSession(s);
      hasSessionRef.current = true;
      toastOnce("success", "Logged in");
    } catch (error) {
      toastOnce("error", getReadableAuthError(error));
      throw error;
    } finally {
      setLoading(false);
    }
  }, [markAuthOp, toastOnce]);

  const logout = React.useCallback(async () => {
    setLoading(true);
    markAuthOp();
    try {
      await logoutAdmin();
      setSession(null);
      hasSessionRef.current = false;
      toastOnce("success", "Logged out");
    } finally {
      setLoading(false);
    }
  }, [markAuthOp, toastOnce]);

  const sendReset = React.useCallback(async (email: string) => {
    await sendAdminPasswordReset(email);
  }, []);

  const value: AdminAuthContextValue = { loading, session, login, logout, sendReset };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuthContext() {
  const ctx = React.useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuthContext must be used inside AdminAuthProvider");
  return ctx;
}

export { useAdminAuthContext as useAdminAuth };
