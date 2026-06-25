'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { GitBranch, X } from 'lucide-react';
import LeaveRequestForm from './LeaveRequestForm';
import ApprovalChainCard from './ApprovalChainCard';
import { useLeaveAuth } from './LeaveAuthContext';

/**
 * Modal hosting the leave-request form. "View chain" opens the approval chain in
 * its own small modal layered above.
 *
 * Props: open, onClose(), onCreated(createdRequest?)
 */
export default function LeaveRequestModal({ open, onClose, onCreated }) {
  const { user } = useLeaveAuth();
  const [showChain, setShowChain] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      // Esc closes the chain first, then the form.
      setShowChain((c) => {
        if (c) return false;
        onClose?.();
        return c;
      });
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  useEffect(() => { if (!open) setShowChain(false); }, [open]);

  if (!open || typeof document === 'undefined') return null;

  // Render at document.body so the overlay can never be trapped by an ancestor's
  // overflow/stacking context (which can make a nested modal invisible).
  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm sm:p-6"
        onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label="New leave request"
          className="my-8 w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">New leave request</p>
              <h2 className="text-lg font-semibold text-slate-900">Book time off</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowChain(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <GitBranch className="h-4 w-4" />
                View chain
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
            <LeaveRequestForm onSuccess={onCreated} onCancel={onClose} />
          </div>
        </div>
      </div>

      {/* Approval chain — its own modal, layered above the form */}
      {showChain && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setShowChain(false); }}
        >
          <div role="dialog" aria-modal="true" aria-label="Approval chain" className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <GitBranch className="h-4 w-4" />
                </span>
                <h3 className="text-sm font-semibold text-slate-800">Approval chain</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowChain(false)}
                aria-label="Close"
                className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-5 py-4">
              <ApprovalChainCard user={user} />
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  );
}
