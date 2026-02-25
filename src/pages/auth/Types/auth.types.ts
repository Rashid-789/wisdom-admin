export type AdminUser = {
  uid: string;
  email: string;
  name: string;
  displayName?: string;
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
