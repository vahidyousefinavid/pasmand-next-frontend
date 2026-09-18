import CityMapView from '@/components/views/Urban/city-map';
import { pageMeta } from '@/lib/seo';
import { C, S } from '@/components/ui/tokens';

export const metadata = pageMeta({
  title: 'نقشهٔ شهر',
  description:
    'کاربری اراضی، تراکم ساختمانی، فضای سبز و محدودهٔ شهری روی نقشه — بدون نیاز به ثبت‌نام.',
  path: '/city-map',
  keywords: ['نقشه شهر', 'کاربری اراضی', 'تراکم ساختمانی', 'طرح تفصیلی', 'محدوده شهری'],
});

export default function Page() {
  return (
    <main className="ss-wrap" style={{ paddingTop: S.s5, paddingBottom: S.s7, display: 'grid', gap: S.s4 }}>
      <header>
        <h1 className="ss-display" style={{ margin: 0, fontSize: 'var(--ss-h2)', color: C.textStrong }}>
          نقشهٔ شهر
        </h1>
        <p style={{ margin: '10px 0 0', fontSize: S.sm, color: C.muted, lineHeight: 2, maxWidth: '52ch' }}>
          لایه‌های طرح تفصیلی شهر: کاربری اراضی، تراکم ساختمانی، فضای سبز و محدودهٔ قانونی. لایه را
          انتخاب کنید و روی نقشه بگردید.
        </p>
      </header>
      <CityMapView />
    </main>
  );
}
