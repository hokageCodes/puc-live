'use client';

import { LeaveAuthProvider } from '../../components/leave/LeaveAuthContext.jsx';

export default function LeaveProviders({ children }) {
  return <LeaveAuthProvider>{children}</LeaveAuthProvider>;
}

