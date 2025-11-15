'use client';

import { LeaveAuthProvider } from '../../components/leave/LeaveAuthContext.js';

export default function LeaveProviders({ children }) {
  return <LeaveAuthProvider>{children}</LeaveAuthProvider>;
}

