// publicUser.ts
//
// Every endpoint that returns "this is who's logged in" (login, /me,
// change-password) needs the exact same set of fields, and must NEVER
// include passwordHash. Centralizing this in one function means that
// rule is enforced in one place instead of trusted to be remembered
// correctly at every call site.

import type { User } from "@prisma/client";

export function toPublicUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    capabilities: user.capabilities,
    mustChangePassword: user.mustChangePassword,
  };
}