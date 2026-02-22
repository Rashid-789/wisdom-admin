export type UserRole = "student" | "teacher" | "admin" | "super_admin";
export type UserStatus = "active" | "disabled" | "banned";

export type UserRow = {
  id: string; // Firestore doc id (uid)
  uid?: string; // duplicate for clarity
  name: string | null;
  email: string;
  avatarUrl?: string | null; // ✅ added
  role: UserRole;
  status: UserStatus;
  createdAt: string; // ISO (mapped from Timestamp)
  grade?: string | null;
  verified?: boolean | null;
};

export type UsersListQuery = {
  role: Exclude<UserRole, "super_admin"> | "admin"; // UI tabs: student/teacher/admin
  page: number; // 1-based
  pageSize: number;
  search?: string;
  status?: "all" | UserStatus;
};

export type UsersListResponse = {
  rows: UserRow[];
  total: number;
};

export type UserDetails = UserRow & {
  phone?: string | null;
  gender?: string | null;
  age?: string | number | null;
  onboarded?: boolean | null;
  lastLoginAt?: string | null; // ISO
  updatedAt?: string | null; // ISO

  // Future (keep for later)
  enrollments?: { id: string; courseTitle: string; completionRate: number }[];
  progress?: { completionRate: number; watchMinutes: number };
  tokens?: { id: string; type: "earned" | "spent"; amount: number; note: string; at: string }[];
  purchases?: { id: string; item: string; amount: number; currency: string; at: string }[];

  assignedCourses?: { id: string; title: string }[];
  liveHosted?: { id: string; title: string; at: string; attendance: number }[];
};

export type UpsertUserInput = {
  name: string;
  email: string;
  role: Exclude<UserRole, "super_admin"> | "admin";
  status: UserStatus;
  grade?: string;
  verified?: boolean;
  phone?: string;
  avatarUrl?: string | null; // added
  age?: string | number;
  gender?: string;
};

export type AdminClaims = {
  isSuperAdmin: boolean;
};