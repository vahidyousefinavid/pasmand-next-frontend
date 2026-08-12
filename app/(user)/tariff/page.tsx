import PricesPage from '@/components/views/Tariff/tariff';
import { CITIES, pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  title: 'قیمت روز ضایعات و اقلام بازیافتی',
  description:
    'قیمت روز خرید آهن، مس، آلومینیوم، پت، نایلون، کاغذ باطله و شیشه — به تفکیک شهر. مبلغ نهایی پس از توزین در محل محاسبه می‌شود.',
  path: '/tariff',
  keywords: [
    'قیمت روز ضایعات',
    'قیمت خرید ضایعات آهن',
    'قیمت کاغذ باطله',
    'قیمت مس',
    'نرخ ضایعات',
    ...CITIES.map((c) => `قیمت ضایعات ${c}`),
  ],
});

export default function Tariff() {
  return <PricesPage />;
}
