import { notFound } from 'next/navigation';

import Prices from '@/components/views/Tariff/prices';
import { JsonLd, SITE_URL, pageMeta } from '@/lib/seo';
import { getCities, getCityBySlug, getCityMaterials, getServices, materialsLd } from '@/lib/publicData';

/**
 * One city's price list, at its own address.
 *
 * «قیمت روز ضایعات نهاوند» is a different search from «قیمت روز ضایعات ملایر»,
 * and until now both landed on the same URL showing whichever city the browser
 * happened to remember. A page per city is linkable, shareable and indexable,
 * and it is also simply what a visitor means when they pick their city.
 *
 * Cities that have not opened yet still have a page: it says so, which is more
 * use to somebody in that city than a 404.
 */
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { city: string } }) {
  const city = await getCityBySlug(params.city);
  if (!city) return pageMeta({ title: 'تعرفهٔ قیمت‌ها', description: 'قیمت روز خرید ضایعات و پسماند خشک.', path: '/tariff' });

  return pageMeta({
    title: `قیمت روز خرید ضایعات در ${city.name}`,
    description: `قیمت روز خرید آهن، مس، آلومینیوم، پت، کاغذ باطله و شیشه در ${city.name}؛ جمع‌آوری رایگان از درِ خانه، توزین در محل و پرداخت به کیف پول.`,
    path: `/tariff/${city.slug}`,
    keywords: [
      `قیمت روز ضایعات ${city.name}`,
      `خرید ضایعات ${city.name}`,
      `فروش پسماند ${city.name}`,
      `نرخ ضایعات ${city.name}`,
      'قیمت روز ضایعات',
    ],
  });
}

export default async function CityTariff({ params }: { params: { city: string } }) {
  const [cities, city, catalogue] = await Promise.all([getCities(), getCityBySlug(params.city), getServices()]);
  if (!city) notFound();

  const materials = await getCityMaterials(city._id);

  return (
    <>
      {materials.length > 0 && <JsonLd data={materialsLd(materials, city.name)} />}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'شهر شهر', item: SITE_URL },
            { '@type': 'ListItem', position: 2, name: 'تعرفهٔ قیمت‌ها', item: `${SITE_URL}/tariff` },
            { '@type': 'ListItem', position: 3, name: city.name, item: `${SITE_URL}/tariff/${city.slug}` },
          ],
        }}
      />

      <Prices city={city} cities={cities} materials={materials} catalogue={catalogue} />
    </>
  );
}
