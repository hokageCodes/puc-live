'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

/**
 * Unified Hub auth provider — one session for the whole HR Hub, built on the
 * backend `hub` scope. Cookie-based (httpOnly hub_access_token / hub_refresh_token):
 * the browser sends them automatically with `credentials: 'include'`, so there is no
 * bearer token in JS. Roles drive what the user can see; per-feature authorization is
 * still enforced server-side.
 *
 * Generalizes the previous per-silo contexts (admin `useAuth`, `LeaveAuthContext`).
 * Those remain in place until their modules migrate into the (hub) shell.
 */

const HubAuthContext = createContext(undefined);

const STORAGE_USER_KEY = 'hub_user';
const REFRESH_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes
const SCOPE = 'hub';

const getBackendUrl = () => process.env.NEXT_PUBLIC_BACKEND_URL || 'https://puc-backend.vercel.app';

export const DEFAULT_HUB_POST_LOGIN = '/dashboard';

const safeParse = (value) => {
  try {
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

const normalizeRoles = (roles) =>
  (Array.isArray(roles) ? roles : []).map((r) => String(r).trim().toLowerCase()).filter(Boolean);

/**
 * Safe post-login redirect (query param `next`). Rejects open redirects and never
 * sends the user back to /login.
 */
export function resolveHubSafeRedirect(rawNext, fallback = DEFAULT_HUB_POST_LOGIN) {
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

  const pathname = decoded.split('?')[0];
  if (pathname === '/login' || pathname.startsWith('/login/')) return fallback;

  return decoded;
}

export function HubAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | unauthenticated | authenticated | authenticating
  const tabWasHiddenRef = useRef(false);

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

  // Rotate + extend the session (also validates tokenVersion server-side).
  const attemptRefresh = useCallback(async () => {
    const res = await fetch(`${backendUrl}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scope: SCOPE }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Unable to refresh session');
    if (!data?.user) throw new Error('Invalid refresh response');
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

  // Lightweight identity re-sync (no token rotation) — used on tab refocus so role
  // changes made by an admin are reflected without minting new tokens each focus.
  const refreshIdentity = useCallback(async () => {
    try {
      const res = await fetch(`${backendUrl}/api/auth/me`, {
        method: 'GET',
        cache: 'no-store',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.status === 401 || res.status === 403) {
        clearSession();
        setStatus('unauthenticated');
        return null;
      }
      if (!res.ok) return user; // transient error — keep current session
      const data = await res.json().catch(() => ({}));
      if (data?.user) {
        applySession(data.user);
        setStatus('authenticated');
        return data.user;
      }
      return user;
    } catch {
      return user; // network error — don't log the user out
    }
  }, [applySession, backendUrl, clearSession, user]);

  const signIn = useCallback(
    async (email, password) => {
      if (!email || !password) throw new Error('Email and password are required');
      setStatus('authenticating');

      const res = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, scope: SCOPE }),
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
    // Clear client session immediately so guards never wait on the network.
    clearSession();
    setStatus('unauthenticated');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    fetch(`${backendUrl}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scope: SCOPE }),
      signal: controller.signal,
    })
      .catch((err) => {
        if (err?.name !== 'AbortError') console.warn('Hub logout request failed:', err);
      })
      .finally(() => clearTimeout(timeoutId));
  }, [backendUrl, clearSession]);

  // Bootstrap: optimistically restore from storage, then verify with the server.
  useEffect(() => {
    let isMounted = true;
    const bootstrap = async () => {
      if (typeof window !== 'undefined') {
        const stored = safeParse(window.localStorage.getItem(STORAGE_USER_KEY));
        if (stored && isMounted) setUser(stored); // optimistic; replaced below
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

  // Periodic refresh while authenticated.
  useEffect(() => {
    if (status !== 'authenticated') return undefined;
    const interval = setInterval(() => {
      refreshSession().catch(() => {});
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refreshSession, status]);

  // Re-sync identity when returning to the tab (cheap /me call, no rotation).
  useEffect(() => {
    if (status !== 'authenticated') return undefined;
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        tabWasHiddenRef.current = true;
        return;
      }
      if (document.visibilityState === 'visible' && tabWasHiddenRef.current) {
        tabWasHiddenRef.current = false;
        void refreshIdentity();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [refreshIdentity, status]);

  const roles = useMemo(() => normalizeRoles(user?.roles), [user]);
  const hasRole = useCallback((role) => roles.includes(String(role).toLowerCase()), [roles]);
  const hasAnyRole = useCallback(
    (allowed = []) => normalizeRoles(allowed).some((r) => roles.includes(r)),
    [roles]
  );

  const value = useMemo(
    () => ({
      user,
      roles,
      status,
      isAuthenticated: status === 'authenticated',
      isLoading: status === 'loading' || status === 'authenticating',
      backendUrl,
      signIn,
      signOut,
      refreshSession,
      refreshIdentity,
      clearSession,
      hasRole,
      hasAnyRole,
    }),
    [backendUrl, clearSession, hasAnyRole, hasRole, refreshIdentity, refreshSession, roles, signIn, signOut, status, user]
  );

  return <HubAuthContext.Provider value={value}>{children}</HubAuthContext.Provider>;
}

export function useHubAuth() {
  const context = useContext(HubAuthContext);
  if (!context) {
    throw new Error('useHubAuth must be used within a HubAuthProvider');
  }
  return context;
}

/**
 * Route guard for hub pages. Redirects to /login (preserving `next`) when
 * unauthenticated, or away from /login when already authenticated.
 */
export function useHubGuard({
  redirectIfFound = false,
  preserveNext = true,
  loginPath = '/login',
  redirectIfFoundTarget = DEFAULT_HUB_POST_LOGIN,
} = {}) {
  const router = useRouter();
  const pathname = usePathname() || '';
  const searchParams = useSearchParams();
  const searchString = searchParams?.toString() ?? '';
  const { status, isAuthenticated } = useHubAuth();

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
    isAuthenticated, loginPath, pathname, preserveNext, redirectIfFound,
    redirectIfFoundTarget, router, searchString, status,
  ]);

  return { status, isAuthenticated };
}
