import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "image.tmdb.org" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
