// app/admin/dashboard/page.js
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Stats Cards */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Total Staff</h3>
            <p className="text-3xl font-bold text-emerald-600">--</p>
            <p className="text-sm text-slate-600">Active employees</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Departments</h3>
            <p className="text-3xl font-bold text-blue-600">--</p>
            <p className="text-sm text-slate-600">Total departments</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Teams</h3>
            <p className="text-3xl font-bold text-purple-600">--</p>
            <p className="text-sm text-slate-600">Active teams</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-lg text-center transition-colors">
              <div className="text-lg font-semibold">Add Staff</div>
              <div className="text-sm opacity-90">Create new employee</div>
            </button>
            
            <button className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg text-center transition-colors">
              <div className="text-lg font-semibold">Manage Departments</div>
              <div className="text-sm opacity-90">View & edit departments</div>
            </button>
            
            <button className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg text-center transition-colors">
              <div className="text-lg font-semibold">Team Management</div>
              <div className="text-sm opacity-90">Organize teams</div>
            </button>
            
            <button className="bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-lg text-center transition-colors">
              <div className="text-lg font-semibold">Practice Areas</div>
              <div className="text-sm opacity-90">Manage practice areas</div>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800">Recent Activity</h2>
          </div>
          <div className="p-6">
            <p className="text-slate-600">No recent activity to display.</p>
          </div>
        </div>
      </main>
    </div>
  );
}