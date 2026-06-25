'use client';

import { Users } from 'lucide-react';

export function buildReportingChain(user) {
  const teamLeadName = user?.teamLead ? `${user.teamLead.firstName} ${user.teamLead.lastName}`.trim() : 'Not assigned';
  const lineManagerName = user?.lineManager ? `${user.lineManager.firstName} ${user.lineManager.lastName}`.trim() : 'Not assigned';
  const hrName = user?.hr ? `${user.hr.firstName} ${user.hr.lastName}`.trim() : 'HR Operations';

  return [
    { id: user?.teamLead?.id ? `tl-${user.teamLead.id}` : 'tl-unassigned', label: 'Team Lead', name: teamLeadName, status: user?.teamLead ? 'Pending' : 'Locked', meta: 'Team Lead approval required first.' },
    { id: user?.lineManager?.id ? `lm-${user.lineManager.id}` : 'lm-unassigned', label: 'Line Manager', name: lineManagerName, status: 'Locked', meta: 'Opens after Team Lead approval.' },
    { id: user?.hr?.id ? `hr-${user.hr.id}` : 'hr-unassigned', label: 'HR', name: hrName, status: 'Locked', meta: 'Final endorsement from HR.' },
  ].map((step, index) => ({ ...step, order: index + 1 }));
}

/**
 * Renders a user's leave approval chain (Team Lead -> Line Manager -> HR).
 * `compact` trims spacing/copy for the modal side panel.
 */
export default function ApprovalChainCard({ user, compact = false }) {
  const chain = buildReportingChain(user);

  return (
    <div>
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Approval chain</h2>
      {!compact && (
        <p className="mt-1 text-xs text-slate-500">
          Your request moves through each stage automatically once the prior step is complete.
        </p>
      )}

      <ol className={compact ? 'mt-3 space-y-2.5' : 'mt-5 space-y-4'}>
        {chain.map((step) => (
          <li key={step.id} className="relative flex gap-3 rounded-xl border border-slate-100 px-3 py-2.5">
            <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <Users className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Step {step.order} · {step.label}</p>
              <p className="truncate text-sm font-medium text-slate-900">{step.name}</p>
              {!compact && <p className="text-xs text-slate-500">{step.meta}</p>}
            </div>
          </li>
        ))}
      </ol>

      {!compact && (
        <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-3 text-xs text-emerald-700">
          HR is notified after your team lead and line manager approve.
        </div>
      )}
    </div>
  );
}
