import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Do not infer the workspace from an unrelated lockfile in the home directory.
  turbopack: { root: process.cwd() },
  outputFileTracingRoot: process.cwd(),
  outputFileTracingExcludes: { "*": [".env*", ".data/**/*", ".cache/**/*", "tests/**/*"] },
  experimental: {
    cpus: 2,
    webpackMemoryOptimizations: true,
    webpackBuildWorker: true,
    parallelServerCompiles: false,
    parallelServerBuildTraces: false,
  },
  onDemandEntries: { maxInactiveAge: 20000, pagesBufferLength: 1 },
  webpack(config) {
    config.parallelism = 2;
    return config;
  },
};

export default nextConfig;
