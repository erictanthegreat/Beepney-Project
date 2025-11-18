import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Google avatars
      },
      {
        protocol: "https",
        hostname: "eutstkauaegdryktgqfl.supabase.co", // Supabase storage domain
      },
    ],
  },
};

export default nextConfig;
