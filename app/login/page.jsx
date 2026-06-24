'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useHubAuth, resolveHubSafeRedirect } from '../../components/hub/HubAuthContext';

function LoadingCard({ message = 'Checking your session…' }) {
  return (
    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}

function SignedInPanel({ user, nextTarget, onSignOut }) {
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email;
  const roles = Array.isArray(user?.roles) ? user.roles : [];
  return (
    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
      <h1 className="text-2xl font-bold mb-2 text-center text-slate-800">PUC Hub</h1>
      <p className="text-center text-slate-600 mb-6">
        Signed in as <span className="font-medium">{name}</span>
      </p>

      {roles.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {roles.map((r) => (
            <span key={r} className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {r}
            </span>
          ))}
        </div>
      )}

      <Link
        href={nextTarget}
        className="block w-full text-center py-2 px-4 rounded-md text-white font-medium bg-emerald-600 hover:bg-emerald-700 transition-colors"
      >
        Continue
      </Link>
      <button
        type="button"
        onClick={onSignOut}
        className="mt-3 block w-full text-center py-2 px-4 rounded-md font-medium text-slate-600 hover:text-slate-800"
      >
        Sign out
      </button>
    </div>
  );
}

function LoginInner() {
  const searchParams = useSearchParams();
  const nextTarget = resolveHubSafeRedirect(searchParams?.get('next'));
  const { signIn, signOut, status, user, isAuthenticated } = useHubAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signIn(form.email, form.password);
      // On success the provider flips to `authenticated` and this view swaps to the
      // signed-in panel. (Phase 4 will switch this to an automatic redirect once the
      // /dashboard shell exists.)
    } catch (err) {
      setError(err?.message || 'Unable to sign in');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading') return <LoadingCard />;

  if (isAuthenticated && user) {
    return <SignedInPanel user={user} nextTarget={nextTarget} onSignOut={signOut} />;
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
      <h1 className="text-2xl font-bold mb-1 text-center text-slate-800">PUC Hub</h1>
      <p className="text-center text-slate-500 text-sm mb-6">Sign in to continue</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input
            type="email" id="email" name="email" value={form.email} onChange={handleChange}
            placeholder="Enter your email" autoComplete="email" required disabled={submitting}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <input
            type="password" id="password" name="password" value={form.password} onChange={handleChange}
            placeholder="Enter your password" autoComplete="current-password" required disabled={submitting}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <button
          type="submit" disabled={submitting}
          className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${
            submitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500'
          }`}
        >
          {submitting ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
      <Suspense fallback={<LoadingCard message="Loading…" />}>
        <LoginInner />
      </Suspense>
    </div>
  );
}
