import WasteTypesPage from '@/components/views/WasteTypes/waste-types';
import { JsonLd, SITE_URL, pageMeta } from '@/lib/seo';
import { WASTE_TYPES } from '@/lib/wasteTypes';

export const metadata = pageMeta({
  title: 'انواع پسماند و راهنمای تفکیک زباله',
  description:
    'شش دستهٔ پسماند — قابل بازیافت، خانگی، الکترونیکی، حجیم، خودرو و ساختمانی — با نمونه‌های هر دسته و راهنمای تفکیک برای تحویل به جمع‌آور.',
  path: '/waste-types',
  keywords: ['انواع پسماند', 'تفکیک زباله', 'پسماند خشک و تر', 'پسماند الکترونیکی', 'نخاله ساختمانی'],
});

/** The six categories as a list Google can read, not only as cards it must guess at. */
const LD = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  '@id': `${SITE_URL}/waste-types#list`,
  name: 'انواع پسماند',
  itemListElement: WASTE_TYPES.map((w, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: w.name,
    description: w.description,
  })),
};

export default function WasteTypes() {
  return (
    <>
      <JsonLd data={LD} />
      <WasteTypesPage />
    </>
  );
}
