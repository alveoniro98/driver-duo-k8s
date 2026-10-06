import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Menghasilkan .next/standalone (server.js + dependency minimal) untuk image Docker yang kecil.
  output: "standalone",
};

export default nextConfig;
