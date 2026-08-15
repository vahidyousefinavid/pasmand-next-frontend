'use client';

import Link from 'next/link';
import {
  ArrowLeft, Building2, ChevronLeft, Clock3, MapPin, MessagesSquare, PackagePlus,
  Route, Scale, Wallet,
} from 'lucide-react';

import { C, S, alpha, fa } from '@/components/ui/tokens';
import { WASTE_TYPES } from '@/lib/wasteTypes';
import { GUIDE_FAQS } from '@/lib/faq';
import type { BoardCity, PublicCity } from '@/lib/publicData';
import RateBoard from './rate-board';
import IranMap from './iran-map';
import { PublicFooter, PublicHeader, useSignedIn } from './public-chrome';

/**
 * The front door of شهرشهر.
 *
 * Who arrives here: somebody who has just heard the name, or who searched
 * «قیمت روز ضایعات نهاوند» and landed on the root of the domain. On a phone,
 * in Persian, with one question — is this real, and what will they pay me?
 *
 * So the page answers in that order. Today's prices, on a board, in the first
 * screen. Then how the four steps actually go. Then what counts as waste, which
 * cities are covered, and the questions people ask before they trust a
 * municipality with their afternoon.
 *
 * The board is the only loud thing on the page; everything around it is
 * deliberately quiet, because a page where everything shouts says nothing.
 */

const STEPS = [
  { n: '۱', title: 'درخواست می‌دهید', body: 'نوع پسماند، آدرس و بازهٔ زمانی را در برنامه انتخاب می‌کنید. یک دقیقه طول می‌کشد.' },
  { n: '۲', title: 'جمع‌آور می‌آید', body: 'جمع‌آورِ شهرداری همان بازه به درِ خانه می‌آید. مسیرش را در برنامه می‌بینید.' },
  { n: '۳', title: 'جلوی شما توزین می‌شود', body: 'وزن و مبلغ هر قلم در حضور خودتان ثبت می‌شود؛ چیزی پشت درِ بسته حساب نمی‌شود.' },
  { n: '۴', title: 'پول همان لحظه واریز می‌شود', body: 'مبلغ به کیف پول شما می‌نشیند و هر وقت خواستید به حسابتان برداشت می‌کنید.' },
];

/**
 * What the platform provides to any service, waste or otherwise. Every one of
 * these is built and running today — which is why they can be listed, and why
 * a list of services nobody has commissioned yet cannot be.
 */
const PLATFORM = [
  { icon: <PackagePlus className="h-5 w-5" />, title: 'درخواست و زمان‌بندی', body: 'شهروند درخواست می‌دهد، آدرس و بازهٔ زمانی را خودش انتخاب می‌کند.' },
  { icon: <Route className="h-5 w-5" />, title: 'پیگیری مرحله‌به‌مرحله', body: 'هر تغییر وضعیت را شهروند و مأمور، هر دو، همان لحظه می‌بینند.' },
  { icon: <Wallet className="h-5 w-5" />, title: 'کیف پول و تسویه', body: 'پرداخت به شهروند و برداشت به حساب بانکی، از حساب خودِ شهرداری.' },
  { icon: <MessagesSquare className="h-5 w-5" />, title: 'گفتگو و اعلان', body: 'گفتگوی مستقیم با مأمور خدمات، و اعلان هر اتفاق در همان برنامه.' },
  { icon: <Building2 className="h-5 w-5" />, title: 'پنل مستقل شهرداری', body: 'تعرفه، نیروها، شهروندان و گزارش‌های هر شهر، جدا از شهرهای دیگر.' },
];

const PROOF = [
  { icon: <Scale className="h-4 w-4" />, title: 'توزین در محل', sub: 'جلوی خودتان' },
  { icon: <Wallet className="h-4 w-4" />, title: 'پرداخت فوری', sub: 'به کیف پول' },
  { icon: <Clock3 className="h-4 w-4" />, title: 'بازهٔ دلخواه', sub: 'صبح یا عصر' },
  { icon: <PackagePlus className="h-4 w-4" />, title: 'جمع‌آوری رایگان', sub: 'بدون هزینه' },
];

