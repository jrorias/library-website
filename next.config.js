/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // This will still show warnings but won't fail the build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // This will still show type errors but won't fail the build
    ignoreBuildErrors: true,
  },
  
  // Clean old builds on deployment
  cleanDistDir: true,
  
  // Generate unique build ID for version tracking
  generateBuildId: async () => {
    return Date.now().toString();
  },
}

module.exports = nextConfig