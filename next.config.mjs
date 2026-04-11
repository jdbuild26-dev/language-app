/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Allow production builds to complete even with type errors during migration
    ignoreBuildErrors: true,
  },
  output: 'standalone',
  turbopack: {},
};

export default nextConfig;
