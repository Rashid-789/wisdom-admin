import React from "react";

export type AdminUser = {
  name: string;
  email: string;
  avatarUrl?: string;
};

const AUTH_STORAGE_KEY = "wisdom_admin_auth";

/**
 * Placeholder session hook.
 * Later replace internals with Firebase auth + custom claims.
 */
export function useAdminSession() {
  const [user] = React.useState<AdminUser>({
    name: "Admin",
    email: "admin@domain.com",
  });

  const logout = async () => {
    // Later: firebase signOut(auth)
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  return { user, logout };
}
