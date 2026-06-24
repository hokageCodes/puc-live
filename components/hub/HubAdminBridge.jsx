'use client';

import { useMemo } from 'react';
import { AdminAuthContext } from '../admin/AdminAuthContext';
import { useHubAuth } from './HubAuthContext';

/**
 * Lets the existing admin (CMS) page components run unchanged inside the hub shell.
 *
 * Admin pages read `getAuthHeaders` from `useAdminAuth()`. In the standalone admin
 * app that returns a bearer token from localStorage; inside the hub the session is
 * cookie-based (hub_access_token), so getAuthHeaders returns {} and the cookie
 * (sent via credentials:'include') authenticates. The backend CMS routes accept
 * scope ['hub','cms'] during migration.
 *
 * Auth is enforced by HubShell (useHubGuard) above this.
 */
export default function HubAdminBridge({ children }) {
  const hub = useHubAuth();

  const value = useMemo(
    () => ({
      admin: hub.user,
      loading: hub.isLoading,
      error: '',
      getAuthHeaders: () => ({}), // cookie-based in the hub; no bearer header
      logout: hub.signOut,
      checkAuth: hub.refreshIdentity,
      refresh: hub.refreshSession,
      login: async () => ({ success: false, error: 'Use the unified hub login' }),
      useRequireAuth: () => {},
    }),
    [hub]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}
