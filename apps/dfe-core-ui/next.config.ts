import path from 'path';
import type { NextConfig } from 'next';

const monorepoRoot = path.resolve(process.cwd(), '..', '..');

const nextConfig: NextConfig = {
  turbopack: {
    root: monorepoRoot,
  },
  // Self-contained server build for the container image: emits
  // .next/standalone with a minimal node_modules + server.js. The tracing root
  // must be the MONOREPO root so the standalone bundle pulls in the workspace
  // deps (@repo/*); the Dockerfile copies .next/standalone + .next/static.
  output: 'standalone',
  outputFileTracingRoot: monorepoRoot,
};

export default nextConfig;
