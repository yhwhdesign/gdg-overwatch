// passwords.ts
//
// Wraps bcrypt so the rest of the app never touches password hashing
// directly. That matters for consistency (one hashing cost factor,
// defined once) and for the "never log secrets" rule — plain-text
// passwords should only ever exist as a function argument here, never
// stored, logged, or passed around elsewhere in the codebase.

import bcrypt from "bcrypt";

// The "cost factor" — how many times bcrypt internally repeats its
// hashing work. Higher = slower to compute = harder to brute-force, but
// also slower for real logins. 12 is a widely used, current-generation
// default that balances security against login speed reasonably well
// on typical server hardware (each hash takes roughly a few hundred
// milliseconds, imperceptible to a real user logging in, but expensive
// at the scale an attacker would need to try millions of guesses).
const BCRYPT_COST_FACTOR = 12;

export async function hashPassword(plainTextPassword: string): Promise<string> {
  return bcrypt.hash(plainTextPassword, BCRYPT_COST_FACTOR);
}

export async function verifyPassword(
  plainTextPassword: string,
  storedHash: string
): Promise<boolean> {
  return bcrypt.compare(plainTextPassword, storedHash);
}