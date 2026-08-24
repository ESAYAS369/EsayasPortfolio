export interface AdminUser {
  email: string;
  name: string;
  role: string;
}

export interface AuthResponse {
  success?: boolean;
  token?: string;
  user?: AdminUser;
  error?: string;
}

const TOKEN_KEY = "esayas_admin_token";
const USER_KEY = "esayas_admin_user";

type AuthListener = (user: AdminUser | null) => void;
const listeners: Set<AuthListener> = new Set();

function notifyListeners(user: AdminUser | null) {
  listeners.forEach((listener) => {
    try {
      listener(user);
    } catch (e) {
      console.error("Auth listener error:", e);
    }
  });
}

export function onAuthStateChanged(listener: AuthListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

export function getCurrentUser(): AdminUser | null {
  const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return Boolean(getStoredToken() && getCurrentUser());
}

export async function loginAdmin(
  identifier: string,
  password: string,
  rememberMe: boolean = true,
): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: identifier,
        password,
        rememberMe,
      }),
    });

    const data: AuthResponse = await res.json();

    if (!res.ok || !data.token || !data.user) {
      return {
        success: false,
        error: data.error || "Authentication failed. Please check your credentials.",
      };
    }

    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(TOKEN_KEY, data.token);
    storage.setItem(USER_KEY, JSON.stringify(data.user));

    notifyListeners(data.user);
    return { success: true, user: data.user };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Network error. Unable to reach authentication server.",
    };
  }
}

export async function verifyCurrentSession(): Promise<boolean> {
  const token = getStoredToken();
  if (!token) {
    logoutAdmin();
    return false;
  }

  try {
    const res = await fetch("/api/auth/verify", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      logoutAdmin();
      return false;
    }

    const data = await res.json();
    if (data.user) {
      // Update stored user details if needed
      const storage = localStorage.getItem(TOKEN_KEY) ? localStorage : sessionStorage;
      storage.setItem(USER_KEY, JSON.stringify(data.user));
    }
    return true;
  } catch (err) {
    // Keep local session if temporary network hiccup, but return true if user exists
    return Boolean(getCurrentUser());
  }
}

export async function logoutAdmin(): Promise<void> {
  const token = getStoredToken();
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);

  notifyListeners(null);

  if (token) {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // Ignore network errors during logout
    }
  }
}
