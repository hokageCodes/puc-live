// hooks/useAuth.js
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const ADMIN_DATA_KEY = 'adminData';
const ADMIN_TOKEN_KEY = 'adminToken';
const CMS_ROLES = new Set(['admin', 'hr', 'cms']);

const getBackendUrl = () => process.env.NEXT_PUBLIC_BACKEND_URL || 'https://puc-backend.vercel.app';
const hasCmsRole = (roles) => Array.isArray(roles) && roles.some((role) => CMS_ROLES.has(String(role).toLowerCase()));

const getStoredAdmin = () => {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(ADMIN_DATA_KEY);
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export function useAuth() {
  const router = useRouter();
  const [admin, setAdmin] = useState(() => getStoredAdmin());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const persistSession = useCallback((adminProfile) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(ADMIN_DATA_KEY, JSON.stringify(adminProfile));
    }
    setAdmin(adminProfile);
  }, []);

  const clearSession = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(ADMIN_DATA_KEY);
      window.localStorage.removeItem(ADMIN_TOKEN_KEY);
    }
    setAdmin(null);
  }, []);

  const getAuthHeaders = useCallback(() => {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem(ADMIN_TOKEN_KEY) : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const backendUrl = getBackendUrl();
      const token = typeof window !== 'undefined' ? window.localStorage.getItem(ADMIN_TOKEN_KEY) : null;

      const res = await fetch(`${backendUrl}/api/admin/me`, {
        method: 'GET',
        cache: 'no-store',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.status === 401 || res.status === 403) {
        clearSession();
        return null;
      }

      if (!res.ok) {
        // Server/network error — keep the existing localStorage session rather than force-logout
        return getStoredAdmin();
      }

      const data = await res.json();

      if (hasCmsRole(data?.admin?.roles)) {
        persistSession(data.admin);
        return data.admin;
      }

      clearSession();
      return null;
    } catch (err) {
      // Network error — keep the existing session so a bad connection doesn't log the user out
      console.error('Auth check error:', err);
      return getStoredAdmin();
    } finally {
      setLoading(false);
    }
  }, [clearSession, persistSession]);

  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      setError('');

      const backendUrl = getBackendUrl();
      const res = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, scope: 'cms' }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (!data?.user) {
        throw new Error('Login successful but session data missing');
      }

      if (!hasCmsRole(data?.user?.roles)) {
        throw new Error('User is not authorized for CMS');
      }

      persistSession(data.user);
      if (typeof window !== 'undefined' && data.accessToken) {
        window.localStorage.setItem(ADMIN_TOKEN_KEY, data.accessToken);
      }
      return { success: true, admin: data.user };
    } catch (err) {
      clearSession();
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [clearSession, persistSession]);

  const refresh = useCallback(async () => {
    try {
      const backendUrl = getBackendUrl();
      const res = await fetch(`${backendUrl}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scope: 'cms' }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || 'Unable to refresh session');
      }

      if (!data?.user) {
        throw new Error('Refresh response missing session data');
      }

      if (!hasCmsRole(data?.user?.roles)) {
        throw new Error('User is not authorized for CMS');
      }

      persistSession(data.user);
      if (typeof window !== 'undefined' && data.accessToken) {
        window.localStorage.setItem(ADMIN_TOKEN_KEY, data.accessToken);
      }
      return data.user;
    } catch (err) {
      console.error('Admin refresh error:', err);
      clearSession();
      return null;
    }
  }, [clearSession, persistSession]);

  const logout = useCallback(async () => {
    try {
      const backendUrl = getBackendUrl();
      await fetch(`${backendUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scope: 'cms' }),
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearSession();
      router.push('/admin/login');
    }
  }, [clearSession, router]);

  const useRequireAuth = () => {
    useEffect(() => {
      if (!loading && !admin) {
        router.push('/admin/login');
      }
    }, [admin, loading, router]);
  };

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Proactively refresh the access token 5 minutes before it expires
  useEffect(() => {
    let timerId = null;

    const scheduleRefresh = () => {
      if (typeof window === 'undefined') return;
      const token = window.localStorage.getItem(ADMIN_TOKEN_KEY);
      if (!token) return;

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const msUntilExpiry = payload.exp * 1000 - Date.now();
        const delay = Math.max(msUntilExpiry - 5 * 60 * 1000, 0);

        timerId = setTimeout(async () => {
          const refreshed = await refresh();
          if (refreshed) scheduleRefresh();
        }, delay);
      } catch {
        // malformed token — let checkAuth handle it
      }
    };

    scheduleRefresh();
    return () => { if (timerId) clearTimeout(timerId); };
  }, [refresh]);

  return {
    admin,
    loading,
    error,
    login,
    logout,
    checkAuth,
    refresh,
    useRequireAuth,
    getAuthHeaders,
  };
}