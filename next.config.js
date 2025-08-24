/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Enable static export for GitHub Pages
  output: 'export',
  
  // Disable image optimization for static export
  images: {
    unoptimized: true
  },
  
  // Configure trailing slash for better static hosting compatibility
  trailingSlash: true,
  
  // Skip build-time type checking (optional, for faster builds)
  typescript: {
    ignoreBuildErrors: false,
  }
}

module.exports = nextConfig