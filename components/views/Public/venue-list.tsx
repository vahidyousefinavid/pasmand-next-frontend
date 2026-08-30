'use client';

import Link from 'next/link';
import { CalendarCheck, Clock3, MapPin, Users } from 'lucide-react';

import { C, S, alpha, fa } from '@/components/ui/tokens';
import type { CityVenues } from '@/lib/publicVenues';
import { faTime } from '@/lib/publicVenues';
import { AudienceTag, Crumbs, groupColor, groupIcon, priceLabel } from './venue-bits';

/**
 * اماکن یک شهر، برای کسی که هنوز حساب ندارد.
 *
 * The public half of رزرو اماکن begins here. Everything on this page is a fact
 * about a public facility — what the municipality lets, where it is, when it is
 * next open and what an hour of it costs — and none of it was readable without
 * an account until now.
 *
 * Filtering is done with links rather than with state: `?group=sport` is a URL,
 * so «سالن‌های ورزشی نهاوند» is a page that can be sent to somebody, indexed,
 * and opened on a phone that has not finished loading its JavaScript.
 */
export default function PublicVenueList({
  data,
  group,
}: {
  data: CityVenues;
  /** The group being shown, from the query string. Empty means all of them. */
  group?: string;
}) {
  const { city, venues, catalogue } = data;
  const base = `/city/${city.slug || city._id}/venues`;

  // Only the groups this city actually owns something in. A filter row offering
  // «مراسم و پذیرایی» to a city with one swimming pool is five dead ends.
  const present = (catalogue?.groups || []).filter((g) => venues.some((v) => v.group === g.key));

  return (
    <main className="ss-wrap" style={{ paddingBlock: 'clamp(20px, 3vw, 40px)' }}>
      <Crumbs
        trail={[
          { href: '/', label: 'شهرشهر' },
          { href: `/city/${city.slug || city._id}`, label: city.name },
          { label: 'اماکن قابل رزرو' },
        ]}
      />

      <header style={{ marginTop: S.s4, maxWidth: '58ch' }}>
        <h1 className="ss-display" style={{ margin: 0, fontSize: 'var(--ss-h2)', color: C.textStrong }}>
          اماکن قابل رزرو شهرداری {city.name}
        </h1>
        <p style={{ margin: '12px 0 0', fontSize: S.sm, color: C.muted, lineHeight: 2.1 }}>
          {venues.length > 0 ? (
            <>
              <strong className="ss-fig" style={{ color: C.textStrong, fontWeight: 800 }}>{fa(venues.length)}</strong>{' '}
              مکان، با سانس‌ها و قیمت‌های واقعی. تقویم و ساعت‌های خالی را بدون ثبت‌نام ببینید؛ ورود
              فقط برای گرفتن جای خودتان لازم است.
            </>
          ) : (
            <>شهرداری {city.name} هنوز مکانی برای رزرو آنلاین ثبت نکرده است.</>
          )}
        </p>
      </header>

      {/* ── دسته‌بندی ── */}
      {present.length > 1 && (
        <nav aria-label="دسته‌بندی اماکن" style={{ display: 'flex', gap: S.s2, flexWrap: 'wrap', marginTop: S.s4 }}>
          <FilterLink href={base} label="همه" on={!group} count={venues.length} />
          {present.map((g) => (
            <FilterLink
              key={g.key}
              href={`${base}?group=${g.key}`}
              label={g.title}
              on={group === g.key}
              count={venues.filter((v) => v.group === g.key).length}
              tone={g.color}
            />
          ))}
        </nav>
      )}

      {/* ── the places ── */}
      <div
        style={{
          display: 'grid', gap: S.s3, marginTop: S.s5,
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 290px), 1fr))',
        }}
      >
        {venues.map((venue) => {
          const Icon = groupIcon(catalogue, venue.group);
          const tone = groupColor(catalogue, venue.group);
          const photo = venue.photos?.[0];
          const soon = venue.nextSessions || [];

          /**
           * A card, not a link.
           *
           * It used to be one `<a>` around everything, which meant the only
           * thing it could offer was «open me». The bookable hours on it are
           * links of their own now — «فردا ۱۶:۰۰» goes to that day, not to the
           * top of the venue — and an anchor inside an anchor is invalid markup
           * that browsers resolve by dropping one of them.
           */
          return (
            <div key={venue._id} className="ss-card ss-venue" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {/* The photograph if the municipality uploaded one, and an honest
                  drawing if it did not — never a stock image of somebody else's
                  swimming pool. */}
              <Link
                href={`${base}/${venue._id}`}
                aria-label={venue.title}
                style={{
                  display: 'block', height: 132, position: 'relative', textDecoration: 'none',
                  background: photo ? `center/cover no-repeat url(${photo})` : `linear-gradient(150deg, ${alpha(tone, 22)}, ${alpha(tone, 8)})`,
                  borderBottom: `1px solid ${C.border}`,
                }}
              >
                {!photo && (
                  <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: tone, opacity: 0.75 }}>
                    <Icon className="h-9 w-9" aria-hidden />
                  </span>
                )}

                <span
                  style={{
                    position: 'absolute', insetInlineStart: 10, top: 10,
                    fontSize: 10.5, fontWeight: 800, padding: '4px 10px', borderRadius: 999,
                    background: C.surface, color: tone, border: `1px solid ${alpha(tone, 30)}`,
                  }}
                >
                  {venue.kindTitle}
                </span>

                {/* «امروز باز است» belongs on the picture, where the eye lands
                    first — it is the one fact that decides whether this card is
                    worth reading at all. */}
                {venue.nextOpen && venue.nextOpen.ahead <= 1 && (
                  <span
                    style={{
                      position: 'absolute', insetInlineEnd: 10, top: 10,
                      fontSize: 10.5, fontWeight: 800, padding: '4px 10px', borderRadius: 999,
                      background: C.green, color: C.onAccent,
                    }}
                  >
                    {venue.nextOpen.ahead === 0 ? 'امروز باز' : 'فردا باز'}
                  </span>
                )}
              </Link>

              <div style={{ padding: S.s4, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Link href={`${base}/${venue._id}`} style={{ textDecoration: 'none' }}>
                  <span style={{ display: 'block', fontSize: 15.5, fontWeight: 800, color: C.textStrong }}>
                    {venue.title}
                  </span>
                </Link>

                {venue.address && (
                  <span style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginTop: 7, fontSize: 12, color: C.muted, lineHeight: 1.9 }}>
                    <MapPin className="h-3.5 w-3.5" style={{ marginTop: 3, flexShrink: 0 }} aria-hidden />
                    {venue.address}
                  </span>
                )}

                <span style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center', marginTop: 9 }}>
                  {venue.audiences?.map((key) => (
                    <AudienceTag key={key} catalogue={catalogue} audience={key} />
                  ))}
                  {!!venue.facilities?.length && (
                    <span style={{ fontSize: 11, color: C.subtle, fontWeight: 700 }}>
                      {fa(venue.facilities.length)} امکانات
                    </span>
                  )}
                </span>

                {/* ── the hours themselves ──
                    The difference between a directory of municipal buildings
                    and a booking system: «فردا باز است» tells somebody to look,
                    «فردا ۱۶:۰۰ · ۳ جا» tells them what they will get and takes
                    them to it. One per day, so the card offers a choice rather
                    than one busy afternoon. */}
                <div style={{ marginTop: S.s3, paddingTop: S.s3, borderTop: `1px solid ${C.border}` }}>
                  {soon.length > 0 ? (
                    <>
                      <span style={{ display: 'block', fontSize: 11, fontWeight: 800, color: C.muted, marginBottom: 7 }}>
                        نزدیک‌ترین ساعت‌های آزاد
                      </span>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {soon.map((session) => (
                          <Link
                            key={`${session.dateKey}-${session.from}`}
                            href={`${base}/${venue._id}?date=${session.dateKey}`}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none',
                              padding: '7px 11px', borderRadius: 12,
                              background: alpha(C.green, 8), border: `1px solid ${alpha(C.green, 24)}`,
                              fontSize: 11.5, fontWeight: 800, color: C.textStrong,
                            }}
                          >
                            <span style={{ color: C.green }}>
                              {session.ahead === 0 ? 'امروز' : session.ahead === 1 ? 'فردا' : session.say.replace(/^\S+\s/, '')}
                            </span>
                            <span className="ss-fig">{faTime(session.from)}</span>
                            {session.left <= 3 && (
                              <span style={{ color: C.amber, fontWeight: 800 }}>{fa(session.left)} جا</span>
                            )}
                          </Link>
                        ))}
                      </div>
                    </>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: C.subtle, fontWeight: 700 }}>
                      <CalendarCheck className="h-3.5 w-3.5" aria-hidden />
                      {venue.nextOpen
                        ? `ساعت آزادی در روزهای پیشِ رو نمانده — تقویم ${venue.title} را ببینید`
                        : 'برنامه‌ای برای روزهای پیشِ رو ثبت نشده'}
                    </span>
                  )}
                </div>

                <span
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: S.s2,
                    marginTop: S.s3, paddingTop: S.s3, borderTop: `1px solid ${C.border}`,
                  }}
                >
                  <span className="ss-fig" style={{ fontSize: 13, fontWeight: 800, color: C.textStrong }}>
                    {priceLabel(venue)}
                  </span>
                  <Link
                    href={`${base}/${venue._id}`}
                    style={{ fontSize: 12, fontWeight: 800, color: C.green, textDecoration: 'none' }}
                  >
                    تقویم و رزرو ←
                  </Link>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {venues.length === 0 && (
        <div className="ss-card" style={{ marginTop: S.s5, padding: S.s6, textAlign: 'center' }}>
          <Users className="h-7 w-7" style={{ color: C.subtle, margin: '0 auto' }} aria-hidden />
          <p style={{ margin: `${S.s3}px 0 0`, fontSize: S.sm, color: C.muted, lineHeight: 2 }}>
            {group
              ? 'در این دسته مکانی ثبت نشده است.'
              : `شهرداری ${city.name} هنوز مکانی برای رزرو آنلاین ثبت نکرده است.`}
          </p>
          {group && (
            <Link href={base} style={{ display: 'inline-block', marginTop: S.s3, fontSize: 13, fontWeight: 800, color: C.green, textDecoration: 'none' }}>
              دیدن همهٔ اماکن
            </Link>
          )}
        </div>
      )}

      <p
        style={{
          display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
          margin: `${S.s5}px 0 0`, padding: `${S.s3}px ${S.s4}px`, borderRadius: 14,
          background: C.bgSubtle, border: `1px dashed ${C.border}`,
          fontSize: 12.5, color: C.muted, lineHeight: 2.1,
        }}
      >
        <Clock3 className="h-4 w-4" style={{ color: C.green }} aria-hidden />
        ساعت‌ها و ظرفیت‌ها را شهرداری {city.name} در پنل خودش ثبت می‌کند و همین‌جا زنده نمایش داده
        می‌شود.
      </p>
    </main>
  );
}

function FilterLink({ href, label, on, count, tone }: { href: string; label: string; on: boolean; count: number; tone?: string }) {
  const colour = tone || C.green;
  return (
    <Link
      href={href}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 7, textDecoration: 'none',
        padding: '8px 14px', borderRadius: 999, fontSize: 12.5, fontWeight: 800,
        background: on ? colour : C.surface,
        color: on ? C.onAccent : C.text,
        border: `1px solid ${on ? colour : C.border}`,
      }}
    >
      {label}
      <span className="ss-fig" style={{ fontSize: 11, opacity: 0.8 }}>{fa(count)}</span>
    </Link>
  );
}
