import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.join(process.cwd()),
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "**.s3.amazonaws.com" },
    ],
  },
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    cpus: 1,
    workerThreads: false,
  },
};

export default nextConfig;
