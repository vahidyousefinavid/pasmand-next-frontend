/** @type {import('next').NextConfig} */
const withPWA = require("next-pwa")({
  dest: "public",
  disable: false,
  register: true,
  skipWaiting: true,
})

async function rewrites() {
  const DOMAIN = process.env.DOMAIN_API;
  return [
    {
      source: "/api/:path*",
      destination: DOMAIN + "/api/:path*",
    },
  ];
}

const nextConfig = {
  // output: 'export',
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  rewrites,
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = withPWA(nextConfig);