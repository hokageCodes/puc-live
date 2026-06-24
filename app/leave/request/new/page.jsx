'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, Users } from 'lucide-react';
import { useLeaveAuth, useLeaveGuard } from '../../../../components/leave/LeaveAuthContext';
import LeaveRequestForm from '../../../../components/leave/LeaveRequestForm';

const buildReportingChain = (user) => {
  const teamLeadName = user?.teamLead ? `${user.teamLead.firstName} ${user.teamLead.lastName}`.trim() : 'Not assigned';
  const lineManagerName = user?.lineManager ? `${user.lineManager.firstName} ${user.lineManager.lastName}`.trim() : 'Not assigned';
  const hrName = user?.hr ? `${user.hr.firstName} ${user.hr.lastName}`.trim() : 'HR Operations';

  return [
    { id: user?.teamLead?.id ? `tl-${user.teamLead.id}` : 'tl-unassigned', label: 'Team Lead', name: teamLeadName, status: user?.teamLead ? 'Pending' : 'Locked', meta: 'Team Lead approval required first.' },
    { id: user?.lineManager?.id ? `lm-${user.lineManager.id}` : 'lm-unassigned', label: 'Line Manager', name: lineManagerName, status: 'Locked', meta: 'Opens after Team Lead approval.' },
    { id: user?.hr?.id ? `hr-${user.hr.id}` : 'hr-unassigned', label: 'HR', name: hrName, status: 'Locked', meta: 'Final endorsement from HR.' },
  ].map((step, index) => ({ ...step, order: index + 1 }));
};

export default function LeaveRequestCreatePage() {
  const router = useRouter();
  const { user, status, basePath } = useLeaveAuth();
  const { isAuthenticated } = useLeaveGuard();

  const isLoading = status === 'loading' || status === 'authenticating';
  const reportingChain = useMemo(() => buildReportingChain(user), [user]);

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
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Approval chain</h2>
          <p className="mt-1 text-xs text-slate-500">Your request will move through each stage automatically once the prior step is complete.</p>

          <ol className="mt-5 space-y-4">
            {reportingChain.map((step) => (
              <li key={step.id} className="relative flex gap-3 rounded-xl border border-slate-100 px-4 py-3">
                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Step {step.order} · {step.label}</p>
                  <p className="text-sm font-medium text-slate-900">{step.name}</p>
                  <p className="text-xs text-slate-500">{step.meta}</p>
                </div>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">{step.status}</div>
              </li>
            ))}
          </ol>

          <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-3 text-xs text-emerald-700">
            HR will receive a notification after your team lead and line manager approve the request.
          </div>
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
