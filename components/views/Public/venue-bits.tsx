'use client';

import Link from 'next/link';
import {
  BookOpen, Building2, ChevronLeft, Dumbbell, PartyPopper, Store, type LucideIcon,
} from 'lucide-react';

import { C, S, alpha, fa } from '@/components/ui/tokens';
import type { CalendarDay, PublicVenue, VenueCatalogue } from '@/lib/publicVenues';

/**
 * The pieces both public booking pages are built from.
 *
 * Shared rather than written twice, because a venue's price and a venue's
 * audience have to read identically on the list and on the page it links to —
 * a card that says «از ۵۰٬۰۰۰» and a page that says something else is the kind
 * of difference somebody notices exactly once, and then stops trusting.
 */

/**
 * A drawing per group of place, for the venues that have no photograph.
 *
 * Keyed by the icon *name* the catalogue sends rather than by the group key, so
 * a group added on the API side arrives with its own drawing instead of falling
 * back to a generic building the day somebody adds «فضای سبز».
 */
const ICONS: Record<string, LucideIcon> = {
  Dumbbell, BookOpen, PartyPopper, Store, Building2,
};

export function groupIcon(catalogue: VenueCatalogue | undefined, group: string): LucideIcon {
  const found = (catalogue?.groups || []).find((g) => g.key === group) as { icon?: string } | undefined;
  return ICONS[found?.icon || ''] || Building2;
}

/** The colour a group is drawn in, or the platform's green. */
export function groupColor(catalogue: VenueCatalogue | undefined, group: string): string {
  return (catalogue?.groups || []).find((g) => g.key === group)?.color || C.green;
}

/** «بانوان» in the colour the whole product uses for it. */
export function audienceOf(catalogue: VenueCatalogue, key: string) {
  return catalogue?.audiences?.find((a) => a.key === key) || null;
}

export function AudienceTag({ catalogue, audience }: { catalogue: VenueCatalogue; audience: string }) {
  const found = audienceOf(catalogue, audience);
  if (!found || found.key === 'all') return null;

  return (
    <span
      style={{
        fontSize: 10.5, fontWeight: 800, padding: '3px 9px', borderRadius: S.rPill, whiteSpace: 'nowrap',
        background: alpha(found.color, 14), color: found.color, border: `1px solid ${alpha(found.color, 30)}`,
      }}
    >
      {found.title}
    </span>
  );
}

/**
 * قیمت، آن‌طور که واقعاً پرداخت می‌شود.
 *
 * A range rather than a number wherever the sessions differ, because
 * `venue.price` is only a default: a سالن with a ۵۰٬۰۰۰ morning and a ۲۵۰٬۰۰۰
 * evening quoted at one figure is quoting a price somebody will not pay.
 */
export function priceLabel(venue: PublicVenue): string {
  const from = venue.priceFrom;
  const to = venue.priceTo;

  if (from === null || from === undefined) return venue.price > 0 ? `${fa(venue.price)} تومان` : 'رایگان';
  if (from === 0 && (to === 0 || to === undefined || to === null)) return 'رایگان';
  if (to === undefined || to === null || to === from) return `${fa(from)} تومان`;
  return `از ${fa(from)} تا ${fa(to)} تومان`;
}

