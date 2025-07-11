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
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }

  // Verify JWT
  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    return NextResponse.next();
  } catch (err) {
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }
}

export const config = {
  matcher: ['/admin/:path*'],
};
