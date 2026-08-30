'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Building2, CalendarCheck, FileText, Flower2, LogIn, MapPin, Megaphone,
  Recycle, Ticket, type LucideIcon,
} from 'lucide-react';

import { C, S, alpha, fa } from '@/components/ui/tokens';
import type { PublicCity, PublicService } from '@/lib/publicData';
import type { CityHighlights } from '@/lib/publicVenues';
import { faTime } from '@/lib/publicVenues';
import { cityHref, serviceEntry } from '@/lib/publicRoutes';

/**
 * کنسول شهر — the front page's first screen, and the only one that matters.
 *
 * What it replaced: a services section four screens down the page, which
 * described five modules and sent all five to the same login form. Somebody who
 * arrived wanting to book the pool on Thursday had to scroll past a price
 * board, four steps, six waste categories and a platform pitch to learn that
 * their city runs رزرو اماکن at all — and then meet a login form that told them
 * nothing about Thursday.
 *
 * So the page now opens on the answer: **your city, its services, and the next
 * free session it actually has**. Three deliberate consequences:
 *
 *  - The city is chosen here and remembered in `selectedCity`, which is the
 *    same key the app and the login screen read. Choosing نهاوند on the front
 *    page means the login signs you up in نهاوند and the app opens in it.
 *  - A card that can be used without an account goes straight to the thing —
 *    اماکن to the city's real venue list, پسماند to its real prices — and one
 *    that genuinely needs a person behind it says «با ورود» on its face rather
 *    than after the click.
 *  - The سانس‌ها are live. «فردا ۱۶:۰۰ · ۳ جا مانده» is read from the same
 *    schedule the booking runs on, so the front page cannot advertise an hour
 *    the module would refuse.
 *
 * Every city is rendered into the HTML and all but one hidden — so «خدمات
 * شهرداری ملایر» is on the page a crawler reads, and a visitor whose JavaScript
 * has not arrived still sees a complete city.
 */

const ICONS: Record<string, LucideIcon> = {
  Recycle, Megaphone, FileText, CalendarCheck, Flower2, Building2,
};

/* The board is dark; these are its surfaces. Written once because a tile, a
   chip and a session card must sit on the same field or the panel looks
   assembled from parts. */
const INK = {
  tile: 'rgba(255,255,255,0.055)',
  tileHover: 'rgba(255,255,255,0.09)',
  line: 'var(--ss-line)',
  lineStrong: 'var(--ss-line-strong)',
  text: '#f2f8f5',
  muted: 'rgba(233,244,239,0.66)',
  faint: 'rgba(233,244,239,0.42)',
};

function ServiceTile({
  service,
  city,
  available,
  live,
}: {
  service: PublicService;
  city: PublicCity;
  /** Whether this city actually runs it — the only thing separating the two states. */
  available: boolean;
  /** A line of fact under the title, when the module has one — «۴ مکان · فردا ۱۶:۰۰». */
  live?: string;
}) {
  const Icon = ICONS[service.icon] || Building2;
  const entry = serviceEntry(service, city);

  const inner = (
    <>
      <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span
          style={{
            width: 38, height: 38, borderRadius: 12, display: 'grid', placeItems: 'center', flexShrink: 0,
            background: available ? alpha(service.color, 26) : 'rgba(255,255,255,0.05)',
            color: available ? service.color : INK.faint,
            border: `1px solid ${available ? alpha(service.color, 44) : INK.line}`,
          }}
        >
          <Icon className="h-[18px] w-[18px]" aria-hidden />
        </span>

        <span style={{ minWidth: 0, flex: 1 }}>
          <span style={{ display: 'block', fontSize: 14, fontWeight: 800, color: available ? INK.text : INK.muted }}>
            {service.title}
          </span>
          <span style={{ display: 'block', marginTop: 2, fontSize: 11, color: INK.faint, lineHeight: 1.7 }}>
            {service.short}
          </span>
        </span>
      </span>

      {/* The one line that makes this a service rather than a claim. */}
      {available && live && (
        <span
          style={{
            display: 'flex', alignItems: 'center', gap: 6, marginTop: 11,
            fontSize: 11.5, fontWeight: 700, color: 'var(--ss-brass)',
          }}
        >
          <span
            aria-hidden
            style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ss-brass)', flexShrink: 0 }}
          />
          {live}
        </span>
      )}

      <span
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
          marginTop: 12, paddingTop: 10, borderTop: `1px solid ${INK.line}`,
        }}
      >
        {available ? (
          <>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 800, color: INK.text }}>
              {entry.action}
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            </span>
            {/* «بدون ثبت‌نام» is only said where the *whole* service works
                without one. اماکن shows its calendar to anybody and still needs
                an account to take a seat, so its card says «رزرو با ورود» —
                which is the truth a citizen would otherwise discover after
                deciding to go swimming on Thursday. */}
            <span
              style={{
                fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap',
                color: entry.access === 'open' ? '#4ade9f' : entry.access === 'browse' ? 'var(--ss-brass)' : INK.faint,
              }}
            >
              {entry.note}
            </span>
          </>
        ) : (
          <span style={{ fontSize: 11, fontWeight: 700, color: INK.faint }}>
            {city.isActive ? 'در این شهر فعال نیست' : 'به‌زودی'}
          </span>
        )}
      </span>
    </>
  );

  const shell: React.CSSProperties = {
    display: 'block', textDecoration: 'none', padding: 14, borderRadius: 18,
    background: available ? INK.tile : 'transparent',
    border: `1px ${available ? 'solid' : 'dashed'} ${available ? INK.line : 'rgba(255,255,255,0.09)'}`,
    transition: 'transform 0.18s ease, background 0.18s ease, border-color 0.18s ease',
  };

  return available ? (
    <Link href={entry.href} className="ss-tile" style={shell}>
      {inner}
    </Link>
  ) : (
    <div style={{ ...shell, opacity: 0.72 }}>{inner}</div>
  );
}

