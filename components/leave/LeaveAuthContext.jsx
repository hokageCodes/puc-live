'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

const LeaveAuthContext = createContext(undefined);

const STORAGE_TOKEN_KEY = 'leave_token';
const STORAGE_USER_KEY = 'leave_user';
const REFRESH_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

const getBackendUrl = () => process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

const safeParse = (value) => {
  try {
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

export function LeaveAuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | unauthenticated | authenticated | authenticating

  const backendUrl = getBackendUrl();

  const applySession = useCallback((accessToken, profile) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_TOKEN_KEY, accessToken);
      window.localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(profile));
    }
    setToken(accessToken);
    setUser(profile);
  }, []);

  const clearSession = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_TOKEN_KEY);
      window.localStorage.removeItem(STORAGE_USER_KEY);
    }
    setToken(null);
    setUser(null);
  }, []);

  const attemptRefresh = useCallback(async () => {
    const res = await fetch(`${backendUrl}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scope: 'leave' }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || 'Unable to refresh session');
    }

    if (!data?.accessToken || !data?.user) {
      throw new Error('Invalid refresh response');
    }

    applySession(data.accessToken, data.user);
    setStatus('authenticated');
    return data.user;
  }, [applySession, backendUrl]);

  const refreshSession = useCallback(async () => {
    try {
      return await attemptRefresh();
    } catch (err) {
      clearSession();
      setStatus('unauthenticated');
      throw err;
    }
  }, [attemptRefresh, clearSession]);

  const signIn = useCallback(
    async (email, password) => {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      setStatus('authenticating');

      const res = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, scope: 'leave' }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        clearSession();
        setStatus('unauthenticated');
        throw new Error(data.message || 'Invalid email or password');
      }

      if (!data?.accessToken || !data?.user) {
        clearSession();
        setStatus('unauthenticated');
        throw new Error('Login response missing session data');
      }

      applySession(data.accessToken, data.user);
      setStatus('authenticated');
      return data.user;
    },
    [applySession, backendUrl, clearSession]
  );

  const signOut = useCallback(async () => {
    try {
      await fetch(`${backendUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scope: 'leave' }),
      });
    } catch (err) {
      console.warn('Leave logout request failed:', err);
    } finally {
      clearSession();
      setStatus('unauthenticated');
    }
  }, [backendUrl, clearSession]);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      if (typeof window !== 'undefined') {
        const storedToken = window.localStorage.getItem(STORAGE_TOKEN_KEY);
        const storedUser = safeParse(window.localStorage.getItem(STORAGE_USER_KEY));

        if (storedToken && storedUser) {
              if (isMounted) {
                setToken(storedToken);
                setUser(storedUser);
                // If the stored user already contains reporting relationships, skip refresh.
                // Otherwise attempt refresh to fetch the latest profile (includes teamLead/lineManager/hr).
                const hasReporting = storedUser.teamLead || storedUser.lineManager || storedUser.hr;
                if (hasReporting) {
                  setStatus('authenticated');
                  return;
                }
              }
            }
      }

      try {
        await attemptRefresh();
      } catch {
        if (isMounted) {
          clearSession();
          setStatus('unauthenticated');
        }
      }
    };

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, [attemptRefresh, clearSession]);

  useEffect(() => {
    if (status !== 'authenticated') return undefined;

    const interval = setInterval(() => {
      refreshSession().catch(() => {
        // handled in refreshSession (will update status)
      });
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [refreshSession, status]);

  const buildAuthHeaders = useCallback(
    (headers = {}) => {
      if (!token) return headers;
      return { ...headers, Authorization: `Bearer ${token}` };
    },
    [token]
  );

  const value = useMemo(
    () => ({
      token,
      user,
      status,
      isAuthenticated: status === 'authenticated',
      isLoading: status === 'loading' || status === 'authenticating',
      backendUrl,
      signIn,
      signOut,
      refreshSession,
      buildAuthHeaders,
      clearSession,
    }),
    [backendUrl, buildAuthHeaders, clearSession, refreshSession, signIn, signOut, status, token, user]
  );

  return <LeaveAuthContext.Provider value={value}>{children}</LeaveAuthContext.Provider>;
}

export function useLeaveAuth() {
  const context = useContext(LeaveAuthContext);
  if (!context) {
    throw new Error('useLeaveAuth must be used within a LeaveAuthProvider');
  }
  return context;
}

export function useLeaveGuard({ redirectIfFound = false } = {}) {
  const router = useRouter();
  const { status, isAuthenticated } = useLeaveAuth();

  useEffect(() => {
    if (status === 'loading' || status === 'authenticating') return;

    if (redirectIfFound && isAuthenticated) {
      router.replace('/leave/dashboard');
      return;
    }

    if (!redirectIfFound && !isAuthenticated) {
      router.replace('/leave/login');
    }
  }, [isAuthenticated, redirectIfFound, router, status]);

  return { status, isAuthenticated };
}

