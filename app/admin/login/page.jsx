'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    console.log('Submitting login form:', form);
  
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/login`, {
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
      setError('Something went wrong');
    }
  };

  return (
    <div className="bg-white p-8 rounded shadow-md w-full max-w-md mx-auto mt-20">
      <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          className="border p-2 w-full rounded"
          required
        />
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
          className="border p-2 w-full rounded"
          required
        />
        <button
          type="submit"
          className="bg-[#01553d] text-white px-4 py-2 w-full rounded hover:bg-[#014532] transition-colors"
        >
          Login
        </button>
      </form>
    </div>
  );
}