import CartablePage from '@/components/views/Services/cartable';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'کارتابل شهروندی',
  description: 'آخرین وضعیت نامه‌ها و درخواست‌های اداری شما در شهرداری.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <CartablePage />;
}
