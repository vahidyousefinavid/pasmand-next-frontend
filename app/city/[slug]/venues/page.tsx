import { notFound } from 'next/navigation';

import PublicVenueList from '@/components/views/Public/venue-list';
import { JsonLd, SITE_URL, pageMeta } from '@/lib/seo';
import { getCityBySlug } from '@/lib/publicData';
import { getCityVenues } from '@/lib/publicVenues';

/**
 * اماکن قابل رزرو یک شهر, published.
 *
 * «رزرو سالن ورزشی نهاوند» used to be a login form. It is a page now, with the
 * city's real halls on it and the day each of them next opens.
 */
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const city = await getCityBySlug(params.slug);
  if (!city) return pageMeta({ title: 'اماکن قابل رزرو', description: 'اماکن شهرداری‌ها روی شهرشهر.', path: '/' });

  return pageMeta({
    title: `رزرو اماکن و سالن‌های شهرداری ${city.name}`,
    description: `سالن ورزشی، استخر، فرهنگسرا و سالن اجتماعات شهرداری ${city.name}: سانس‌ها، ظرفیت و قیمت هر ساعت را ببینید و آنلاین رزرو کنید.`,
    path: `/city/${city.slug}/venues`,
    keywords: [
      `رزرو سالن ${city.name}`,
      `سالن ورزشی ${city.name}`,
      `استخر ${city.name}`,
      `رزرو اماکن ورزشی ${city.name}`,
      `فرهنگسرا ${city.name}`,
    ],
  });
}

export default async function CityVenues({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { group?: string };
}) {
  const city = await getCityBySlug(params.slug);
  if (!city) notFound();

  const data = await getCityVenues(city.slug || city._id, searchParams.group);
  // The module being off, or the API being down, are two different things and
  // neither is a page: the city's own page says what it does run.
  if (!data) notFound();

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: `اماکن قابل رزرو شهرداری ${city.name}`,
          numberOfItems: data.venues.length,
          itemListElement: data.venues.map((venue, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: {
              '@type': 'Place',
              name: venue.title,
              description: venue.description || venue.kindTitle,
              url: `${SITE_URL}/city/${city.slug}/venues/${venue._id}`,
              address: venue.address
                ? { '@type': 'PostalAddress', streetAddress: venue.address, addressLocality: city.name }
                : undefined,
            },
          })),
        }}
      />
      <PublicVenueList data={data} group={searchParams.group} />
    </>
  );
}
