'use client';

import Link from 'next/link';
import {
  ArrowLeft, Building2, CalendarCheck, Check, FileText, Flower2, Megaphone, Recycle,
  Ticket, type LucideIcon,
} from 'lucide-react';

import { C, S, alpha, fa } from '@/components/ui/tokens';
import type { PublicCity, PublicService } from '@/lib/publicData';
import type { CityVenues } from '@/lib/publicVenues';
import { serviceEntry } from '@/lib/publicRoutes';
import { Crumbs, groupColor, groupIcon, priceLabel } from './venue-bits';

/**
 * صفحهٔ یک شهر — «شهرداری نهاوند چه کارهایی را آنلاین انجام می‌دهد؟»
 *
 * One address per municipality, and the answer to the question people actually
 * type. Until now that answer only existed as a tab on the front page: it could
 * not be linked to, sent to somebody, printed on a poster in the شهرداری, or
 * indexed as «خدمات شهرداری نهاوند» — which is the search a citizen of نهاوند
 * runs, not «شهرشهر».
 *
 * Everything on it is that city's own: its services, its اماکن, its prices, its
 * announcement. Nothing about the platform, which has its own page.
 */

const ICONS: Record<string, LucideIcon> = {
  Recycle, Megaphone, FileText, CalendarCheck, Flower2, Building2,
};

