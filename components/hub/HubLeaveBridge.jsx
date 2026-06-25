'use client';

import { useMemo } from 'react';
import { LeaveAuthContext } from '../leave/LeaveAuthContext';
import { useHubAuth } from './HubAuthContext';

const getBackendUrl = () => process.env.NEXT_PUBLIC_BACKEND_URL || 'https://puc-backend.vercel.app';

/**
 * Lets the existing leave page components run unchanged inside the hub shell.
 *
 * The leave pages read their session and in-app base path from `useLeaveAuth()`.
 * This bridge provides that same context, but backed by the unified hub session
 * and with `basePath = '/hub/leave'` so their navigation stays inside the hub.
 *
 * Auth is enforced by HubShell (useHubGuard) above this; here the leave guard is
 * effectively inert because the user is already authenticated when these mount.
 */
export default function HubLeaveBridge({ children }) {
  const hub = useHubAuth();

  const value = useMemo(
    () => ({
      user: hub.user,
      status: hub.status,
      isAuthenticated: hub.isAuthenticated,
      isLoading: hub.isLoading,
      backendUrl: getBackendUrl(),
      basePath: '/hub/leave',
      signIn: hub.signIn,
      signOut: hub.signOut,
      refreshSession: hub.refreshSession,
      buildAuthHeaders: (headers = {}) => ({ ...headers, ...hub.getAuthHeaders() }), // hub Bearer token
      clearSession: hub.clearSession,
    }),
    [hub]
  );

  return <LeaveAuthContext.Provider value={value}>{children}</LeaveAuthContext.Provider>;
}
