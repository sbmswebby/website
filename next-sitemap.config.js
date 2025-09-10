/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://sbmsacademy.in',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' }, // allow main site
      { userAgent: '*', disallow: ['/api/*', '/admin', '/login', '/signup', '/reset-password', '/profile'] }, // block sensitive pages
    ],
    additionalSitemaps: [
      'https://sbmsacademy.in/sitemap.xml',
    ],
  },
};
