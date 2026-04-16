import { postHogMiddleware } from '@posthog/next'

const posthogProxy = postHogMiddleware({
  projectId: process.env.NEXT_PUBLIC_POSTHOG_KEY,
  host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  proxy: true
})

export async function proxy(request) {
  return posthogProxy(request)
}

export const config = {
  matcher: [
    '/_next/static/:path*',
    '/_next/image/:path*',
    '/favicon.ico',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}