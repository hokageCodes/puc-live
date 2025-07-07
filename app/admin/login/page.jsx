// app/admin/login/page.js
'use client';
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    console.log('Submitting login form:', form);
    console.log('Backend URL:', process.env.NEXT_PUBLIC_BACKEND_URL);
  
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const res = await fetch(`${backendUrl}/api/admin/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
  
      console.log('Response status:', res.status);
      console.log('Response headers:', [...res.headers.entries()]);
      
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || 'Login failed');
        return;
      }

      const data = await res.json();
      console.log('Login response data:', data);
      
      // Check if cookies are set
      console.log('All cookies:', document.cookie);
      
      // Wait a moment for cookie to be set, then redirect
      setTimeout(() => {
        console.log('Redirecting to dashboard...');
        router.push('/admin/dashboard');
      }, 100);
      
    } catch (err) {
      console.error('Login error:', err);
      setError('Connection error. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-slate-800">Admin Login</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
              disabled={loading}
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
              disabled={loading}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${
              loading 
                ? 'bg-slate-400 cursor-not-allowed' 
                : 'bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500'
            }`}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        {/* Debug info (remove in production) */}
        <div className="mt-4 text-xs text-slate-500">
          <p>Backend URL: {process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}</p>
        </div>
      </div>
    </div>
  );
}