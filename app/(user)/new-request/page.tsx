import NewRequestView from '@/components/views/NewRequest/new-request';
import type { Metadata } from 'next';

// Behind the auth gate and disallowed in robots.ts, so this title is for the
// browser tab and the share sheet rather than for a search result.
export const metadata: Metadata = {
  title: 'ثبت درخواست جمع‌آوری',
  description: 'در چهار قدم: نوع پسماند، محل، زمان مراجعه و بازبینی.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <NewRequestView />;
}
