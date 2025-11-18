'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState, Suspense } from 'react';
import { useLeaveAuth, useLeaveGuard } from '../../../components/leave/LeaveAuthContext';

function ResetForm() {
  const { backendUrl } = useLeaveAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  useLeaveGuard({ redirectIfFound: true });

  const initialToken = useMemo(() => searchParams?.get('token') || '', [searchParams]);
  const initialEmail = useMemo(() => searchParams?.get('email') || '', [searchParams]);

  const [form, setForm] = useState({
    email: initialEmail,
    password: '',
    confirmPassword: '',
    token: initialToken,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`${backendUrl}/api/auth/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          token: form.token,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || 'Unable to reset password. Please request a new link.');
      }

      setSuccess('Password updated successfully! Redirecting to login…');
      setTimeout(() => router.replace('/leave/login'), 1500);
    } catch (err) {
      setError(err.message || 'Password reset failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-6 py-16">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-semibold text-slate-900">Reset your password</h1>
          <p className="mt-3 text-sm text-slate-500">Choose a new password to regain access to the leave portal.</p>
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
              <label htmlFor="token" className="text-sm font-medium text-slate-700">
                Reset token
              </label>
              <input
                id="token"
                name="token"
                type="text"
                autoComplete="off"
                value={form.token}
                onChange={handleChange}
                required
                disabled={submitting}
                placeholder="Paste the token from your reset email"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">
                Firm email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                required
                disabled={submitting}
                placeholder="you@paulusoro.com"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-medium text-slate-700">
                  New password
                </label>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                  placeholder="Create password"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                  placeholder="Repeat password"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="text-xs font-semibold text-emerald-600 transition hover:text-emerald-500"
            >
              {showPassword ? 'Hide passwords' : 'Show passwords'}
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:cursor-not-allowed disabled:bg-emerald-300"
            >
              {submitting ? 'Updating password…' : 'Update password'}
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

export default function LeaveResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    }>
      <ResetForm />
    </Suspense>
  );
}

