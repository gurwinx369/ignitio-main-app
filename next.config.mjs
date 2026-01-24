/** @type {import('next').NextConfig} */
const nextConfig = {
  // ============================================================================
  // Reverse Proxy Configuration for Jupyter
  // This forwards ALL /jupyter/* requests to the Jupyter server
  // ============================================================================
  async rewrites() {
    return [
      {
        source: '/jupyter/:path*',
        destination: 'http://localhost:8888/jupyter/:path*',
      },
    ];
  },

  // ============================================================================
  // Headers Configuration
  // Required for iframe embedding and WebSocket connections
  // ============================================================================
  async headers() {
    return [
      {
        source: '/jupyter/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-Requested-With, Content-Type, Authorization',
          },
          // Don't set X-Frame-Options here - let Jupyter handle it
        ],
      },
    ];
  },
  reactCompiler: true,
  serverExternalPackages: ["mongoose"],
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;
