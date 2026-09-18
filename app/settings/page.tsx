import type { Metadata } from 'next';

import AppearanceView from '@/components/views/Settings/appearance';

export const metadata: Metadata = {
  title: 'ظاهر برنامه',
  description: 'رنگ تابلوهای شهرشهر و حالت روشن یا تاریک.',
};

export default function SettingsPage() {
  return <AppearanceView />;
}
