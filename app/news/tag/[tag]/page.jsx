'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Tag, ArrowLeft } from 'lucide-react';

export default function TagPage() {
  const params = useParams();
  const tag = params?.tag;
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allTags, setAllTags] = useState([]);

  useEffect(() => {
    if (tag) {
      fetchBlogsByTag();
      fetchAllTags();
    }
  }, [tag]);

  const fetchBlogsByTag = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://puc-backend-t8pl.onrender.com";
      const res = await fetch(`${backendUrl}/api/blogs/public`);
      
      if (res.ok) {
        const data = await res.json();
        // Filter blogs by tag (case-insensitive)
        const decodedTag = decodeURIComponent(tag);
        const filtered = data.filter(blog => 
          blog.tags && blog.tags.some(t => 
            t.toLowerCase() === decodedTag.toLowerCase()
          )
        );
        setBlogs(filtered);
      }
    } catch (err) {
      console.error('Failed to fetch blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTags = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://puc-backend-t8pl.onrender.com";
      const res = await fetch(`${backendUrl}/api/blogs/public`);
      
      if (res.ok) {
        const data = await res.json();
        // Get all unique tags
        const tags = new Set();
        data.forEach(blog => {
          if (blog.tags && Array.isArray(blog.tags)) {
            blog.tags.forEach(tag => tags.add(tag));
          }
        });
        setAllTags(Array.from(tags).sort());
      }
    } catch (err) {
      console.error('Failed to fetch tags:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading posts...</p>
        </div>
      </div>
    );
  }

  const decodedTag = tag ? decodeURIComponent(tag) : '';

  return (
    <div className="min-h-screen bg-white pt-32 pb-20 overflow-x-hidden">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 mb-12">
        <Link 
          href="/news" 
          className="inline-flex items-center text-emerald-600 hover:text-emerald-700 transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to News
        </Link>
        
        <div className="flex items-center gap-3 mb-4">
          <Tag className="w-8 h-8 text-emerald-600" />
          <h1 className="text-4xl md:text-5xl font-bold text-emerald-700">
            {decodedTag}
          </h1>
        </div>
        <p className="text-lg text-slate-600">
          {blogs.length} {blogs.length === 1 ? 'article' : 'articles'} tagged with "{decodedTag}"
        </p>
      </div>

      {/* Popular Tags */}
      {allTags.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 mb-12">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-4">Browse by Topic</h2>
          <div className="flex flex-wrap gap-2">
            {allTags.map((t) => (
              <Link
                key={t}
                href={`/news/tag/${encodeURIComponent(t)}`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  t.toLowerCase() === decodedTag.toLowerCase()
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                {t}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Posts */}
      <div className="max-w-7xl mx-auto px-4">
        {blogs.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {blogs.map((post) => (
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
                        {post.tags.slice(0, 3).map((tagItem, tagIndex) => (
                          <Link
                            key={tagIndex}
                            href={`/news/tag/${encodeURIComponent(tagItem)}`}
                            onClick={(e) => e.stopPropagation()}
                            className={`px-3 py-1 text-xs font-medium rounded-full border transition ${
                              tagItem.toLowerCase() === decodedTag.toLowerCase()
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            }`}
                          >
                            {tagItem}
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
        ) : (
          <div className="text-center py-16">
            <Tag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">No articles found</h2>
            <p className="text-slate-600 mb-6">There are no articles tagged with "{decodedTag}" yet.</p>
            <Link 
              href="/news" 
              className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Browse All News
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

