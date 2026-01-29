/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [{
            protocol: 'https', hostname: 'lh3.googleusercontent.com',
        }, {
            protocol: 'https', hostname: 'ik.imagekit.io',
        }],
    },

    async rewrites() {
        // For local development, proxy to Jupyter server
        // For production, serve static JupyterLite from public/jupyter/build
        if (process.env.NODE_ENV === 'development') {
            return [{
                source: '/jupyter/:path*', destination: 'http://localhost:8888/jupyter/:path*',
            },];
        }
        // In production, no rewrites needed - static files served from public/
        return [];
    },

    async headers() {
        return [{
            // Headers for JupyterLite static files (production)
            source: '/jupyter/:path*', headers: [{
                key: 'Cross-Origin-Embedder-Policy', value: 'require-corp',
            }, {
                key: 'Cross-Origin-Opener-Policy', value: 'same-origin',
            }, {
                key: 'Cross-Origin-Resource-Policy', value: 'cross-origin',
            }, {
                key: 'Access-Control-Allow-Origin', value: '*',
            }, {
                key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS',
            }, {
                key: 'Access-Control-Allow-Headers', value: 'X-Requested-With, Content-Type, Authorization',
            },],
        }, {
            // Headers for workspace pages that need WebAssembly and SharedArrayBuffer
            // ONLY apply to workspace routes, NOT to auth pages
            source: '/workspace/:path*', headers: [{
                key: 'Cross-Origin-Embedder-Policy', value: 'credentialless',
            }, {
                key: 'Cross-Origin-Opener-Policy', value: 'same-origin',
            },],
        }, {
            // Explicitly allow OAuth popups for authentication pages
            // This ensures Firebase Google sign-in works properly
            source: '/auth/:path*', headers: [{
                key: 'Cross-Origin-Opener-Policy', value: 'unsafe-none',
            },],
        },
            // REMOVED: The global '/:path*' headers that were breaking Firebase OAuth
            // Those headers are now only applied to specific routes that actually need them
        ];
    },

    // React Compiler
    reactCompiler: true,

    // External packages for server
    serverExternalPackages: ["mongoose"],

    // On-demand entries configuration
    onDemandEntries: {
        maxInactiveAge: 25 * 1000, pagesBufferLength: 2,
    },

};

export default nextConfig;
