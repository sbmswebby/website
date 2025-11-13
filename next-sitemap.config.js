/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://sbmsacademy.in',
  generateRobotsTxt: true,
  sitemapSize: 7000,
  autoLastmod: true,

  // ✅ Required for App Router
  experimental: {
    appDir: true,
  },

  // ✅ Tell it where to find your build output
  outDir: 'public',

  // ✅ Optional but useful if you have dynamic routes
  transform: async (config, path) => {
    // Exclude API or auth pages
    if (
      path.startsWith('/api') ||
      path.startsWith('/admin') ||
      path.startsWith('/login') ||
      path.startsWith('/signup') ||
      path.startsWith('/reset-password') ||
      path.startsWith('/profile')
    ) {
      return null;
    }

    // Return sitemap entry
    return {
      loc: path,
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date().toISOString(),
    };
  },

  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
      {
        userAgent: '*',
        disallow: [
          '/api/*',
          '/admin',
          '/login',
          '/signup',
          '/reset-password',
          '/profile',
        ],
      },
    ],
  },
};
