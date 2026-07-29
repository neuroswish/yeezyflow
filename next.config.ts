import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/opengraph-image", destination: "/opengraph-image.png" },
      { source: "/:trackId/opengraph-image", destination: "/og-tracks/:trackId.png" },
    ];
  },
};

export default nextConfig;
