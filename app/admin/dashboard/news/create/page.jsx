'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { toast } from 'react-toastify';
import { ArrowLeft, Sparkles, Image as ImageIcon, Link2, RefreshCcw } from 'lucide-react';

const SimpleEditor = dynamic(() => import('../../../../../components/admin/blog/SimpleEditor'), {
  ssr: false,
  loading: () => <div className="h-64 rounded-2xl border border-dashed border-slate-200 bg-white p-6" />,
});

const inputClasses =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition';
const textareaClasses = `${inputClasses} min-h-[140px] resize-none`;
const sectionClasses = 'admin-surface rounded-2xl border border-slate-200 p-6 shadow-sm shadow-slate-100';
const asideSectionClasses = 'admin-surface rounded-2xl border border-slate-200 p-6 shadow-sm shadow-slate-100';
const labelClasses = 'text-xs font-semibold uppercase tracking-wide text-slate-500';

const defaultForm = {
  title: '',
  slug: '',
  excerpt: '',
  author: '',
  coverImage: '',
  tags: '',
  content: '',
  status: 'draft',
  scheduledAt: '',
  featured: false,
};

// FIXED: Corrected regex pattern - was [^  -] which matches nothing, should be [^\w\s-]
const generateSlug = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters, keep alphanumeric, whitespace, and hyphens
    .replace(/[\s_]+/g, '-')   // Replace spaces and underscores with hyphens
    .replace(/-+/g, '-')        // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '');     // Remove leading/trailing hyphens

