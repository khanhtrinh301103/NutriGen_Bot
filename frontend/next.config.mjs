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
  // Chỉ áp dụng khi deploy lên Netlify
  ...(process.env.NETLIFY === 'true' && {
    staticPageGenerationTimeout: 120,
    experimental: {
      // Tắt một số chức năng có thể gây lỗi
      esmExternals: 'loose',
    }
  })
};

export default nextConfig;