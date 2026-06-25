'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { useLeaveAuth, useLeaveGuard } from '../../../../components/leave/LeaveAuthContext';
import LeaveRequestForm from '../../../../components/leave/LeaveRequestForm';
import ApprovalChainCard from '../../../../components/leave/ApprovalChainCard';

export default function LeaveRequestCreatePage() {
  const router = useRouter();
  const { user, status, basePath } = useLeaveAuth();
  const { isAuthenticated } = useLeaveGuard();

  const isLoading = status === 'loading' || status === 'authenticating';

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-6 py-4 text-sm text-slate-600">
          Preparing your request form…
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">New Leave Request</p>
          <h1 className="text-2xl font-semibold text-slate-900">Let’s plan your time off</h1>
          <p className="text-sm text-slate-600">Complete the form below to notify your approvers and HR operations.</p>
        </div>

        <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Request details</h2>
            <p className="text-xs text-slate-500">Fields marked with * are required.</p>
          </div>
          <LeaveRequestForm
            onSuccess={() => router.push(`${basePath}/requests`)}
            onCancel={() => router.push(`${basePath}/dashboard`)}
          />
        </section>
      </div>

      <aside className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <ApprovalChainCard user={user} />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Helpful links</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <Link href={`${basePath}/policy`} className="inline-flex items-center gap-2 text-slate-600 hover:text-emerald-600">
                Leave policy handbook
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </li>
            <li>
              <Link href={`${basePath}/history`} className="inline-flex items-center gap-2 text-slate-600 hover:text-emerald-600">
                View past requests
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </li>
            <li>
              <a href="mailto:hr@paulusoro.com" className="inline-flex items-center gap-2 text-slate-600 hover:text-emerald-600">
                Contact HR support
                <ChevronRight className="h-3.5 w-3.5" />
              </a>
            </li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
