import type { NextConfig } from 'next';
import path from 'path';

// Only the Next.js server connects to Django. Browsers always use same-origin URLs.
const backendApi = (
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://127.0.0.1:8000/api/v1'
).replace(/\/$/, '');
const backendOrigin = new URL(backendApi).origin;

const nextConfig: NextConfig = {
  turbopack: { root: path.resolve(__dirname) },
  allowedDevOrigins: ['localhost', '127.0.0.1', '*.e2b.app'],
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      { source: '/api/v1/:path*', destination: `${backendApi}/:path*/` },
      { source: '/media/:path*', destination: `${backendOrigin}/media/:path*` },
    ];
  },
};

export default nextConfig;
