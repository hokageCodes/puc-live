'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BlogManagementPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://puc-backend-t8pl.onrender.com";
      const token = localStorage.getItem('admin_token');
      
      const res = await fetch(`${backendUrl}/api/blogs/admin/all`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

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

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://puc-backend-t8pl.onrender.com";
      const token = localStorage.getItem('admin_token');
      
      const res = await fetch(`${backendUrl}/api/blogs/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        fetchBlogs();
      }
    } catch (err) {
      console.error('Failed to delete blog:', err);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: 'bg-gray-500',
      published: 'bg-green-500',
      scheduled: 'bg-blue-500'
    };
    return badges[status] || 'bg-gray-500';
  };

  if (loading) {
    return <div className="p-4">Loading blogs...</div>;
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Blog Management</h1>
        <button
          onClick={() => router.push('/admin/dashboard/blog/create')}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          + Create New Post
        </button>
      </div>

      {blogs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No blog posts yet.</p>
          <button
            onClick={() => router.push('/admin/dashboard/blog/create')}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Create Your First Post
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Views</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {blogs.map((blog) => (
                <tr key={blog._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-slate-900">{blog.title}</div>
                    {blog.excerpt && (
                      <div className="text-sm text-slate-500 truncate max-w-md">{blog.excerpt}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full text-white ${getStatusBadge(blog.status)}`}>
                      {blog.status}
                    </span>
                    {blog.featured && (
                      <span className="ml-2 px-2 py-1 text-xs rounded-full text-white bg-amber-500">
                        Featured
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {blog.views || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/admin/dashboard/blog/edit/${blog._id}`)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(blog._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
