export interface AuthUser {
  id: string;
  email: string;
  name: string;
  targetRole: string;
  experienceLevel: string;
  avatar: string;
  token?: string;
  createdAt?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
  targetRole?: string;
  experienceLevel?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  error?: string;
  user?: AuthUser;
  token?: string;
}

const STORAGE_KEY = 'edupath_auth_user';

/**
 * Sign in using email and password via backend proxy
 */
export async function loginWithEmail(email: string, password: string): Promise<AuthResponse> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Failed to sign in' };
    }

    if (data.user) {
      storeAuthUser(data.user, data.token);
    }

    return {
      success: true,
      user: data.user,
      token: data.token,
      message: data.message
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Unable to connect to authentication server'
    };
  }
}

/**
 * Register a new user account with email via backend proxy
 */
export async function registerWithEmail(data: RegisterData): Promise<AuthResponse> {
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    if (!res.ok) {
      return { success: false, error: result.error || 'Failed to create account' };
    }

    if (result.user) {
      storeAuthUser(result.user, result.token);
    }

    return {
      success: true,
      user: result.user,
      token: result.token,
      message: result.message
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Unable to connect to authentication server'
    };
  }
}

/**
 * Fetch available demo accounts
 */
export async function fetchDemoAccounts(): Promise<AuthUser[]> {
  try {
    const res = await fetch('/api/auth/demo-users');
    if (!res.ok) return [];
    const data = await res.json();
    return data.users || [];
  } catch {
    return [];
  }
}

/**
 * Get stored authentication session from localStorage
 */
export function getStoredAuthUser(): AuthUser | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

/**
 * Save user session to localStorage
 */
export function storeAuthUser(user: AuthUser, token?: string): void {
  try {
    const userWithToken = { ...user, token: token || user.token };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userWithToken));
  } catch {
    // LocalStorage write failed
  }
}

/**
 * Remove session from localStorage
 */
export function clearStoredAuthUser(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // LocalStorage remove failed
  }
}
