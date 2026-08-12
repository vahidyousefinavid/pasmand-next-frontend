import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

/**
 * Only the publicly served pages. Listing a URL that answers with a redirect to
 * /login tells Google the sitemap is unreliable, which costs more than the
 * extra entries would gain.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    // The root serves the public landing page to anyone without a session.
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/waste-types`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/tariff`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/guide`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/contact-us`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${SITE_URL}/login`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
