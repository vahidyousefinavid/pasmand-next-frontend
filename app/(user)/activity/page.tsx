import ActivityPage from '@/components/views/Activity/activity';
import type { Metadata } from 'next';

/**
 * Behind the auth gate: this is the citizen's own list, so it is deliberately
 * not indexed and carries no public description.
 */
export const metadata: Metadata = {
  title: 'کارهای من',
  description: 'درخواست‌ها، رزروها، گزارش‌ها و نامه‌های شما در یک فهرست.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ActivityPage />;
}
