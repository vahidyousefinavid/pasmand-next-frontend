/** @type {import('next').NextConfig} */

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  disable:false,
  aggressiveFrontEndNavCaching:true,
  cacheOnFrontEndNav:true,
  reloadOnOnline:true,
});

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