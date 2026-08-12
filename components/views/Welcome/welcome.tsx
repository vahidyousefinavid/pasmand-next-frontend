'use client';

import Link from 'next/link';
import {
  Recycle, PackagePlus, Banknote, Truck, Scale, Wallet, MapPin, Leaf,
  ChevronLeft, Building2, ShieldCheck, Clock,
} from 'lucide-react';

import { useCity } from '@/context/data-context';
import { C, S, alpha } from '@/components/ui/tokens';
import { Card, IconBadge, StepRail, type Step } from '@/components/ui/kit';
import EcoGlobe from '@/components/ui/EcoGlobe';

/**
 * The public front door.
 *
 * Everything else on this site is behind the login, which meant a search engine
 * — and anyone who had merely heard the name — arrived at a form. This page is
 * what a brand search lands on: it says what شهرشهر is, in the words people
 * type, and every claim on it links to a page that backs it up.
 *
 * The name appears in both spellings, «شهرشهر» and «شهر شهر», because that is
 * how it is written in the wild and a page that uses only one is invisible to
 * searches for the other.
 */

const STEPS: Step[] = [
  { key: 'request', title: 'درخواست می‌دهید', detail: 'نوع پسماند، آدرس و بازهٔ زمانی را انتخاب می‌کنید.' },
  { key: 'come', title: 'جمع‌آور می‌آید', detail: 'در همان بازه، جمع‌آور شهرداری به درِ خانه مراجعه می‌کند.' },
  { key: 'weigh', title: 'در محل توزین می‌شود', detail: 'وزن و مبلغ در حضور شما ثبت می‌شود.' },
  { key: 'pay', title: 'پول به کیف پول می‌نشیند', detail: 'مبلغ بلافاصله به کیف پول شما در برنامه واریز می‌شود.' },
];

const SERVICES = [
  {
    href: '/tariff',
    title: 'قیمت روز ضایعات',
    description: 'نرخ خرید آهن، مس، آلومینیوم، پت، کاغذ باطله و شیشه، به تفکیک شهر.',
    icon: <Banknote className="h-5 w-5" />,
    color: C.green,
  },
  {
    href: '/waste-types',
    title: 'انواع پسماند و تفکیک',
    description: 'شش دستهٔ پسماند خشک، خانگی، الکترونیکی، حجیم، خودرو و ساختمانی.',
    icon: <Recycle className="h-5 w-5" />,
    color: C.violet,
  },
  {
    href: '/guide',
    title: 'راهنمای جمع‌آوری',
    description: 'از ثبت درخواست تا توزین و تسویه، پنج قدم روشن.',
    icon: <Truck className="h-5 w-5" />,
    color: C.statusInfo,
  },
  {
    href: '/contact-us',
    title: 'پشتیبانی شهروندان',
    description: 'تلفن، ایمیل و گفتگوی آنلاین در روزهای کاری.',
    icon: <ShieldCheck className="h-5 w-5" />,
    color: C.amber,
  },
];

const HIGHLIGHTS = [
  { icon: <Wallet className="h-4 w-4" />, title: 'پرداخت به کیف پول', sub: 'بلافاصله پس از توزین' },
  { icon: <Scale className="h-4 w-4" />, title: 'توزین در محل', sub: 'در حضور خودتان' },
  { icon: <Clock className="h-4 w-4" />, title: 'بازهٔ زمانی دلخواه', sub: 'صبح یا بعدازظهر' },
  { icon: <Leaf className="h-4 w-4" />, title: 'جمع‌آوری رایگان', sub: 'بدون هزینه برای شهروند' },
];

