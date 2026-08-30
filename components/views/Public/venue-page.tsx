'use client';

import Link from 'next/link';
import {
  BadgeCheck, CalendarDays, Clock3, Info, LogIn, Map, MapPin, Phone, Ticket, Users, XCircle,
} from 'lucide-react';

import { C, S, alpha, fa } from '@/components/ui/tokens';
import type { PublicVenue, VenueDay } from '@/lib/publicVenues';
import { bookHref, faTime } from '@/lib/publicVenues';
import { AudienceTag, Crumbs, DayLink, MonthGrid, groupColor, groupIcon, priceLabel } from './venue-bits';

/**
 * یک مکان، یک روز، و راهی که به رزرو ختم می‌شود.
 *
 * This is the page the whole public half of the module exists for. It shows
 * exactly what the signed-in booking sheet shows — the real sessions, the real
 * prices, the real number of remaining places — to somebody who has never
 * signed up, and then hands them to the login with the session they chose still
 * in their hand.
 *
 * Two decisions worth stating:
 *
 *  - **The day is in the URL.** Every date on the strip is a link, so a
 *    particular Thursday at this particular hall is an address that can be sent
 *    to somebody, bookmarked, indexed, and opened on a phone whose JavaScript
 *    has not arrived. There is no client state on this page at all.
 *  - **Nothing is promised that the API would refuse.** The sessions, the
 *    closures, the notice period and the seats left are computed by the same
 *    schedule engine the booking runs through, so a session offered here is a
 *    session that can actually be taken — and one that cannot says why, in the
 *    municipality's own words.
 */
