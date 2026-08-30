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
import { C, S, alpha, fa } from '@/components/ui/tokens';
import { Screen, Hero, Card, IconBadge, SectionTitle, Shimmer } from '@/components/ui/kit';
import { serviceIcon, useCityServices } from '@/lib/cityServices';

/**
 * Home.
 *
 * The services list is a dotted rail rather than a grid of equal tiles: the
 * things a citizen does here are not eight interchangeable options, they are a
 * route — hand something over, watch it get collected, get paid, learn what
 * goes where. The rail says that; a 2×4 grid says the opposite.
 */

/**
 * The route a request actually takes — and the only thing the dotted rail is
 * for now. It used to carry eight entries: the four steps of the waste service
 * *and* the reference pages *and* the account pages, with whatever modules the
 * city runs appended after all of them. A citizen of نهاوند had to scroll past
 * eight rows about rubbish to find «رزرو اماکن», which is the module their
 * municipality actually switched on for them.
 */
const JOURNEY = [
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
    title: 'پیگیری درخواست‌ها',
    description: 'مرحله‌به‌مرحله ببینید درخواست پسماندتان کجای مسیر است',
    icon: <FileClock className="h-5 w-5" />,
    color: C.statusInfo,
  },
  {
    href: '/wallet',
    title: 'کیف پول',
    description: 'مبلغ هر توزین همین‌جا می‌نشیند؛ برداشت به حساب خودتان',
    icon: <Wallet className="h-5 w-5" />,
    color: C.amber,
  },
];

/**
 * Reference and account — needed, and needed rarely.
 *
 * As full-width cards these four were indistinguishable from the things a
 * person opens the app to *do*. As a row of chips they are still one tap away
 * and no longer in the way.
 */
/**
 * If `/api/v1/services` never answers — a restarting API, a phone that lost the
 * network — the grid still has to be a grid. Waste is the one module every city
 * on this platform runs, so it is the honest floor: never a promise of a
 * service this city may not have.
 */
const FALLBACK_MODULES = [
  {
    key: 'waste',
    title: 'جمع‌آوری پسماند',
    short: 'خرید پسماند خشک از درِ خانه',
    icon: 'Recycle',
    color: C.green,
    href: '/new-request',
  },
];

const EXTRAS = [
  { href: '/tariff', title: 'تعرفهٔ قیمت‌ها', icon: <Banknote className="h-4 w-4" /> },
  { href: '/waste-types', title: 'انواع پسماند', icon: <Trash2 className="h-4 w-4" /> },
  { href: '/addresses', title: 'آدرس‌های من', icon: <MapPinned className="h-4 w-4" /> },
  { href: '/guide', title: 'راهنما', icon: <HelpCircle className="h-4 w-4" /> },
  { href: '/contact-us', title: 'پشتیبانی', icon: <Phone className="h-4 w-4" /> },
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
  /**
   * The modules this municipality has switched on — the first thing on the
   * screen now, and the reason this app is not a waste app.
   */
  const { services: cityModules, loading: modulesLoading } = useCityServices();

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
            // Named after what this city actually runs. A greeting about
            // rubbish is the wrong first sentence in a municipality that also
            // lets its halls, answers ۱۳۷ and keeps a cartable.
            selectedCity?.name
              ? cityModules.length > 1
                ? `خدمات شهرداری ${selectedCity.name}، از همین‌جا.`
                : `پسماند خانه‌تان را در ${selectedCity.name} بفروشید؛ ما درِ خانه تحویل می‌گیریم.`
              : 'خدمات شهرداری شهرتان، از همین‌جا.'
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

        {/* ── خدمات شهر، پیش از هر چیز دیگر ──
            What the municipality offers, in a grid rather than threaded onto
            the rail below it: these are not steps of anything, they are
            separate services, and a citizen who came to book a hall should not
            have to read about waste collection to find one. */}
        <SectionTitle
          title={selectedCity?.name ? `خدمات شهرداری ${selectedCity.name}` : 'خدمات شهر شما'}
          action={
            !modulesLoading && cityModules.length > 0 ? (
              <span className="tnum" style={{ fontSize: S.xs, color: C.muted, fontWeight: 700 }}>
                {fa(cityModules.length)} خدمت فعال
              </span>
            ) : undefined
          }
        />

        <div
          style={{
            // 8px between cards read as one block with seams rather than as
            // separate destinations; the same air the rest of the screen uses
            // is what makes them countable.
            display: 'grid', gap: S.s3,
            // Two on a phone, more where there is room. A module is a
            // destination, so its tile has to be big enough to be a target.
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 152px), 1fr))',
          }}
        >
          {modulesLoading
            ? [0, 1, 2, 3].map((i) => <Shimmer key={i} height={116} />)
            : (cityModules.length ? cityModules : FALLBACK_MODULES).map((service) => {
              const Icon = serviceIcon(service.icon);
              return (
                <Link key={service.key} href={service.href} style={{ textDecoration: 'none' }}>
                  <Card interactive style={{ height: '100%' }}>
                    <div style={{ padding: S.s4, display: 'flex', flexDirection: 'column', gap: 9, height: '100%' }}>
                      <IconBadge color={service.color}>
                        <Icon className="h-5 w-5" />
                      </IconBadge>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: S.sm, fontWeight: 800, color: C.textStrong, lineHeight: 1.6 }}>
                          {service.title}
                        </p>
                        <p style={{ margin: '4px 0 0', fontSize: 11, color: C.muted, lineHeight: 1.7 }}>
                          {service.short}
                        </p>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
        </div>

        {/* ── rotating notice ──
            Its own air above it: the services grid ended and this began with
            nothing between them, so two unrelated things read as one block. */}
        <div style={{ position: 'relative', height: 132, marginTop: S.s5, marginBottom: S.s2 }}>
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

        {/* ── the waste journey, on its dotted rail ──
            Three entries, and they genuinely are a sequence: a request comes
            before a collection, which comes before the money. The rail draws
            that order — which is why the modules above are *not* on it. */}
        <SectionTitle
          title="جمع‌آوری پسماند"
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
            {JOURNEY.map((s, i) => (
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

        {/* ── the rest, as chips ── */}
        <div style={{ display: 'flex', gap: S.s2, flexWrap: 'wrap', marginTop: S.s5 }}>
          {EXTRAS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7, textDecoration: 'none',
                padding: '10px 15px', borderRadius: S.rPill,
                background: C.surface, border: `1px solid ${C.border}`,
                color: C.text, fontSize: S.xs, fontWeight: 700,
              }}
            >
              <span style={{ color: C.muted, display: 'inline-flex' }}>{item.icon}</span>
              {item.title}
            </Link>
          ))}
        </div>
      </Screen>
      <Navigation />
    </>
  );
}
