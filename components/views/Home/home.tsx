'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import {
  Banknote,
  MapPinned,
  HelpCircle,
  Phone,
  Trash2,
  ChevronLeft,
  PackagePlus,
  Megaphone,
} from 'lucide-react';
import { Navigation } from '@/components/views/navigation';
import { TopMenu } from '@/components/views/top-menu';
import { useAuth } from '@/context/auth-context';
import { useCity } from '@/context/data-context';
import { axiosService } from '@/lib/axiosService';
import { C, S, alpha, fa, serviceColor } from '@/components/ui/tokens';
import { Screen, Plaque, Card, Code, SectionTitle, Shimmer } from '@/components/ui/kit';
import { serviceIcon, useCityServices } from '@/lib/cityServices';
import PageSkeleton from '@/components/views/page-skeleton';

/**
 * Home — «تابلوی شهر».
 *
 * The old home opened on a green slab that said «سلام» and then offered eight
 * equal pastel tiles. It answered a question nobody asks. A citizen opens this
 * app for one of two reasons: something of theirs is in progress and they want
 * to know where it is, or they have an errand to start. So the screen is, in
 * order:
 *
 *   1. the plaque — which city this is, and the municipality's own notice
 *   2. «کارهای باز شما» — everything in flight, whichever service it belongs to
 *   3. the city's services, as a directory rather than a tile grid
 *   4. today's waste prices, because that is the number people come back for
 *
 * Nothing rotates and nothing is decorative: the three gradient banners that
 * used to cycle here said nothing the rest of the screen did not.
 */

interface OpenItem {
  kind: 'waste' | 'booking' | 'report' | 'letter';
  service: string;
  title: string;
  sub: string;
  code?: string;
  label: string;
  tone: string;
  say: string;
  open: boolean;
  href: string;
}

/** The same hue each service wears everywhere else — see tokens.ts. */
const KIND_COLOR: Record<string, string> = {
  waste: 'var(--sh-waste)',
  booking: 'var(--sh-venues)',
  report: 'var(--sh-reports)',
  letter: 'var(--sh-cartable)',
};

interface Price {
  _id: string;
  title: string;
  pricePerUnit: number;
  change: number;
  city?: string;
}

const TONE: Record<string, string> = {
  wait: 'var(--pm-status-warn)',
  work: 'var(--pm-status-info)',
  done: 'var(--pm-status-ok)',
  stop: 'var(--pm-status-neutral)',
};

/** The four steps of a first request — shown only to somebody with nothing open. */
const FIRST_TIME = [
  { title: 'پسماند را جدا کنید', detail: 'کاغذ، پلاستیک، فلز — خشک و تمیز' },
  { title: 'درخواست بدهید', detail: 'محل و ساعت را خودتان انتخاب می‌کنید' },
  { title: 'در محل توزین می‌شود', detail: 'جمع‌آور با ترازو می‌آید' },
  { title: 'پول به کیف پول می‌نشیند', detail: 'برداشت به حساب خودتان' },
];

/**
 * If `/api/v1/services` never answers — a restarting API, a phone that lost the
 * network — the list still has to be a list. Waste is the one module every city
 * on this platform runs, so it is the honest floor.
 */
const FALLBACK_MODULES = [
  {
    key: 'waste',
    title: 'جمع‌آوری پسماند خشک',
    short: 'خرید پسماند خشک از درِ خانه',
    icon: 'Recycle',
    color: 'var(--sh-waste)',
    href: '/new-request',
  },
];

const EXTRAS = [
  { href: '/tariff', title: 'تعرفهٔ قیمت‌ها', icon: <Banknote className="h-4 w-4" /> },
  { href: '/waste-types', title: 'انواع پسماند', icon: <Trash2 className="h-4 w-4" /> },
  { href: '/addresses', title: 'نشانی‌های من', icon: <MapPinned className="h-4 w-4" /> },
  { href: '/guide', title: 'راهنما', icon: <HelpCircle className="h-4 w-4" /> },
  { href: '/contact-us', title: 'پشتیبانی', icon: <Phone className="h-4 w-4" /> },
];

