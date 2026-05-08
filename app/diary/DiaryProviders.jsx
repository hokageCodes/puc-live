'use client';

import { LeaveAuthProvider } from '../../components/leave/LeaveAuthContext';

export default function DiaryProviders({ children }) {
  return <LeaveAuthProvider>{children}</LeaveAuthProvider>;
}
