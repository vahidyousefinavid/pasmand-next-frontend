'use client';

import Link from 'next/link';
import {
  ArrowLeft, Building2, Clock3, LogIn, MapPin, MessagesSquare, PackagePlus,
  Route, Scale, Wallet,
} from 'lucide-react';

import { C, S, alpha, fa } from '@/components/ui/tokens';
import { HOME_FAQS } from '@/lib/faq';
import type { BoardCity, PublicCity, PublicService } from '@/lib/publicData';
import type { CityHighlights } from '@/lib/publicVenues';
import RateBoard from './rate-board';
import IranMap from './iran-map';
import { PublicFooter, PublicHeader, SectionHead, useSignedIn } from './public-chrome';
import ServiceGrid from './service-grid';

/**
 * The front door of شهرشهر.
 *
 * Who arrives here: somebody who has just heard the name, or who searched
 * «قیمت روز ضایعات نهاوند» and landed on the root of the domain. On a phone,
 * in Persian, with one question — is this real, and what will they pay me?
 *
 * It used to answer with a price board and then, four sections later, with a
 * list of services that all led to a login form. That order was written when
 * this was a waste app: prices were the only thing a city had to offer and the
 * only thing anybody could be shown without an account.
 *
 * There are five services now, each city runs its own set, and two of them can
 * be used end-to-end by somebody who has never signed up. So the page opens on
 * **the console** — your city, its services, and the sessions its اماکن have
 * free this week — and the price board stands underneath with the service it
 * belongs to. Everything below that is unchanged: how collection goes, what
 * counts as waste, which cities are covered, and the questions people ask
 * before trusting a municipality with their afternoon.
 *
 * The console is the only loud thing on the page; everything around it is
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

/**
 * Two lists, deliberately.
 *
 * `board` is the cities with published prices — the only ones a rate board can
 * show. `cities` is every city the panel knows, including the ones that have
 * not opened, because the coverage map's whole point is to show both states.
 */
