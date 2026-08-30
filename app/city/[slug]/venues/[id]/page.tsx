import { notFound } from 'next/navigation';

import PublicVenuePage from '@/components/views/Public/venue-page';
import { JsonLd, SITE_URL, pageMeta } from '@/lib/seo';
import { getCityBySlug } from '@/lib/publicData';
import { getCityVenue, getCityVenues } from '@/lib/publicVenues';

/**
 * یک مکان، در یک روز.
 *
 * The date is a query parameter rather than component state on purpose: this
 * page is the thing somebody sends to a friend — «پنجشنبه ساعت ۱۶ استخر بانوان
 * جا دارد» — and a URL that carries the day is the only version of that message
 * which still means the same thing when it is opened.
 */
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string; id: string } }) {
  const city = await getCityBySlug(params.slug);
  const data = city ? await getCityVenue(city.slug || city._id, params.id) : null;

  if (!city || !data) {
    return pageMeta({ title: 'رزرو اماکن', description: 'اماکن شهرداری‌ها روی شهرشهر.', path: '/' });
  }

  return pageMeta({
    title: `${data.venue.title} — رزرو آنلاین در ${city.name}`,
    description: `${data.venue.kindTitle} ${data.venue.title} در ${city.name}: سانس‌ها، ساعت‌های خالی، ظرفیت و قیمت هر سانس. تقویم را بدون ثبت‌نام ببینید و آنلاین رزرو کنید.`,
    path: `/city/${city.slug}/venues/${params.id}`,
    keywords: [
      `${data.venue.title} ${city.name}`,
      `رزرو ${data.venue.kindTitle} ${city.name}`,
      `سانس ${data.venue.kindTitle} ${city.name}`,
      `ساعت کار ${data.venue.title}`,
    ],
  });
}

export default async function VenuePage({
  params,
  searchParams,
}: {
  params: { slug: string; id: string };
  searchParams: { date?: string };
}) {
  const city = await getCityBySlug(params.slug);
  if (!city) notFound();

  const [data, list] = await Promise.all([
    getCityVenue(city.slug || city._id, params.id, searchParams.date),
    // The rest of the city's places, for the strip at the foot of the page. A
    // venue page that ends in nothing is a dead end: somebody whose Thursday is
    // full at the pool should be shown the other hall, not the back button.
    getCityVenues(city.slug || city._id),
  ]);
  if (!data) notFound();

  const others = (list?.venues || []).filter((venue) => venue._id !== params.id).slice(0, 4);

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Place',
          name: data.venue.title,
          description: data.venue.description || `${data.venue.kindTitle} در ${city.name}`,
          url: `${SITE_URL}/city/${city.slug}/venues/${params.id}`,
          telephone: data.venue.phone || undefined,
          maximumAttendeeCapacity: data.venue.capacity || undefined,
          address: data.venue.address
            ? { '@type': 'PostalAddress', streetAddress: data.venue.address, addressLocality: city.name }
            : undefined,
          ...(data.venue.location
            ? { geo: { '@type': 'GeoCoordinates', latitude: data.venue.location.lat, longitude: data.venue.location.lng } }
            : {}),
        }}
      />
      <PublicVenuePage data={data} others={others} />
    </>
  );
}
