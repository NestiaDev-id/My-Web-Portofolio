import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  dev: {
    allowedDevOrigins: [
      "http://localhost:3000",
      "http://your-allowed-origin.com",
    ],
  },
};

export default nextConfig;
