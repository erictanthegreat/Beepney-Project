import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'lh3.googleusercontent.com',        // Google avatars
      'eutstkauaegdryktgqfl.supabase.co', // Supabase storage domain
    ],
  },
};

export default nextConfig;