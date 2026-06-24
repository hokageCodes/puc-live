'use client';

import { useHubAuth } from '../../../components/hub/HubAuthContext';

export default function HubDashboardPage() {
  const { user, roles } = useHubAuth();
  const firstName = user?.firstName || (user?.email ? user.email.split('@')[0] : 'there');

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-800">Welcome, {firstName}</h1>
      <p className="mt-1 text-slate-500">Your HR Hub workspace.</p>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-700">Your access</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {(roles.length ? roles : ['staff']).map((r) => (
            <span key={r} className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {r}
            </span>
          ))}
        </div>
        <p className="mt-4 text-sm text-slate-500">
          Modules you can access will appear in the sidebar as they are migrated into the
          Hub — Leave, Staff management, Organization, Performance, and more.
        </p>
      </div>
    </div>
  );
}
