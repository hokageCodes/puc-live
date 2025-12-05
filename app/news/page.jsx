'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function BlogPageContent() {
  const searchParams = useSearchParams();
  const authorFilter = searchParams?.get('author');
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://puc-backend-t8pl.onrender.com";
      const res = await fetch(`${backendUrl}/api/blogs/public`);
      
      if (res.ok) {
        const data = await res.json();
        setBlogs(data);
      }
    } catch (err) {
      console.error('Failed to fetch blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading news posts...</p>
        </div>
      </div>
    );
  }

  // Filter by author if specified
  let filteredBlogs = blogs;
  if (authorFilter) {
    filteredBlogs = blogs.filter(blog => 
      blog.author && blog.author.toLowerCase().includes(authorFilter.toLowerCase())
    );
  }

  // Separate featured and regular posts
  const featuredPost = filteredBlogs.find(blog => blog.featured);
  const regularPosts = filteredBlogs.filter(blog => !blog.featured);

  // Get all unique tags for sidebar
  const allTags = Array.from(
    new Set(
      blogs.flatMap(blog => blog.tags || [])
    )
  ).sort();

  return (
    <div className="min-h-screen bg-white pt-32 overflow-x-hidden">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        {authorFilter ? (
          <>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-emerald-700 mb-4">
              Articles by {authorFilter}
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-4">
              {filteredBlogs.length} {filteredBlogs.length === 1 ? 'article' : 'articles'} found
            </p>
            <Link 
              href="/news" 
              className="inline-flex items-center text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              ← View all news
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-emerald-700 mb-4">
              Our News
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
              Insights, updates, and thought leadership from our team
            </p>
          </>
        )}
      </div>

      {/* Featured Post */}
      {featuredPost && (
        <div className="max-w-7xl mx-auto px-4 mb-20 overflow-hidden">
          <Link href={`/news/${featuredPost.slug}`}>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-slate-100 w-full">
              <div className="aspect-video w-full overflow-hidden bg-slate-100">
                <img
                  src={featuredPost.coverImage}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 md:p-10">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-full shadow-md">
                    Featured
                  </span>
                  <span className="text-sm text-slate-500">
                    {new Date(featuredPost.publishedAt || featuredPost.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-emerald-700 mb-4 hover:text-emerald-600 transition-colors">
                  {featuredPost.title}
                </h2>
                {featuredPost.excerpt && (
                  <p className="text-base md:text-lg text-slate-600 mb-6 leading-relaxed">
                    {featuredPost.excerpt}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mb-6">
                  {featuredPost.tags?.map((tag, index) => (
                    <Link
                      key={index}
                      href={`/news/tag/${encodeURIComponent(tag)}`}
                      onClick={(e) => e.stopPropagation()}
                      className="px-3 py-1 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-full border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 transition-colors"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
                <div className="flex items-center text-emerald-600 font-semibold group">
                  Read More 
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Regular Posts */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        {regularPosts.length > 0 ? (
          <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-2">
            {regularPosts.map((post) => (
              <Link key={post._id} href={`/news/${post.slug}`} className="group block h-full">
                <article className="h-full bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300">
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex flex-col flex-1 px-5 py-6 md:px-6 md:py-7">
                    <span className="text-xs uppercase tracking-wide text-slate-400 mb-3">
                      {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                    <h2 className="text-lg md:text-xl font-semibold text-emerald-700 leading-snug mb-3 group-hover:text-emerald-600 transition-colors">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 mb-4">
                        {post.excerpt}
                      </p>
                    )}
                    {post.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-auto mb-4">
                        {post.tags.slice(0, 3).map((tag, tagIndex) => (
                          <Link
                            key={tagIndex}
                            href={`/news/tag/${encodeURIComponent(tag)}`}
                            onClick={(e) => e.stopPropagation()}
                            className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 transition-colors"
                          >
                            {tag}
                          </Link>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center text-emerald-600 font-semibold mt-auto">
                      Read More
                      <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
            </div>

            {/* Popular Tags Sidebar */}
            {allTags.length > 0 && (
              <aside className="lg:sticky lg:top-32 h-fit">
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-4">Browse by Topic</h3>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/news/tag/${encodeURIComponent(tag)}`}
                        className="px-3 py-1.5 bg-white text-emerald-700 text-sm font-medium rounded-full border border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 transition-colors"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>
              </aside>
            )}
          </div>
        ) : (
          <div className="text-center py-16 text-slate-500 text-sm">
            No additional articles at the moment.
          </div>
        )}
      </div>

      {filteredBlogs.length === 0 && !loading && (
        <div className="max-w-7xl mx-auto px-4 py-20 text-center overflow-hidden">
          <p className="text-xl md:text-2xl text-slate-500 mb-4">
            {authorFilter 
              ? `No articles found by ${authorFilter}.` 
              : 'No news posts yet. Check back soon!'}
          </p>
          {authorFilter && (
            <Link 
              href="/news" 
              className="inline-block mt-4 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              View all news
            </Link>
          )}
          <div className="mt-8 text-6xl">📝</div>
        </div>
      )}
    </div>
  );
}

export default function BlogPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center pt-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <BlogPageContent />
    </Suspense>
  );
}
