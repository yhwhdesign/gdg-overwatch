// lib/users.ts
//
// API calls for admin user management. Kept separate from lib/api.ts
// (the generic fetch wrapper) so each domain area of the app has its
// own small, readable file of "what calls exist and what they return,"
// rather than one giant api.ts growing indefinitely as features are
// added.

import { apiFetch } from "./api";

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  capabilities: string[];
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: string;
};

export type NewUserResult = {
  id: string;
  email: string;
  name: string;
  capabilities: string[];
  temporaryPassword: string; // only ever present in THIS response — never returned again
};

export function listUsers(): Promise<AdminUser[]> {
  return apiFetch<AdminUser[]>("/api/users");
}

export function createUser(input: { email: string; name: string; capabilities: string[] }): Promise<NewUserResult> {
  return apiFetch<NewUserResult>("/api/users", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function setUserActive(id: string, isActive: boolean): Promise<AdminUser> {
  return apiFetch<AdminUser>(`/api/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
}

// Only callable by a MASTER user — the backend enforces this
// independently (see routes/users.ts's isMaster check); this function
// just makes the call, it doesn't decide whether the caller is allowed
// to make it.
export function setUserCapabilities(id: string, capabilities: string[]): Promise<AdminUser> {
  return apiFetch<AdminUser>(`/api/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ capabilities }),
  });
}