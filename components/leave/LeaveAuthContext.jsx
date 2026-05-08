'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const LeaveAuthContext = createContext(undefined);

const STORAGE_USER_KEY = 'leave_user';
const REFRESH_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

const getBackendUrl = () => process.env.NEXT_PUBLIC_BACKEND_URL || 'https://puc-backend.vercel.app';

export const DEFAULT_LEAVE_POST_LOGIN = '/leave/dashboard';

export const DEFAULT_DIARY_POST_LOGIN = '/diary';

/** Paths we never send someone to after login (avoid loops / odd UX). */
const DISALLOWED_POST_LOGIN_PREFIXES = [
  '/leave/login',
  '/leave/activate',
  '/leave/forgot',
  '/leave/reset',
  '/diary/login',
];

/** Only internal app sections that use the leave-scoped session. */
const ALLOWED_POST_LOGIN_PREFIXES = ['/leave', '/diary'];

/**
 * Safe redirect target after leave login (query param `next`).
 * Rejects open redirects and paths outside leave/diary apps.
 */
export function resolveLeaveSafeRedirect(rawNext, fallback = DEFAULT_LEAVE_POST_LOGIN) {
  if (rawNext == null || typeof rawNext !== 'string') return fallback;

  let decoded = rawNext.trim();
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    return fallback;
  }

  decoded = decoded.trim();
  if (!decoded.startsWith('/') || decoded.startsWith('//')) return fallback;
  if (decoded.includes('\\')) return fallback;

  let pathname = decoded;
  let search = '';
  const qIndex = decoded.indexOf('?');
  if (qIndex !== -1) {
    pathname = decoded.slice(0, qIndex);
    search = decoded.slice(qIndex);
  }

  if (DISALLOWED_POST_LOGIN_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return fallback;
  }

  const allowed = ALLOWED_POST_LOGIN_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!allowed) return fallback;

  return pathname + search;
}

const safeParse = (value) => {
  try {
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

export function LeaveAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | unauthenticated | authenticated | authenticating

  const backendUrl = getBackendUrl();

  const applySession = useCallback((profile) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(profile));
    }
    setUser(profile);
  }, []);

  const clearSession = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_USER_KEY);
    }
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

    if (!data?.user) {
      throw new Error('Invalid refresh response');
    }

    applySession(data.user);
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

      if (!data?.user) {
        clearSession();
        setStatus('unauthenticated');
        throw new Error('Login response missing session data');
      }

      applySession(data.user);
      setStatus('authenticated');
      return data.user;
    },
    [applySession, backendUrl, clearSession]
  );

  const signOut = useCallback(() => {
    // Clear client session immediately so navigation and guards never wait on the network.
    // Previously: if logout fetch hung, `finally` never ran → stuck UI, cookies/localStorage
    // stayed → confusing refresh behaviour.
    clearSession();
    setStatus('unauthenticated');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    fetch(`${backendUrl}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scope: 'leave' }),
      signal: controller.signal,
    })
      .catch((err) => {
        if (err?.name !== 'AbortError') {
          console.warn('Leave logout request failed:', err);
        }
      })
      .finally(() => {
        clearTimeout(timeoutId);
      });
  }, [backendUrl, clearSession]);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      // Optimistically restore user from storage so the UI doesn't flash blank,
      // but always verify with the server — skipping the refresh means a revoked
      // session (tokenVersion bumped by logout/password-change) would appear valid.
      if (typeof window !== 'undefined') {
        const storedUser = safeParse(window.localStorage.getItem(STORAGE_USER_KEY));
        if (storedUser && isMounted) {
          setUser(storedUser); // optimistic — replaced by server response below
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

    return () => { isMounted = false; };
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

  const buildAuthHeaders = useCallback((headers = {}) => headers, []);

  const value = useMemo(
    () => ({
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
    [backendUrl, buildAuthHeaders, clearSession, refreshSession, signIn, signOut, status, user]
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

export function useLeaveGuard({
  redirectIfFound = false,
  preserveNext = false,
  loginPath = '/leave/login',
  redirectIfFoundTarget = DEFAULT_LEAVE_POST_LOGIN,
} = {}) {
  const router = useRouter();
  const pathname = usePathname() || '';
  const searchParams = useSearchParams();
  const searchString = searchParams?.toString() ?? '';
  const { status, isAuthenticated } = useLeaveAuth();

  useEffect(() => {
    if (status === 'loading' || status === 'authenticating') return;

    if (redirectIfFound && isAuthenticated) {
      router.replace(redirectIfFoundTarget);
      return;
    }

    if (!redirectIfFound && !isAuthenticated) {
      if (preserveNext && pathname) {
        const returnTo = searchString ? `${pathname}?${searchString}` : pathname;
        router.replace(`${loginPath}?next=${encodeURIComponent(returnTo)}`);
      } else {
        router.replace(loginPath);
      }
    }
  }, [
    isAuthenticated,
    loginPath,
    pathname,
    preserveNext,
    redirectIfFound,
    redirectIfFoundTarget,
    router,
    searchString,
    status,
  ]);

  return { status, isAuthenticated };
}