export default function HomeView() {
  const {
    services: cityModules,
    city: serviceCity,
    loading: modulesLoading,
    failed: modulesFailed,
    retry: retryModules,
  } = useCityServices();

  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState<OpenItem[] | null>(null);
  const [prices, setPrices] = useState<Price[]>([]);
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

  /** What of this citizen's is still open, across every service they use. */
  useEffect(() => {
    const token = Cookies.get('auth_token');
    if (!token) { setOpen([]); return; }

    axiosService({ url: '/api/v1/activity', method: 'get', token })
      // `open` is the API's own answer to «هنوز در جریان است؟»; the screen does
      // not re-decide it from a status string it would have to keep in step.
      .then((res: any) => setOpen((res?.data?.items || []).filter((i: any) => i?.open).slice(0, 3)))
      .catch(() => setOpen([]));
  }, []);

  /** Today's prices — the number people open this app to check. */
  useEffect(() => {
    axiosService({ url: '/api/v1/recyclableMaterials', method: 'get' })
      .then((res: any) => setPrices(Array.isArray(res?.data) ? res.data : []))
      .catch(() => setPrices([]));
  }, []);

  // Returning null here used to blank the whole screen for the frame between
  // paint and hydration — on every single visit to the app's home. The guard is
  // still needed (what follows reads the browser's own state), but it can hand
  // back the same skeleton the rest of the app uses instead of nothing.
  if (!mounted) return <PageSkeleton />;

  const cityName = selectedCity?.name || serviceCity?.name || '';
  const cityId = (selectedCity as any)?._id || (serviceCity as any)?._id;
  const announcement = (selectedCity as any)?.settings?.announcement || (selectedCity as any)?.announcement || '';
  const modules = cityModules.length ? cityModules : FALLBACK_MODULES;

  const cityPrices = prices
    .filter((p) => (cityId ? p.city === cityId : true) && Number(p.pricePerUnit) > 0)
    .sort((a, b) => b.pricePerUnit - a.pricePerUnit)
    .slice(0, 4);

  return (
    <>
      <TopMenu />
      <Screen>
        <Plaque
          large
          city={cityName || 'شهر شما'}
          section="شهرداری"
          note={
            cityName
              ? 'خدمات شهرداری، از همین‌جا — درخواست بدهید، پیگیری کنید، و بدانید هر کار کجاست.'
              : 'برای دیدن خدمات، شهرتان را انتخاب کنید.'
          }
          onClick={() => {
            // The plaque is the city switcher, because changing the city here
            // really does re-scope everything below it. The picker itself lives
            // in TopMenu — one dialog, opened from wherever the city is named.
            window.dispatchEvent(new CustomEvent('shahrshahr:city-picker'));
          }}
        />

        {/* ── the municipality's own notice ──
            Written by an operator for the people of this city, so it sits
            above anything the platform has to say. */}
        {announcement && (
          <Card style={{ marginBottom: S.s4 }} accent={C.brass}>
            <div style={{ padding: S.s4, display: 'flex', gap: S.s3, alignItems: 'flex-start' }}>
              <Megaphone className="h-5 w-5" style={{ color: C.brass, flexShrink: 0, marginTop: 2 }} />
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: S.xs, fontWeight: 700, color: C.brass }}>
                  اطلاعیهٔ شهرداری{cityName ? ` ${cityName}` : ''}
                </p>
                <p style={{ margin: '5px 0 0', fontSize: S.sm, lineHeight: 1.9, color: C.text }}>{announcement}</p>
              </div>
            </div>
          </Card>
        )}

        {/* ── کارهای باز ── */}
        {open === null ? (
          <Shimmer height={92} />
        ) : open.length > 0 ? (
          <>
            <SectionTitle
              title="کارهای باز شما"
              action={
                <Link href="/activity" style={{ fontSize: S.xs, fontWeight: 700, color: C.enamelInk, textDecoration: 'none' }}>
                  همه
                </Link>
              }
            />
            <div style={{ display: 'grid', gap: S.s2 }}>
              {open.map((item, i) => (
                <Link key={`${item.href}-${i}`} href={item.href} style={{ textDecoration: 'none' }}>
                  <Card interactive className="sh-rise" style={{ ['--i' as any]: i }}>
                    <div style={{ padding: S.s4, display: 'flex', alignItems: 'center', gap: S.s3 }}>
                      <span
                        aria-hidden
                        style={{
                          width: 3, alignSelf: 'stretch', minHeight: 44, borderRadius: 2,
                          background: KIND_COLOR[item.kind] || C.enamel, flexShrink: 0,
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: S.xs, fontWeight: 600, color: KIND_COLOR[item.kind] || C.muted }}>
                          {item.service}
                        </p>
                        <p style={{ margin: '3px 0 0', fontSize: S.base, fontWeight: 700, color: C.textStrong }}>{item.title}</p>
                        <p style={{ margin: '4px 0 0', fontSize: S.xs, color: C.muted, lineHeight: 1.8 }}>
                          {item.say}{item.sub ? ` — ${item.sub}` : ''}
                        </p>
                        <span style={{ display: 'inline-flex', gap: 6, marginTop: S.s2, alignItems: 'center', flexWrap: 'wrap' }}>
                          {item.code && <Code>{item.code}</Code>}
                          <span style={{ fontSize: S.xs, fontWeight: 700, color: TONE[item.tone] || C.muted }}>
                            {item.label}
                          </span>
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        ) : (
          /* Nothing open is not an empty state to apologise for — it is the
             moment to explain how the thing works. */
          <>
            <SectionTitle title="چطور کار می‌کند" tone={C.brass} />
            <Card>
              <ol style={{ listStyle: 'none', margin: 0, padding: S.s4, display: 'grid', gap: S.s3 }}>
                {FIRST_TIME.map((step, i) => (
                  <li key={step.title} style={{ display: 'flex', gap: S.s3, alignItems: 'flex-start' }}>
                    <span
                      className="tnum"
                      aria-hidden
                      style={{
                        width: 26, height: 26, flexShrink: 0, borderRadius: S.r1,
                        display: 'grid', placeItems: 'center',
                        border: `1px solid ${alpha(C.brass, 40)}`, color: C.brass,
                        fontSize: S.xs, fontWeight: 700,
                      }}
                    >
                      {fa(i + 1)}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: S.sm, fontWeight: 700, color: C.textStrong }}>{step.title}</p>
                      <p style={{ margin: '3px 0 0', fontSize: S.xs, color: C.muted, lineHeight: 1.8 }}>{step.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Card>
          </>
        )}

        {/* ── the city's services, as a directory ──
            A board in a town hall lists its departments in a column, each with
            its own marker; it does not lay them out as eight equal squares.
            The list also lets each service say what it is in a full sentence,
            which a 150px tile could not. */}
        <SectionTitle
          title={cityName ? `خدمات شهر ${cityName}` : 'خدمات شهر شما'}
          action={
            !modulesLoading && cityModules.length > 0 ? (
              <span className="tnum" style={{ fontSize: S.xs, color: C.muted, fontWeight: 600 }}>
                <bdi>{fa(cityModules.length)}</bdi> خدمت فعال
              </span>
            ) : undefined
          }
        />

        {modulesLoading ? (
          <Shimmer height={220} />
        ) : (
          <Card>
            <div role="list">
              {modules.map((service: any, i: number) => {
                const Icon = serviceIcon(service.icon);
                const tone = serviceColor(service.key);
                return (
                  <Link
                    key={service.key}
                    href={service.href}
                    role="listitem"
                    className="sh-rise"
                    style={{
                      ['--i' as any]: i,
                      display: 'flex', alignItems: 'center', gap: S.s3,
                      padding: `${S.s4}px`, textDecoration: 'none', color: 'inherit',
                      borderTop: i ? `1px solid ${C.border}` : 'none',
                    }}
                  >
                    <span
                      style={{
                        width: 40, height: 40, flexShrink: 0, borderRadius: S.r1,
                        display: 'grid', placeItems: 'center',
                        background: alpha(tone, 10), border: `1px solid ${alpha(tone, 26)}`, color: tone,
                      }}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: S.base, fontWeight: 700, color: C.textStrong }}>{service.title}</p>
                      <p style={{ margin: '3px 0 0', fontSize: S.xs, color: C.muted, lineHeight: 1.8 }}>{service.short}</p>
                    </div>
                    <ChevronLeft className="h-4 w-4" style={{ color: C.subtle, flexShrink: 0 }} aria-hidden />
                  </Link>
                );
              })}
            </div>
          </Card>
        )}

        {/* The services list is the only route to ۱۳۷، کارتابل، اماکن and
            درگذشتگان, so a failed lookup has to say so rather than quietly
            fall back to the waste row and look like a city that runs one
            service. */}
        {!modulesLoading && modulesFailed && (
          <Card style={{ marginTop: S.s3 }} accent={C.statusWarn}>
            <div style={{ padding: S.s4, display: 'flex', alignItems: 'center', gap: S.s3, flexWrap: 'wrap' }}>
              <p style={{ margin: 0, flex: 1, minWidth: '18ch', fontSize: S.xs, color: C.text, lineHeight: 1.9 }}>
                فهرست خدمات شهر شما بارگذاری نشد؛ ممکن است خدمات دیگری هم فعال باشد.
              </p>
              <button
                type="button"
                onClick={retryModules}
                style={{
                  minHeight: 40, padding: '9px 16px', borderRadius: S.r1, cursor: 'pointer',
                  background: 'transparent', border: `1px solid ${C.borderStrong}`,
                  color: C.text, fontFamily: 'inherit', fontSize: S.xs, fontWeight: 700,
                }}
              >
                تلاش دوباره
              </button>
            </div>
          </Card>
        )}

        {/* ── نرخ امروز ──
            The rate a scrap yard chalks on the wall. Brass, tabular, and read
            down a column; the arrow is a triangle rather than an arrow glyph,
            which is not mirrored in RTL and would point the wrong way. */}
        {cityPrices.length > 0 && (
          <>
            <SectionTitle
              title="نرخ امروزِ پسماند خشک"
              tone={C.brass}
              action={
                <Link href="/tariff" style={{ fontSize: S.xs, fontWeight: 700, color: C.enamelInk, textDecoration: 'none' }}>
                  همهٔ قیمت‌ها
                </Link>
              }
            />
            <Card accent={C.brass}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <caption className="pm-sr-only">قیمت خرید هر کیلوگرم پسماند خشک{cityName ? ` در ${cityName}` : ''}</caption>
                <tbody>
                  {cityPrices.map((p, i) => (
                    <tr key={p._id} style={{ borderTop: i ? `1px solid ${C.border}` : 'none' }}>
                      <th
                        scope="row"
                        style={{
                          textAlign: 'start', fontWeight: 600, fontSize: S.sm, color: C.text,
                          padding: `${S.s3}px ${S.s4}px`,
                        }}
                      >
                        {p.title}
                      </th>
                      <td className="tnum" style={{ textAlign: 'end', padding: `${S.s3}px ${S.s4}px`, whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: S.md, fontWeight: 700, color: C.brass }}>{fa(p.pricePerUnit)}</span>
                        <span style={{ fontSize: S.xs, color: C.muted, marginInlineStart: 5 }}>تومان / کیلو</span>
                        {Number.isFinite(Number(p.change)) && Number(p.change) !== 0 && (
                          <span
                            style={{
                              marginInlineStart: 8, fontSize: S.xs, fontWeight: 700,
                              color: Number(p.change) > 0 ? C.statusOk : C.statusDanger,
                            }}
                          >
                            <span aria-hidden>{Number(p.change) > 0 ? '▲' : '▼'}</span>
                            <span className="pm-sr-only">{Number(p.change) > 0 ? 'افزایش' : 'کاهش'} </span>
                            <bdi>{fa(Math.abs(Number(p.change)))}٪</bdi>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </>
        )}

        {/* The errand most people came for. A link, not a <Btn>: a button
            inside an anchor is invalid markup and costs keyboard users a
            second focus stop for one action. */}
        <Link
          href="/new-request"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: S.s2,
            marginTop: S.s6, minHeight: 52, padding: '14px 20px', borderRadius: S.r2,
            background: C.enamel, color: C.onHero, textDecoration: 'none',
            fontSize: S.base, fontWeight: 700,
          }}
        >
          <PackagePlus className="h-4 w-4" aria-hidden />
          ثبت درخواست جمع‌آوری
        </Link>

        {/* ── reference and account ── */}
        <div style={{ display: 'flex', gap: S.s2, flexWrap: 'wrap', marginTop: S.s4 }}>
          {EXTRAS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7, textDecoration: 'none',
                minHeight: 40, padding: '10px 14px', borderRadius: S.r1,
                background: C.surface, border: `1px solid ${C.border}`,
                color: C.text, fontSize: S.xs, fontWeight: 600,
              }}
            >
              <span style={{ color: C.muted, display: 'inline-flex' }} aria-hidden>{item.icon}</span>
              {item.title}
            </Link>
          ))}
        </div>

        {/* Who this citizen is, said once, at the bottom where a signature
            belongs rather than as a greeting at the top. */}
        {(user as any)?.phoneNumber && (
          <p style={{ margin: `${S.s5}px 0 0`, fontSize: S.xs, color: C.subtle, textAlign: 'center' }}>
            <span style={{ marginInlineEnd: 6 }}>حساب شما</span>
            <Code tone={C.subtle}>{(user as any).phoneNumber}</Code>
          </p>
        )}
      </Screen>
      <Navigation />
    </>
  );
}
