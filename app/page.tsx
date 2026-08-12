import HomeView from '@/components/views/Home/home';
import type { Metadata } from 'next';

// Behind the auth gate and disallowed in robots.ts, so this title is for the
// browser tab and the share sheet rather than for a search result.
export const metadata: Metadata = {
  title: 'خانه',
  description: 'میان‌بر همهٔ خدمات: ثبت درخواست جمع‌آوری، پیگیری، کیف پول و تعرفهٔ روز.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <HomeView />;
}
