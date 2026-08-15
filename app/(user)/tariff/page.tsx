import Prices from '@/components/views/Tariff/prices';
import { CITIES, JsonLd, SITE_URL, cityKeywords, pageMeta } from '@/lib/seo';
import { getCities, getPricedCity, materialsLd } from '@/lib/publicData';

export const metadata = pageMeta({
  title: 'قیمت روز خرید ضایعات و پسماند خشک',
  description:
    'قیمت روز خرید آهن، مس، آلومینیوم، پت، نایلون، کاغذ باطله و شیشه در شهر شهر — به تفکیک شهر. فروش پسماند خشک با توزین در محل و پرداخت فوری به کیف پول.',
  path: '/tariff',
  keywords: [
    'قیمت روز ضایعات',
    'خرید و فروش پسماند',
    'فروش ضایعات',
    'قیمت خرید ضایعات آهن',
    'قیمت کاغذ باطله',
    'قیمت مس',
    'نرخ ضایعات امروز',
    ...cityKeywords(['قیمت ضایعات', 'فروش پسماند']),
  ],
});

/**
 * The price list — the city that is actually running, with the others one link
 * away at `/tariff/[city]`.
 *
 * Rendered per request rather than at build time. With `revalidate` alone Next
 * prerendered this during `docker compose build`, where `pasmand-api` is not on
 * the network, so the page shipped with an empty price list baked in. The fetch
 * inside carries its own half-hour cache, so this costs one API call per half
 * hour, not one per visitor.
 */
export const dynamic = 'force-dynamic';

export default async function Tariff() {
  const cities = await getCities();
  const { city, materials } = await getPricedCity(cities);
  const cityName = city?.name || CITIES[0];

  return (
    <>
      {materials.length > 0 && <JsonLd data={materialsLd(materials, cityName)} />}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'شهر شهر', item: SITE_URL },
            { '@type': 'ListItem', position: 2, name: 'تعرفهٔ قیمت‌ها', item: `${SITE_URL}/tariff` },
          ],
        }}
      />

      <Prices city={city} cities={cities} materials={materials} />
    </>
  );
}
