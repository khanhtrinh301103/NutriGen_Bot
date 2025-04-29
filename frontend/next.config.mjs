// frontend/next.config.mjs
import path from "path";
import { fileURLToPath } from 'url';

// Hỗ trợ đường dẫn __dirname trong ES modules
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
  // Cấu hình đặc biệt cho Netlify
  ...(process.env.NETLIFY === 'true' && {
    output: 'export',
    distDir: '.next',
    images: {
      unoptimized: true,
    },
  })
};

export default nextConfig;