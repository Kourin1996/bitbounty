/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  env: {
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  }
};

export default nextConfig;
