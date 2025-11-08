'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { Shield, Sun, Moon, Lock, Save } from 'lucide-react';
import { useAdminTheme } from '../../../../components/admin/AdminThemeContext';

const inputClasses =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition';
const sectionClasses = 'rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100';
const labelClasses = 'text-xs font-semibold uppercase tracking-wide text-slate-500';

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme, setTheme, toggleTheme } = useAdminTheme();

  const handleThemeToggle = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    toast.success(`Switched to ${nextTheme} mode.`);
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (!currentPassword.trim() || !newPassword.trim()) {
      toast.warn('Please fill in the required password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      toast.success('Password update request sent (placeholder).');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Password update failed:', err);
      toast.error('Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-emerald-600">Admin Preferences</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900 md:text-3xl">Settings</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Control account security, choose your preferred theme, and manage upcoming admin personalisation features.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
            <Shield className="h-4 w-4" />
            Secure by default
          </span>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <section className={sectionClasses}>
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5 text-emerald-600" />
            <div>
              <h2 className="text-base font-semibold text-slate-900">Update password</h2>
              <p className="text-sm text-slate-500">Change your admin password to keep access secure.</p>
            </div>
          </div>

          <form onSubmit={handlePasswordUpdate} className="mt-6 space-y-4">
            <div className="space-y-2">
              <label className={labelClasses}>Current password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={inputClasses}
                placeholder="••••••••"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className={labelClasses}>New password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={inputClasses}
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <label className={labelClasses}>Confirm new password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClasses}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-700">Session reminder</p>
                <p className="text-xs text-slate-500">Make sure you save any ongoing work before changing your password.</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="mr-2 h-4 w-4" />
              {loading ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </section>

        <aside className="space-y-6">
          <section className={sectionClasses}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Theme preference</h3>
                <p className="text-xs text-slate-500">Choose the admin appearance you prefer. Dark mode coming soon.</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm">
                {theme === 'light' ? <Sun className="h-4 w-4 text-emerald-600" /> : <Moon className="h-4 w-4 text-slate-600" />}
                {theme === 'light' ? 'Light' : 'Dark'} mode
              </span>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <button
                type="button"
                onClick={handleThemeToggle}
                className={`relative h-10 w-full rounded-full border transition ${
                  theme === 'light'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-slate-300 bg-slate-100 text-slate-600'
                }`}
              >
                <div className="flex w-full items-center justify-between px-4">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <Sun className="h-4 w-4" /> Light
                  </span>
                  <span className="flex items-center gap-2 text-sm font-medium">
                    Dark <Moon className="h-4 w-4" />
                  </span>
                </div>
                <span
                  className={`absolute top-1 h-8 w-[50%] rounded-full bg-white shadow transition ${
                    theme === 'light' ? 'left-1' : 'left-1/2'
                  }`}
                />
              </button>
              <p className="mt-3 text-xs text-slate-500">
                Theme preference is saved per browser. Dark mode adjusts panels, typography, and navigation.
              </p>
            </div>
          </section>

          <section className={sectionClasses}>
            <h3 className="text-sm font-semibold text-slate-900">Upcoming controls</h3>
            <p className="mt-2 text-sm text-slate-500">
              Soon you’ll manage multi-factor authentication, API tokens, and other admin-specific preferences from here.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
