'use client';

/**
 * Simple accessible modal (no extra deps).
 */
export function DiaryConflictModal({ open, title, children, onClose, onProceed, proceedLabel = 'Save anyway' }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50"
        aria-label="Dismiss"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="diary-conflict-modal-title"
        className="relative z-10 w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
      >
        <h2 id="diary-conflict-modal-title" className="text-lg font-semibold text-slate-900">
          {title}
        </h2>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-600">{children}</div>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Go back
          </button>
          <button
            type="button"
            onClick={onProceed}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            {proceedLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
