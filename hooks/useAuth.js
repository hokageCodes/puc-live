// hooks/useAuth.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const checkAuth = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://puc-backend-t8pl.onrender.com";
      const res = await fetch(`${backendUrl}/api/admin/me`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        throw new Error('Authentication failed');
      }

      const data = await res.json();
      
      if (data.admin && data.admin.isAdmin) {
        setAdmin(data.admin);
        return data.admin;
      } else {
        throw new Error('User is not admin');
      }
    } catch (err) {
      console.error('Auth check error:', err);
      setError(err.message);
      setAdmin(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError('');
      
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://puc-backend-t8pl.onrender.com";
      const res = await fetch(`${backendUrl}/api/admin/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Login failed');
      }

      const data = await res.json();
      
      if (data.admin && data.admin.isAdmin) {
        setAdmin(data.admin);
        localStorage.setItem('adminData', JSON.stringify(data.admin));
        return { success: true, admin: data.admin };
      } else {
        throw new Error('Login successful but admin data is missing');
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://puc-backend-t8pl.onrender.com";
      const res = await fetch(`${backendUrl}/api/admin/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        setAdmin(null);
        localStorage.removeItem('adminData');
        router.push('/admin/login');
        return { success: true };
      } else {
        throw new Error('Logout failed');
      }
    } catch (err) {
      console.error('Logout error:', err);
      return { success: false, error: err.message };
    }
  };

  const useRequireAuth = () => {
    useEffect(() => {
      if (!loading && !admin) {
        router.push('/admin/login');
      }
    }, [loading, admin]);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return {
    admin,
    loading,
    error,
    login,
    logout,
    checkAuth,
    useRequireAuth
  };
}