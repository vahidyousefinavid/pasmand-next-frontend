'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Banknote,
  FileClock,
  MapPinned,
  HelpCircle,
  Leaf,
  Gift,
  Recycle,
  Wallet,
  Phone,
  Trash2,
  ChevronLeft,
  PackagePlus,
  Sparkles,
} from 'lucide-react';
import { Navigation } from '@/components/views/navigation';
import { TopMenu } from '@/components/views/top-menu';
import { useAuth } from '@/context/auth-context';
import { useCity } from '@/context/data-context';
import { C, S, alpha } from '@/components/ui/tokens';
import { Screen, Hero, Card, IconBadge, SectionTitle } from '@/components/ui/kit';
import { serviceIcon, useCityServices } from '@/lib/cityServices';

/**
 * Home.
 *
 * The services list is a dotted rail rather than a grid of equal tiles: the
 * things a citizen does here are not eight interchangeable options, they are a
 * route — hand something over, watch it get collected, get paid, learn what
 * goes where. The rail says that; a 2×4 grid says the opposite.
 */

const services = [
  {
    href: '/new-request',
    title: 'درخواست جمع‌آوری',
    description: 'نوع پسماند، محل و زمان را انتخاب کنید تا جمع‌آور بیاید',
    icon: <PackagePlus className="h-5 w-5" />,
    color: C.green,
    primary: true,
  },
  {
    href: '/history',
    title: 'پیگیری و سوابق',
    description: 'مرحله‌به‌مرحله ببینید درخواست‌تان کجای مسیر است',
    icon: <FileClock className="h-5 w-5" />,
    color: C.statusInfo,
  },
  {
    href: '/wallet',
    title: 'کیف پول',
    description: 'موجودی، واریزها و برداشت‌های شما',
    icon: <Wallet className="h-5 w-5" />,
    color: C.amber,
  },
  {
    href: '/tariff',
    title: 'تعرفهٔ قیمت‌ها',
    description: 'قیمت روز خرید هر قلم پسماند',
    icon: <Banknote className="h-5 w-5" />,
    color: C.green,
  },
  {
    href: '/waste-types',
    title: 'انواع پسماند',
    description: 'کدام پسماند در کدام دسته می‌گنجد',
    icon: <Trash2 className="h-5 w-5" />,
    color: C.violet,
  },
  {
    href: '/addresses',
    title: 'آدرس‌ها',
    description: 'آدرس‌های ذخیره‌شده برای جمع‌آوری سریع‌تر',
    icon: <MapPinned className="h-5 w-5" />,
    color: C.statusInfo,
  },
  {
    href: '/guide',
    title: 'راهنمای استفاده',
    description: 'از ثبت درخواست تا تسویه، قدم به قدم',
    icon: <HelpCircle className="h-5 w-5" />,
    color: C.statusNeutral,
  },
  {
    href: '/contact-us',
    title: 'پشتیبانی',
    description: 'اگر چیزی مطابق انتظار پیش نرفت، با ما حرف بزنید',
    icon: <Phone className="h-5 w-5" />,
    color: C.statusNeutral,
  },
];

const banners = [
  {
    title: 'بیش از ۵ کیلوگرم؟ نوبت ویژه بگیرید',
    description: 'برای حجم بالاتر، جمع‌آور با خودروی بزرگ‌تر می‌آید.',
    icon: <Recycle className="h-6 w-6" />,
    cta: 'ثبت درخواست',
    href: '/new-request',
    from: C.heroStart,
    to: C.heroEnd,
  },
  {
    title: 'تفکیک درست، بازیافت واقعی',
    description: 'پسماند خشکِ تمیز دوباره تولید می‌شود؛ مخلوط، دفن.',
    icon: <Leaf className="h-6 w-6" />,
    cta: 'انواع پسماند',
    href: '/waste-types',
    from: '#0e6f7a',
    to: '#1aa0a8',
  },
  {
    title: 'هر جمع‌آوری، اعتبار در کیف پول',
    description: 'مبلغ پس از توزین، مستقیم به کیف پول شما می‌نشیند.',
    icon: <Gift className="h-6 w-6" />,
    cta: 'کیف پول',
    href: '/wallet',
    from: '#2f4fa8',
    to: '#4f7ae0',
  },
];

