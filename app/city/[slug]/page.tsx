import { notFound } from 'next/navigation';

import CityHub from '@/components/views/Public/city-hub';
import { JsonLd, SITE_URL, pageMeta } from '@/lib/seo';
import { getCityBySlug, getCityMaterials, getServices } from '@/lib/publicData';
import { getCityVenues } from '@/lib/publicVenues';

/**
 * یک شهر، یک نشانی.
 *
 * «خدمات شهرداری نهاوند» is a search somebody in نهاوند runs; «شهرشهر» is not.
 * This page is the one that answers it — the city's own services, its اماکن and
 * its prices, at an address that can be linked, sent and printed.
 */
export const dynamic = 'force-dynamic';

/**
 * Lets the 60-second data cache in lib/publicData.ts actually apply:
 * `force-dynamic` alone forces every fetch to `no-store`. Rendering stays
 * per-request; only the upstream call is reused, which is what keeps a
 * momentary API timeout from blanking the services section — the API on this
 * box timed out eighteen times in half an hour when this was measured.
 *
 * The 30-minute version of this was reverted once because a municipality
 * switching a service on did not appear on the public site for half an hour.
 * Sixty seconds keeps the resilience without that.
 */
export const fetchCache = 'default-cache';


/**
 * No `fetchCache` override here, deliberately.
 *
 * `force-dynamic` also flips every `fetch` on the route to `no-store`, which
 * looks wasteful next to the 30-minute `revalidate` in lib/publicData.ts — so
 * this route briefly carried `fetchCache = 'default-cache'` to «restore» it.
 * That was wrong twice over: it made no measurable difference to TTFB, and it
 * meant a municipality switching a service on in the panel did not appear on
 * the public site for up to half an hour. Which services a city runs has to be
 * true the moment it is changed; a cached rate board is not worth a city
 * believing its own panel is broken.
 */

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const city = await getCityBySlug(params.slug);
  if (!city) {
    return pageMeta({ title: 'خدمات شهرها', description: 'خدمات شهرها روی سامانهٔ شهرشهر.', path: '/' });
  }

  return pageMeta({
    title: `خدمات شهر ${city.name} در شهرشهر`,
    description: `خدمات شهر ${city.name} با همکاری شهرداری روی شهرشهر آنلاین شده است: رزرو اماکن و سالن‌های ورزشی، سامانهٔ ۱۳۷، کارتابل شهروندی، جمع‌آوری و خرید پسماند خشک و جست‌وجوی درگذشتگان — دیدن سانس‌ها و قیمت‌ها بدون ثبت‌نام.`,
    path: `/city/${city.slug}`,
    keywords: [
      `خدمات شهرداری ${city.name}`,
      `شهرداری ${city.name}`,
      `رزرو سالن ${city.name}`,
      `سامانه ۱۳۷ ${city.name}`,
      `قیمت ضایعات ${city.name}`,
    ],
  });
}

export default async function CityPage({ params }: { params: { slug: string } }) {
  const [city, catalogue] = await Promise.all([getCityBySlug(params.slug), getServices()]);
  if (!city) notFound();

  const [venues, materials] = await Promise.all([
    // Only asked for when the city runs the module: the endpoint would refuse
    // otherwise, and a 404 in the server log for every visit is noise that
    // hides the real ones.
    city.isActive && city.services.includes('venues') ? getCityVenues(city.slug || city._id) : Promise.resolve(null),
    getCityMaterials(city._id),
  ]);

  return (
    <>
      {/* This page is شهرشهر's page *about* a municipality's services — not the
          municipality itself. Typing it as `GovernmentOffice` told Google the
          opposite: that this URL is the شهرداری's own office. So the page is a
          `WebPage`, the شهرداری is a separate organisation it is `about` and the
          `provider` of each service, and شهرشهر (the `#organization` declared in
          lib/seo.tsx) is what actually publishes the page. */}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: `خدمات شهر ${city.name} در شهرشهر`,
          url: `${SITE_URL}/city/${city.slug}`,
          isPartOf: { '@id': `${SITE_URL}/#website` },
          publisher: { '@id': `${SITE_URL}/#organization` },
          about: {
            '@type': 'GovernmentOrganization',
            name: `شهرداری ${city.name}`,
            areaServed: { '@type': 'City', name: city.name },
            ...(Number.isFinite(city.lat) && Number.isFinite(city.lng)
              ? { geo: { '@type': 'GeoCoordinates', latitude: city.lat, longitude: city.lng } }
              : {}),
          },
          mainEntity: {
            '@type': 'OfferCatalog',
            name: `خدمات آنلاین شهرداری ${city.name}`,
            itemListElement: catalogue
              .filter((service) => city.isActive && city.services.includes(service.key))
              .map((service) => ({
                '@type': 'Offer',
                itemOffered: {
                  '@type': 'Service',
                  name: service.title,
                  description: service.description,
                  provider: { '@type': 'GovernmentOrganization', name: `شهرداری ${city.name}` },
                },
              })),
          },
        }}
      />
      <CityHub city={city} catalogue={catalogue} venues={venues} materialCount={materials.length} />
    </>
  );
}
