import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/lib/seo';
import { getCities } from '@/lib/publicData';
import { getCityVenues } from '@/lib/publicVenues';

/**
 * Only the publicly served pages. Listing a URL that answers with a redirect to
 * /login tells Google the sitemap is unreliable, which costs more than the
 * extra entries would gain.
 *
 * The per-city price lists are generated from the cities that actually have
 * prices published — a sitemap entry for a page that says «هنوز تعرفه‌ای ثبت
 * نشده» is a promise the page does not keep.
 */
/**
 * Built per request, not at image build time.
 *
 * The list depends on which cities are open and which اماکن they have — facts
 * that live in the panel and change without a deploy. Baked at build time it
 * would be a snapshot of whatever the database held the afternoon the image was
 * made, which for a new city means being unlisted until the next release.
 */
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  let cityPages: MetadataRoute.Sitemap = [];
  try {
    const cities = await getCities();
    const live = cities.filter((city) => city.isActive && city.slug);

    cityPages = [
      // Every open city has a page of its own services, whether or not it has
      // published a price yet — «خدمات شهرداری نهاوند» is a real query and the
      // page answers it either way.
      ...live.map((city) => ({
        url: `${SITE_URL}/city/${city.slug}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      })),
      ...live
        .filter((city) => city.materialCount > 0)
        .map((city) => ({
          url: `${SITE_URL}/tariff/${city.slug}`,
          lastModified: now,
          changeFrequency: 'daily' as const,
          priority: 0.9,
        })),
      // The اماکن of the cities that run the module, and each place itself.
      // A hall is a page somebody searches for by name — «استخر شهدا نهاوند» —
      // so listing them is worth the one extra call per city.
      ...(
        await Promise.all(
          live
            .filter((city) => city.services.includes('venues'))
            .map(async (city) => {
              const data = await getCityVenues(city.slug);
              if (!data?.venues?.length) return [];

              return [
                {
                  url: `${SITE_URL}/city/${city.slug}/venues`,
                  lastModified: now,
                  changeFrequency: 'daily' as const,
                  priority: 0.85,
                },
                ...data.venues.map((venue) => ({
                  url: `${SITE_URL}/city/${city.slug}/venues/${venue._id}`,
                  lastModified: now,
                  changeFrequency: 'daily' as const,
                  priority: 0.7,
                })),
              ];
            }),
        )
      ).flat(),
    ];
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