export default function HomeView() {
  // The modules this city has switched on, appended to the fixed four below.
  const { services: cityModules } = useCityServices();

  /**
   * The rail: the fixed parts of the waste service, then whatever else this
   * city runs. Built here rather than written into the constant below, because
   * the answer belongs to the municipality and changes without a deploy.
   */
  const rail = [
    ...services,
    ...cityModules
      .filter((service) => service.key !== 'waste')
      .map((service) => {
        const Icon = serviceIcon(service.icon);
        return {
          href: service.href,
          title: service.title,
          description: service.short,
          icon: <Icon className="h-5 w-5" />,
          color: service.color,
          primary: false,
        };
      }),
  ];
  const [mounted, setMounted] = useState(false);
  const [slide, setSlide] = useState(0);
  const { user } = useAuth();
  const { selectedCity } = useCity();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // A PWA that cannot register its worker is still a working website.
      });
    }
  }, []);

  // Plain interval instead of a carousel library: three slides that cross-fade
  // do not need 40KB of gesture handling.
  useEffect(() => {
    const id = setInterval(() => setSlide((s) => (s + 1) % banners.length), 5500);
    return () => clearInterval(id);
  }, []);

  if (!mounted) return null;

  const name = (user as any)?.firstName || (user as any)?.name || '';

  return (
    <>
      <TopMenu />
      <Screen>
        <Hero
          icon={<Leaf className="h-6 w-6" />}
          title={name ? `سلام ${name}` : 'سلام'}
          sub={
            selectedCity?.name
              ? `پسماند خانه‌تان را در ${selectedCity.name} بفروشید؛ ما درِ خانه تحویل می‌گیریم.`
              : 'پسماند خانه‌تان را بفروشید؛ ما درِ خانه تحویل می‌گیریم.'
          }
          aside={
            <Link href="/new-request" style={{ textDecoration: 'none' }}>
              <span
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: S.s2,
                  background: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.3)',
                  color: C.onHero, padding: '12px 18px', borderRadius: S.rPill,
                  fontSize: S.sm, fontWeight: 800, whiteSpace: 'nowrap',
                }}
              >
                <PackagePlus className="h-4 w-4" />
                درخواست جمع‌آوری
              </span>
            </Link>
          }
        />

        {/* ── rotating notice ── */}
        <div style={{ position: 'relative', height: 132, marginBottom: S.s2 }}>
          {banners.map((b, i) => (
            <Link
              key={b.title}
              href={b.href}
              aria-hidden={i !== slide}
              tabIndex={i === slide ? 0 : -1}
              style={{
                position: 'absolute', inset: 0, textDecoration: 'none',
                borderRadius: S.r3, overflow: 'hidden',
                background: `linear-gradient(120deg, ${b.from}, ${b.to})`,
                color: '#fff',
                display: 'flex', alignItems: 'center', gap: S.s4,
                padding: `0 ${S.s5}px`,
                opacity: i === slide ? 1 : 0,
                transform: i === slide ? 'none' : 'scale(0.98)',
                transition: 'opacity .5s ease, transform .5s ease',
                pointerEvents: i === slide ? 'auto' : 'none',
                boxShadow: C.shadowCard,
              }}
            >
              <span style={{ width: 46, height: 46, borderRadius: 16, display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,0.18)', flexShrink: 0 }}>
                {b.icon}
              </span>
              <span style={{ minWidth: 0, flex: 1 }}>
                <span style={{ display: 'block', fontSize: S.base, fontWeight: 800 }}>{b.title}</span>
                <span style={{ display: 'block', fontSize: S.xs, opacity: 0.85, marginTop: 5, lineHeight: 1.7 }}>{b.description}</span>
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: S.xs, fontWeight: 800, whiteSpace: 'nowrap', opacity: 0.95 }}>
                {b.cta}
                <ChevronLeft className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: S.s2 }}>
          {banners.map((b, i) => (
            <button
              key={b.title}
              type="button"
              aria-label={`اعلان ${i + 1}`}
              onClick={() => setSlide(i)}
              style={{
                height: 5, width: i === slide ? 22 : 8, borderRadius: 999, border: 'none', padding: 0,
                background: i === slide ? C.green : C.borderStrong,
                transition: 'width .3s ease, background .3s ease', cursor: 'pointer',
              }}
            />
          ))}
        </div>

        {/* ── services, threaded on a dotted rail ──
            The four fixed entries are the parts of the waste service every city
            has. Anything after them is a module this particular municipality
            switched on, which is why the list is built at render time rather
            than written out here. */}
        <SectionTitle
          title="خدمات"
          action={
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: S.xs, color: C.muted, fontWeight: 600 }}>
              <Sparkles className="h-3.5 w-3.5" />
              مسیر یک درخواست
            </span>
          }
        />

        <div style={{ position: 'relative', paddingInlineStart: 34 }}>
          {/* The rail itself, on the start edge — the right, in Persian.
              Dotted, because the distance between two services is a wait, and
              it fades at the tail so the list does not look truncated. */}
          <span
            aria-hidden
            style={{
              position: 'absolute', insetInlineStart: 14, top: 26, bottom: 26, width: 2,
              backgroundImage: `linear-gradient(to bottom, ${alpha(C.green, 55)} 55%, transparent 0)`,
              backgroundSize: '2px 10px',
              backgroundRepeat: 'repeat-y',
              maskImage: 'linear-gradient(to bottom, #000 0%, #000 82%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, #000 0%, #000 82%, transparent 100%)',
              animation: 'pmDashFlow 1.6s linear infinite',
            }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: S.s3 }}>
            {rail.map((s, i) => (
              <div key={s.href} className="pm-fade-up" style={{ position: 'relative', animationDelay: `${i * 45}ms` }}>
                {/* the node on the rail */}
                <span
                  aria-hidden
                  style={{
                    position: 'absolute', insetInlineStart: -26, top: 26,
                    width: 12, height: 12, borderRadius: '50%',
                    background: C.bg,
                    border: `2.5px solid ${s.color}`,
                    boxShadow: s.primary ? `0 0 0 5px ${alpha(s.color, 14)}` : undefined,
                  }}
                />

                <Link href={s.href} style={{ textDecoration: 'none', display: 'block' }}>
                  <Card accent={s.primary ? s.color : undefined} interactive>
                    <div style={{ padding: `${S.s4}px`, display: 'flex', alignItems: 'center', gap: S.s3 }}>
                      <IconBadge color={s.color}>{s.icon}</IconBadge>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: S.base, fontWeight: 800, color: C.textStrong }}>{s.title}</p>
                        <p style={{ margin: '5px 0 0', fontSize: S.xs, color: C.muted, lineHeight: 1.75 }}>{s.description}</p>
                      </div>
                      <ChevronLeft className="h-4 w-4" style={{ color: C.subtle, flexShrink: 0 }} />
                    </div>
                  </Card>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* A link, not a <Btn>: a button inside an anchor is invalid markup and
            keyboard users get two focus stops for one action. */}
        <Link
          href="/new-request"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: S.s2,
            marginTop: S.s6, padding: '14px 20px', borderRadius: S.r2,
            background: C.green, color: C.onAccent, textDecoration: 'none',
            fontSize: S.base, fontWeight: 800,
            boxShadow: `0 8px 20px ${alpha(C.green, 28)}`,
          }}
        >
          <PackagePlus className="h-4 w-4" />
          ثبت درخواست جمع‌آوری
        </Link>
      </Screen>
      <Navigation />
    </>
  );
}