export default function Landing({
  board,
  cities,
  catalogue,
  highlights,
}: {
  board: BoardCity[];
  cities: PublicCity[];
  /** خدمات شهرشهر, as the API defines them — see `city-console.tsx`. */
  catalogue: PublicService[];
  /** Live venue availability per city, for the console's rail. */
  highlights: CityHighlights[];
}) {
  const signedIn = useSignedIn();

  const cityNames = cities.filter((c) => c.isActive).map((c) => c.name);

  // The largest number of services any city actually runs today. It is what the
  // hero can claim without naming a city, and it is a fact rather than a plan.
  const mostServices = Math.max(
    0,
    ...cities.filter((c) => c.isActive).map((c) => c.services.length),
  );

  // The map needs coordinates; a city without them is still listed beside it.
  const mapCities = cities.filter((c) => Number.isFinite(c.lat) && Number.isFinite(c.lng));
  const live = cities.filter((c) => c.isActive);
  const soon = cities.filter((c) => !c.isActive);
  const liveNames = live.map((c) => c.name).join('، ');

  return (
    <div className="ss" dir="rtl" style={{ minHeight: '100vh' }}>
      <PublicHeader signedIn={signedIn} />

      <main>
        {/* ── hero ──
            A photograph, because the page had none and a wall of green cards
            asks a newcomer to read before it gives them anything to look at.
            It is a real place — the garden at Avicenna's tomb in همدان, from
            Wikimedia Commons — not stock: a municipal site showing a city that
            is not its own would be the first thing it got wrong. The overlay
            is heavy on purpose; the picture sets a mood and the words have to
            stay readable on a phone in sunlight. */}
        <section
          style={{
            position: 'relative',
            isolation: 'isolate',
            overflow: 'hidden',
            // Deliberately short. A full-screen hero on a phone means the
            // services — the reason anybody is here — start below the fold.
            minHeight: 'clamp(300px, 42vh, 420px)',
            display: 'grid',
            alignItems: 'center',
          }}
        >
          <img
            src="/img/hero-city.jpg"
            alt="باغ آرامگاه بوعلی‌سینا در همدان"
            loading="eager"
            /* eslint-disable-next-line @next/next/no-img-element */
            style={{
              position: 'absolute', inset: 0, zIndex: -2,
              width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 58%',
            }}
          />
          {/* Two layers: a brand-tinted wash so the photo reads as ours, and a
              directional gradient that keeps the text side darkest. */}
          <span
            aria-hidden
            style={{
              position: 'absolute', inset: 0, zIndex: -1,
              background:
                // The wash over the photograph is the skin's own dark, so the
                // hero changes colour with the rest of the product.
                'linear-gradient(to left,'
                + ' color-mix(in srgb, var(--sh-enamel-deep) 35%, transparent) 0%,'
                + ' color-mix(in srgb, var(--sh-enamel-deep) 88%, transparent) 55%,'
                + ' color-mix(in srgb, var(--sh-enamel-deep) 96%, transparent) 100%)',
            }}
          />

          <div className="ss-wrap" style={{ paddingBlock: 'clamp(28px, 4vw, 56px)' }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', color: 'var(--ss-brass-on-dark, #e6c98a)' }}>
              شهرشهر · شهروند سبز · با همکاری شهرداری‌ها
            </p>

            <h1
              className="ss-display"
              style={{ margin: '14px 0 0', color: '#fff', maxWidth: '18ch', textWrap: 'balance' as any }}
            >
              خدمات شهرِ شما،
              <br />
              همین‌جا.
            </h1>

            <p style={{ margin: '16px 0 0', fontSize: S.base, color: 'rgba(255,255,255,.82)', lineHeight: 2, maxWidth: '40ch' }}>
              رزرو سالن، گزارش مشکل شهری، قیمت روز پسماند — بیشترشان بدون ثبت‌نام.
            </p>

            <div style={{ display: 'flex', gap: S.s3, flexWrap: 'wrap', marginTop: S.s5 }}>
              <a href="#services" className="ss-cta-primary">
                خدمات شهرم را ببین
              </a>
              <Link href={signedIn ? '/' : '/login'} className="ss-cta-ghost">
                {signedIn ? 'ورود به برنامه' : 'ورود شهروندان'}
              </Link>
            </div>

            {cityNames.length > 0 && (
              <p style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', margin: `${S.s5}px 0 0`, fontSize: S.sm, color: 'rgba(255,255,255,.72)' }}>
                <MapPin className="h-4 w-4" style={{ color: '#7fd4ab' }} aria-hidden />
                فعال در
                <strong style={{ color: '#fff', fontWeight: 800 }}>{cityNames.join('، ')}</strong>
              </p>
            )}
          </div>
        </section>

        {/* The question the site exists to answer, asked before anything else
            is explained. */}
        <div id="services" style={{ scrollMarginTop: 80 }}>
          <ServiceGrid cities={cities} catalogue={catalogue} />
        </div>

        {/* The city console used to live here and is gone: it answered the
            same question the grid above now answers — «کدام خدمت در شهر من
            هست» — in a denser, less pressable form, and keeping both made the
            phone page longer than the one this redesign set out to shorten.
            Its per-venue detail belongs on the city's own page, which is where
            a visitor who wants that depth is already headed. */}

        {/* ── نرخ امروز ──
            The board is the waste service's own proof, so it now stands with
            that service rather than in front of every other one. It is still
            high on the page and still server-rendered: «قیمت روز ضایعات» is the
            query this site wins, and it is answered above the fold on a laptop
            and one flick down on a phone. */}
        <section style={{ background: C.surface, borderBlock: `1px solid ${C.border}` }}>
          <div
            className="ss-wrap"
            style={{
              paddingBlock: 'clamp(30px, 4vw, 60px)',
              display: 'grid', gap: 'clamp(22px, 3.4vw, 44px)', alignItems: 'center',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            }}
          >
            <div>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', color: 'var(--ss-brass-ink)' }}>
                خدمت فعال · جمع‌آوری پسماند
              </p>
              <h2 className="ss-display" style={{ margin: '12px 0 0', fontSize: 'var(--ss-h2)', color: C.textStrong }}>
                نرخ امروزِ پسماند خشک
              </h2>
              <p style={{ margin: '14px 0 0', fontSize: S.sm, color: C.muted, lineHeight: 2.1, maxWidth: '44ch' }}>
                قیمت‌ها را شهرداری هر شهر خودش ثبت می‌کند. بار در خانهٔ شما و جلوی خودتان توزین
                می‌شود و مبلغش همان لحظه به کیف پولتان می‌نشیند.
              </p>

              <div style={{ display: 'flex', gap: S.s3, flexWrap: 'wrap', marginTop: S.s4 }}>
                <Link
                  href={signedIn ? '/new-request' : '/login'}
                  className="ss-cta"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: S.s2, textDecoration: 'none',
                    padding: '14px 24px', borderRadius: 16,
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
                    padding: '14px 22px', borderRadius: 16,
                    background: C.bgSubtle, color: C.textStrong,
                    border: `1px solid ${C.border}`, fontSize: S.base, fontWeight: 800,
                  }}
                >
                  چطور کار می‌کند؟
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </div>

            <RateBoard cities={board} />
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

        {/* ── خدمت فعال: پسماند، در یک نوار ──
            This was two full sections — four numbered steps and six waste
            categories — and together they were the better part of two screens
            about *one* service, on a page five services now share. Both already
            have pages of their own (`/guide`, `/waste-types`, `/tariff`) which
            say the same things with more room; the front page's job is to say
            the service exists, what it gives you, and where to read it
            properly. A visitor who came to book a hall no longer scrolls
            through a tutorial on sorting rubbish to reach the map. */}
        <section className="ss-wrap" style={{ paddingBlock: 'clamp(36px, 5vw, 72px)' }}>
          <div
            className="ss-card"
            style={{
              padding: 'clamp(20px, 3vw, 34px)',
              display: 'grid', gap: 'clamp(18px, 2.6vw, 32px)',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
              alignItems: 'center',
            }}
          >
            <div>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 800, letterSpacing: '0.06em', color: 'var(--ss-brass-ink)' }}>
                خدمت فعال · جمع‌آوری پسماند
              </p>
              <h2 className="ss-display" style={{ margin: '10px 0 0', fontSize: 'var(--ss-h2)', color: C.textStrong }}>
                از درخواست تا پول، در یک بعدازظهر
              </h2>
              <p style={{ margin: '12px 0 0', fontSize: S.sm, color: C.muted, lineHeight: 2.1, maxWidth: '46ch' }}>
                درخواست می‌دهید، جمع‌آور به درِ خانه می‌آید، بار جلوی خودتان توزین می‌شود و مبلغش همان
                لحظه به کیف پولتان می‌نشیند.
              </p>

              <div style={{ display: 'flex', gap: S.s2, flexWrap: 'wrap', marginTop: S.s4 }}>
                {[
                  { href: '/guide', label: 'چطور کار می‌کند' },
                  { href: '/waste-types', label: 'چه چیزی تحویل بدهم' },
                  { href: '/tariff', label: 'قیمت روز' },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none',
                      padding: '10px 16px', borderRadius: 999,
                      background: C.bgSubtle, border: `1px solid ${C.border}`,
                      color: C.textStrong, fontSize: 12.5, fontWeight: 800,
                    }}
                  >
                    {item.label}
                    <ArrowLeft className="h-3.5 w-3.5" style={{ color: C.green }} aria-hidden />
                  </Link>
                ))}
              </div>
            </div>

            {/* The four steps as one compact column rather than four cards:
                the same sequence, a fifth of the height. */}
            <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 10 }}>
              {STEPS.map((step) => (
                <li key={step.n} style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
                  <span
                    className="ss-fig"
                    style={{
                      flexShrink: 0, width: 26, height: 26, borderRadius: '50%', display: 'grid', placeItems: 'center',
                      background: alpha(C.green, 12), color: C.green, fontSize: 12, fontWeight: 800,
                      border: `1px solid ${alpha(C.green, 24)}`,
                    }}
                  >
                    {step.n}
                  </span>
                  <span style={{ minWidth: 0, fontSize: 13, color: C.text, lineHeight: 1.9, fontWeight: 700 }}>
                    {step.title}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── coverage ──
            This was a 865px panel: a map of Iran, a stats pair and a list of
            every city linking to its price page. All true, and none of it
            something a citizen does — they already know which city they are
            in, and they chose it two sections ago. It is now one line of fact
            and a link, which is the part that was load-bearing: proof the
            platform is real in more than one place. */}
        {cities.length > 0 && (
          <section className="ss-wrap" style={{ paddingBottom: 'clamp(36px, 5vw, 72px)' }}>
            <div className="ss-coverage">
              <span className="ss-coverage-dot" aria-hidden />
              <p style={{ margin: 0, fontSize: S.sm, color: C.text, lineHeight: 2 }}>
                امروز در{' '}
                <strong style={{ color: C.textStrong, fontWeight: 800 }}>{liveNames}</strong>{' '}
                فعال است.
                <span style={{ color: C.muted }}>
                  {' '}شهرداری هر شهر تازه با پنل و تعرفهٔ خودش اضافه می‌شود.
                </span>
              </p>
              <Link href="/tariff" className="ss-coverage-link">
                قیمت هر شهر
              </Link>
            </div>
          </section>
        )}

        {/* ── the questions people actually ask ── */}
        <section style={{ background: C.surface, borderTop: `1px solid ${C.border}` }}>
          <div className="ss-wrap" style={{ paddingBlock: 'clamp(44px, 6vw, 88px)' }}>
            <SectionHead
              eyebrow="پرسش‌های پرتکرار"
              title="قبل از اینکه شروع کنید"
              sub="سه پرسش اول دربارهٔ خودِ سامانه است — همان چیزهایی که کسی برای نخستین‌بار می‌پرسد."
            />

            <div style={{ display: 'grid', gap: S.s2, maxWidth: '76ch' }}>
              {HOME_FAQS.map((faq) => (
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

        {/* ── last word ──
            «از پسماند شروع کنید» was the closing line on a page five services
            share, addressed to somebody who may have come for a swimming
            session. One account opens all of them, which is the thing actually
            worth saying at the end. */}
        <section className="ss-wrap" style={{ paddingBlock: 'clamp(44px, 6vw, 80px)', textAlign: 'center' }}>
          <h2 className="ss-display" style={{ margin: 0, fontSize: 'var(--ss-h2)', color: C.textStrong }}>
            یک حساب، برای همهٔ خدمات شهرتان.
          </h2>
          <p style={{ margin: '14px auto 0', fontSize: S.sm, color: C.muted, lineHeight: 2.1, maxWidth: '48ch' }}>
            دیدن قیمت‌ها، اماکن و سانس‌ها ثبت‌نام نمی‌خواهد. برای رزرو، ثبت درخواست یا پیگیری نامه
            یک‌بار با شمارهٔ موبایل وارد می‌شوید — کمتر از یک دقیقه — و هر خدمتی که شهرتان بعد
            از این اضافه کند، با همین حساب در دسترستان است.
          </p>
          <Link
            href={signedIn ? '/' : '/login'}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: S.s2, textDecoration: 'none', marginTop: S.s5,
              padding: '16px 30px', borderRadius: 16,
              background: C.green, color: C.onAccent, fontSize: S.base, fontWeight: 800,
              boxShadow: `0 12px 26px ${alpha(C.green, 30)}`,
            }}
          >
            <LogIn className="h-4 w-4" aria-hidden />
            {signedIn ? 'ورود به برنامه' : 'ورود شهروندان'}
          </Link>
        </section>

        {/* The «برای شهرداری‌ها» pitch used to sit here and is gone.
            It was 743px of a citizen's page addressed to somebody else — a
            municipality deciding whether to buy the platform — and the site
            already has a page for that audience at /report, linked from the
            footer as «معرفی سامانه». One line is enough here. */}
        <section className="ss-wrap" style={{ paddingBottom: 'clamp(36px, 5vw, 72px)' }}>
          <p style={{ margin: 0, fontSize: S.sm, color: C.muted, textAlign: 'center', lineHeight: 2 }}>
            شهرداری هستید و می‌خواهید شهرتان روی شهرشهر بیاید؟{' '}
            <Link href="/report" style={{ color: C.green, fontWeight: 800, textDecoration: 'none' }}>
              معرفی سامانه و مدل همکاری
            </Link>
          </p>
        </section>

      </main>

      <PublicFooter signedIn={signedIn} />
    </div>
  );
}
