import NotificationsPage from '@/components/views/Notifications/notifications';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'اعلان‌ها',
  description: 'همهٔ اعلان‌های درخواست‌ها، پیام‌ها و کیف پول.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <NotificationsPage />;
}
