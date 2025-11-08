'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  Plus,
  RefreshCcw,
  Search,
  Filter,
  FileText,
  CheckCircle2,
  Clock,
  Star,
  Eye,
  Edit,
  Trash2,
  ArrowLeft,
} from 'lucide-react';

const statusMeta = {
  draft: {
    label: 'Draft',
    badge: 'bg-slate-200 text-slate-700',
    icon: Clock,
  },
  published: {
    label: 'Published',
    badge: 'bg-emerald-100 text-emerald-700',
    icon: CheckCircle2,
  },
  scheduled: {
    label: 'Scheduled',
    badge: 'bg-blue-100 text-blue-700',
    icon: Clock,
  },
};

const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export default function BlogManagementPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchBlogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let data = [...blogs];

    if (statusFilter !== 'all') {
      data = data.filter((blog) => (blog.status || 'draft') === statusFilter);
    }

    if (featuredOnly) {
      data = data.filter((blog) => blog.featured);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      data = data.filter((blog) => {
        const haystack = [
          blog.title,
          blog.excerpt,
          blog.author,
          ...(blog.tags || []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(term);
      });
    }

    setFiltered(data);
  }, [blogs, statusFilter, featuredOnly, searchTerm]);

  const fetchBlogs = async (showToast = false) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      
      const res = await fetch(`${backendUrl}/api/blogs/admin/all`, {
        credentials: 'include',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Unable to load blog posts.');
      }

        const data = await res.json();
      setBlogs(Array.isArray(data) ? data : []);
      if (showToast) {
        toast.success('Blog posts refreshed.');
      }
    } catch (err) {
      console.error('Failed to fetch blogs:', err);
      toast.error(err.message || 'Failed to fetch blog posts.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchBlogs(true);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Delete this post? This action cannot be undone.');
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('admin_token');
      
      const res = await fetch(`${backendUrl}/api/blogs/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete blog post.');
      }

      toast.success('Blog post deleted.');
      setBlogs((prev) => prev.filter((blog) => blog._id !== id));
    } catch (err) {
      console.error('Failed to delete blog:', err);
      toast.error(err.message || 'Failed to delete blog post.');
    }
  };

  const stats = useMemo(() => {
    const total = blogs.length;
    const published = blogs.filter((b) => b.status === 'published').length;
    const drafts = blogs.filter((b) => (b.status || 'draft') === 'draft').length;
    const featured = blogs.filter((b) => b.featured).length;

    return {
      total,
      published,
      drafts,
      featured,
    };
  }, [blogs]);

  if (loading && !isRefreshing) {
    return (
      <div className="admin-surface flex min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-slate-200">
        <div className="flex flex-col items-center gap-3 admin-text-muted">
          <span className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
          <p className="text-sm font-medium">Loading blog posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page space-y-8">
      <header className="admin-surface flex flex-col gap-4 rounded-2xl border border-slate-200 p-6 shadow-sm shadow-slate-100 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold admin-text-muted transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to blog list
          </button>
          <h1 className="text-2xl font-bold admin-text md:text-3xl">Blog Management</h1>
          <p className="max-w-2xl text-sm admin-text-muted">
            Publish insight pieces, highlight firm achievements, and keep the public blog fresh.
            Drafts stay private until you publish.
          </p>
      </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium admin-text transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
          >
            <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => router.push('/admin/dashboard/blog/create')}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-emerald-200 transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            <Plus className="h-4 w-4" />
            New Post
          </button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Total Posts
              </p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{stats.total}</p>
            </div>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <FileText className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-3 text-xs text-slate-500">Everything in the content library.</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Published
              </p>
              <p className="mt-2 text-3xl font-semibold text-emerald-700">{stats.published}</p>
            </div>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-3 text-xs text-slate-500">Live on the public blog.</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Drafts
              </p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{stats.drafts}</p>
            </div>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <Clock className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-3 text-xs text-slate-500">Still in review or awaiting revisions.</p>
        </div>

        <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/70 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-500">
                Featured
              </p>
              <p className="mt-2 text-3xl font-semibold text-amber-600">{stats.featured}</p>
            </div>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <Star className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-3 text-xs text-amber-600/80">
            Spotlight stories promoted to the top of the public page.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search titles, excerpts, authors or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 md:justify-end">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
              <Filter className="h-4 w-4 text-slate-400" />
              <span className="font-medium">Status</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-200"
              >
                <option value="all">All</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>

            <button
              onClick={() => setFeaturedOnly((prev) => !prev)}
              className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition ${
                featuredOnly
                  ? 'border-amber-200 bg-amber-50 text-amber-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700'
              }`}
            >
              <Star className="h-4 w-4" />
              Featured {featuredOnly ? 'Only' : 'Filter'}
            </button>

            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {filtered.length} result{filtered.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>
      </section>

      {filtered.length === 0 ? (
        <section className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 text-slate-500">
            <FileText className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-slate-800">Nothing matches yet</h2>
            <p className="text-sm text-slate-500">
              Refine your filters or create something new to fill this space.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setFeaturedOnly(false);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
            >
              Reset Filters
            </button>
            <button
              onClick={() => router.push('/admin/dashboard/blog/create')}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-emerald-200 transition hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4" />
              Create Post
            </button>
          </div>
        </section>
      ) : (
        <section className="grid gap-6">
          {filtered.map((blog) => {
            const statusKey = (blog.status || 'draft').toLowerCase();
            const status = statusMeta[statusKey] || statusMeta['draft'];
            const StatusIcon = status.icon;
            const hasCover = Boolean(blog.coverImage);

            return (
              <article
                key={blog._id}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="relative w-full md:w-1/3">
                    <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100">
                      {hasCover ? (
                        <img
                          src={blog.coverImage}
                          alt={blog.title}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-slate-400">
                          No cover image
                        </div>
                      )}
                    </div>
                    {blog.featured && (
                      <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white shadow">
                        <Star className="h-3 w-3" />
                        Featured
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-5 p-6 md:p-8">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${status.badge}`}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          {status.label}
                        </span>
                        {blog.category && (
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                            {blog.category}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                        <Eye className="h-3.5 w-3.5" />
                        {blog.views || 0} views
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h2 className="text-lg font-semibold text-slate-900 md:text-xl">
                        {blog.title}
                      </h2>
                      {blog.excerpt && (
                        <p className="text-sm text-slate-600 line-clamp-3">{blog.excerpt}</p>
                      )}
                    </div>

                    {blog.tags && blog.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {blog.tags.slice(0, 5).map((tag, index) => (
                          <span
                            key={`${blog._id}-tag-${index}`}
                            className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                          >
                            #{tag}
                          </span>
                        ))}
                        {blog.tags.length > 5 && (
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                            +{blog.tags.length - 5} more
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
                      <div className="flex flex-wrap items-center gap-4">
                        <span className="font-medium text-slate-600">
                          {blog.author || 'Editorial Team'}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => router.push(`/admin/dashboard/blog/edit/${blog._id}`)}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      >
                          <Edit className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(blog._id)}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:border-red-200 hover:bg-red-50"
                      >
                          <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                        <button
                          onClick={() => router.push(`/blog/${blog.slug}`)}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View Live
                        </button>
                      </div>
                    </div>
                  </div>
        </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
