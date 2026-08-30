import MemorialsPage from '@/components/views/Services/memorials';
import { pageMeta } from '@/lib/seo';

/**
 * The one module page a search engine should have.
 *
 * People look for a relative's grave from outside the app, so this page is
 * public and indexable — unlike every other screen behind the login. It now
 * carries three things that all belong to the same moment in someone's life:
 * the city's مشاهیر, the اطلاعیه‌ها for ceremonies happening this week, and the
 * cemetery register itself, which keeps its own tab and its own dataset.
 */
export const metadata = pageMeta({
  title: 'یادبود، مشاهیر و جست‌وجوی درگذشتگان',
  description:
    'مشاهیر و مفاخر شهر، اطلاعیه‌های مراسم ترحیم، و جست‌وجوی نام درگذشتگان در آرامستان‌های شهرداری: آرامستان، قطعه، ردیف و شمارهٔ قبر — بدون نیاز به ثبت‌نام.',
  path: '/deceased',
  keywords: [
    'یادبود', 'مشاهیر شهر', 'مفاخر', 'اطلاعیه ترحیم', 'مراسم ختم',
    'جست‌وجوی درگذشتگان', 'محل دفن', 'آرامستان', 'قطعه و ردیف قبر', 'استعلام قبر',
  ],
});

export default function Page() {
  return <MemorialsPage />;
}
