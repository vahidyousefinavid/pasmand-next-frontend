import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/lib/seo';
import { getCities } from '@/lib/publicData';

/**
 * Only the publicly served pages. Listing a URL that answers with a redirect to
 * /login tells Google the sitemap is unreliable, which costs more than the
 * extra entries would gain.
 *
 * The per-city price lists are generated from the cities that actually have
 * prices published — a sitemap entry for a page that says «هنوز تعرفه‌ای ثبت
 * نشده» is a promise the page does not keep.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  let cityPages: MetadataRoute.Sitemap = [];
  try {
    const cities = await getCities();
    cityPages = cities
      .filter((city) => city.isActive && city.materialCount > 0 && city.slug)
      .map((city) => ({
        url: `${SITE_URL}/tariff/${city.slug}`,
        lastModified: now,
        changeFrequency: 'daily' as const,
        priority: 0.9,
      }));
  } catch {
    // A sitemap that lists the fixed pages beats one that fails to build.
  }

  return [
    // The root serves the public landing page to anyone without a session.
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/waste-types`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/tariff`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    ...cityPages,
    { url: `${SITE_URL}/guide`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/contact-us`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${SITE_URL}/login`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
