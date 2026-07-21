'use client';

import { Users } from 'lucide-react';

/**
 * Mirrors the server's chain (see buildApproverChain in leaveController): roles with
 * no one assigned aren't steps at all, and when one person holds several roles they
 * approve ONCE — the roles merge into a single step rather than repeating.
 * The HR step with nobody named goes to whichever HR picks it up.
 */
export function buildReportingChain(user) {
  const fullName = (person) => `${person.firstName || ''} ${person.lastName || ''}`.trim();

  const candidates = [
    { role: 'teamLead', label: 'Team Lead', person: user?.teamLead },
    { role: 'lineManager', label: 'Line Manager', person: user?.lineManager },
    { role: 'hr', label: 'HR', person: user?.hr, alwaysPresent: true },
  ];

  const steps = [];
  const byPerson = new Map(); // person id -> the step already covering them

  candidates.forEach(({ role, label, person, alwaysPresent }) => {
    if (!person && !alwaysPresent) return; // nobody in that role — not a step

    const key = person?.id ? String(person.id) : null;
    const existing = key ? byPerson.get(key) : null;

    if (existing) {
      existing.labels.push(label); // same person — merge, don't repeat
      return;
    }

    const step = {
      id: key ? `${role}-${key}` : `${role}-unassigned`,
      labels: [label],
      name: person ? fullName(person) : 'HR Operations',
    };
    steps.push(step);
    if (key) byPerson.set(key, step);
  });

  return steps.map((step, index) => {
    const merged = step.labels.length > 1;
    return {
      ...step,
      label: step.labels.join(' · '),
      order: index + 1,
      status: index === 0 ? 'Pending' : 'Locked',
      meta: merged
        ? 'Holds these roles, so approves once for all of them.'
        : index === 0
        ? 'Approves first.'
        : 'Opens once the previous step is approved.',
    };
  });
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
          {chain.length > 1
            ? 'Each step is notified once the one before it is approved.'
            : 'One approval completes your request.'}
        </div>
      )}
    </div>
  );
}
