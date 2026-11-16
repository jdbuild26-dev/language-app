/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['127.0.0.1'],
  typescript: {
    // Allow production builds to complete even with type errors during migration
    ignoreBuildErrors: true,
  },
  output: 'standalone',
  turbopack: {},
};

export default nextConfig;