export default function WelcomeView() {
  const { cities } = useCity();

  return (
    <div
      dir="rtl"
      style={{
        minHeight: '100vh',
        background: C.bg,
        color: C.text,
        paddingBottom: `calc(${S.s7}px + env(safe-area-inset-bottom))`,
      }}
    >
      {/* ── header ── */}
      <header
        style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: `linear-gradient(135deg, ${C.heroStart}, ${C.heroEnd})`,
          color: C.onHero, boxShadow: C.shadowHero,
          borderEndStartRadius: 22, borderEndEndRadius: 22,
          paddingTop: 'env(safe-area-inset-top)',
        }}
      >
        <div style={{ maxWidth: 1040, margin: '0 auto', padding: `${S.s3}px ${S.s4}px`, display: 'flex', alignItems: 'center', gap: S.s3 }}>
          <span style={{ width: 40, height: 40, borderRadius: 14, display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.24)', flexShrink: 0 }}>
            <Leaf className="h-5 w-5" />
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', fontSize: S.base, fontWeight: 800 }}>شهرشهر</span>
            <span style={{ display: 'block', fontSize: 10, color: C.onHeroMuted }}>سامانهٔ خدمات شهری</span>
          </span>
          <Link
            href="/login"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none', flexShrink: 0,
              padding: '10px 16px', borderRadius: 999,
              background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)',
              color: C.onHero, fontSize: S.xs, fontWeight: 800,
            }}
          >
            ورود شهروندان
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: 1040, margin: '0 auto', padding: `${S.s5}px ${S.s4}px 0` }}>
        {/* ── hero ── */}
        <section style={{ display: 'grid', gap: S.s5, justifyItems: 'center', textAlign: 'center', padding: `${S.s5}px 0 ${S.s6}px` }}>
          <EcoGlobe size={200} />

          <h1 style={{ margin: 0, fontSize: S.xxl, fontWeight: 800, color: C.textStrong, lineHeight: 1.5, letterSpacing: '-0.02em' }}>
            شهر شهر — سامانهٔ خدمات شهری
          </h1>

          <p style={{ margin: 0, fontSize: S.md, color: C.muted, lineHeight: 2, maxWidth: '60ch' }}>
            <strong style={{ color: C.text }}>شهرشهر</strong>، که شهروندان آن را با نام{' '}
            <strong style={{ color: C.text }}>شهروند سبز</strong> می‌شناسند، خدمات شهری را از تلفن همراه
            به درِ خانهٔ شما می‌آورد. <strong style={{ color: C.text }}>نخستین خدمت فعال</strong>، جمع‌آوری
            و خرید پسماند خشک است: درخواست می‌دهید، جمع‌آور می‌آید، بار در محل توزین می‌شود و پولش همان
            لحظه به کیف پول شما می‌نشیند. خدمات شهریِ بعدی روی همین سامانه اضافه می‌شوند.
          </p>

          <div style={{ display: 'flex', gap: S.s3, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link
              href="/login"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: S.s2,
                padding: '15px 26px', borderRadius: S.r2, textDecoration: 'none',
                background: C.green, color: C.onAccent, fontSize: S.base, fontWeight: 800,
                boxShadow: `0 8px 22px ${alpha(C.green, 30)}`,
              }}
            >
              <PackagePlus className="h-4 w-4" />
              ثبت درخواست جمع‌آوری
            </Link>
            <Link
              href="/tariff"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: S.s2,
                padding: '15px 26px', borderRadius: S.r2, textDecoration: 'none',
                background: C.surface, color: C.green, border: `1px solid ${alpha(C.green, 26)}`,
                fontSize: S.base, fontWeight: 800,
              }}
            >
              <Banknote className="h-4 w-4" />
              قیمت روز ضایعات
            </Link>
          </div>

          {/* the cities, which is what makes a local search match */}
          <p style={{ margin: 0, fontSize: S.sm, color: C.muted, display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
            <MapPin className="h-4 w-4" style={{ color: C.green }} />
            در حال ارائهٔ خدمات در
            {cities.map((c, i) => (
              <span key={c.id} style={{ fontWeight: 800, color: C.textStrong }}>
                {c.name}{i < cities.length - 1 ? '،' : ''}
              </span>
            ))}
          </p>
        </section>

        {/* ── what you get ── */}
        <section style={{ display: 'grid', gap: S.s3, gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}>
          {HIGHLIGHTS.map((h) => (
            <Card key={h.title}>
              <div style={{ padding: S.s4, display: 'flex', alignItems: 'center', gap: S.s3 }}>
                <IconBadge color={C.green} size={40}>{h.icon}</IconBadge>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: S.sm, fontWeight: 800, color: C.textStrong }}>{h.title}</p>
                  <p style={{ margin: '4px 0 0', fontSize: S.xs, color: C.muted }}>{h.sub}</p>
                </div>
              </div>
            </Card>
          ))}
        </section>

        {/* ── how it works ── */}
        <h2 style={{ margin: `${S.s7}px 0 ${S.s2}px`, fontSize: S.xl, fontWeight: 800, color: C.textStrong }}>
          خدمت فعال امروز: جمع‌آوری و خرید پسماند خشک
        </h2>
        <p style={{ margin: `0 0 ${S.s4}px`, fontSize: S.sm, color: C.muted, lineHeight: 2, maxWidth: '62ch' }}>
          این نخستین خدمتی است که روی سامانهٔ شهرشهر اجرا می‌شود و در چهار قدم انجام می‌گیرد.
        </p>
        <Card accent={C.green}>
          <div style={{ padding: `${S.s5}px ${S.s4}px` }}>
            <StepRail steps={STEPS} current={STEPS.length} />
          </div>
        </Card>

        {/* ── services ── */}
        <h2 style={{ margin: `${S.s7}px 0 ${S.s4}px`, fontSize: S.xl, fontWeight: 800, color: C.textStrong }}>
          بخش‌های سامانهٔ خدمات شهری شهرشهر
        </h2>
        <section style={{ display: 'grid', gap: S.s3, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {SERVICES.map((s) => (
            <Link key={s.href} href={s.href} style={{ textDecoration: 'none' }}>
              <Card interactive style={{ height: '100%' }}>
                <div style={{ padding: S.s4, display: 'flex', alignItems: 'center', gap: S.s3 }}>
                  <IconBadge color={s.color}>{s.icon}</IconBadge>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: S.base, fontWeight: 800, color: C.textStrong }}>{s.title}</p>
                    <p style={{ margin: '5px 0 0', fontSize: S.xs, color: C.muted, lineHeight: 1.8 }}>{s.description}</p>
                  </div>
                  <ChevronLeft className="h-4 w-4" style={{ color: C.subtle, flexShrink: 0 }} />
                </div>
              </Card>
            </Link>
          ))}
        </section>

        {/* ── for municipalities ── */}
        <section style={{ marginTop: S.s7 }}>
          <Card accent={C.statusInfo}>
            <div style={{ padding: `${S.s5}px ${S.s4}px`, display: 'flex', gap: S.s4, flexWrap: 'wrap', alignItems: 'center' }}>
              <IconBadge color={C.statusInfo} size={52}><Building2 className="h-6 w-6" /></IconBadge>
              <div style={{ flex: '1 1 300px', minWidth: 0 }}>
                <h2 style={{ margin: 0, fontSize: S.md, fontWeight: 800, color: C.textStrong }}>
                  برای شهرداری‌ها و مدیران خدمات شهری
                </h2>
                <p style={{ margin: '8px 0 0', fontSize: S.sm, color: C.muted, lineHeight: 2 }}>
                  شهرشهر برای هر شهر یک پنل مستقل دارد: خدمات همان شهر، تعرفهٔ اختصاصی، نیروهای خدماتی،
                  شهروندان و گزارش درخواست‌ها — همه جدا از شهرهای دیگر و زیر نظر مدیر همان شهر. هر خدمت
                  شهری تازه‌ای هم روی همین ساختار اضافه می‌شود.
                </p>
              </div>
              <Link
                href="/contact-us"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: S.s2, textDecoration: 'none',
                  padding: '13px 22px', borderRadius: S.r2,
                  background: alpha(C.statusInfo, 12), color: C.statusInfo,
                  border: `1px solid ${alpha(C.statusInfo, 26)}`, fontSize: S.sm, fontWeight: 800,
                }}
              >
                تماس برای همکاری
              </Link>
            </div>
          </Card>
        </section>

        {/* ── footer ── */}
        <footer style={{ marginTop: S.s7, paddingTop: S.s5, borderTop: `1px dashed ${C.border}`, textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: S.sm, color: C.muted, lineHeight: 2 }}>
            شهرشهر / شهر شهر — شهروند سبز · سامانهٔ خدمات شهری · خدمت فعال: جمع‌آوری پسماند
          </p>
          <nav style={{ display: 'flex', gap: S.s4, flexWrap: 'wrap', justifyContent: 'center', marginTop: S.s3 }}>
            {SERVICES.map((s) => (
              <Link key={s.href} href={s.href} style={{ fontSize: S.xs, color: C.green, fontWeight: 700, textDecoration: 'none' }}>
                {s.title}
              </Link>
            ))}
            <Link href="/login" style={{ fontSize: S.xs, color: C.green, fontWeight: 700, textDecoration: 'none' }}>ورود شهروندان</Link>
          </nav>
        </footer>
      </main>
    </div>
  );
}
