'use client';

import { createContext, useContext } from 'react';
import { useAuth } from '../../hooks/useAuth';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const auth = useAuth();
  return <AdminAuthContext.Provider value={auth}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}