/** شهرشهر / نهاوند / اماکن — where the visitor is, and the way back. */
export function Crumbs({ trail }: { trail: { href?: string; label: string }[] }) {
  return (
    <nav aria-label="مسیر" style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', fontSize: 12, color: C.muted }}>
      {trail.map((step, index) => (
        <span key={step.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          {index > 0 && <ChevronLeft className="h-3 w-3" style={{ color: C.subtle }} aria-hidden />}
          {step.href ? (
            <Link href={step.href} style={{ color: C.muted, textDecoration: 'none', fontWeight: 600 }}>
              {step.label}
            </Link>
          ) : (
            <span style={{ color: C.textStrong, fontWeight: 800 }}>{step.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

/**
 * یک روز از تقویم، به شکل یک پیوند.
 *
 * A link and not a button, on purpose. The date lives in the URL, so a day is
 * shareable, bookmarkable, indexable and — the part that actually matters on a
 * municipal site — works on a phone whose JavaScript has not arrived yet.
 * «پنجشنبه ساعت ۱۶ استخر بانوان» can be sent to somebody as an address.
 */
export function DayLink({
  day,
  href,
  on,
}: {
  day: CalendarDay;
  href: string;
  on: boolean;
}) {
  return (
    <Link
      href={href}
      className="ss-day"
      data-on={on}
      data-closed={day.closed}
      aria-current={on ? 'date' : undefined}
      style={{ flex: '0 0 auto' }}
    >
      <span style={{ display: 'block', fontSize: 10.5, fontWeight: 700, opacity: 0.82 }}>
        {day.isToday ? 'امروز' : day.ahead === 1 ? 'فردا' : day.weekdayName}
      </span>
      <span className="ss-fig" style={{ display: 'block', marginTop: 3, fontSize: 20, lineHeight: 1.15 }}>
        {fa(day.jd)}
      </span>
      <span style={{ display: 'block', marginTop: 2, fontSize: 10, opacity: 0.75 }}>
        {day.monthName}
      </span>
      <span style={{ display: 'block', marginTop: 5, fontSize: 9.5, fontWeight: 700, opacity: on ? 0.9 : 0.7 }}>
        {day.closed ? 'تعطیل' : `${fa(day.sessionCount)} سانس`}
      </span>
    </Link>
  );
}

const WEEKDAYS = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];

/**
 * تقویم ماه — the same object the operator works in.
 *
 * The panel's own venue calendar is a month grid: weeks down, weekdays across,
 * every day a cell that says whether the place is open and how many سانس it
 * runs. The citizen's side had a horizontal rail of the next fourteen days,
 * which is right for «کدام روز نزدیک است» and useless for «آخر شهریور چطور».
 *
 * So the rail stays as the quick answer and this stands underneath it as the
 * whole window — deliberately built the same shape as the panel's, because a
 * municipality that registers a closure in one calendar should recognise the
 * calendar its citizens read it in.
 *
 * A `<details>` rather than a toggle: it opens with no JavaScript, the keyboard
 * already knows how, and a crawler reads the days whether it is open or not.
 */
export function MonthGrid({
  days,
  activeKey,
  hrefFor,
  dark = false,
}: {
  days: CalendarDay[];
  activeKey: string;
  hrefFor: (day: CalendarDay) => string;
  /** Drawn on the booking board rather than on the page's own ground. */
  dark?: boolean;
}) {
  if (!days.length) return null;

  // Weeks, each day under its own weekday. A week ends where the next شنبه
  // begins, which leaves the first row correctly short — the window starts
  // today, not on a Saturday.
  const rows: (CalendarDay | null)[][] = [];
  let week: (CalendarDay | null)[] = new Array(7).fill(null);
  let started = false;

  days.forEach((day) => {
    if (started && day.weekday === 0) {
      rows.push(week);
      week = new Array(7).fill(null);
    }
    week[day.weekday] = day;
    started = true;
  });
  if (started) rows.push(week);

  // `Array.from`, not a spread: this tsconfig targets ES5 and spreading a
  // Set needs --downlevelIteration.
  const months = Array.from(new Set(days.map((d) => d.monthName))).join(' و ');

  // The board is dark, and a white card dropped onto it reads as a different
  // page's component that wandered in.
  const skin = dark
    ? {
      shell: { background: 'rgba(255,255,255,0.045)', border: '1px solid var(--ss-line)' },
      title: '#f2f8f5',
      weekday: 'rgba(233,244,239,0.6)',
      openBg: 'rgba(255,255,255,0.06)',
      openBorder: 'var(--ss-line)',
      openText: '#eef5f1',
      shutBg: 'transparent',
      shutBorder: 'rgba(255,255,255,0.09)',
      shutText: 'rgba(233,244,239,0.42)',
    }
    : {
      shell: { background: C.surface, border: `1px solid ${C.border}` },
      title: C.textStrong,
      weekday: C.muted,
      openBg: alpha(C.green, 8),
      openBorder: alpha(C.green, 22),
      openText: C.text,
      shutBg: C.bgSubtle,
      shutBorder: C.border,
      shutText: C.subtle,
    };

  return (
    <details style={{ ...skin.shell, borderRadius: 18, padding: `${S.s3}px ${S.s4}px`, marginTop: S.s3 }}>
      <summary style={{ cursor: 'pointer', fontSize: 13, fontWeight: 800, color: skin.title, lineHeight: 2 }}>
        تقویم کامل — {months}
      </summary>

      <div style={{ display: 'grid', gap: 4, gridTemplateColumns: 'repeat(7, 1fr)', marginTop: S.s3 }}>
        {WEEKDAYS.map((name) => (
          <span key={name} style={{ fontSize: 10.5, fontWeight: 800, color: skin.weekday, textAlign: 'center', padding: '2px 0' }}>
            {name}
          </span>
        ))}

        {rows.flatMap((row, wi) =>
          row.map((day, di) => {
            if (!day) return <span key={`${wi}-${di}`} />;
            const on = day.dateKey === activeKey;

            return (
              <Link
                key={day.dateKey}
                href={hrefFor(day)}
                title={`${day.say}${day.reason ? ` — ${day.reason}` : ''}`}
                aria-current={on ? 'date' : undefined}
                style={{
                  display: 'grid', gap: 2, justifyItems: 'center', textAlign: 'center',
                  padding: '7px 3px', borderRadius: 12, textDecoration: 'none',
                  background: on ? C.green : day.closed ? skin.shutBg : skin.openBg,
                  color: on ? C.onAccent : day.closed ? skin.shutText : skin.openText,
                  border: `1.5px solid ${on ? C.green : day.closed ? skin.shutBorder : skin.openBorder}`,
                }}
              >
                {/* The first of a month says so. «۳۱» followed by «۱» is two
                    numbers and no month, which is exactly how somebody books
                    the right day of the wrong one. */}
                {day.jd === 1 && (
                  <span style={{ fontSize: 8.5, fontWeight: 800, opacity: 0.9, whiteSpace: 'nowrap' }}>
                    {day.monthName}
                  </span>
                )}
                <span className="ss-fig" style={{ fontSize: 13, fontWeight: 800 }}>{fa(day.jd)}</span>
                <span style={{ fontSize: 8.5, whiteSpace: 'nowrap' }}>
                  {day.closed ? 'تعطیل' : `${fa(day.sessionCount)} سانس`}
                </span>
              </Link>
            );
          }),
        )}
      </div>
    </details>
  );
}

/** ظرفیت، امکانات، شمارهٔ تماس — the facts a place is chosen on. */
export function FactRow({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.muted }}>
      <Icon className="h-3.5 w-3.5" style={{ color: C.green, flexShrink: 0 }} aria-hidden />
      {label}
    </span>
  );
}
