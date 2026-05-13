'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_DIARY_POST_LOGIN,
  resolveLeaveSafeRedirect,
  useLeaveAuth,
} from '../../../components/leave/LeaveAuthContext';

export default function DiaryLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, status, isAuthenticated } = useLeaveAuth();

  const nextParam = searchParams.get('next');
  const afterLogin = useMemo(
    () => resolveLeaveSafeRedirect(nextParam, DEFAULT_DIARY_POST_LOGIN),
    [nextParam]
  );

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(afterLogin);
    }
  }, [afterLogin, isAuthenticated, router]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await signIn(form.email, form.password);
      router.replace(afterLogin);
    } catch (err) {
      setError(err.message || 'Unable to sign in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const busy = submitting || status === 'authenticating';

  return (
    <div className="flex min-h-dvh flex-col bg-white lg:flex-row">
      <div className="relative hidden h-dvh min-h-0 w-full max-w-2xl shrink-0 overflow-hidden bg-slate-900 text-white lg:flex lg:flex-col">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 via-transparent to-slate-900" />
        <div className="relative h-full w-full">
          <div className="flex h-full flex-col justify-center p-12">
            <header>
              <span className="inline-flex items-center rounded-full border border-white/20 px-4 py-1 text-xs uppercase tracking-[0.2em] text-white/70">
                Paul Usoro & Co.
              </span>
              <h1 className="mt-10 text-4xl font-semibold leading-tight text-white">
                Court Diary
              </h1>
              <p className="mt-6 max-w-md text-sm text-white/70">
                Sign in with your staff credentials to view and update your team&apos;s court diary.
              </p>
            </header>
          </div>
        </div>
      </div>

      <main className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-12 lg:min-h-dvh lg:px-12 lg:py-16">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-semibold text-slate-900">Court Diary sign in</h2>
            <p className="text-sm text-slate-500">Same staff account as leave; this page opens your diary only.</p>
          </div>

          {status === 'loading' && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Checking your session…
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="diary-email" className="text-sm font-medium text-slate-700">
                Work email
              </label>
              <input
                id="diary-email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                required
                disabled={busy}
                placeholder="you@paulusoro.com"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="diary-password" className="text-sm font-medium text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-xs font-medium text-emerald-600 transition hover:text-emerald-500"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                id="diary-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                required
                disabled={busy}
                placeholder="Enter your password"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:cursor-not-allowed disabled:bg-emerald-300"
            >
              {busy ? 'Signing in…' : 'Sign in to diary'}
            </button>
          </form>

          <div className="flex flex-col gap-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/leave/activate" className="font-medium text-emerald-600 transition hover:text-emerald-500">
              Activate account
            </Link>
            <Link href="/leave/forgot" className="font-medium text-emerald-600 transition hover:text-emerald-500">
              Forgot password?
            </Link>
          </div>

          <p className="text-center text-xs text-slate-500">
            Looking for leave instead?{' '}
            <Link href="/leave/login" className="font-medium text-emerald-600 hover:text-emerald-500">
              Leave portal sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
