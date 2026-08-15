import DeceasedPage from '@/components/views/Services/deceased';
import { pageMeta } from '@/lib/seo';

/**
 * The one module page a search engine should have.
 *
 * People look for a relative's grave from outside the app, so this page is
 * public and indexable — unlike every other screen behind the login.
 */
export const metadata = pageMeta({
  title: 'جست‌وجوی درگذشتگان و محل دفن',
  description:
    'جست‌وجوی نام درگذشتگان در آرامستان‌های شهرداری: آرامستان، قطعه، ردیف و شمارهٔ قبر — بدون نیاز به ثبت‌نام.',
  path: '/deceased',
  keywords: ['جست‌وجوی درگذشتگان', 'محل دفن', 'آرامستان', 'قطعه و ردیف قبر', 'استعلام قبر'],
});

export default function Page() {
  return <DeceasedPage />;
}
