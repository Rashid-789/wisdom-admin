/* eslint-disable @typescript-eslint/no-explicit-any */
export type AdminUser = {
  name(name: any): import("react").ReactNode;
  uid: string;
  email: string;
  displayName: string;
  role: "admin" | "super_admin";
  avatarUrl?: string | null;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type AuthSession = {
  user: AdminUser;
  token: string;
};

