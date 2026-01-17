/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  allowedDevOrigins: [
    'http://localhost:5000',
    'http://127.0.0.1:5000',
    'https://*.repl.co',
    'https://*.replit.dev',
    'https://*.replit.app',
    'https://*.replit.com',
    'https://*.kirk.replit.dev',
    'https://*.spock.replit.dev',
    'https://*.picard.replit.dev',
    'https://*.janeway.replit.dev',
    'https://*.sisko.replit.dev',
  ],
};

export default nextConfig;
