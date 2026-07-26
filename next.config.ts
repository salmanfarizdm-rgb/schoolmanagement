import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/login/parent',
        permanent: false,
      },
    ]
  },
};

export default nextConfig;
