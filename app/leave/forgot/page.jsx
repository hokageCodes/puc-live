'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useLeaveAuth, useLeaveGuard } from '../../../components/leave/LeaveAuthContext';

export default function LeaveForgotPasswordPage() {
  const { backendUrl } = useLeaveAuth();
  useLeaveGuard({ redirectIfFound: true });

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const res = await fetch(`${backendUrl}/api/auth/request-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || 'Unable to send reset link. Please try again.');
      }

      setSuccess('Password reset email sent! Check your inbox for further instructions.');
    } catch (err) {
      setError(err.message || 'Something went wrong while sending the reset link.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-6 py-16">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-semibold text-slate-900">Forgot password</h1>
          <p className="mt-3 text-sm text-slate-500">
            We’ll email you a secure link to reset your password.
          </p>
        </header>

        <div className="mx-auto w-full max-w-lg space-y-6">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">
                Firm email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                disabled={submitting}
                placeholder="you@paulusoro.com"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:cursor-not-allowed disabled:bg-emerald-300"
            >
              {submitting ? 'Sending reset link…' : 'Send reset link'}
            </button>
          </form>

          <div className="text-center text-xs text-slate-500">
            Remembered your password?{' '}
            <Link href="/leave/login" className="font-semibold text-emerald-600 transition hover:text-emerald-500">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

