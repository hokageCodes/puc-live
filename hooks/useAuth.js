// hooks/useAuth.js
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const ADMIN_TOKEN_KEY = 'admin_token';
const ADMIN_DATA_KEY = 'adminData';

const getBackendUrl = () => process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

const getStoredToken = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(ADMIN_TOKEN_KEY);
};

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

  const buildHeaders = useCallback(() => {
    const token = getStoredToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const persistSession = useCallback((accessToken, adminProfile) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(ADMIN_TOKEN_KEY, accessToken);
      window.localStorage.setItem(ADMIN_DATA_KEY, JSON.stringify(adminProfile));
    }
    setAdmin(adminProfile);
  }, []);

  const clearSession = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(ADMIN_TOKEN_KEY);
      window.localStorage.removeItem(ADMIN_DATA_KEY);
    }
    setAdmin(null);
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const backendUrl = getBackendUrl();
      const token = getStoredToken();

      if (!token) {
        clearSession();
        return null;
      }

      const res = await fetch(`${backendUrl}/api/admin/me`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...buildHeaders(),
        },
      });

      if (!res.ok) {
        throw new Error('Authentication failed');
      }

      const data = await res.json();

      if (Array.isArray(data?.admin?.roles) && data.admin.roles.includes('admin')) {
        persistSession(token, data.admin);
        return data.admin;
      }

      throw new Error('User is not authorized for CMS');
    } catch (err) {
      console.error('Auth check error:', err);
      setError(err.message);
      clearSession();
      return null;
    } finally {
      setLoading(false);
    }
  }, [buildHeaders, clearSession, persistSession]);

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

      if (!data?.accessToken || !data?.user) {
        throw new Error('Login successful but session data missing');
      }

      if (!Array.isArray(data.user.roles) || !data.user.roles.includes('admin')) {
        throw new Error('User is not authorized for CMS');
      }

      persistSession(data.accessToken, data.user);
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

      if (!data?.accessToken || !data?.user) {
        throw new Error('Refresh response missing session data');
      }

      if (!Array.isArray(data.user.roles) || !data.user.roles.includes('admin')) {
        throw new Error('User is not authorized for CMS');
      }

      persistSession(data.accessToken, data.user);
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

  return {
    admin,
    loading,
    error,
    login,
    logout,
    checkAuth,
    refresh,
    buildHeaders,
    useRequireAuth,
  };
}