export default function CreateBlogPage() {
  const router = useRouter();
  const [formData, setFormData] = useState(defaultForm);
  const [coverFile, setCoverFile] = useState(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const tagList = useMemo(
    () =>
      formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    [formData.tags]
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    setCoverFile(file || null);
    if (file) {
      const url = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, coverImage: url }));
    }
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      slug: slugTouched ? prev.slug : generateSlug(title),
    }));
  };

  const handleSlugChange = (e) => {
    setSlugTouched(true);
    const rawValue = e.target.value;
    setFormData((prev) => ({
      ...prev,
      slug: generateSlug(rawValue),
    }));
  };

  const resetSlug = () => {
    setSlugTouched(false);
    setFormData((prev) => ({
      ...prev,
      slug: generateSlug(prev.title || ''),
    }));
  };

  const handleContentChange = (content) => {
    setFormData((prev) => ({ ...prev, content }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://puc-backend-t8pl.onrender.com';
      const token = localStorage.getItem('admin_token');

      let res;
      if (coverFile) {
        const data = new FormData();
        data.append('title', formData.title);
        data.append('slug', formData.slug);
        data.append('excerpt', formData.excerpt);
        data.append('content', formData.content);
        data.append('status', formData.status);
        if (formData.scheduledAt) data.append('scheduledAt', formData.scheduledAt);
        data.append('tags', JSON.stringify(tagList));
        data.append('coverImage', coverFile);

        res = await fetch(`${backendUrl}/api/blogs`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
          body: data,
        });
      } else {
        res = await fetch(`${backendUrl}/api/blogs`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : undefined,
          },
          body: JSON.stringify({
            ...formData,
            tags: tagList,
          }),
        });
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to create news post');
      }

      toast.success('News post created successfully.');
      router.push('/admin/dashboard/news');
    } catch (err) {
      console.error('Error creating blog:', err);
      const message = err.message || 'Failed to create news post';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const previewUrl = formData.coverImage?.trim();
  const isScheduled = formData.status === 'scheduled';

  return (
    <div className="admin-page space-y-8">
      <header className="admin-surface flex flex-col gap-4 rounded-2xl border border-slate-200 p-6 shadow-sm shadow-slate-100 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to news list
          </button>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Create new news post</h1>
          <p className="max-w-2xl text-sm text-slate-600">
            Craft a polished article for the public site. Provide a strong cover image, a descriptive slug, and rich content to boost engagement.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setFormData(defaultForm)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
          >
            <RefreshCcw className="h-4 w-4" />
            Clear form
          </button>
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
            <Sparkles className="h-4 w-4" />
            Draft mode
          </span>
        </div>
      </header>

      {error && (
        <div className="admin-surface rounded-2xl border border-rose-200 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <section className={sectionClasses}>
            <div className="flex flex-col gap-5">
              <div className="space-y-2">
                <label className={labelClasses}>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleTitleChange}
                  required
                  className={inputClasses}
                  placeholder="Paulusoro & Co. wins landmark arbitration..."
                />
              </div>

              <div className="grid gap-3 md:grid-cols-[2fr_auto] md:items-end">
                <div className="space-y-2">
                  <label className={labelClasses}>URL slug *</label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleSlugChange}
                    required
                    className={inputClasses}
                    placeholder="paulusoro-wins-arbitration"
                  />
                  <p className="flex items-center gap-2 text-xs text-slate-500">
                    <Link2 className="h-3.5 w-3.5" />
                    `/news/{formData.slug || 'your-slug'}`
                  </p>
                </div>
                <button
                  type="button"
                  onClick={resetSlug}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  Auto-generate
                </button>
              </div>

              <div className="space-y-2">
                <label className={labelClasses}>Excerpt</label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleChange}
                  className={textareaClasses}
                  placeholder="Short summary that appears on listings and previews."
                />
              </div>

              <div className="space-y-2">
                <label className={labelClasses}>Author(s)</label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="John Doe, Jane Smith"
                />
                <p className="text-xs text-slate-500">Enter author name(s). Separate multiple authors with commas.</p>
              </div>

              <div className="space-y-2">
                <label className={labelClasses}>Tags (comma-separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="litigation, arbitration, dispute resolution"
                />
                {tagList.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {tagList.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className={sectionClasses}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Article body</h2>
                <p className="text-sm text-slate-500">Use headings, quotes, and links to keep the story engaging.</p>
              </div>
            </div>
            <div className="mt-4">
              <SimpleEditor value={formData.content} onChange={handleContentChange} />
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className={asideSectionClasses}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Cover image *</h3>
                <p className="text-xs text-slate-500">Provide an absolute URL. Recommended 1600×900px.</p>
              </div>
            </div>
              <div className="mt-4 space-y-3">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  {previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={previewUrl} alt="Cover preview" className="h-40 w-full object-cover" />
                  ) : (
                    <div className="flex h-40 w-full items-center justify-center gap-2 text-sm text-slate-400">
                      <ImageIcon className="h-5 w-5" /> No cover image yet
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs text-slate-500">Cover image</label>

                  <div className="mt-2">
                    <input
                      id="cover-file-input"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="sr-only"
                    />

                    <label
                      htmlFor="cover-file-input"
                      className="group flex cursor-pointer items-center gap-4 rounded-lg border-2 border-dashed border-slate-200 px-4 py-3 hover:border-emerald-300 transition"
                    >
                      <ImageIcon className="h-6 w-6 text-emerald-600 group-hover:text-emerald-700" />
                      <div>
                        <div className="text-sm font-semibold text-slate-900">Upload image from your device</div>
                        <div className="text-xs text-slate-500">PNG, JPG — up to 5MB</div>
                        {coverFile ? (
                          <div className="mt-1 text-xs text-slate-600">Selected: {coverFile.name}</div>
                        ) : null}
                      </div>
                    </label>
                  </div>

                  <div className="mt-3 text-xs text-slate-500">Or paste an external image URL</div>
                  <input
                    type="url"
                    name="coverImage"
                    value={formData.coverImage}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder="https://assets.paulusoro.com/blog/cover.jpg"
                  />
                </div>
              </div>
          </section>

          <section className={asideSectionClasses}>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className={labelClasses}>Publishing status *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={inputClasses}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>

              {isScheduled && (
                <div className="space-y-2">
                  <label className={labelClasses}>Schedule date</label>
                  <input
                    type="datetime-local"
                    name="scheduledAt"
                    value={formData.scheduledAt}
                    onChange={handleChange}
                    className={inputClasses}
                  />
                </div>
              )}

              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-700">Feature this post</p>
                  <p className="text-xs text-slate-500">Pinned to the top of the public news.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, featured: !prev.featured }))}
                  className={`relative h-6 w-12 rounded-full transition ${
                    formData.featured ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                  aria-pressed={formData.featured}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                      formData.featured ? 'right-0.5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>
        </aside>

        <footer className="admin-surface lg:col-span-2 flex flex-col gap-3 rounded-2xl border border-slate-200 p-6 shadow-sm shadow-slate-100 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-slate-400">
            Tip: publish immediately or keep as a draft while you gather approvals.
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 px-6 py-2 text-sm font-medium text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-7 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Creating…' : 'Create post'}
            </button>
          </div>
        </footer>
      </form>
    </div>
  );
}