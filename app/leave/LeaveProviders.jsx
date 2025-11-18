'use client';

import { LeaveAuthProvider } from '../../components/leave/LeaveAuthContext';

export default function LeaveProviders({ children }) {
  return <LeaveAuthProvider>{children}</LeaveAuthProvider>;
}

