/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  headers: () => [
    {
      source: "/api/(.*)",
      headers: [
        {
          key: "Cache-Control",
          value: "no-store",
        },
      ],
    },
  ],
};

module.exports = nextConfig;
