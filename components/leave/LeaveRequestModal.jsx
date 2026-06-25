'use client';

import { useEffect, useState } from 'react';
import { Users, X } from 'lucide-react';
import LeaveRequestForm from './LeaveRequestForm';
import ApprovalChainCard from './ApprovalChainCard';
import { useLeaveAuth } from './LeaveAuthContext';

/**
 * Modal hosting the leave-request form. Used from the requests page so booking
 * leave happens in-place (no separate page navigation). A "View chain" toggle
 * reveals the approval chain in a compact panel beside the form.
 *
 * Props: open, onClose(), onCreated(createdRequest?)
 */
export default function LeaveRequestModal({ open, onClose, onCreated }) {
  const { user } = useLeaveAuth();
  const [showChain, setShowChain] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/50 backdrop-blur-sm p-4 sm:p-6"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <div className="my-8 flex w-full max-w-4xl items-start gap-4">
        {/* Main dialog */}
        <div
          role="dialog"
          aria-modal="true"
          aria-label="New leave request"
          className="w-full max-w-2xl flex-1 rounded-2xl border border-slate-200 bg-white shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">New leave request</p>
              <h2 className="text-lg font-semibold text-slate-900">Book time off</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowChain((v) => !v)}
                aria-pressed={showChain}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                  showChain
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Users className="h-4 w-4" />
                {showChain ? 'Hide chain' : 'View chain'}
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="px-6 py-5">
            {/* On small screens the chain stacks above the form when toggled */}
            {showChain && (
              <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50/60 p-4 lg:hidden">
                <ApprovalChainCard user={user} compact />
              </div>
            )}
            <LeaveRequestForm onSuccess={onCreated} onCancel={onClose} />
          </div>
        </div>

        {/* Side panel (large screens) */}
        {showChain && (
          <aside className="hidden w-72 shrink-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl lg:block">
            <ApprovalChainCard user={user} compact />
          </aside>
        )}
      </div>
    </div>
  );
}
