import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['firebasestorage.googleapis.com'],
    unoptimized: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve("src"),
    };
    return config;
  },
  // Cấu hình đặc biệt cho Netlify
  ...(process.env.NETLIFY === 'true' && {
    staticPageGenerationTimeout: 180, // Tăng timeout lên
    experimental: {
      // Tắt một số chức năng có thể gây lỗi
      esmExternals: 'loose',
    },
    // Tắt SSG/SSR cho một số trang
    unstable_excludePages: [
      '/adminUI/**/*', // Tất cả trang admin
      '/profile',      // Trang profile
      '/blog',         // Trang blog
      '/auth/**/*'     // Tất cả trang auth
    ]
  })
};

export default nextConfig;