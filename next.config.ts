/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' fonts.gstatic.com; img-src 'self' blob: data: media.smartbrainskenya.com media.media.smartbrainskenya.com; media-src 'self' blob: data: media.smartbrainskenya.com media.media.smartbrainskenya.com; connect-src 'self' hglrixqudkabblksrssa.supabase.co https://api.publit.io;",
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.smartbrainskenya.com',
      },
      {
        protocol: 'https',
        hostname: 'media.media.smartbrainskenya.com',
      },
    ],
  },
};

export default nextConfig;
