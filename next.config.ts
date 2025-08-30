import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@/components', '@/lib'],
  },
  
  // Enable compression
  compress: true,
  
  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  
  // Bundle analyzer (optional - for development)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config) => {
      config.plugins.push(
        new (require('@next/bundle-analyzer')())({
          enabled: true,
        })
      );
      return config;
    },
  }),
  
  // Reduce bundle size
  swcMinify: true,
  
  // Enable React strict mode for better performance
  reactStrictMode: true,
  
  // Optimize font loading
  optimizeFonts: true,
};

export default nextConfig;