function CoverageStat({ value, label, tone }: { value: number; label: string; tone: string }) {
  return (
    <div
      style={{
        flex: '1 1 120px', padding: '13px 16px', borderRadius: 16,
        background: 'rgba(255,255,255,0.05)', border: '1px solid var(--ss-line)',
      }}
    >
      <p className="ss-fig" style={{ margin: 0, fontSize: 26, color: tone, lineHeight: 1.2 }}>{fa(value)}</p>
      <p style={{ margin: '4px 0 0', fontSize: 12, color: 'rgba(233,244,239,0.66)' }}>{label}</p>
    </div>
  );
}

function SectionHead({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div style={{ maxWidth: '58ch', marginBottom: S.s5 }}>
      <p style={{ margin: 0, fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', color: 'var(--ss-brass-ink)' }}>
        {eyebrow}
      </p>
      <h2 className="ss-display" style={{ margin: '10px 0 0', fontSize: 'var(--ss-h2)', color: C.textStrong }}>
        {title}
      </h2>
      {sub && <p style={{ margin: '12px 0 0', fontSize: S.sm, color: C.muted, lineHeight: 2.1 }}>{sub}</p>}
    </div>
  );
}

/**
 * Two lists, deliberately.
 *
 * `board` is the cities with published prices — the only ones a rate board can
 * show. `cities` is every city the panel knows, including the ones that have
 * not opened, because the coverage map's whole point is to show both states.
 */
export default function Landing({ board, cities }: { board: BoardCity[]; cities: PublicCity[] }) {
  const signedIn = useSignedIn();

  const cityNames = cities.filter((c) => c.isActive).map((c) => c.name);

  // The map needs coordinates; a city without them is still listed beside it.
  const mapCities = cities.filter((c) => Number.isFinite(c.lat) && Number.isFinite(c.lng));
  const live = cities.filter((c) => c.isActive);
  const soon = cities.filter((c) => !c.isActive);
  const liveNames = live.map((c) => c.name).join('، ');

  return (
    <div className="ss" dir="rtl" style={{ minHeight: '100vh' }}>
      <PublicHeader signedIn={signedIn} />

      <main>
        {/* ── hero: the claim, and the board that proves it ── */}
        <section className="ss-wrap" style={{ paddingTop: 'clamp(28px, 5vw, 64px)', paddingBottom: 'clamp(32px, 5vw, 72px)' }}>
          <div
            style={{
              display: 'grid', gap: 'clamp(28px, 4vw, 52px)', alignItems: 'center',
              gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))',
            }}
          >
            <div className="ss-rise">
              <p style={{ margin: 0, fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', color: 'var(--ss-brass-ink)' }}>
                خدمات شهری شهرشهر · شهروند سبز
              </p>

              <h1 className="ss-display" style={{ margin: '14px 0 0', fontSize: 'var(--ss-h1)', color: C.textStrong }}>
                خدمات شهرداری،
                <br />
                از <span style={{ color: C.green }}>گوشیِ خودتان</span>.
              </h1>

              <p style={{ margin: '18px 0 0', fontSize: 'var(--ss-lede)', color: C.muted, lineHeight: 2.1, maxWidth: '48ch' }}>
                شهرشهر بستری است که هر شهرداری خدماتش را روی آن به شهروند می‌رساند — و خدمت‌به‌خدمت
                کامل می‌شود.
              </p>

              {/* The service that exists today, named as such. A platform page
                  that stays abstract gives a visitor nothing to do; one that
                  only talks about waste hides what the system is. */}
              <div
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 11, marginTop: S.s4,
                  padding: `${S.s3}px ${S.s4}px`, borderRadius: 16,
                  background: C.surface, border: `1px solid ${C.border}`, maxWidth: '48ch',
                }}
              >
                <span
                  style={{
                    marginTop: 3, flexShrink: 0, fontSize: 10, fontWeight: 800, padding: '4px 10px',
                    borderRadius: 999, background: alpha(C.green, 12), color: C.green,
                    border: `1px solid ${alpha(C.green, 26)}`, whiteSpace: 'nowrap',
                  }}
                >
                  خدمت فعال
                </span>
                <span style={{ minWidth: 0, fontSize: S.sm, color: C.text, lineHeight: 2 }}>
                  <strong style={{ color: C.textStrong, fontWeight: 800 }}>جمع‌آوری و خرید پسماند خشک</strong>{' '}
                  از درِ خانه: رایگان، با توزین جلوی خودتان و پرداخت همان لحظه به کیف پول.
                </span>
              </div>

              <div style={{ display: 'flex', gap: S.s3, flexWrap: 'wrap', marginTop: S.s5 }}>
                <Link
                  href={signedIn ? '/new-request' : '/login'}
                  className="ss-cta"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: S.s2, textDecoration: 'none',
                    padding: '15px 26px', borderRadius: 16,
                    background: C.green, color: C.onAccent, fontSize: S.base, fontWeight: 800,
                    boxShadow: `0 12px 26px ${alpha(C.green, 30)}`,
                  }}
                >
                  <PackagePlus className="h-4 w-4" aria-hidden />
                  ثبت درخواست جمع‌آوری
                </Link>
                <Link
                  href="/guide"
                  className="ss-cta"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: S.s2, textDecoration: 'none',
                    padding: '15px 24px', borderRadius: 16,
                    background: C.surface, color: C.textStrong,
                    border: `1px solid ${C.border}`, fontSize: S.base, fontWeight: 800,
                  }}
                >
                  چطور کار می‌کند؟
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                </Link>
              </div>

              {cityNames.length > 0 && (
                <p style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', margin: `${S.s5}px 0 0`, fontSize: S.sm, color: C.muted }}>
                  <MapPin className="h-4 w-4" style={{ color: C.green }} aria-hidden />
                  فعال در
                  <strong style={{ color: C.textStrong, fontWeight: 800 }}>{cityNames.join('، ')}</strong>
                </p>
              )}
            </div>

            <div>
              <p style={{ margin: `0 0 ${S.s3}px`, fontSize: 12, fontWeight: 800, color: 'var(--ss-brass-ink)', letterSpacing: '0.06em' }}>
                نرخ امروزِ خدمت فعال
              </p>
              <RateBoard cities={board} />
            </div>
          </div>
        </section>

        {/* ── the four facts, as a band rather than four more cards ── */}
        <section style={{ borderBlock: `1px solid ${C.border}`, background: C.surface }}>
          <div
            className="ss-wrap"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', paddingBlock: S.s4 }}
          >
            {PROOF.map((p, i) => (
              <div
                key={p.title}
                style={{
                  display: 'flex', alignItems: 'center', gap: 11, padding: `${S.s2}px ${S.s3}px`,
                  borderInlineStart: i === 0 ? 'none' : `1px solid ${C.border}`,
                }}
              >
                <span style={{ color: C.green, flexShrink: 0 }}>{p.icon}</span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 13, fontWeight: 800, color: C.textStrong }}>{p.title}</span>
                  <span style={{ display: 'block', fontSize: 11, color: C.muted }}>{p.sub}</span>
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── how it goes ── */}
        <section className="ss-wrap" style={{ paddingBlock: 'clamp(44px, 6vw, 88px)' }}>
          <SectionHead
            eyebrow="خدمت فعال · جمع‌آوری پسماند"
            title="از درخواست تا پول، در یک بعدازظهر"
            sub="هیچ مرحله‌ای پشت درِ بسته انجام نمی‌شود؛ وزن و مبلغ را همان‌جا می‌بینید و در برنامه هم ثبت می‌ماند."
          />

          <ol className="ss-steps" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {STEPS.map((step) => (
              <li key={step.n} className="ss-card" style={{ padding: S.s4 }}>
                <span className="ss-step-no">قدم {step.n}</span>
                <p className="ss-display" style={{ margin: '10px 0 0', fontSize: 16, color: C.textStrong, lineHeight: 1.6 }}>
                  {step.title}
                </p>
                <p style={{ margin: '9px 0 0', fontSize: 13, color: C.muted, lineHeight: 2 }}>{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ── what counts as waste here ── */}
        <section style={{ background: C.bgSubtle, borderBlock: `1px solid ${C.border}` }}>
          <div className="ss-wrap" style={{ paddingBlock: 'clamp(44px, 6vw, 88px)' }}>
            <SectionHead
              eyebrow="خدمت فعال · چه چیزی تحویل بدهم"
              title="شش دستهٔ پسماند"
              sub="دستهٔ «قابل بازیافت» همان است که بابتش پول می‌گیرید؛ بقیه جمع‌آوری می‌شوند تا سرِ جای درستشان بروند."
            />

            <div style={{ display: 'grid', gap: S.s3, gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
              {WASTE_TYPES.map((type) => (
                <Link key={type.id} href="/waste-types" className="ss-card ss-link-card" style={{ padding: S.s4 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                    <span
                      style={{
                        width: 40, height: 40, borderRadius: 13, display: 'grid', placeItems: 'center', flexShrink: 0,
                        background: alpha(type.color, 12), color: type.color, border: `1px solid ${alpha(type.color, 24)}`,
                      }}
                    >
                      <type.Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: 15, fontWeight: 800, color: C.textStrong }}>{type.name}</span>
                      <span style={{ display: 'block', marginTop: 3, fontSize: 12, color: C.muted }}>{type.short}</span>
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── the part that is not about waste ──
            The reason this page is not «a waste app»: collection is the first
            service on it, and everything under that service — requests,
            tracking, the wallet, the conversation, the city's own panel — was
            built once and belongs to the platform. Naming those is honest,
            where naming services nobody has agreed to yet would not be. */}
        <section className="ss-wrap" style={{ paddingBottom: 'clamp(44px, 6vw, 88px)' }}>
          <SectionHead
            eyebrow="سامانه، نه یک برنامهٔ تک‌کاره"
            title="خدمت بعدی، از روز اول این‌ها را دارد"
            sub="جمع‌آوری پسماند نخستین خدمتی است که روی شهرشهر اجرا شده. آنچه زیرِ آن ساخته شده مخصوص پسماند نیست و هر خدمت تازه‌ای از همان ابتدا از آن استفاده می‌کند."
          />

          <div style={{ display: 'grid', gap: S.s3, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            {PLATFORM.map((item) => (
              <div key={item.title} className="ss-card" style={{ padding: S.s4 }}>
                <span
                  style={{
                    width: 38, height: 38, borderRadius: 12, display: 'grid', placeItems: 'center',
                    background: alpha(C.green, 10), color: C.green, border: `1px solid ${alpha(C.green, 22)}`,
                  }}
                >
                  {item.icon}
                </span>
                <p style={{ margin: '12px 0 0', fontSize: 14, fontWeight: 800, color: C.textStrong }}>{item.title}</p>
                <p style={{ margin: '7px 0 0', fontSize: 12, color: C.muted, lineHeight: 1.95 }}>{item.body}</p>
              </div>
            ))}
          </div>

          <p
            style={{
              margin: `${S.s4}px 0 0`, padding: `${S.s3}px ${S.s4}px`, borderRadius: 14,
              background: C.bgSubtle, border: `1px dashed ${C.border}`,
              fontSize: 13, color: C.muted, lineHeight: 2.1, maxWidth: '70ch',
            }}
          >
            خدمت بعدی را <strong style={{ color: C.textStrong }}>شهرداری هر شهر</strong> تعیین می‌کند و روی
            همین سامانه اضافه می‌شود — بدون برنامهٔ تازه‌ای برای نصب و بدون حساب تازه‌ای برای ساختن.
          </p>
        </section>

        {/* ── coverage: the country, and the two states a city can be in ── */}
        {cities.length > 0 && (
          <section className="ss-wrap" style={{ paddingBottom: 'clamp(44px, 6vw, 88px)' }}>
            <SectionHead
              eyebrow="پوشش خدمات"
              title={liveNames ? `امروز ${liveNames}. ساخته‌شده برای همهٔ ایران.` : 'ساخته‌شده برای همهٔ ایران.'}
              sub="نقشه همان است که هست: شهرهای روشن، شهرهایی‌اند که خدمات در آن‌ها فعال است. شهرداری هر شهر تازه، با پنل و تعرفهٔ خودش به همین سامانه اضافه می‌شود."
            />

            <div
              className="ss-board"
              style={{
                display: 'grid', gap: 'clamp(18px, 3vw, 36px)', alignItems: 'center',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                padding: 'clamp(18px, 3vw, 32px)',
              }}
            >
              <IranMap cities={mapCities} />

              {/* The same information as text and links — which is what a
                  keyboard, a screen reader and a crawler actually read. */}
              <div>
                <div style={{ display: 'flex', gap: S.s3, flexWrap: 'wrap', marginBottom: S.s4 }}>
                  <CoverageStat value={live.length} label="شهر فعال" tone="#4ade9f" />
                  <CoverageStat value={soon.length} label="شهر در نوبت" tone="#e3ad55" />
                </div>

                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>
                  {cities.map((city) => (
                    <li key={city._id}>
                      <Link
                        href={city.slug ? `/tariff/${city.slug}` : '/tariff'}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none',
                          padding: '11px 14px', borderRadius: 14,
                          background: 'rgba(255,255,255,0.05)', border: '1px solid var(--ss-line)',
                        }}
                      >
                        <span
                          aria-hidden
                          style={{
                            width: 9, height: 9, borderRadius: '50%', flexShrink: 0,
                            background: city.isActive ? '#4ade9f' : 'transparent',
                            border: city.isActive ? 'none' : '1.5px dashed #e3ad55',
                            boxShadow: city.isActive ? '0 0 10px rgba(74,222,159,0.8)' : 'none',
                          }}
                        />
                        <span style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 800, color: '#eef5f1' }}>
                          {city.name}
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: city.isActive ? '#4ade9f' : '#e3ad55' }}>
                          {city.isActive ? 'فعال' : 'به‌زودی'}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>

                <p style={{ margin: `${S.s4}px 0 0`, fontSize: 12, color: 'rgba(233,244,239,0.6)', lineHeight: 2 }}>
                  شهر شما در فهرست نیست؟{' '}
                  <Link href="/contact-us" style={{ color: 'var(--ss-brass)', fontWeight: 800 }}>
                    به شهرداری‌تان معرفی‌اش کنید
                  </Link>
                  .
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ── for the municipalities themselves ── */}
        <section className="ss-wrap" style={{ paddingBottom: 'clamp(44px, 6vw, 88px)' }}>
          <div
            className="ss-board"
            style={{ padding: 'clamp(24px, 4vw, 44px)', display: 'grid', gap: S.s4, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', alignItems: 'center' }}
          >
            <div>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', color: 'var(--ss-brass)' }}>
                برای شهرداری‌ها
              </p>
              <h2 className="ss-display" style={{ margin: '12px 0 0', fontSize: 'var(--ss-h2)', color: '#f4f9f6' }}>
                شهر خودتان را روی همین سامانه بیاورید
              </h2>
              <p style={{ margin: '14px 0 0', fontSize: 14, color: 'rgba(233,244,239,0.72)', lineHeight: 2.1, maxWidth: '48ch' }}>
                هر شهر پنل مستقل خودش را دارد: تعرفه، خدمات، جمع‌آوران، شهروندان و گزارش‌ها — جدا از
                شهرهای دیگر و زیر نظر مدیر همان شهر. حساب بانکی و تسویهٔ شهروندان هم از حساب خودِ
                شهرداری انجام می‌شود.
              </p>
            </div>

            <div style={{ display: 'flex', gap: S.s3, flexWrap: 'wrap', justifyContent: 'flex-start' }}>
              <Link
                href="/contact-us"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none',
                  padding: '14px 24px', borderRadius: 14,
                  background: 'var(--ss-brass)', color: '#201603', fontSize: 14, fontWeight: 800,
                }}
              >
                <Building2 className="h-4 w-4" aria-hidden />
                تماس برای همکاری
              </Link>
              <Link
                href="/report"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none',
                  padding: '14px 22px', borderRadius: 14,
                  background: 'rgba(255,255,255,0.08)', border: '1px solid var(--ss-line-strong)',
                  color: '#eef5f1', fontSize: 14, fontWeight: 800,
                }}
              >
                معرفی سامانه
              </Link>
            </div>
          </div>
        </section>

        {/* ── the questions people actually ask ── */}
        <section style={{ background: C.surface, borderTop: `1px solid ${C.border}` }}>
          <div className="ss-wrap" style={{ paddingBlock: 'clamp(44px, 6vw, 88px)' }}>
            <SectionHead eyebrow="پرسش‌های پرتکرار" title="قبل از اولین درخواست" />

            <div style={{ display: 'grid', gap: S.s2, maxWidth: '76ch' }}>
              {GUIDE_FAQS.slice(0, 6).map((faq) => (
                // <details> rather than a scripted accordion: it opens without
                // JavaScript, the keyboard already knows how to use it, and a
                // crawler reads the answer whether it is open or not.
                <details key={faq.q} className="ss-card" style={{ padding: `${S.s3}px ${S.s4}px` }}>
                  <summary style={{ cursor: 'pointer', fontSize: 14, fontWeight: 800, color: C.textStrong, lineHeight: 2 }}>
                    {faq.q}
                  </summary>
                  <p style={{ margin: '10px 0 0', fontSize: 13, color: C.muted, lineHeight: 2.1 }}>{faq.a}</p>
                </details>
              ))}
            </div>

            <Link
              href="/guide"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: S.s4, fontSize: 13, fontWeight: 800, color: C.green, textDecoration: 'none' }}
            >
              راهنمای کامل
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        </section>

        {/* ── last word ── */}
        <section className="ss-wrap" style={{ paddingBlock: 'clamp(44px, 6vw, 80px)', textAlign: 'center' }}>
          <h2 className="ss-display" style={{ margin: 0, fontSize: 'var(--ss-h2)', color: C.textStrong }}>
            از پسماند شروع کنید.
          </h2>
          <p style={{ margin: '14px auto 0', fontSize: S.sm, color: C.muted, lineHeight: 2.1, maxWidth: '48ch' }}>
            یک‌بار با شمارهٔ موبایل ثبت‌نام می‌کنید — کمتر از یک دقیقه — و هر خدمتی که شهرداری شهرتان
            بعد از این اضافه کند، با همین حساب در دسترستان است.
          </p>
          <Link
            href={signedIn ? '/new-request' : '/login'}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: S.s2, textDecoration: 'none', marginTop: S.s5,
              padding: '16px 30px', borderRadius: 16,
              background: C.green, color: C.onAccent, fontSize: S.base, fontWeight: 800,
              boxShadow: `0 12px 26px ${alpha(C.green, 30)}`,
            }}
          >
            <PackagePlus className="h-4 w-4" aria-hidden />
            شروع کنید
          </Link>
        </section>
      </main>

      <PublicFooter signedIn={signedIn} />
    </div>
  );
}
