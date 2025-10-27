'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function SingleBlogPage() {
  const params = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBlog();
  }, [params.slug]);

  const fetchBlog = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://puc-backend-t8pl.onrender.com";
      const res = await fetch(`${backendUrl}/api/blogs/${params.slug}`);
      
      if (res.ok) {
        const data = await res.json();
        setBlog(data);
      } else {
        setError('Blog post not found');
      }
    } catch (err) {
      console.error('Failed to fetch blog:', err);
      setError('Failed to load blog post');
    } finally {
      setLoading(false);
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
          <Link href="/blog" className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-white pt-32 pb-20 overflow-x-hidden">
      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-4 mb-8">
        <Link href="/blog" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 transition-colors">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Blog
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
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            {blog.featured && (
              <span className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-full">
                Featured
              </span>
            )}
            <span className="text-sm text-slate-500">
              {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
            <span className="text-sm text-slate-500">•</span>
            <span className="text-sm text-slate-500">
              {blog.views || 0} views
            </span>
          </div>

          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {blog.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-full border border-emerald-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

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
          href="/blog" 
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