/** «استخر شهدا · فردا ۱۶:۰۰ · ۳ جا مانده» — one free session, ready to be taken. */
function SessionCard({ slug, item }: { slug: string; item: CityHighlights['soon'][number] }) {
  return (
    <Link
      href={`/city/${slug}/venues/${item.venue}?date=${item.dateKey}`}
      className="ss-tile"
      style={{
        display: 'block', textDecoration: 'none', flex: '0 0 auto', width: 232,
        padding: 13, borderRadius: 16,
        background: INK.tile, border: `1px solid ${INK.line}`,
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Ticket className="h-4 w-4" style={{ color: 'var(--ss-brass)', flexShrink: 0 }} aria-hidden />
        <span style={{ minWidth: 0, flex: 1, fontSize: 13, fontWeight: 800, color: INK.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.venueTitle}
        </span>
      </span>

      <span className="ss-fig" style={{ display: 'block', marginTop: 9, fontSize: 19, color: '#f7fbf9', letterSpacing: '0.01em' }}>
        {faTime(item.from)} <span style={{ fontSize: 12, color: INK.faint }}>تا</span> {faTime(item.to)}
      </span>

      <span style={{ display: 'block', marginTop: 4, fontSize: 11.5, color: INK.muted }}>
        {item.ahead === 0 ? 'امروز' : item.ahead === 1 ? 'فردا' : item.say}
        {item.label ? ` · ${item.label}` : ''}
      </span>

      <span
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
          marginTop: 10, paddingTop: 9, borderTop: `1px solid ${INK.line}`,
        }}
      >
        <span className="ss-fig" style={{ fontSize: 12.5, fontWeight: 800, color: INK.text }}>
          {item.price > 0 ? `${fa(item.price)} تومان` : 'رایگان'}
        </span>
        <span style={{ fontSize: 10.5, fontWeight: 800, color: item.left <= 3 ? 'var(--ss-brass)' : '#4ade9f' }}>
          {fa(item.left)} جای خالی
        </span>
      </span>
    </Link>
  );
}

export default function CityConsole({
  cities,
  catalogue,
  highlights,
}: {
  cities: PublicCity[];
  catalogue: PublicService[];
  /** Live venue availability per city — empty is a state this must survive. */
  highlights: CityHighlights[];
}) {
  /**
   * Opens on a city that has something to show. `cities` is already sorted with
   * the running ones first, but «the first» would be the wrong answer if that
   * city's panel happened to be empty.
   */
  const opening = Math.max(0, cities.findIndex((c) => c.isActive && c.services.length > 0));
  const [selected, setSelected] = useState(opening);

  /**
   * The choice the rest of the site is already built on.
   *
   * `selectedCity` is what the app's own picker writes, what the login screen
   * pre-selects from and what `CityProvider` resolves on boot. Reading it here
   * means somebody who chose ملایر last week opens on ملایر; writing it means
   * choosing نهاوند on the front page is still true three clicks later, inside
   * the app, in a different session.
   *
   * After mount, never during render: the HTML served to everybody has to be
   * identical, and a localStorage read during render would make it differ.
   */
  useEffect(() => {
    const saved = typeof window === 'undefined' ? null : localStorage.getItem('selectedCity');
    if (!saved) return;
    const index = cities.findIndex((c) => c._id === saved);
    if (index >= 0) setSelected(index);
  }, [cities]);

  const choose = (index: number) => {
    setSelected(index);
    const city = cities[index];
    if (city?._id && typeof window !== 'undefined') localStorage.setItem('selectedCity', city._id);
  };

  if (!cities.length || !catalogue.length) return null;

  return (
    <div className="ss-board ss-rise" style={{ padding: 'clamp(16px, 2.4vw, 26px)' }}>
      {/* ── which city ─────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: S.s3, flexWrap: 'wrap',
          paddingBottom: S.s3, borderBottom: `1px solid ${INK.line}`,
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12, fontWeight: 800, color: 'var(--ss-brass)' }}>
          <MapPin className="h-3.5 w-3.5" aria-hidden />
          شهر شما
        </span>

        <div role="tablist" aria-label="انتخاب شهر" style={{ display: 'flex', gap: 7, flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
          {cities.map((city, index) => (
            <button
              key={city._id}
              type="button"
              role="tab"
              id={`console-tab-${city._id}`}
              aria-selected={index === selected}
              aria-controls={`console-panel-${city._id}`}
              onClick={() => choose(index)}
              className="ss-chip"
              data-on={index === selected}
            >
              <span
                aria-hidden
                style={{
                  width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                  background: city.isActive ? (index === selected ? '#201603' : '#4ade9f') : 'transparent',
                  border: city.isActive ? 'none' : `1.5px dashed ${index === selected ? '#201603' : '#e3ad55'}`,
                }}
              />
              {city.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── one panel per city, all of them in the HTML ─────────────────── */}
      {cities.map((city, index) => {
        const shown = index === selected;
        const live = highlights.find((h) => h._id === city._id);
        const has = (service: PublicService) => city.isActive && city.services.includes(service.key);
        const active = catalogue.filter(has);
        /**
         * ترتیب، بر اساس اینکه همین حالا چه کاری می‌شود کرد.
         *
         * Catalogue order is the platform's order, and on a phone it put two
         * services the city has switched off — and two that begin with a login
         * — above the one somebody came to use. The rank is what a visitor can
         * do, in order:
         *
         *   ۰  running, and there is a free session waiting (اماکن, today)
         *   ۱  running, and there is something to look at before signing in
         *   ۲  running, but there is nothing to show until they sign in
         *   ۳  not running here
         *
         * The last group stays on the page rather than being hidden: «هنوز فعال
         * نیست» is information a citizen can act on too — it is what they take
         * to their شهرداری.
         */
        const rank = (service: PublicService) => {
          if (!has(service)) return 3;
          if (service.key === 'venues' && live?.soon?.length) return 0;
          return serviceEntry(service, city).access === 'login' ? 2 : 1;
        };
        const ordered = [...catalogue].sort((a, b) => rank(a) - rank(b));

        return (
          <div
            key={city._id}
            role="tabpanel"
            id={`console-panel-${city._id}`}
            aria-labelledby={`console-tab-${city._id}`}
            hidden={!shown}
            style={{ display: shown ? 'block' : 'none' }}
          >
            {/* What this city is, in one line, before the grid says it in five. */}
            <p
              style={{
                display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
                margin: `${S.s3}px 0 ${S.s3}px`, fontSize: 13, color: INK.muted, lineHeight: 1.9,
              }}
            >
              {city.isActive ? (
                <>
                  <strong style={{ color: INK.text, fontWeight: 800 }}>شهرداری {city.name}</strong>
                  <span className="ss-fig" style={{ color: '#4ade9f', fontWeight: 800 }}>{fa(active.length)}</span>
                  خدمت را آنلاین ارائه می‌کند.
                  <Link
                    href={cityHref(city)}
                    style={{ marginInlineStart: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--ss-brass)', fontWeight: 800, textDecoration: 'none', fontSize: 12.5 }}
                  >
                    صفحهٔ {city.name}
                    <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                </>
              ) : (
                <>
                  <strong style={{ color: INK.text, fontWeight: 800 }}>{city.name}</strong>
                  هنوز روی شهرشهر باز نشده است؛ خدماتی که شهرداری آن انتخاب کند همین‌جا دیده می‌شود.
                </>
              )}
            </p>

            {/* ── the services themselves ── */}
            <div
              style={{
                display: 'grid', gap: 10,
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 196px), 1fr))',
              }}
            >
              {ordered.map((service) => {
                const available = has(service);

                // The venue tile earns a fact instead of a description: how many
                // places the city lets, and when the next one is free.
                const soonest = live?.soon?.[0];
                const venueLine = service.key === 'venues' && live?.venueCount
                  ? `${fa(live.venueCount)} مکان${soonest ? ` · ${soonest.ahead === 0 ? 'امروز' : soonest.ahead === 1 ? 'فردا' : soonest.say} ${faTime(soonest.from)}` : ''}`
                  : undefined;

                return (
                  <ServiceTile
                    key={service.key}
                    service={service}
                    city={city}
                    available={available}
                    live={venueLine}
                  />
                );
              })}
            </div>

            {/* ── the live line: real hours, ready to be taken ── */}
            {city.isActive && !!live?.soon?.length && (
              <div style={{ marginTop: S.s4, paddingTop: S.s3, borderTop: `1px solid ${INK.line}` }}>
                <p style={{ display: 'flex', alignItems: 'center', gap: 8, margin: `0 0 ${S.s3}px`, fontSize: 12, fontWeight: 800, color: INK.muted }}>
                  <CalendarCheck className="h-3.5 w-3.5" style={{ color: 'var(--ss-brass)' }} aria-hidden />
                  نزدیک‌ترین سانس‌های آزاد در {city.name}
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: INK.faint }}>
                    برای دیدن و رزرو، ثبت‌نام لازم نیست
                  </span>
                </p>

                {/* A rail rather than a grid: these are the *soonest* few, and
                    the order matters more than fitting them all on one line. */}
                <div className="ss-rail" style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
                  {live.soon.map((item) => (
                    <SessionCard key={`${item.venue}-${item.dateKey}-${item.from}`} slug={city.slug || city._id} item={item} />
                  ))}

                  <Link
                    href={`/city/${city.slug || city._id}/venues`}
                    className="ss-tile"
                    style={{
                      flex: '0 0 auto', width: 132, borderRadius: 16, padding: 13, textDecoration: 'none',
                      border: `1px dashed ${INK.lineStrong}`, display: 'grid', placeItems: 'center',
                      color: INK.text, fontSize: 12.5, fontWeight: 800, textAlign: 'center',
                    }}
                  >
                    <span>
                      همهٔ اماکن
                      <span style={{ display: 'block', marginTop: 4, fontSize: 10.5, color: INK.faint, fontWeight: 700 }}>
                        و تقویم کامل
                      </span>
                    </span>
                  </Link>
                </div>
              </div>
            )}

            {/* A city with the module on and nothing free in the next week says
                so, rather than leaving the rail out and looking unfinished. */}
            {city.isActive && city.services.includes('venues') && !live?.soon?.length && (
              <p style={{ margin: `${S.s3}px 0 0`, fontSize: 11.5, color: INK.faint, lineHeight: 1.9 }}>
                در روزهای پیشِ رو سانس آزادی برای اماکن {city.name} ثبت نشده است.{' '}
                <Link href={`/city/${city.slug || city._id}/venues`} style={{ color: 'var(--ss-brass)', fontWeight: 800, textDecoration: 'none' }}>
                  دیدن اماکن و تقویم
                </Link>
              </p>
            )}
          </div>
        );
      })}

      {/* ── the way in, for the two services that need one ── */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: S.s3, flexWrap: 'wrap',
          marginTop: S.s4, paddingTop: S.s3, borderTop: `1px solid ${INK.line}`,
        }}
      >
        <span style={{ fontSize: 11.5, color: INK.faint, lineHeight: 1.9, flex: 1, minWidth: 180 }}>
          دیدن خدمات، قیمت‌ها و سانس‌ها ثبت‌نام نمی‌خواهد. برای <strong style={{ color: INK.muted }}>رزرو مکان</strong> یا
          ثبت درخواست، یک‌بار با شمارهٔ موبایل وارد می‌شوید.
        </span>
        <Link
          href="/login"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7, textDecoration: 'none',
            padding: '11px 20px', borderRadius: 14,
            background: 'var(--ss-brass)', color: '#201603', fontSize: 13, fontWeight: 800,
          }}
        >
          <LogIn className="h-3.5 w-3.5" aria-hidden />
          ورود شهروندان
        </Link>
      </div>
    </div>
  );
}
