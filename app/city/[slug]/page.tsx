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

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const city = await getCityBySlug(params.slug);
  if (!city) {
    return pageMeta({ title: 'خدمات شهرها', description: 'خدمات شهرداری‌ها روی سامانهٔ شهرشهر.', path: '/' });
  }

  return pageMeta({
    title: `خدمات شهرداری ${city.name}`,
    description: `خدمات آنلاین شهرداری ${city.name}: رزرو اماکن و سالن‌های ورزشی، سامانهٔ ۱۳۷، کارتابل شهروندی، جمع‌آوری و خرید پسماند خشک و جست‌وجوی درگذشتگان — دیدن سانس‌ها و قیمت‌ها بدون ثبت‌نام.`,
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
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'GovernmentOffice',
          name: `شهرداری ${city.name}`,
          url: `${SITE_URL}/city/${city.slug}`,
          areaServed: { '@type': 'City', name: city.name },
          ...(Number.isFinite(city.lat) && Number.isFinite(city.lng)
            ? { geo: { '@type': 'GeoCoordinates', latitude: city.lat, longitude: city.lng } }
            : {}),
          makesOffer: catalogue
            .filter((service) => city.isActive && city.services.includes(service.key))
            .map((service) => ({
              '@type': 'Offer',
              itemOffered: { '@type': 'Service', name: service.title, description: service.description },
            })),
        }}
      />
      <CityHub city={city} catalogue={catalogue} venues={venues} materialCount={materials.length} />
    </>
  );
}
