import ProfilePage from '@/components/views/Profile/profile';
import type { Metadata } from 'next';

// Behind the auth gate and disallowed in robots.ts, so this title is for the
// browser tab and the share sheet rather than for a search result.
export const metadata: Metadata = {
  title: 'حساب کاربری',
  description: 'اطلاعات شخصی، آدرس‌ها و درخواست‌های شما.',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ProfilePage />;
}
