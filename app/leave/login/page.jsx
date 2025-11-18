'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useLeaveAuth } from '../../../components/leave/LeaveAuthContext';

export default function LeaveLoginPage() {
  const router = useRouter();
  const { signIn, status, isAuthenticated } = useLeaveAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/leave/dashboard');
    }
  }, [isAuthenticated, router]);

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
      router.replace('/leave/dashboard');
    } catch (err) {
      setError(err.message || 'Unable to sign in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const busy = submitting || status === 'authenticating';

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">
      <div className="relative hidden w-full max-w-2xl overflow-hidden bg-slate-900 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-slate-900" />
        <div className="relative h-full w-full">
          <div className="flex h-full flex-col justify-between p-12">
            <header>
              <span className="inline-flex items-center rounded-full border border-white/20 px-4 py-1 text-xs uppercase tracking-[0.2em] text-white/70">
                Paul Usoro & Co.
              </span>
              <h1 className="mt-10 text-4xl font-semibold leading-tight text-white">
                Leave Management <br /> Portal
              </h1>
              <p className="mt-6 max-w-md text-sm text-white/70">
                Sign in to request time off, track approvals, and stay aligned with your team’s leave calendar.
              </p>
            </header>

            <footer className="mt-10 space-y-4 text-sm text-white/70">
              <div>
                <p className="text-white">Need help?</p>
                <p className="text-white/60">
                  Contact HR at <span className="font-medium text-white">hr@paulusoro.com</span>
                </p>
              </div>
              <p className="text-white/40">&copy; {new Date().getFullYear()} Paul Usoro &amp; Co. All rights reserved.</p>
            </footer>
          </div>
        </div>
      </div>

      <main className="flex flex-1 items-center justify-center px-6 py-16 lg:px-12">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-semibold text-slate-900">Welcome back</h2>
            <p className="text-sm text-slate-500">Use your firm email and password to access the leave portal.</p>
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
              <label htmlFor="email" className="text-sm font-medium text-slate-700">
                Work email
              </label>
              <input
                id="email"
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
                <label htmlFor="password" className="text-sm font-medium text-slate-700">
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
                id="password"
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
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <Link href="/leave/activate" className="font-medium text-emerald-600 transition hover:text-emerald-500">
              Activate account
            </Link>
            <Link href="/leave/forgot" className="font-medium text-emerald-600 transition hover:text-emerald-500">
              Forgot password?
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

