// next.config.js
import path from 'path';

const isProd = process.env.NODE_ENV === 'production';

const cspHeader = (isProd
  ? `
      default-src 'self';
      script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      img-src 'self' data: blob: https:;
      font-src 'self' data: https://fonts.gstatic.com https://res.cloudinary.com;
      connect-src 'self' https:;
      frame-ancestors 'none';
      base-uri 'self';
      form-action 'self';
      object-src 'none';
      upgrade-insecure-requests;
    `
  : `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      img-src 'self' data: blob: https: http:;
      font-src 'self' data: https://fonts.gstatic.com;
      connect-src 'self' https: http://localhost:* ws://localhost:* wss://localhost:*;
      frame-ancestors 'none';
      base-uri 'self';
      form-action 'self';
      object-src 'none';
    `)
  .replace(/\s{2,}/g, ' ')
  .trim();

const nextConfig = {
  turbopack: {
    root: path.resolve(process.cwd()),
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'puc-backend.vercel.app',
        pathname: '/uploads/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: cspHeader },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