export default function CityHub({
  city,
  catalogue,
  venues,
  materialCount,
}: {
  city: PublicCity;
  catalogue: PublicService[];
  /** The city's اماکن, when it runs the module — `null` when it does not. */
  venues: CityVenues | null;
  materialCount: number;
}) {
  const slug = city.slug || city._id;
  const active = catalogue.filter((s) => city.services.includes(s.key));
  /**
   * The services this city runs, first — and within those, the ones a visitor
   * can use right now before the ones that begin with a login. What the
   * municipality has *not* switched on stays listed and greyed, because that is
   * worth knowing too: it is what a citizen takes to their شهرداری.
   */
  const rank = (service: PublicService) => {
    if (!city.services.includes(service.key)) return 2;
    return serviceEntry(service, city).access === 'login' ? 1 : 0;
  };
  const ordered = [...catalogue].sort((a, b) => rank(a) - rank(b));

  return (
    <main className="ss-wrap" style={{ paddingBlock: 'clamp(20px, 3vw, 40px)' }}>
      <Crumbs trail={[{ href: '/', label: 'شهرشهر' }, { label: city.name }]} />

      <header style={{ marginTop: S.s4, maxWidth: '60ch' }}>
        <h1 className="ss-display" style={{ margin: 0, fontSize: 'var(--ss-h2)', color: C.textStrong }}>
          خدمات شهرداری {city.name}
        </h1>
        <p style={{ margin: '12px 0 0', fontSize: S.sm, color: C.muted, lineHeight: 2.1 }}>
          {active.length > 0 ? (
            <>
              شهرداری {city.name} امروز{' '}
              <strong className="ss-fig" style={{ color: C.green, fontWeight: 800 }}>{fa(active.length)}</strong>{' '}
              خدمت را روی شهرشهر ارائه می‌کند. سانس‌ها، قیمت‌ها و اطلاعات اماکن را بدون ثبت‌نام
              می‌بینید؛ برای رزرو و ثبت درخواست یک‌بار وارد می‌شوید.
            </>
          ) : (
            <>شهرداری {city.name} هنوز خدمتی را روی شهرشهر فعال نکرده است.</>
          )}
        </p>
      </header>

      {/* آنچه شهرداری نوشته است — its own words, above anything the platform says. */}
      {city.announcement && (
        <p
          style={{
            margin: `${S.s4}px 0 0`, padding: `${S.s3}px ${S.s4}px`, borderRadius: 14,
            background: alpha(C.amber, 8), border: `1px solid ${alpha(C.amber, 26)}`,
            fontSize: 13, color: C.text, lineHeight: 2.1,
          }}
        >
          {city.announcement}
        </p>
      )}

      {/* ── خدمات ── */}
      <div
        style={{
          display: 'grid', gap: S.s3, marginTop: S.s5,
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 262px), 1fr))',
        }}
      >
        {ordered.map((service) => {
          const on = city.services.includes(service.key);
          const Icon = ICONS[service.icon] || Building2;
          const entry = serviceEntry(service, city);

          const body = (
            <>
              <span
                aria-hidden
                style={{
                  display: 'block', height: 3, borderRadius: 3, width: on ? 34 : 18,
                  background: on ? service.color : C.border,
                }}
              />
              <span style={{ display: 'flex', alignItems: 'center', gap: 11, marginTop: S.s3 }}>
                <span
                  style={{
                    width: 42, height: 42, borderRadius: 14, display: 'grid', placeItems: 'center', flexShrink: 0,
                    background: on ? alpha(service.color, 12) : alpha(C.subtle, 10),
                    color: on ? service.color : C.subtle,
                    border: `1px solid ${on ? alpha(service.color, 26) : C.border}`,
                  }}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 15, fontWeight: 800, color: on ? C.textStrong : C.muted }}>
                    {service.title}
                  </span>
                  <span style={{ display: 'block', marginTop: 3, fontSize: 12, color: C.muted }}>{service.short}</span>
                </span>
              </span>

              <span style={{ display: 'block', marginTop: S.s3, fontSize: 12.5, color: C.muted, lineHeight: 2 }}>
                {service.description}
              </span>

              <span
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: S.s2,
                  marginTop: S.s3, paddingTop: S.s3, borderTop: `1px solid ${C.border}`,
                }}
              >
                {on ? (
                  <>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, fontWeight: 800, color: C.green }}>
                      {entry.action}
                      <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                    </span>
                    <span
                      style={{
                        fontSize: 10.5, fontWeight: 800, whiteSpace: 'nowrap',
                        color: entry.access === 'open' ? C.green : entry.access === 'browse' ? C.amber : C.subtle,
                      }}
                    >
                      {entry.note}
                    </span>
                  </>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 800, color: C.subtle }}>
                    در {city.name} فعال نیست
                  </span>
                )}
              </span>
            </>
          );

          const shell = { padding: S.s4, opacity: on ? 1 : 0.75, borderStyle: on ? 'solid' : 'dashed' } as const;

          return on ? (
            <Link key={service.key} href={entry.href} className="ss-card ss-link-card" style={shell}>
              {body}
            </Link>
          ) : (
            <div key={service.key} className="ss-card" style={shell}>
              {body}
            </div>
          );
        })}
      </div>

      {/* ── اماکن این شهر، همین‌جا ──
          A link to اماکن is a promise; six of the city's actual halls with the
          day they next open is the service. */}
      {!!venues?.venues?.length && (
        <section style={{ marginTop: 'clamp(30px, 4vw, 56px)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: S.s3, flexWrap: 'wrap' }}>
            <h2 className="ss-display" style={{ margin: 0, fontSize: 'var(--ss-h2)', color: C.textStrong }}>
              اماکن قابل رزرو
            </h2>
            <Link href={`/city/${slug}/venues`} style={{ marginInlineStart: 'auto', fontSize: 13, fontWeight: 800, color: C.green, textDecoration: 'none' }}>
              همهٔ {fa(venues.venues.length)} مکان ←
            </Link>
          </div>

          <div
            style={{
              display: 'grid', gap: S.s3, marginTop: S.s4,
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
            }}
          >
            {venues.venues.slice(0, 6).map((venue) => {
              const Icon = groupIcon(venues.catalogue, venue.group);
              const tone = groupColor(venues.catalogue, venue.group);

              return (
                <Link
                  key={venue._id}
                  href={`/city/${slug}/venues/${venue._id}`}
                  className="ss-card ss-link-card"
                  style={{ padding: S.s4 }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span
                      style={{
                        width: 38, height: 38, borderRadius: 12, display: 'grid', placeItems: 'center', flexShrink: 0,
                        background: alpha(tone, 12), color: tone, border: `1px solid ${alpha(tone, 26)}`,
                      }}
                    >
                      <Icon className="h-[18px] w-[18px]" aria-hidden />
                    </span>
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: 14.5, fontWeight: 800, color: C.textStrong }}>{venue.title}</span>
                      <span style={{ display: 'block', marginTop: 2, fontSize: 11.5, color: C.muted }}>{venue.kindTitle}</span>
                    </span>
                  </span>

                  <span
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: S.s2,
                      marginTop: S.s3, paddingTop: S.s3, borderTop: `1px solid ${C.border}`,
                    }}
                  >
                    <span className="ss-fig" style={{ fontSize: 12.5, fontWeight: 800, color: C.textStrong }}>
                      {priceLabel(venue)}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 800, color: venue.nextOpen ? C.green : C.subtle }}>
                      <Ticket className="h-3.5 w-3.5" aria-hidden />
                      {venue.nextOpen
                        ? venue.nextOpen.ahead === 0 ? 'امروز باز' : venue.nextOpen.ahead === 1 ? 'فردا باز' : venue.nextOpen.say
                        : 'بدون برنامه'}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── قیمت روز، اگر ثبت شده باشد ── */}
      {materialCount > 0 && (
        <section
          className="ss-card"
          style={{
            marginTop: 'clamp(26px, 3.4vw, 44px)', padding: S.s5,
            display: 'flex', alignItems: 'center', gap: S.s4, flexWrap: 'wrap',
          }}
        >
          <span style={{ flex: 1, minWidth: 220 }}>
            <span style={{ display: 'block', fontSize: 15, fontWeight: 800, color: C.textStrong }}>
              قیمت روز خرید پسماند در {city.name}
            </span>
            <span style={{ display: 'block', marginTop: 6, fontSize: 12.5, color: C.muted, lineHeight: 2 }}>
              <span className="ss-fig" style={{ fontWeight: 800, color: C.textStrong }}>{fa(materialCount)}</span> قلم،
              با نرخی که شهرداری {city.name} خودش ثبت کرده است.
            </span>
          </span>
          <Link
            href={`/tariff/${slug}`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7, textDecoration: 'none',
              padding: '12px 22px', borderRadius: 14,
              background: C.green, color: C.onAccent, fontSize: 13, fontWeight: 800,
            }}
          >
            <Check className="h-4 w-4" aria-hidden />
            دیدن تعرفه
          </Link>
        </section>
      )}
    </main>
  );
}
