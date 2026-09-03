// capabilities.ts
//
// Every capability string used anywhere in the app is defined here,
// once, as a named constant. This is purely to avoid typos: if you
// write requireCapability("jobs:edit_stauts") by hand somewhere, that
// silently creates a permission nobody has, instead of failing loudly.
// Using CAPABILITIES.JOBS_EDIT_STATUS everywhere means a typo is a
// TypeScript compile error instead of a runtime bug someone discovers
// weeks later.
//
// This list starts small (just what Phase 2 needs) and grows as real
// features are built — we don't invent capabilities for features that
// don't exist yet.

export const CAPABILITIES = {
  // Can manage users (create, activate/deactivate) and satisfies any
  // ordinary capability check, but CANNOT change anyone's capabilities
  // — that's reserved for MASTER. See middleware.ts's requireCapability
  // for exactly how this hierarchy is enforced.
  ADMIN: "admin",

  // Sits above ADMIN. The only capability that can assign or change
  // capabilities on any user (including granting/revoking ADMIN or
  // MASTER itself). This split exists specifically so that an admin
  // can run day-to-day user management without being able to grant
  // themselves or anyone else more access than they were given.
  MASTER: "master",
} as const;

// A convenience bundle for the very first user created by the seed
// script — this MUST be MASTER, not ADMIN: if the first user were only
// ADMIN, there would be no way for anyone to ever become MASTER
// afterward, since only MASTER can assign capabilities.
export const MASTER_CAPABILITIES: string[] = [CAPABILITIES.MASTER];