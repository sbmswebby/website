/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://sbmsacademy.in',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' }, // Allow all main pages
      {
        userAgent: '*',
        disallow: [
          '/api/*',
          '/admin',
          '/login',
          '/signup',
          '/reset-password',
          '/profile',
        ], // Block sensitive routes
      },
    ],
    // ❌ Remove 'additionalSitemaps' if it points to your own main sitemap
  },
};
