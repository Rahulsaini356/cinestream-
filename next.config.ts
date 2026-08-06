import type { NextConfig } from "next";

// Mock Google Font network fetches during build
process.env.NEXT_FONT_GOOGLE_MOCK = "1";

const nextConfig: NextConfig = {
  output: "standalone",

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "image.tmdb.org" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },

  allowedDevOrigins: ["127.0.0.1"],

  turbopack: {},

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.google.com https://www.googletagmanager.com https://*.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https: https://www.google-analytics.com https://*.google-analytics.com; connect-src 'self' https://api.themoviedb.org https://api.brevo.com https://www.google-analytics.com https://*.google-analytics.com; frame-src 'self' https://vidlink.pro https://*.vidlink.pro https://vidsrc.net https://*.vidsrc.net https://vidsrc.pm https://*.vidsrc.pm https://vidsrc.me https://*.vidsrc.me https://vidsrc.xyz https://*.vidsrc.xyz https://vidsrc.to https://*.vidsrc.to https://vidsrc.su https://*.vidsrc.su https://autoembed.co https://*.autoembed.co https://2embed.cc https://*.2embed.cc https://www.2embed.cc https://*.2embed.cc https://superembed.stream https://*.superembed.stream https://googleads.g.doubleclick.net;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;