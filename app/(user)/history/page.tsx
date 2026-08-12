import HistoryPage from '@/components/views/History/history';
import type { Metadata } from 'next';

// Behind the auth gate and disallowed in robots.ts, so this title is for the
// browser tab and the share sheet rather than for a search result.
export const metadata: Metadata = {
  title: 'پیگیری درخواست‌ها',
  description: 'مسیر هر درخواست جمع‌آوری، از ثبت تا توزین و تسویه.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <HistoryPage />;
}
