// sessions.ts
//
// Everything related to creating, checking, and destroying a login
// session. This is the heart of the "server-side sessions instead of
// JWT" decision logged in PROJECT_STATE.md: a session is just a random,
// unguessable string stored both in the database and in the user's
// browser cookie. To check if someone is logged in, we look up that
// string in the database. To log someone out immediately (e.g. they
// were terminated), we delete the row — there's no token floating
// around that keeps working until it "expires" on its own.

import crypto from "crypto";
import { prisma } from "../db";

// How long a session lasts before it needs a fresh login. 7 days is a
// reasonable balance for a work tool used daily — long enough that
// technicicans aren't annoyed by frequent re-logins, short enough that
// a lost/stolen device's access window is bounded. We can revisit this
// once real usage patterns exist.
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// The cookie name the session token is stored under in the browser.
export const SESSION_COOKIE_NAME = "overwatch_session";

// Generates a long, cryptographically random token — NOT something
// predictable like a counter or a timestamp. crypto.randomBytes uses
// the operating system's secure random number generator, which is what
// makes this unguessable even by someone who knows how our code works.
function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// Creates a new session row for a user and returns the token to set as
// a cookie. Called once, at successful login.
export async function createSession(userId: string): Promise<{ token: string; expiresAt: Date }> {
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await prisma.session.create({
    data: { token, userId, expiresAt },
  });

  return { token, expiresAt };
}

// Looks up a session token and returns the associated user, or null if
// the token doesn't exist, has expired, or belongs to a deactivated
// user. This is called on every request to a protected route (see
// middleware.ts), so it's kept to a single, simple database query.
export async function getUserForSessionToken(token: string) {
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session) return null;

  // Expired sessions are treated as if they don't exist, even though
  // the row technically still exists until a cleanup job removes it.
  // (A scheduled cleanup of expired session rows is a small
  // housekeeping task we can add later — it's not a correctness
  // requirement right now, just tidiness.)
  if (session.expiresAt < new Date()) return null;

  // A deactivated user (isActive: false) is blocked immediately, even
  // if their session hasn't technically expired yet — this is what
  // makes "cut off someone's access right now" actually work, not just
  // "wait up to 7 days."
  if (!session.user.isActive) return null;

  return session.user;
}

// Deletes a session — called at logout. Deleting (not just marking
// inactive) keeps the sessions table from growing unbounded with dead
// rows.
export async function deleteSession(token: string): Promise<void> {
  await prisma.session.delete({ where: { token } }).catch(() => {
    // If the token was already deleted/never existed, that's fine —
    // logging out someone who's already logged out isn't an error.
  });
}