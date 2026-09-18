import UrbanPage from '@/components/views/Urban/urban';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ساخت‌وساز و املاک',
  description: 'ثبت و پیگیری پروانهٔ ساخت، تغییر کاربری و تخفیف عوارض.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <UrbanPage />;
}
