/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Use standalone output for Lambda deployment
  output: 'standalone',
  
  // Enable image optimization for Lambda
  images: {
    domains: [],
    formats: ['image/webp'],
  },
  
  // Skip build-time type checking (optional, for faster builds)
  typescript: {
    ignoreBuildErrors: false,
  }
}

module.exports = nextConfig