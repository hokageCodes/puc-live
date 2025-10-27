'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function BlogPage() {
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
          <p className="text-gray-600">Loading blog posts...</p>
        </div>
      </div>
    );
  }

  // Separate featured and regular posts
  const featuredPost = blogs.find(blog => blog.featured);
  const regularPosts = blogs.filter(blog => !blog.featured);

  return (
    <div className="min-h-screen bg-white pt-32 overflow-x-hidden">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-emerald-700 mb-4">
          Our Blog
        </h1>
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
          Insights, updates, and thought leadership from our team
        </p>
      </div>

      {/* Featured Post */}
      {featuredPost && (
        <div className="max-w-7xl mx-auto px-4 mb-20 overflow-hidden">
          <Link href={`/blog/${featuredPost.slug}`}>
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
                    <span
                      key={index}
                      className="px-3 py-1 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-full border border-emerald-200"
                    >
                      {tag}
                    </span>
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

      {/* Regular Posts - Alternating Layout */}
      <div className="max-w-7xl mx-auto px-4 pb-20 overflow-hidden">
        {regularPosts.map((post, index) => {
          const isLeft = index % 2 === 0;
          
          return (
            <div key={post._id} className="mb-12 md:mb-16 w-full">
              <Link href={`/blog/${post.slug}`} className="block w-full">
                <div className={`flex flex-col ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} gap-6 md:gap-8 bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-slate-100 w-full`}>
                {/* Image */}
                <div className="w-full md:w-1/2 aspect-video md:aspect-square overflow-hidden bg-slate-100 flex-shrink-0">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                
                {/* Content */}
                <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-center flex-shrink-0">
                  <span className="text-sm text-slate-500 mb-3">
                    {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-emerald-700 mb-3 md:mb-4 hover:text-emerald-600 transition-colors leading-tight">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-sm md:text-base text-slate-600 mb-4 md:mb-6 leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4 md:mb-6">
                      {post.tags.slice(0, 3).map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs md:text-sm font-medium rounded-full border border-emerald-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center text-emerald-600 font-semibold group">
                    Read More 
                    <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </div>
              </Link>
            </div>
          );
        })}
      </div>

      {blogs.length === 0 && (
        <div className="max-w-7xl mx-auto px-4 py-20 text-center overflow-hidden">
          <p className="text-xl md:text-2xl text-slate-500 mb-4">No blog posts yet. Check back soon!</p>
          <div className="mt-8 text-6xl">📝</div>
        </div>
      )}
    </div>
  );
}
