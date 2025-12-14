import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
    ],
  },
  serverExternalPackages: [
    'express',
    'import-in-the-middle',
    'require-in-the-middle',
    '@genkit-ai/core',
    '@genkit-ai/ai',
    '@genkit-ai/googleai',
    '@genkit-ai/firebase',
    '@opentelemetry/instrumentation',
    '@opentelemetry/exporter-jaeger',
  ],
  // Set Turbopack root to silence workspace warning
  turbopack: {
    root: process.cwd(),
  },
}

export default nextConfig