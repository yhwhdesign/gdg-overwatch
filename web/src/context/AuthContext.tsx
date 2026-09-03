// context/AuthContext.tsx
//
// Makes "who is currently logged in, if anyone" available anywhere in
// the app via a single hook (useAuth()), instead of every component
// having to independently call /api/auth/me.
//
// On first load, this checks whether a valid session already exists
// (e.g. the user refreshed the page, or came back the next day within
// the 7-day session window) by calling GET /api/auth/me — this is what
// makes "staying logged in" work at all, since otherwise every page
// refresh would look like a fresh, logged-out visit.

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { apiFetch, ApiError } from "../lib/api";

type AuthUser = {
  id: string;
  email: string;
  name: string;
  capabilities: string[];
  mustChangePassword: boolean;
};

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean; // true only during the initial "do we have a session already" check
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (args: { currentPassword?: string; newPassword: string }) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiFetch<AuthUser>("/api/auth/me")
      .then(setUser)
      .catch(() => {
        // A 401 here just means "not logged in yet" — completely normal
        // for a first-time visitor, not an error worth surfacing.
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function login(email: string, password: string) {
    // Let ApiError propagate up to the caller (the login form) so it
    // can show the actual error message ("Invalid email or password")
    // next to the form fields.
    const loggedInUser = await apiFetch<AuthUser>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setUser(loggedInUser);
  }

    async function logout() {
    await apiFetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }

  async function changePassword(args: { currentPassword?: string; newPassword: string }) {
    const updatedUser = await apiFetch<AuthUser>("/api/auth/change-password", {
      method: "POST",
      body: JSON.stringify(args),
    });
    setUser(updatedUser);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside an <AuthProvider>");
  }
  return ctx;
}

export { ApiError };