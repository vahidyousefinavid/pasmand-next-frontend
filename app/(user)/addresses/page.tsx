import AddressesPage from '@/components/views/Addresse/adresses';
import type { Metadata } from 'next';

// Behind the auth gate and disallowed in robots.ts, so this title is for the
// browser tab and the share sheet rather than for a search result.
export const metadata: Metadata = {
  title: 'آدرس‌های من',
  description: 'آدرس‌های ذخیره‌شده برای جمع‌آوری سریع‌تر.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AddressesPage />;
}
