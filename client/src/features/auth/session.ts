import type { AuthSession } from "./types";

const AUTH_STORAGE_KEY = "auth_data";

export function clearSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function readSession(): AuthSession | null {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;

  try {
    const value: unknown = JSON.parse(raw);
    if (
      !value ||
      typeof value !== "object" ||
      typeof (value as Partial<AuthSession>).token !== "string" ||
      typeof (value as Partial<AuthSession>).userId !== "number" ||
      typeof (value as Partial<AuthSession>).expiry !== "number"
    ) {
      clearSession();
      return null;
    }

    const session = value as AuthSession;
    if (Date.now() >= session.expiry) {
      clearSession();
      return null;
    }

    return session;
  } catch {
    clearSession();
    return null;
  }
}

export function saveSession(token: string, userId: number) {
  const session: AuthSession = {
    token,
    userId,
    expiry: Date.now() + 7 * 24 * 60 * 60 * 1000,
  };
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}
