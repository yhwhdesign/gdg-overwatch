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
  // Broad administrative access — initially given to the seeded first
  // user. Real fine-grained admin capabilities get split out as the
  // permission model matures past this initial foundation.
  ADMIN: "admin",
} as const;

// A convenience bundle for the very first user created by the seed
// script — full access, since there's no one else yet to have granted
// them anything more specific.
export const ADMIN_CAPABILITIES: string[] = [CAPABILITIES.ADMIN];