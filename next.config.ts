import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Product and hero uploads are sent through Server Actions.
      // Default limit is 1 MB, which causes 413 + "Failed to fetch".
      bodySizeLimit: "30mb",
    },
  },
};

export default nextConfig;
