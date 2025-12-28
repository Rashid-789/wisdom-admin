
import type {
  UpsertUserInput,
  UserDetails,
  UsersListQuery,
  UsersListResponse,
} from "../Types/users.types";
import {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  resetPassword,
  setUserStatus,
} from "../Types/users.mock";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function getUsersList(q: UsersListQuery, signal?: AbortSignal): Promise<UsersListResponse> {
  await sleep(250);
  if (signal?.aborted) throw new DOMException("Request aborted", "AbortError");

  let rows = listUsers(q.role);

  if (q.search) {
    const s = q.search.trim().toLowerCase();
    rows = rows.filter((u) => u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s));
  }

  if (q.status && q.status !== "all") {
    rows = rows.filter((u) => u.status === q.status);
  }

  const total = rows.length;
  const start = (q.page - 1) * q.pageSize;
  const end = start + q.pageSize;
  const paged = rows.slice(start, end);

  return { rows: paged, total };
}

export async function getUserDetails(id: string, signal?: AbortSignal): Promise<UserDetails> {
  await sleep(220);
  if (signal?.aborted) throw new DOMException("Request aborted", "AbortError");

  const u = getUserById(id);
  if (!u) throw new Error("User not found");
  return u;
}

export async function createUserApi(input: UpsertUserInput): Promise<UserDetails> {
  await sleep(220);

  const now = new Date().toISOString();
  const newUser: UserDetails = {
    id: `u_${Math.random().toString(16).slice(2)}`,
    name: input.name,
    email: input.email,
    role: input.role,
    status: input.status,
    createdAt: now,
    grade: input.grade,
    verified: input.verified,
    phone: input.phone,
  };

  return createUser(newUser);
}

export async function updateUserApi(id: string, input: Partial<UpsertUserInput>): Promise<UserDetails> {
  await sleep(220);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updated = updateUser(id, input as any);
  if (!updated) throw new Error("User not found");
  return updated;
}

export async function resetUserPasswordApi(id: string): Promise<void> {
  await sleep(200);
  resetPassword(id);
}

export async function setUserStatusApi(id: string, status: "active" | "disabled" | "banned"): Promise<void> {
  await sleep(200);
  const updated = setUserStatus(id, status);
  if (!updated) throw new Error("User not found");
}
