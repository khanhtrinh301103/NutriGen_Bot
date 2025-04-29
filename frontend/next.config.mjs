// frontend/next.config.mjs
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
      "@": path.resolve(__dirname, "src"),
    };
    return config;
  },
  // Tắt ISR/SSG cho các trang cần động
  eslint: {
    ignoreDuringBuilds: true, // Bỏ qua lỗi ESLint trong quá trình build
  },
  typescript: {
    ignoreBuildErrors: true, // Bỏ qua lỗi TypeScript trong quá trình build
  },
  // Cấu hình cho quá trình build
  onDemandEntries: {
    // Tăng thời gian chờ cho prerendering
    maxInactiveAge: 60 * 60 * 1000, // 1 giờ
    pagesBufferLength: 5,
  },
  experimental: {
    // Giúp tránh các vấn đề với prerendering
    esmExternals: 'loose',
  }
};

export default nextConfig;