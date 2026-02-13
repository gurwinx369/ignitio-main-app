/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [{
            protocol: 'https',
            hostname: 'lh3.googleusercontent.com',
        }, {
            protocol: 'https',
            hostname: 'ik.imagekit.io',
        }],
    },

    async rewrites() {
        if (process.env.NODE_ENV === 'development') {
            return [{
                source: '/jupyter/:path*',
                destination: 'http://localhost:8888/jupyter/:path*',
            }];
        }
        return [];
    },

    async headers() {
        return [
            // including service worker for notification
            {
                // Apply headers to service worker file
                source: '/firebase-messaging-sw.js',
                headers: [
                    {
                        key: 'Service-Worker-Allowed',
                        value: '/',
                    },
                    {
                        key: 'Content-Type',
                        value: 'application/javascript; charset=utf-8',
                    },
                    {
                        key: 'Cache-Control',
                        value: 'no-cache, no-store, must-revalidate',
                    },
                ],
            },
            {
                // Headers for JupyterLite static files
                // These apply ONLY to the iframe content itself
                source: '/jupyter/build/:path*',
                headers: [
                    {
                        key: 'Cross-Origin-Embedder-Policy',
                        value: 'require-corp',
                    },
                    {
                        key: 'Cross-Origin-Opener-Policy',
                        value: 'same-origin',
                    },
                    {
                        key: 'Cross-Origin-Resource-Policy',
                        value: 'cross-origin',
                    },
                ],
            },
            {
                // REMOVED COOP from workspace pages
                // Only keeping COEP with credentialless mode
                // This allows WebAssembly without breaking auth
                source: '/workspace/:path*',
                headers: [
                    {
                        key: 'Cross-Origin-Embedder-Policy',
                        value: 'credentialless',
                    },
                    // COOP REMOVED - This was breaking your session!
                ],
            },
            {
                // Explicitly allow OAuth popups for authentication
                source: '/auth/:path*',
                headers: [
                    {
                        key: 'Cross-Origin-Opener-Policy',
                        value: 'unsafe-none',
                    },
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
    skipTrailingSlashRedirect: true,
};

export default nextConfig;