export default function PublicVenuePage({
  data,
  others = [],
}: {
  data: VenueDay;
  /** The city's other places — a page that ends in nothing is a dead end. */
  others?: PublicVenue[];
}) {
  const { city, venue, calendar, sessions, catalogue } = data;
  const slug = city.slug || city._id;
  const base = `/city/${slug}/venues`;
  const Icon = groupIcon(catalogue, venue.group);
  const tone = groupColor(catalogue, venue.group);

  const open = sessions.filter((s) => s.available).length;

  return (
    <main className="ss-wrap" style={{ paddingBlock: 'clamp(20px, 3vw, 40px)' }}>
      <Crumbs
        trail={[
          { href: '/', label: 'شهرشهر' },
          { href: `/city/${slug}`, label: city.name },
          { href: base, label: 'اماکن' },
          { label: venue.title },
        ]}
      />

      {/* ── the place ─────────────────────────────────────────────────── */}
      <header
        style={{
          display: 'grid', gap: 'clamp(16px, 2.6vw, 30px)', alignItems: 'center', marginTop: S.s4,
          gridTemplateColumns: venue.photos?.length ? 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))' : '1fr',
        }}
      >
        <div>
          <span
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              fontSize: 11.5, fontWeight: 800, padding: '5px 12px', borderRadius: 999,
              background: alpha(tone, 12), color: tone, border: `1px solid ${alpha(tone, 28)}`,
            }}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
            {venue.kindTitle}
          </span>

          <h1 className="ss-display" style={{ margin: '12px 0 0', fontSize: 'var(--ss-h2)', color: C.textStrong }}>
            {venue.title}
          </h1>

          <p style={{ margin: '6px 0 0', fontSize: 12.5, color: C.muted }}>
            شهرداری {city.name}
          </p>

          {venue.description && (
            <p style={{ margin: '14px 0 0', fontSize: S.sm, color: C.muted, lineHeight: 2.1, maxWidth: '52ch' }}>
              {venue.description}
            </p>
          )}

          <div style={{ display: 'flex', gap: S.s3, flexWrap: 'wrap', marginTop: S.s4 }}>
            {venue.address && <Fact icon={MapPin} label={venue.address} />}
            {venue.location && (
              <a
                href={`https://www.openstreetmap.org/?mlat=${venue.location.lat}&mlon=${venue.location.lng}#map=17/${venue.location.lat}/${venue.location.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 800, color: C.green, textDecoration: 'none' }}
              >
                <Map className="h-4 w-4" aria-hidden />
                دیدن روی نقشه
              </a>
            )}
            {venue.phone && <Fact icon={Phone} label={venue.phone} />}
            {!!venue.capacity && <Fact icon={Users} label={`گنجایش ${fa(venue.capacity)} نفر`} />}
            <Fact icon={Ticket} label={priceLabel(venue)} />
          </div>

          {!!venue.facilities?.length && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: S.s3 }}>
              {venue.facilities.map((item) => (
                <span
                  key={item}
                  style={{
                    fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999,
                    background: C.bgSubtle, color: C.muted, border: `1px solid ${C.border}`,
                  }}
                >
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>

        {!!venue.photos?.length && (
          <div className="ss-rail" style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
            {venue.photos.map((url) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={url}
                src={url}
                alt={`${venue.title} — ${city.name}`}
                loading="lazy"
                style={{
                  flex: '0 0 auto', width: 'min(100%, 340px)', height: 210, objectFit: 'cover',
                  borderRadius: 20, border: `1px solid ${C.border}`,
                }}
              />
            ))}
          </div>
        )}
      </header>

      {/* ── the booking board ─────────────────────────────────────────── */}
      <section className="ss-board" style={{ marginTop: 'clamp(20px, 3vw, 34px)', padding: 'clamp(16px, 2.4vw, 26px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: S.s3, flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12, fontWeight: 800, color: 'var(--ss-brass)' }}>
            <CalendarDays className="h-3.5 w-3.5" aria-hidden />
            روز را انتخاب کنید
          </span>
          <span style={{ fontSize: 11.5, color: 'rgba(233,244,239,0.5)' }}>
            تا {fa(venue.bookingWindowDays || 14)} روز آینده
          </span>
        </div>

        {/* Days as links: the strip is navigation, not state. */}
        <div className="ss-rail" style={{ display: 'flex', gap: 8, overflowX: 'auto', marginTop: S.s3, paddingBottom: 6 }}>
          {calendar.map((day) => (
            <DayLink
              key={day.dateKey}
              day={day}
              href={`${base}/${venue._id}?date=${day.dateKey}`}
              on={day.dateKey === data.dateKey}
            />
          ))}
        </div>

        {/* The whole window, in the shape the operator registered it in. */}
        <MonthGrid
          days={calendar}
          activeKey={data.dateKey}
          hrefFor={(day) => `${base}/${venue._id}?date=${day.dateKey}`}
          dark
        />

        {/* ── the chosen day ── */}
        <div style={{ marginTop: S.s4, paddingTop: S.s4, borderTop: '1px solid var(--ss-line)' }}>
          <p style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap', margin: 0 }}>
            <span className="ss-display" style={{ fontSize: 17, color: '#f4f9f6' }}>{data.say}</span>
            {data.bookable ? (
              <span style={{ fontSize: 11.5, fontWeight: 800, color: open ? '#4ade9f' : 'var(--ss-brass)' }}>
                {open ? `${fa(open)} سانس آزاد` : 'همهٔ سانس‌های این روز پر است'}
              </span>
            ) : (
              <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--ss-brass)' }}>{data.reason || 'قابل رزرو نیست'}</span>
            )}
          </p>

          {/* Said before the buttons rather than after them. The calendar is
              free to read; the seat is not — and somebody who has just decided
              on Thursday at ۱۶:۰۰ should know that a login is coming before
              they press, not after. */}
          {data.bookable && open > 0 && (
            <p
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                margin: `${S.s3}px 0 0`, padding: '10px 13px', borderRadius: 13,
                background: 'rgba(255,255,255,0.045)', border: '1px solid var(--ss-line)',
                fontSize: 11.5, color: 'rgba(233,244,239,0.72)', lineHeight: 1.9,
              }}
            >
              <LogIn className="h-3.5 w-3.5" style={{ color: 'var(--ss-brass)', flexShrink: 0 }} aria-hidden />
              <span>
                دیدن سانس‌ها آزاد است. برای <strong style={{ color: '#f2f8f5' }}>گرفتن جا</strong> یک‌بار با
                شمارهٔ موبایل وارد می‌شوید و به همین سانس برمی‌گردید.
              </span>
            </p>
          )}

          {data.closed || !sessions.length ? (
            <div
              style={{
                marginTop: S.s3, padding: `${S.s4}px`, borderRadius: 16,
                border: '1px dashed var(--ss-line-strong)', color: 'rgba(233,244,239,0.66)',
                fontSize: 13, lineHeight: 2,
              }}
            >
              {data.reason || 'برای این روز سانسی ثبت نشده است.'} روز دیگری را از نوار بالا انتخاب کنید.
            </div>
          ) : (
            <ul style={{ listStyle: 'none', margin: `${S.s3}px 0 0`, padding: 0, display: 'grid', gap: 9 }}>
              {sessions.map((session) => (
                <li
                  key={session._id || `${session.from}-${session.to}`}
                  className="ss-session"
                  style={{
                    padding: '13px 15px', borderRadius: 16,
                    background: session.available ? 'rgba(255,255,255,0.055)' : 'transparent',
                    border: `1px ${session.available ? 'solid' : 'dashed'} var(--ss-line)`,
                    opacity: session.available ? 1 : 0.66,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
                      <span className="ss-fig" style={{ fontSize: 19, color: '#f7fbf9' }}>
                        {faTime(session.from)}
                        <span style={{ fontSize: 12, color: 'rgba(233,244,239,0.45)' }}> تا </span>
                        {faTime(session.to)}
                      </span>
                      <AudienceTag catalogue={catalogue} audience={session.audience} />
                      {session.label && (
                        <span style={{ fontSize: 11.5, color: 'rgba(233,244,239,0.66)' }}>{session.label}</span>
                      )}
                    </span>

                    <span style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 7 }}>
                      <span className="ss-fig" style={{ fontSize: 13, fontWeight: 800, color: '#f2f8f5' }}>
                        {session.price > 0 ? `${fa(session.price)} تومان` : 'رایگان'}
                      </span>
                      <span style={{ fontSize: 11.5, color: session.left <= 3 && session.left > 0 ? 'var(--ss-brass)' : 'rgba(233,244,239,0.6)' }}>
                        {session.capacity > 1
                          ? `${fa(session.left)} جای خالی از ${fa(session.capacity)}`
                          : session.left > 0 ? 'آزاد است' : 'رزرو شده'}
                      </span>
                    </span>
                  </div>

                  {session.available ? (
                    <Link
                      href={bookHref(city._id, venue._id, data.dateKey)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none',
                        padding: '11px 18px', borderRadius: 13, whiteSpace: 'nowrap',
                        background: 'var(--ss-brass)', color: '#201603', fontSize: 12.5, fontWeight: 800,
                      }}
                    >
                      <LogIn className="h-3.5 w-3.5" aria-hidden />
                      رزرو با ورود
                    </Link>
                  ) : (
                    <span
                      style={{
                        display: 'inline-flex', alignItems: 'flex-start', gap: 6, maxWidth: '34ch',
                        fontSize: 11.5, fontWeight: 700, color: 'rgba(233,244,239,0.6)', lineHeight: 1.9,
                      }}
                    >
                      <XCircle className="h-3.5 w-3.5" style={{ flexShrink: 0, marginTop: 3 }} aria-hidden />
                      {session.blockedReason || 'قابل رزرو نیست'}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}

        </div>
      </section>

      {/* ── قوانین رزرو ───────────────────────────────────────────────── */}
      <section
        style={{
          display: 'grid', gap: S.s3, marginTop: S.s5,
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
        }}
      >
        <Rule
          icon={Clock3}
          title="مهلت رزرو"
          body={
            venue.minNoticeHours
              ? `رزرو برای امروز تا ${fa(venue.minNoticeHours)} ساعت پیش از شروع سانس ممکن است.`
              : 'برای سانس‌های امروز هم می‌توانید رزرو کنید.'
          }
        />
        <Rule
          icon={XCircle}
          title="لغو رزرو"
          body={
            venue.cancelDeadlineHours
              ? `تا ${fa(venue.cancelDeadlineHours)} ساعت پیش از سانس، لغو با بازگشت وجه انجام می‌شود.`
              : 'پس از ثبت، لغو بدون بازگشت وجه انجام می‌شود.'
          }
        />
        <Rule
          icon={BadgeCheck}
          title="تأیید"
          body={
            venue.needsApproval
              ? 'این مکان پس از بررسی شهرداری تأیید می‌شود؛ نتیجه را در برنامه می‌بینید.'
              : 'رزرو این مکان بی‌درنگ قطعی می‌شود.'
          }
        />
        {!!venue.maxPerCitizenPerWeek && (
          <Rule icon={Info} title="سقف هفتگی" body={`هر شهروند در هفته تا ${fa(venue.maxPerCitizenPerWeek)} رزرو در این مکان می‌تواند داشته باشد.`} />
        )}
      </section>

      {venue.rules && (
        <div className="ss-card" style={{ marginTop: S.s3, padding: S.s4 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: C.textStrong }}>مقررات این مکان</p>
          <p style={{ margin: '9px 0 0', fontSize: 12.5, color: C.muted, lineHeight: 2.1, whiteSpace: 'pre-line' }}>
            {venue.rules}
          </p>
        </div>
      )}

      {/* ── اماکن دیگر این شهر ── */}
      {others.length > 0 && (
        <section style={{ marginTop: 'clamp(28px, 3.6vw, 48px)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: S.s3, flexWrap: 'wrap' }}>
            <h2 className="ss-display" style={{ margin: 0, fontSize: 'var(--ss-h2)', color: C.textStrong }}>
              اماکن دیگر {city.name}
            </h2>
            <Link href={base} style={{ marginInlineStart: 'auto', fontSize: 13, fontWeight: 800, color: C.green, textDecoration: 'none' }}>
              همهٔ اماکن ←
            </Link>
          </div>

          <div
            style={{
              display: 'grid', gap: S.s3, marginTop: S.s4,
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
            }}
          >
            {others.map((other) => {
              const OtherIcon = groupIcon(catalogue, other.group);
              const otherTone = groupColor(catalogue, other.group);

              return (
                <Link key={other._id} href={`${base}/${other._id}`} className="ss-card ss-link-card" style={{ padding: S.s4 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span
                      style={{
                        width: 36, height: 36, borderRadius: 12, display: 'grid', placeItems: 'center', flexShrink: 0,
                        background: alpha(otherTone, 12), color: otherTone, border: `1px solid ${alpha(otherTone, 26)}`,
                      }}
                    >
                      <OtherIcon className="h-[17px] w-[17px]" aria-hidden />
                    </span>
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: 14, fontWeight: 800, color: C.textStrong }}>{other.title}</span>
                      <span style={{ display: 'block', marginTop: 2, fontSize: 11.5, color: C.muted }}>{other.kindTitle}</span>
                    </span>
                  </span>

                  <span
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: S.s2,
                      marginTop: S.s3, paddingTop: S.s3, borderTop: `1px solid ${C.border}`,
                    }}
                  >
                    <span className="ss-fig" style={{ fontSize: 12, fontWeight: 800, color: C.textStrong }}>
                      {priceLabel(other)}
                    </span>
                    <span style={{ fontSize: 11.5, fontWeight: 800, color: other.nextOpen ? C.green : C.subtle }}>
                      {other.nextOpen
                        ? other.nextOpen.ahead === 0 ? 'امروز باز' : other.nextOpen.ahead === 1 ? 'فردا باز' : other.nextOpen.say
                        : 'بدون برنامه'}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <Link
        href={base}
        style={{ display: 'inline-block', marginTop: S.s5, fontSize: 13, fontWeight: 800, color: C.green, textDecoration: 'none' }}
      >
        دیدن همهٔ اماکن {city.name} ←
      </Link>
    </main>
  );
}

function Fact({ icon: Icon, label }: { icon: typeof MapPin; label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'flex-start', gap: 7, fontSize: 12.5, color: C.muted, lineHeight: 1.8 }}>
      <Icon className="h-4 w-4" style={{ color: C.green, flexShrink: 0, marginTop: 2 }} aria-hidden />
      {label}
    </span>
  );
}

function Rule({ icon: Icon, title, body }: { icon: typeof Clock3; title: string; body: string }) {
  return (
    <div className="ss-card" style={{ padding: S.s4 }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12.5, fontWeight: 800, color: C.textStrong }}>
        <Icon className="h-4 w-4" style={{ color: C.green }} aria-hidden />
        {title}
      </span>
      <p style={{ margin: '8px 0 0', fontSize: 12, color: C.muted, lineHeight: 2 }}>{body}</p>
    </div>
  );
}
