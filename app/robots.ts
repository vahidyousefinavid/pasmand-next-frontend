import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

/**
 * Crawl rules.
 *
 * Only the pages the auth gate actually serves to a visitor without a cookie
 * are worth crawling; the rest answer with a redirect to /login, and a crawler
 * that keeps hitting redirects spends its budget learning nothing.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/new-request', '/history', '/wallet', '/profile', '/addresses', '/settings', '/api/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
