'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import LeaveRequestForm from './LeaveRequestForm';

/**
 * Modal hosting the leave-request form. Used from the requests page so booking
 * leave happens in-place (no separate page navigation).
 *
 * Props: open, onClose(), onCreated(createdRequest?)
 */
export default function LeaveRequestModal({ open, onClose, onCreated }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    // Prevent background scroll while open
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
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5">
          <LeaveRequestForm onSuccess={onCreated} onCancel={onClose} />
        </div>
      </div>
    </div>
  );
}
