import { NextResponse } from 'next/server';

// Auth is handled client-side via Bearer token (localStorage).
// The AdminLayoutWrapper redirects to login when there's no valid session.
// This middleware just lets all /admin/* requests through.
export default function middleware(req) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
