import VenuesPage from '@/components/views/Services/venues';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'رزرو اماکن',
  description: 'رزرو آنلاین سالن‌های ورزشی، فرهنگسراها و غرفه‌های بازارچه.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <VenuesPage />;
}
