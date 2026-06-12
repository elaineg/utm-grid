import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Pin the workspace root so the parent repo's lockfile is ignored.
    root: path.join(__dirname),
  },
};

export default nextConfig;
