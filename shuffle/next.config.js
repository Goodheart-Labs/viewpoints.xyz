/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  headers: async () => [
    {
      source: "/iframe/:path*",
      headers: [
        {
          key: "X-Frame-Options",
          value: "ALLOWALL",
        },
        {
          key: "Access-Control-Allow-Origin",
          value: "*",
        },
        {
          key: "Access-Control-Allow-Methods",
          value: "GET",
        },
        {
          key: "Access-Control-Allow-Headers",
          value: "*",
        },
      ],
    },
  ],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
