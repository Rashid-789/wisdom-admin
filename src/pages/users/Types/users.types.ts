
export type UserRole = "student" | "teacher" | "admin";
export type UserStatus = "active" | "disabled" | "banned";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string; // ISO
  grade?: string; // student
  verified?: boolean; // teacher
};

export type UsersListQuery = {
  role: UserRole;
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
  phone?: string;
  bio?: string;

  // Student-only
  enrollments?: { id: string; courseTitle: string; completionRate: number }[];
  progress?: { completionRate: number; watchMinutes: number };
  tokens?: { id: string; type: "earned" | "spent"; amount: number; note: string; at: string }[];
  purchases?: { id: string; item: string; amount: number; currency: string; at: string }[];

  // Teacher-only
  assignedCourses?: { id: string; title: string }[];
  liveHosted?: { id: string; title: string; at: string; attendance: number }[];
};

export type UpsertUserInput = {
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  grade?: string;
  verified?: boolean;
  phone?: string;
};

export type AdminClaims = {
  isSuperAdmin: boolean;
};
