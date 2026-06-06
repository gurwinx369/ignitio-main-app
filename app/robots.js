export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: [
        '/',
        '/auth/login',
        '/auth/signup',
        '/home/roadmaps/cpp',
        '/home/roadmaps/git-github',
        '/home/roadmaps/prompt-engineering',
      ],
      disallow: [
        '/api/',
        '/home/onboarding/',
        '/home/profile',
        '/home/settings',
      ],
    },
    sitemap: 'https://app.ignitio.cloud/sitemap.xml',
  };
}
