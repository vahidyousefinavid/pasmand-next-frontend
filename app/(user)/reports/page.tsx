import ReportsPage from '@/components/views/Services/reports';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'سامانهٔ ۱۳۷',
  description: 'ثبت و پیگیری گزارش‌های مردمی: سد معبر، آسفالت، روشنایی و زبالهٔ رهاشده.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ReportsPage />;
}
