// tempPassword.ts
//
// Generates a temporary password for an admin-created account. Uses
// the same cryptographically secure random source as session tokens
// (see sessions.ts) — NOT Math.random(), which is predictable and
// unsuitable for anything security-related.
//
// base64url encoding keeps the result URL/text-safe (no characters
// that are awkward to read aloud or paste) while still being long
// enough to be secure for the short window it exists before the user
// changes it.

import crypto from "crypto";

export function generateTemporaryPassword(): string {
  return crypto.randomBytes(9).toString("base64url"); // 12 characters
}