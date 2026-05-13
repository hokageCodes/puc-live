'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { useLeaveAuth, useLeaveGuard } from '../../../components/leave/LeaveAuthContext';

const ACTIVATION_TOKEN_KEY = 'puc_activation_token';

function ActivateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { backendUrl } = useLeaveAuth();
  useLeaveGuard({ redirectIfFound: true });

  const [token, setToken] = useState('');
  const [form, setForm] = useState({
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const raw = searchParams?.get('token');
    let fromQuery = '';
    if (raw) {
      try {
        fromQuery = decodeURIComponent(raw);
      } catch {
        fromQuery = raw;
      }
    }
    if (fromQuery) {
      sessionStorage.setItem(ACTIVATION_TOKEN_KEY, fromQuery);
      setToken(fromQuery);
      window.history.replaceState(null, '', '/leave/activate');
      return;
    }
    const stored = sessionStorage.getItem(ACTIVATION_TOKEN_KEY);
    if (stored) setToken(stored);
  }, [searchParams]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const effectiveToken = (token || sessionStorage.getItem(ACTIVATION_TOKEN_KEY) || '').trim();
    if (!effectiveToken) {
      setError('Use the activation link from your invite email to open this page.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`${backendUrl}/api/auth/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: form.password,
          token: effectiveToken,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const apiMsg =
          typeof data.message === 'string'
            ? data.message
            : typeof data.error?.message === 'string'
              ? data.error.message
              : null;
        throw new Error(apiMsg || 'Activation failed. Please confirm your token or request a new invite.');
      }

      sessionStorage.removeItem(ACTIVATION_TOKEN_KEY);
      setSuccess('Account activated! You can now sign in.');
      setTimeout(() => router.replace('/leave/login'), 1500);
    } catch (err) {
      setError(err.message || 'Unable to activate account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-semibold text-slate-900">Activate your account</h1>
          <p className="mt-3 text-sm text-slate-500">
            Choose a secure password to finish setup. Your invite link has already identified you—nothing to paste.
          </p>
        </header>

        <div className="mx-auto w-full max-w-xl space-y-6">
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
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5 md:col-span-2">
                <label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Password
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

              <div className="space-y-1.5 md:col-span-2">
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
              {submitting ? 'Activating…' : 'Activate account'}
            </button>
          </form>

          <div className="text-center text-xs text-slate-500">
            Already activated your account?{' '}
            <Link href="/leave/login" className="font-semibold text-emerald-600 transition hover:text-emerald-500">
              Go to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LeaveActivatePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-emerald-600" />
            <p className="mt-4 text-sm text-slate-500">Loading...</p>
          </div>
        </div>
      }
    >
      <ActivateForm />
    </Suspense>
  );
}
