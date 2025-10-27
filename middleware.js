// middleware.js
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const PUBLIC_PATHS = ['/admin/login'];

export default async function middleware(req) {
  const { pathname } = req.nextUrl;

  console.log('Middleware running for path:', pathname);

  // Allow public pages
  if (PUBLIC_PATHS.includes(pathname)) {
    console.log('Public path, allowing access');
    return NextResponse.next();
  }

  // Check cookie
  const token = req.cookies.get('admin_token')?.value;
  console.log('Token from cookie:', token ? 'Found' : 'Not found');
  
  if (!token) {
    console.log('No token in cookie, allowing through - will be checked by AdminLayoutWrapper');
    // Don't redirect here - let AdminLayoutWrapper handle it
    return NextResponse.next();
  }

  // Check if JWT_SECRET is available
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET not found in environment variables');
    // Instead of blocking, let the request through and let the dashboard handle auth
    return NextResponse.next();
  }

  // Verify JWT
  try {
    console.log('Attempting to verify JWT...');
    await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    console.log('JWT verification successful');
    return NextResponse.next();
  } catch (err) {
    console.error('JWT verification failed:', err.message);
    console.log('Redirecting to login due to invalid token');
    
    // Create response with redirect
    const response = NextResponse.redirect(new URL('/admin/login', req.url));
    
    // Clear the invalid cookie
    response.cookies.delete('admin_token');
    
    return response;
  }
}

export const config = {
  matcher: ['/admin/:path*'],
};