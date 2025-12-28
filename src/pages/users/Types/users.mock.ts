
import type { UserDetails, UserRole, UserStatus } from "./users.types";

function iso(d: Date) {
  return d.toISOString();
}

let USERS: UserDetails[] = [
  {
    id: "u1",
    name: "John Doe",
    email: "john@example.com",
    role: "student",
    status: "active",
    createdAt: iso(new Date(Date.now() - 1000 * 60 * 60 * 24 * 40)),
    grade: "Grade 8",
    progress: { completionRate: 62, watchMinutes: 8200 },
    enrollments: [
      { id: "e1", courseTitle: "Applied Mathematics", completionRate: 73 },
      { id: "e2", courseTitle: "Physics", completionRate: 55 },
    ],
    tokens: [
      { id: "t1", type: "earned", amount: 120, note: "Completed Topic 1", at: iso(new Date(Date.now() - 1000 * 60 * 60 * 5)) },
      { id: "t2", type: "spent", amount: 30, note: "Unlocked exercise", at: iso(new Date(Date.now() - 1000 * 60 * 60 * 3)) },
    ],
    purchases: [
      { id: "p1", item: "Applied Mathematics Book", amount: 1500, currency: "PKR", at: iso(new Date(Date.now() - 1000 * 60 * 60 * 24 * 2)) },
    ],
  },
   {
    id: "u1",
    name: "Tester John",
    email: "tester@example.com",
    role: "student",
    status: "active",
    createdAt: iso(new Date(Date.now() - 1000 * 60 * 60 * 24 * 40)),
    grade: "Grade 8",
    progress: { completionRate: 62, watchMinutes: 8200 },
    enrollments: [
      { id: "e1", courseTitle: "Applied Mathematics", completionRate: 73 },
      { id: "e2", courseTitle: "Physics", completionRate: 55 },
    ],
    tokens: [
      { id: "t1", type: "earned", amount: 120, note: "Completed Topic 1", at: iso(new Date(Date.now() - 1000 * 60 * 60 * 5)) },
      { id: "t2", type: "spent", amount: 30, note: "Unlocked exercise", at: iso(new Date(Date.now() - 1000 * 60 * 60 * 3)) },
    ],
    purchases: [
      { id: "p1", item: "Applied Mathematics Book", amount: 1500, currency: "PKR", at: iso(new Date(Date.now() - 1000 * 60 * 60 * 24 * 2)) },
    ],
  },
  {
    id: "u2",
    name: "Ms. Fatima",
    email: "fatima@example.com",
    role: "teacher",
    status: "active",
    createdAt: iso(new Date(Date.now() - 1000 * 60 * 60 * 24 * 120)),
    verified: true,
    assignedCourses: [{ id: "c1", title: "Physics" }],
    liveHosted: [{ id: "l1", title: "Motion & Forces Live", at: iso(new Date(Date.now() - 1000 * 60 * 60 * 24 * 1)), attendance: 64 }],
  },
   {
    id: "u2",
    name: "Mr. tester",
    email: "tester@example.com",
    role: "teacher",
    status: "active",
    createdAt: iso(new Date(Date.now() - 1000 * 60 * 60 * 24 * 120)),
    verified: true,
    assignedCourses: [{ id: "c1", title: "Physics" }],
    liveHosted: [{ id: "l1", title: "Motion & Forces Live", at: iso(new Date(Date.now() - 1000 * 60 * 60 * 24 * 1)), attendance: 64 }],
  },
  {
    id: "u3",
    name: "Admin One",
    email: "admin@domain.com",
    role: "admin",
    status: "active",
    createdAt: iso(new Date(Date.now() - 1000 * 60 * 60 * 24 * 365)),
  },
];

export function listUsers(role: UserRole) {
  return USERS.filter((u) => u.role === role);
}

export function getUserById(id: string) {
  return USERS.find((u) => u.id === id) ?? null;
}

export function createUser(user: UserDetails) {
  USERS = [user, ...USERS];
  return user;
}

export function updateUser(id: string, patch: Partial<UserDetails>) {
  const idx = USERS.findIndex((u) => u.id === id);
  if (idx < 0) return null;
  USERS[idx] = { ...USERS[idx], ...patch };
  return USERS[idx];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function resetPassword(_id: string) {
  return true;
}

export function setUserStatus(id: string, status: UserStatus) {
  return updateUser(id, { status });
}
