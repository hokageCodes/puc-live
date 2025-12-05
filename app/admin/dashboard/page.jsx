// app/admin/dashboard/page.js
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  FileText,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpRight,
  Eye,
  PenSquare,
  Settings,
} from 'lucide-react';

const cardBase = 'admin-surface rounded-2xl border border-slate-200 p-6 shadow-sm shadow-slate-100';
const smallText = 'text-xs font-semibold uppercase tracking-wide admin-text-muted';
const metricValue = 'text-3xl font-semibold admin-text';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalStaff: 0,
    totalBlogs: 0,
    publishedBlogs: 0,
    draftBlogs: 0,
    recentBlogs: [],
    featuredBlogs: [],
    newestStaff: [],
  });
  const [error, setError] = useState('');

  const adminName = useMemo(() => {
    if (typeof window === 'undefined') return 'Admin';
    try {
      const stored = JSON.parse(window.localStorage.getItem('adminData'));
      if (stored?.email) {
        return stored.email.split('@')[0];
      }
    } catch (err) {
      console.warn('Failed to parse stored admin info:', err);
    }
    return 'Admin';
  }, []);

  const loadStats = async (showToast = false) => {
    try {
      setIsRefreshing(showToast);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const token = typeof window !== 'undefined' ? window.localStorage.getItem('admin_token') : null;
      const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

      const [staffRes, blogsRes] = await Promise.all([
        fetch(`${backendUrl}/api/staff`, {
          credentials: 'include',
          headers: authHeaders,
        }),
        fetch(`${backendUrl}/api/blogs/admin/all`, {
          credentials: 'include',
          headers: authHeaders,
        }),
      ]);

      if (!staffRes.ok && !blogsRes.ok) {
        throw new Error('Unable to load dashboard data.');
      }

      const [staffData = [], blogData = []] = await Promise.all([
        staffRes.ok ? staffRes.json() : Promise.resolve([]),
        blogsRes.ok ? blogsRes.json() : Promise.resolve([]),
      ]);

      const sortedBlogs = [...blogData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const recentBlogs = sortedBlogs.slice(0, 4);
      const featuredBlogs = sortedBlogs.filter((blog) => blog.featured).slice(0, 3);

      const newestStaff = [...staffData]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 4);

      setStats({
        totalStaff: staffData.length,
        totalBlogs: blogData.length,
        publishedBlogs: blogData.filter((blog) => blog.status === 'published').length,
        draftBlogs: blogData.filter((blog) => blog.status === 'draft').length,
        recentBlogs,
        featuredBlogs,
        newestStaff,
      });
      setError('');
    } catch (err) {
      console.error('Dashboard load failed:', err);
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const metrics = [
    {
      label: 'Team members',
      value: stats.totalStaff,
      icon: Users,
      accent: 'bg-emerald-50 text-emerald-600',
      description: 'Profiles live in the directory',
      href: '/admin/dashboard/staff',
    },
    {
      label: 'News posts',
      value: stats.totalBlogs,
      icon: FileText,
      accent: 'bg-sky-50 text-sky-600',
      description: 'Published + drafts',
      href: '/admin/dashboard/news',
    },
    {
      label: 'Published',
      value: stats.publishedBlogs,
      icon: CheckCircle2,
      accent: 'bg-lime-50 text-lime-600',
      description: 'Live on the website',
      href: '/admin/dashboard/news',
    },
    {
      label: 'Drafts',
      value: stats.draftBlogs,
      icon: Clock,
      accent: 'bg-amber-50 text-amber-600',
      description: 'Waiting for review',
      href: '/admin/dashboard/news',
    },
  ];

  return (
    <div className="admin-page space-y-8">
      <section className={`${cardBase} flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between`}>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-emerald-600">Overview</p>
          <h1 className="mt-2 text-2xl font-bold admin-text md:text-3xl">Welcome back, {adminName}.</h1>
          <p className="mt-3 text-sm admin-text-muted max-w-2xl">
            Monitor content momentum, keep an eye on staff visibility, and jump into the tasks that matter most. Everything updates in real time as submissions go live.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => loadStats(true)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium admin-text transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
          >
            <Sparkles className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh data
          </button>
          <Link
            href="/admin/dashboard/news/create"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            <PenSquare className="h-4 w-4" />
            New post
          </Link>
        </div>
      </section>

      {error && (
        <div className="admin-surface rounded-2xl border border-rose-200 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="admin-surface flex min-h-[200px] items-center justify-center rounded-2xl border border-slate-200">
          <div className="flex items-center gap-3 admin-text-muted">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
            Loading dashboard…
          </div>
        </div>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {metrics.map(({ label, value, icon: Icon, accent, description, href }) => (
              <Link key={label} href={href} className="block">
                <article className={`${cardBase} transition hover:-translate-y-0.5 hover:shadow-lg`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={smallText}>{label}</p>
                      <p className={`${metricValue} mt-2`}>{value}</p>
                    </div>
                    <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${accent}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>
                  <p className="mt-3 text-sm admin-text-muted">{description}</p>
                </article>
              </Link>
            ))}
          </section>

          <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <article className={`${cardBase} space-y-5`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold admin-text">Recent news activity</h2>
                  <p className="text-sm admin-text-muted">Latest posts and their performance at a glance.</p>
                </div>
                <Link
                  href="/admin/dashboard/news"
                  className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700"
                >
                  Manage posts <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>

              {stats.recentBlogs.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center">
                  <p className="text-sm admin-text-muted">No news posts yet. Publish your first story to populate this feed.</p>
                  <Link
                    href="/admin/dashboard/news/create"
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    <PenSquare className="h-4 w-4" />
                    Write a post
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.recentBlogs.map((blog) => (
                    <Link key={blog._id} href={`/admin/dashboard/news/edit/${blog._id}`} className="block">
                      <div className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 transition hover:border-emerald-200 hover:bg-emerald-50/40">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                                blog.status === 'published'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : blog.status === 'scheduled'
                                    ? 'bg-sky-100 text-sky-700'
                                    : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {blog.status}
                            </span>
                            {blog.featured && (
                              <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                                Featured
                              </span>
                            )}
                          </div>
                          <h3 className="mt-2 text-sm font-semibold admin-text">{blog.title}</h3>
                          <p className="text-xs admin-text-muted">
                            {new Date(blog.createdAt).toLocaleDateString()} • {(blog.tags || []).slice(0, 2).join(', ') || 'No tags'}
                          </p>
                        </div>
                        <div className="ml-4 flex items-center gap-2 text-xs admin-text-muted">
                          <Eye className="h-4 w-4" />
                          {blog.views || 0}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </article>

            <aside className="space-y-6">
              <article className={`${cardBase} space-y-5`}>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold admin-text">Newest team members</h2>
                  <Link href="/admin/dashboard/staff" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
                    View all
                  </Link>
                </div>

                {stats.newestStaff.length === 0 ? (
                  <p className="text-sm admin-text-muted">No staff profiles yet. Add a team member to populate this list.</p>
                ) : (
                  <ul className="space-y-3">
                    {stats.newestStaff.map((member) => (
                      <li key={member._id} className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
                        <div>
                          <p className="text-sm font-medium admin-text">
                            {member.firstName} {member.lastName}
                          </p>
                          <p className="text-xs admin-text-muted">
                            {member.position || 'Role pending'} • {new Date(member.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                            member.isVisible === false
                              ? 'bg-slate-200 text-slate-600'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {member.isVisible === false ? 'Hidden' : 'Live'}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>

              <article className={`${cardBase} space-y-4`}>
                <h2 className="text-lg font-semibold admin-text">Quick actions</h2>
                <div className="space-y-3">
                  <Link href="/admin/dashboard/news/create" className="block">
                    <div className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-3 transition hover:border-emerald-200 hover:bg-emerald-50/40">
                      <div>
                        <p className="text-sm font-medium admin-text">Draft a new news post</p>
                        <p className="text-xs admin-text-muted">Jump straight into the editor</p>
                      </div>
                      <PenSquare className="h-4 w-4 admin-text-muted" />
                    </div>
                  </Link>
                  <Link href="/admin/dashboard/staff" className="block">
                    <div className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-3 transition hover:border-emerald-200 hover:bg-emerald-50/40">
                      <div>
                        <p className="text-sm font-medium admin-text">Manage staff visibility</p>
                        <p className="text-xs admin-text-muted">Update bios and order</p>
                      </div>
                      <Users className="h-4 w-4 admin-text-muted" />
                    </div>
                  </Link>
                  <Link href="/admin/dashboard/settings" className="block">
                    <div className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-3 transition hover:border-emerald-200 hover:bg-emerald-50/40">
                      <div>
                        <p className="text-sm font-medium admin-text">Review admin settings</p>
                        <p className="text-xs admin-text-muted">Password & theme</p>
                      </div>
                      <Settings className="h-4 w-4 admin-text-muted" />
                    </div>
                  </Link>
                </div>
              </article>
            </aside>
          </section>
        </>
      )}
    </div>
  );
}