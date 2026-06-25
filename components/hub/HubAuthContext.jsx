'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { HUB_TOKEN_KEY } from '../../utils/api';

/**
 * Unified Hub auth provider — one session for the whole HR Hub, built on the
 * backend `hub` scope. Primary auth is a Bearer access token (stored in
 * localStorage, sent as Authorization on every request) — like the admin app —
 * because cross-site refresh cookies are unreliable across the frontend/backend
 * domains in production. The refresh cookie is still used opportunistically to
 * extend the session when available. Roles drive visibility; the server enforces
 * per-feature authorization.
 */

const HubAuthContext = createContext(undefined);

const STORAGE_USER_KEY = 'hub_user';
const REFRESH_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes
const SCOPE = 'hub';

const getBackendUrl = () => process.env.NEXT_PUBLIC_BACKEND_URL || 'https://puc-backend.vercel.app';

export const DEFAULT_HUB_POST_LOGIN = '/hub/dashboard';

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
  const refreshInFlightRef = useRef(null); // single-flight guard for concurrent refreshes

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
      window.localStorage.removeItem(HUB_TOKEN_KEY);
    }
    setUser(null);
  }, []);

  const storeToken = useCallback((token) => {
    if (token && typeof window !== 'undefined') window.localStorage.setItem(HUB_TOKEN_KEY, token);
  }, []);

  const getAuthHeaders = useCallback(() => {
    if (typeof window === 'undefined') return {};
    const t = window.localStorage.getItem(HUB_TOKEN_KEY);
    return t ? { Authorization: `Bearer ${t}` } : {};
  }, []);

  // Validate the stored Bearer token via /auth/me. Works cross-site (no cookie),
  // so it's the primary way the hub keeps you logged in across page loads.
  const validateViaMe = useCallback(async () => {
    if (typeof window === 'undefined') return { ok: false, authError: false };
    const token = window.localStorage.getItem(HUB_TOKEN_KEY);
    if (!token) return { ok: false, authError: false, noToken: true };
    try {
      const res = await fetch(`${backendUrl}/api/auth/me`, {
        method: 'GET',
        cache: 'no-store',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      if (res.status === 401 || res.status === 403) return { ok: false, authError: true };
      if (!res.ok) return { ok: false, authError: false };
      const data = await res.json().catch(() => ({}));
      if (!data?.user) return { ok: false, authError: false };
      applySession(data.user);
      setStatus('authenticated');
      return { ok: true, user: data.user };
    } catch {
      return { ok: false, authError: false };
    }
  }, [applySession, backendUrl]);

  // One refresh round-trip. Returns a result instead of throwing so callers can
  // distinguish a real auth failure (401 -> log out) from a transient/network error
  // (keep the session). Rotates + extends the session server-side.
  const doRefresh = useCallback(async () => {
    try {
      const res = await fetch(`${backendUrl}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scope: SCOPE }),
      });
      if (res.status === 401) return { ok: false, authError: true };
      if (!res.ok) return { ok: false, authError: false }; // 429/5xx etc. — transient
      const data = await res.json().catch(() => ({}));
      if (!data?.user) return { ok: false, authError: false };
      storeToken(data.accessToken);
      applySession(data.user);
      setStatus('authenticated');
      return { ok: true, user: data.user };
    } catch {
      return { ok: false, authError: false }; // network error — do not log out
    }
  }, [applySession, backendUrl, storeToken]);

  // Single-flight: concurrent callers (StrictMode double-invoke, multiple tabs,
  // periodic + manual) share ONE network refresh, so we never race the rotation.
  const attemptRefresh = useCallback(() => {
    if (refreshInFlightRef.current) return refreshInFlightRef.current;
    const p = doRefresh().finally(() => { refreshInFlightRef.current = null; });
    refreshInFlightRef.current = p;
    return p;
  }, [doRefresh]);

  // Public refresh: only log out on a definitive auth failure; tolerate transient errors.
  const refreshSession = useCallback(async () => {
    const result = await attemptRefresh();
    if (result.authError) {
      clearSession();
      setStatus('unauthenticated');
    }
    return result;
  }, [attemptRefresh, clearSession]);

  // Keep the session alive WITHOUT logging the user out on a failed cookie refresh.
  // The Bearer token is the source of truth: validate it via /me; only if the token
  // itself is rejected do we try the refresh cookie, and only log out if BOTH fail.
  // This stops the mid-task auto-logout when cross-site cookies are unavailable.
  const keepSessionAlive = useCallback(async () => {
    const me = await validateViaMe();
    if (me.ok || !me.authError) return; // valid, or transient — stay logged in
    const r = await attemptRefresh();   // token expired — last resort: cookie refresh
    if (r.authError) {
      clearSession();
      setStatus('unauthenticated');
    }
  }, [validateViaMe, attemptRefresh, clearSession]);

  // Lightweight identity re-sync (no token rotation) — used on tab refocus so role
  // changes made by an admin are reflected without minting new tokens each focus.
  const refreshIdentity = useCallback(async () => {
    try {
      const res = await fetch(`${backendUrl}/api/auth/me`, {
        method: 'GET',
        cache: 'no-store',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
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
  }, [applySession, backendUrl, clearSession, getAuthHeaders, user]);

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

      storeToken(data.accessToken);
      applySession(data.user);
      setStatus('authenticated');
      return data.user;
    },
    [applySession, backendUrl, clearSession, storeToken]
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

  // Bootstrap: optimistically restore from storage, then verify.
  // PRIMARY: validate the stored Bearer token via /auth/me (works cross-site, so a
  // page load / navigation from /login keeps you logged in without a cookie).
  // FALLBACK: the refresh cookie, to extend or to recover an expired token.
  useEffect(() => {
    let isMounted = true;
    const bootstrap = async () => {
      let hadStored = false;
      if (typeof window !== 'undefined') {
        const stored = safeParse(window.localStorage.getItem(STORAGE_USER_KEY));
        if (stored && isMounted) { setUser(stored); hadStored = true; } // optimistic
      }

      const me = await validateViaMe();
      if (!isMounted) return;
      if (me.ok) return; // authenticated via Bearer token

      if (me.authError) {
        // Token present but rejected (expired/revoked) — try the refresh cookie.
        const r = await attemptRefresh();
        if (!isMounted) return;
        if (!r.ok) { clearSession(); setStatus('unauthenticated'); }
        return;
      }

      // No token (or transient /me error): try the refresh cookie (covers a legacy
      // cookie-only session), tolerating transient failures.
      const r = await attemptRefresh();
      if (!isMounted) return;
      if (r.authError) {
        clearSession();
        setStatus('unauthenticated');
      } else if (!r.ok) {
        setStatus(hadStored ? 'authenticated' : 'unauthenticated');
      }
    };
    bootstrap();
    return () => { isMounted = false; };
  }, [attemptRefresh, clearSession, validateViaMe]);

  // Periodic session check while authenticated — tolerant (won't log out on a failed
  // cookie refresh; only if the Bearer token itself is dead).
  useEffect(() => {
    if (status !== 'authenticated') return undefined;
    const interval = setInterval(() => {
      keepSessionAlive().catch(() => {});
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [keepSessionAlive, status]);

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
      getAuthHeaders,
      hasRole,
      hasAnyRole,
    }),
    [backendUrl, clearSession, getAuthHeaders, hasAnyRole, hasRole, refreshIdentity, refreshSession, roles, signIn, signOut, status, user]
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
