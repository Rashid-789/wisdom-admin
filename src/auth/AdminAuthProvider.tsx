import React from "react";
import type { AuthSession, LoginInput } from "../pages/auth/Types/auth.types";
import { getCurrentSession, loginAdmin, logoutAdmin, sendAdminPasswordReset } from "../pages/auth/Api/auth.api";

type AdminAuthContextValue = {
  loading: boolean;
  session: AuthSession | null;
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  sendReset: (email: string) => Promise<void>;
};

const AdminAuthContext = React.createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = React.useState(true);
  const [session, setSession] = React.useState<AuthSession | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const s = await getCurrentSession();
        setSession(s);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = React.useCallback(async (input: LoginInput) => {
    const s = await loginAdmin(input);
    setSession(s);
  }, []);

  const logout = React.useCallback(async () => {
    await logoutAdmin();
    setSession(null);
  }, []);

  const sendReset = React.useCallback(async (email: string) => {
    await sendAdminPasswordReset(email);
  }, []);

  const value: AdminAuthContextValue = { loading, session, login, logout, sendReset };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAdminAuthContext() {
  const ctx = React.useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuthContext must be used inside AdminAuthProvider");
  return ctx;
}

