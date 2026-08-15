import MessagesPage from '@/components/views/Messages/messages';
import type { Metadata } from 'next';

// Behind the auth gate and out of robots.ts, so this title is for the browser
// tab and the share sheet rather than for a search result.
export const metadata: Metadata = {
  title: 'پیام‌ها',
  description: 'گفتگوی شما با جمع‌آوران، همه در یک جا.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <MessagesPage />;
}
