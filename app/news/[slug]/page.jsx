'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Heart, Share2, Copy, Check } from 'lucide-react';
import { toast } from 'react-toastify';

const getVisitorId = () => {
  if (typeof window === 'undefined') return '';

  let savedId = localStorage.getItem('puc_blog_visitor_id');
  if (!savedId) {
    const generated = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `visitor-${Math.random().toString(36).slice(2)}-${Date.now()}`;
    localStorage.setItem('puc_blog_visitor_id', generated);
    savedId = generated;
  }
  return savedId;
};

export default function SingleBlogPage() {
  const params = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

  const fetchBlog = useCallback(async () => {
    if (!params?.slug) return;

    const visitorId = getVisitorId();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${backendUrl}/api/blogs/${params.slug}?visitorId=${visitorId}`);

      if (!res.ok) {
        if (res.status === 404) {
          setError('Blog post not found');
        } else {
          setError('Failed to load blog post');
        }
        setBlog(null);
        return;
      }

      const data = await res.json();
      const { isLiked: liked = false, likesCount: likes = 0, ...blogData } = data;

      setBlog(blogData);
      setIsLiked(Boolean(liked));
      setLikesCount(typeof likes === 'number' ? likes : 0);
    } catch (err) {
      console.error('Failed to fetch blog:', err);
      setError('Failed to load blog post');
      setBlog(null);
    } finally {
      setLoading(false);
    }
  }, [backendUrl, params?.slug]);

  useEffect(() => {
    fetchBlog();
  }, [fetchBlog]);

  const handleToggleLike = async () => {
    if (!blog || likeLoading) return;

    const visitorId = getVisitorId();
    setLikeLoading(true);

    try {
      const res = await fetch(`${backendUrl}/api/blogs/${params.slug}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ visitorId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Unable to update like');
      }

      const data = await res.json();
      setLikesCount(typeof data.likesCount === 'number' ? data.likesCount : likesCount);
      setIsLiked(Boolean(data.isLiked));
    } catch (err) {
      console.error('Toggle like failed:', err);
      toast.error(err.message || 'Could not update like. Please try again.');
    } finally {
      setLikeLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (typeof window === 'undefined') return;

    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Copy link failed:', err);
      toast.error('Unable to copy link');
    }
  };

  const handleShare = async () => {
    if (typeof window === 'undefined') return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: blog?.title || 'Paulusoro & Co.',
          text: blog?.excerpt || '',
          url: window.location.href,
        });
      } else {
        await handleCopyLink();
      }
    } catch (err) {
      if (err?.name !== 'AbortError') {
        console.error('Share failed:', err);
        toast.error('Unable to share link');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center pt-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center pt-32 px-4">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold text-slate-800 mb-4">Post Not Found</h1>
          <p className="text-slate-600 mb-6">{error || 'The blog post you are looking for does not exist.'}</p>
          <Link href="/news" className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
            Back to News
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-white pt-32 pb-20 overflow-x-hidden">
      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-4 mb-8">
        <Link href="/news" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 transition-colors">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to News
        </Link>
      </div>

      {/* Hero Image */}
      <div className="max-w-5xl mx-auto px-4 mb-8 md:mb-12 overflow-hidden">
        <div className="aspect-video md:aspect-[21/9] w-full overflow-hidden rounded-2xl bg-slate-100 shadow-xl">
          <img
            src={blog.coverImage}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <header className="mb-8 space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
            {blog.featured && (
              <span className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-full">
                Featured
              </span>
            )}
            <span>
              {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
            <span>•</span>
            <span>{blog.views || 0} views</span>
            <span>•</span>
            <button
              onClick={handleToggleLike}
              disabled={likeLoading}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                isLiked
                  ? 'border-rose-200 bg-rose-50 text-rose-600'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600'
              }`}
              aria-pressed={isLiked}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              {likeLoading ? 'Saving...' : `${likesCount} like${likesCount === 1 ? '' : 's'}`}
            </button>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <Share2 className="h-4 w-4" />
              Share
            </button>
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied' : 'Copy link'}
            </button>
          </div>

          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag, index) => (
                <Link
                  key={index}
                  href={`/news/tag/${encodeURIComponent(tag)}`}
                  className="px-4 py-2 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-full border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}
        </header>

        {/* Author */}
        {blog.author && (
          <div className="mb-4">
            <p className="text-sm text-slate-500 mb-1">Author</p>
            <Link
              href={`/news?author=${encodeURIComponent(blog.author)}`}
              className="text-lg font-semibold text-emerald-700 hover:text-emerald-600 transition-colors"
            >
              {blog.author}
            </Link>
          </div>
        )}

        {/* Title */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-emerald-700 mb-6 leading-tight">
          {blog.title}
        </h1>

        {/* Excerpt */}
        {blog.excerpt && (
          <p className="text-xl md:text-2xl text-slate-600 mb-8 leading-relaxed font-light">
            {blog.excerpt}
          </p>
        )}

        {/* Divider */}
        <div className="border-t border-slate-200 my-8"></div>

        {/* Content */}
        <div 
          className="prose prose-lg md:prose-xl max-w-none prose-emerald prose-headings:text-emerald-700 prose-a:text-emerald-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg prose-img:shadow-lg prose-blockquote:border-emerald-600 prose-blockquote:bg-emerald-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r prose-strong:text-emerald-900"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </div>

      {/* Footer */}
      <div className="max-w-3xl mx-auto px-4 mt-16 pt-8 border-t border-slate-200">
        <Link 
          href="/news" 
          className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to All Posts
        </Link>
      </div>
    </article>
  );
}

