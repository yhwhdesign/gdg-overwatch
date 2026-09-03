// lib/api.ts
//
// A thin wrapper around fetch() so every API call in the app
// consistently does two things without having to remember them each
// time:
//
//   1. Sends cookies (credentials: "include") — without this, the
//      browser would NOT send our session cookie along with the
//      request, and every call would look logged-out even right after
//      a successful login.
//   2. Parses the JSON response and throws a real Error with the
//      server's message on failure, so calling code can just try/catch
//      instead of manually checking res.ok every time.

const API_BASE = ""; // same-origin: Vite's dev proxy (see vite.config.ts) forwards /api/* to the backend locally, and vercel.json does the same in production

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include", // always send the session cookie
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  // 204 No Content has no body to parse.
  const data = res.status === 204 ? null : await res.json().catch(() => null);

  if (!res.ok) {
    const message = (data && (data as { error?: string }).error) || `Request failed (${res.status})`;
    throw new ApiError(message, res.status);
  }

  return data as T;
}