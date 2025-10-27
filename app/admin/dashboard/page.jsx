// app/admin/dashboard/page.js
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalStaff: 0,
    totalBlogs: 0,
    publishedBlogs: 0,
    draftBlogs: 0,
    totalDepartments: 0,
    totalTeams: 0,
    recentBlogs: []
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://puc-backend-t8pl.onrender.com";
      const token = localStorage.getItem('admin_token');
      
      // Fetch all data in parallel
      const [staffRes, blogsRes] = await Promise.all([
        fetch(`${backendUrl}/api/staff`, { credentials: 'include' }),
        fetch(`${backendUrl}/api/blogs/admin/all`, { 
          credentials: 'include',
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      let staffCount = 0;
      let totalBlogs = 0;
      let publishedBlogs = 0;
      let draftBlogs = 0;
      let recentBlogs = [];

      if (staffRes.ok) {
        const staff = await staffRes.json();
        staffCount = staff.length;
      }

      if (blogsRes.ok) {
        const blogs = await blogsRes.json();
        totalBlogs = blogs.length;
        publishedBlogs = blogs.filter(b => b.status === 'published').length;
        draftBlogs = blogs.filter(b => b.status === 'draft').length;
        
        // Get 5 most recent blogs
        recentBlogs = blogs
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
      }

      setStats({
        totalStaff: staffCount,
        totalBlogs,
        publishedBlogs,
        draftBlogs,
        totalDepartments: 0, // You can add API for this later
        totalTeams: 0, // You can add API for this later
        recentBlogs
      });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const checkAuth = async () => {
    try {
      const backendUrl = "https://puc-backend-t8pl.onrender.com";
      const res = await fetch(`${backendUrl}/api/admin/me`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      console.log('Auth check response status:', res.status);
      
      if (!res.ok) {
        console.log('Auth check failed, redirecting to login');
        router.push('/admin/login');
        return;
      }

      const data = await res.json();
      console.log('Auth check success:', data);
      
      if (data.admin && data.admin.isAdmin) {
        setAdmin(data.admin);
      } else {
        console.log('User is not admin, redirecting to login');
        router.push('/admin/login');
      }
    } catch (err) {
      console.error('Auth check error:', err);
      setError('Authentication check failed');
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const backendUrl = "https://puc-backend-t8pl.onrender.com";
      const res = await fetch(`${backendUrl}/api/admin/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        // Clear any stored admin data
        localStorage.removeItem('adminData');
        console.log('Logout successful, redirecting to login');
        router.push('/admin/login');
      } else {
        console.error('Logout failed');
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (!admin) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">
                Welcome, {admin.email}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full">
        {statsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Staff */}
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium opacity-90">Total Staff</h3>
                  <svg className="w-8 h-8 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-4xl font-bold">{stats.totalStaff}</p>
                <p className="text-sm opacity-90 mt-1">Active employees</p>
              </div>

              {/* Total Blogs */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium opacity-90">Total Blogs</h3>
                  <svg className="w-8 h-8 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <p className="text-4xl font-bold">{stats.totalBlogs}</p>
                <p className="text-sm opacity-90 mt-1">Blog posts</p>
              </div>

              {/* Published Blogs */}
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium opacity-90">Published</h3>
                  <svg className="w-8 h-8 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-4xl font-bold">{stats.publishedBlogs}</p>
                <p className="text-sm opacity-90 mt-1">Public posts</p>
              </div>

              {/* Draft Blogs */}
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium opacity-90">Drafts</h3>
                  <svg className="w-8 h-8 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <p className="text-4xl font-bold">{stats.draftBlogs}</p>
                <p className="text-sm opacity-90 mt-1">Unpublished drafts</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/admin/dashboard/blog/create">
                  <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-6 rounded-lg text-center transition-colors shadow hover:shadow-lg">
                    <div className="text-2xl mb-2">📝</div>
                    <div className="text-lg font-semibold">New Blog Post</div>
                    <div className="text-sm opacity-90">Create & publish content</div>
                  </button>
                </Link>
                
                <Link href="/admin/dashboard/blog">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg text-center transition-colors shadow hover:shadow-lg">
                    <div className="text-2xl mb-2">📰</div>
                    <div className="text-lg font-semibold">Manage Blogs</div>
                    <div className="text-sm opacity-90">View all posts</div>
                  </button>
                </Link>
                
                <Link href="/people">
                  <button className="w-full bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-lg text-center transition-colors shadow hover:shadow-lg">
                    <div className="text-2xl mb-2">👥</div>
                    <div className="text-lg font-semibold">View Staff</div>
                    <div className="text-sm opacity-90">Browse team page</div>
                  </button>
                </Link>
                
                <Link href="/admin/dashboard/settings">
                  <button className="w-full bg-orange-600 hover:bg-orange-700 text-white p-6 rounded-lg text-center transition-colors shadow hover:shadow-lg">
                    <div className="text-2xl mb-2">⚙️</div>
                    <div className="text-lg font-semibold">Settings</div>
                    <div className="text-sm opacity-90">Manage preferences</div>
                  </button>
                </Link>
              </div>
            </div>

            {/* Leave Management Section */}
            <div className="bg-white rounded-lg shadow mb-8">
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="text-xl font-semibold text-slate-800">Leave Management System</h2>
                <p className="text-sm text-slate-600 mt-1">Manage staff leaves and approvals</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link href="/leave/dashboard">
                    <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-lg text-left transition-colors shadow hover:shadow-lg">
                      <div className="text-lg mb-1">📅</div>
                      <div className="font-semibold">Leave Dashboard</div>
                      <div className="text-sm opacity-90">View leave requests & approvals</div>
                    </button>
                  </Link>
                  
                  <Link href="/leave/settings">
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg text-left transition-colors shadow hover:shadow-lg">
                      <div className="text-lg mb-1">⚙️</div>
                      <div className="font-semibold">Leave Settings</div>
                      <div className="text-sm opacity-90">Manage leave types & balances</div>
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Recent Blog Posts */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-slate-800">Recent Blog Posts</h2>
                <Link href="/admin/dashboard/blog" className="text-sm text-emerald-600 hover:text-emerald-700">
                  View All →
                </Link>
              </div>
              <div className="p-6">
                {stats.recentBlogs.length > 0 ? (
                  <div className="space-y-4">
                    {stats.recentBlogs.map((blog) => (
                      <Link key={blog._id} href={`/admin/dashboard/blog/edit/${blog._id}`}>
                        <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 hover:shadow transition-all">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                blog.status === 'published' ? 'bg-green-100 text-green-700' :
                                blog.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {blog.status}
                              </span>
                              {blog.featured && (
                                <span className="px-3 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
                                  Featured
                                </span>
                              )}
                            </div>
                            <h3 className="font-semibold text-slate-800 mb-1">{blog.title}</h3>
                            <p className="text-sm text-slate-600">{new Date(blog.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-sm text-slate-600">{blog.views || 0} views</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-500 mb-4">No blog posts yet</p>
                    <Link href="/admin/dashboard/blog/create">
                      <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                        Create Your First Post
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}