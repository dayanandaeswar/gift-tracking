import type { NextConfig } from 'next';

const config: NextConfig = {
  // React Compiler — stable in Next.js 16 (was experimental.reactCompiler in v15)

  // Turbopack — stable, top-level in Next.js 16 (was experimental.turbopack in v15)

  // Cache Components — replaces experimental.ppr in Next.js 16
  // This is the new PPR model: static shell + streamed dynamic data via "use cache"
  cacheComponents: true,
};

export default config;
