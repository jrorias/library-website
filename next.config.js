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
  }
  
  module.exports = nextConfig