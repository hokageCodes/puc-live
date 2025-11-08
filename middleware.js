// middleware.js
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const PUBLIC_PATHS = ['/admin/login'];

export default async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Allow public pages
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // Check cookie
  const token = req.cookies.get('admin_token')?.value;
  
  if (!token) {
    // Don't redirect here - let AdminLayoutWrapper handle it
    return NextResponse.next();
  }

  // Check if JWT_SECRET is available
  if (!process.env.JWT_SECRET) {
    // Instead of blocking, let the request through and let the dashboard handle auth
    return NextResponse.next();
  }

  // Verify JWT
  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    return NextResponse.next();
  } catch (err) {
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