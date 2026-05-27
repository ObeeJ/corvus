import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:6565/api/:path*",
      },
    ];
  },
};

export default nextConfig;
