'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Cookies from 'js-cookie';
import { CalendarCheck, Loader2, MapPin, Ticket, Users, Wallet } from 'lucide-react';

import { axiosService } from '@/lib/axiosService';
import { useToast } from '@/hooks/use-toast';
import { C, S, alpha, fa } from '@/components/ui/tokens';
import { Btn, Card, EmptyState, Hero, IconBadge, Modal, Screen, Segmented, Shimmer } from '@/components/ui/kit';
import { BOOKING_STATUS } from '@/lib/cityServices';
import { faDigits } from '@/lib/when';
import { DateStrip, type CalendarDay } from './venue-calendar';
import BookingDetailSheet from './booking-detail';

/**
 * رزرو اماکن.
 *
 * The question is «کدام سانس خالی است، و برای چه کسی؟» — the second half being
 * the one an استخر lives or dies by. So a day is not a row of identical hours:
 * each session says who it is for, what it costs and how many places are left,
 * and a day the place is shut says why in the municipality's own words.
 *
 * None of that is decided here. The schedule — weekly, even/odd, the exceptions
 * calendar, the official holidays — is computed by the API, and this screen
 * draws the answer. A date strip that offered a day the API would refuse is a
 * promise the product cannot keep.
 */

interface Session {
  _id: string; from: string; to: string; audience: string; label: string;
  price: number; capacity: number; taken: number; left: number;
  available: boolean; blockedReason: string;
}
interface Audience { key: string; title: string; short: string; color: string }
/**
 * The rules of booking this place, sent with the day rather than discovered
 * afterwards: «تا چند ساعت قبل» and «لغو رایگان تا کِی» belong on the screen
 * where the money is spent, not in a message once it has been.
 */
interface VenueRules {
  minNoticeHours?: number; cancelDeadlineHours?: number; needsApproval?: boolean;
  bookingWindowDays?: number; maxPerCitizenPerWeek?: number;
}
interface Catalogue { audiences: Audience[]; kinds: { key: string; title: string; group: string }[]; groups: { key: string; title: string; color: string }[] }

interface Venue {
  _id: string; title: string; kind: string; kindTitle?: string; group?: string;
  description: string; address: string; phone?: string; rules?: string;
  price: number; capacity?: number; needsApproval: boolean; photos: string[];
  facilities?: string[]; audiences?: string[];
  nextOpen?: { date: string; dateKey: string; weekdayName: string } | null;
}
interface Booking {
  _id: string; code: string; codeText?: string; date: string; say?: string; ahead?: number;
  from: string; to: string; amount: number;
  seat?: number; audience?: string; audienceTitle?: string; sessionLabel?: string;
  payment: 'wallet' | 'onsite'; status: keyof typeof BOOKING_STATUS; rejectionReason?: string;
  venue?: { title: string; kind: string; address: string };
  /** Computed by the API — see Utils/bookingPolicy.js. Never re-decided here. */
  policy?: { cancellable: boolean; refundable: boolean; reason?: string; note?: string };
}

const TONE: Record<string, string> = {
  wait: C.statusWarn, work: C.statusInfo, done: C.statusOk, stop: C.statusNeutral,
};

const EMPTY_CATALOGUE: Catalogue = { audiences: [], kinds: [], groups: [] };

/** «بانوان» in the colour the whole product uses for it. */
function useAudience(catalogue: Catalogue) {
  return useCallback(
    (key: string) => catalogue.audiences.find((a) => a.key === key) || { key, title: '', short: '', color: C.green },
    [catalogue],
  );
}

/** The chip that answers «برای چه کسی». */
function AudienceTag({ audience, size = 'sm' }: { audience: Audience; size?: 'sm' | 'xs' }) {
  if (!audience.title || audience.key === 'all') return null;
  return (
    <span
      style={{
        fontSize: size === 'sm' ? 10 : 9, fontWeight: 800, padding: size === 'sm' ? '3px 9px' : '2px 7px',
        borderRadius: S.rPill, whiteSpace: 'nowrap',
        background: alpha(audience.color, 12), color: audience.color,
        border: `1px solid ${alpha(audience.color, 26)}`,
      }}
    >
      {audience.short || audience.title}
    </span>
  );
}

export default function VenuesPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState<'browse' | 'mine'>('browse');

  const [venues, setVenues] = useState<Venue[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [catalogue, setCatalogue] = useState<Catalogue>(EMPTY_CATALOGUE);
  const [group, setGroup] = useState('');
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState('');
  const [open, setOpen] = useState<Venue | null>(null);
  /** Which booking's ticket is on screen, if any. */
  const [detail, setDetail] = useState<string | null>(null);
  /**
   * جایی که از سایت عمومی آمده‌اند.
   *
   * `?venue=…&date=…` is how the public booking page hands somebody back after
   * the login. They chose a hall and a day before they had an account; opening
   * the app on a list and making them find it again would waste the entire
   * point of showing them the calendar in the first place.
   */
  const [deepLink, setDeepLink] = useState<{ venue: string; date: string } | null>(null);
  /** The day the sheet should open on — set only when they arrived with one. */
  const [openDate, setOpenDate] = useState('');

  /**
   * Notifications link to a *booking*, not to a list.
   *
   * «رزرو ۳۱۱۸۷۸ تأیید شد» arriving in the inbox and then dropping the citizen
   * on a screen of every booking they have ever made is the module asking them
   * to find their own row. `?open=<id>` opens the ticket itself; `?tab=mine`
   * is kept for the older links already sitting in people's inboxes.
   *
   * Read after mounting, never during render — the server has no query string
   * and the two would disagree.
   */
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get('tab') === 'mine') setTab('mine');
    const openId = query.get('open');
    if (openId) { setTab('mine'); setDetail(openId); }

    const venueId = query.get('venue');
    if (venueId) setDeepLink({ venue: venueId, date: query.get('date') || '' });
  }, []);


  const token = () => Cookies.get('auth_token');
  const audienceOf = useAudience(catalogue);

  const load = useCallback(() => {
    Promise.all([
      axiosService({ url: '/api/v1/venues', method: 'get', token: token() })
        .then((res: any) => {
          setVenues(res?.data?.venues || []);
          if (res?.data?.catalogue) setCatalogue(res.data.catalogue);
        }),
      axiosService({ url: '/api/v1/bookings', method: 'get', token: token() })
        .then((res: any) => setBookings(res?.data?.bookings || [])),
    ])
      .then(() => setBlocked(''))
      .catch((err: any) => setBlocked(err?.data?.message || 'دریافت اطلاعات انجام نشد.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  /**
   * Opens the sheet as soon as the list it belongs to has arrived — and clears
   * the link, so closing the sheet does not immediately re-open it.
   */
  useEffect(() => {
    if (!deepLink || !venues.length) return;
    const found = venues.find((v) => v._id === deepLink.venue);
    if (found) {
      setOpen(found);
      setOpenDate(deepLink.date);
    }
    setDeepLink(null);
  }, [deepLink, venues]);

  /**
   * پیشِ رو و گذشته.
   *
   * The API already returns them in this order — the next thing to turn up to
   * first — so the split is a `findIndex`, not a second opinion about dates.
   * Two lists rather than one because they are read for different reasons: the
   * first is «کجا باید بروم», the second is «قبلاً چه کردم».
   */
  const live = ['pending', 'confirmed'];
  const upcomingList = bookings.filter((b) => (b.ahead ?? 0) >= 0 && live.includes(b.status));
  const pastList = bookings.filter((b) => !((b.ahead ?? 0) >= 0 && live.includes(b.status)));
  const upcoming = upcomingList.length;

  /** Only the groups this city actually has anything in. */
  const groups = useMemo(() => {
    const present = new Set(venues.map((v) => v.group).filter(Boolean));
    return catalogue.groups.filter((g) => present.has(g.key));
  }, [venues, catalogue]);

  const shown = group ? venues.filter((v) => v.group === group) : venues;

  return (
    <>
      <Screen>
        <Hero
          icon={<CalendarCheck className="h-6 w-6" />}
          title="رزرو اماکن"
          sub="استخر، سالن ورزشی، فرهنگسرا و غرفهٔ بازارچه — سانس خالی را ببینید و همان‌جا رزرو کنید."
          aside={
            <div style={{ textAlign: 'start' }}>
              <p style={{ margin: 0, fontSize: S.xs, color: C.onHeroMuted, fontWeight: 600 }}>رزرو پیشِ رو</p>
              <p className="tnum" style={{ margin: '6px 0 0', fontSize: S.xl, fontWeight: 800 }}>
                {loading ? '…' : fa(upcoming)}
              </p>
            </div>
          }
        />

        {blocked ? (
          <EmptyState icon={<CalendarCheck className="h-6 w-6" />} title="این خدمت در دسترس نیست" sub={blocked} />
        ) : (
          <>
            <div style={{ marginBottom: S.s3 }}>
              <Segmented<'browse' | 'mine'>
                value={tab}
                onChange={setTab}
                options={[
                  { value: 'browse', label: `اماکن (${fa(venues.length)})` },
                  { value: 'mine', label: `رزروهای من (${fa(bookings.length)})` },
                ]}
              />
            </div>

            {tab === 'browse' && groups.length > 1 && (
              <div className="pm-scroll-x" style={{ display: 'flex', gap: 7, marginBottom: S.s3, paddingBottom: 4 }}>
                {[{ key: '', title: 'همه', color: C.green }, ...groups].map((g) => {
                  const on = group === g.key;
                  return (
                    <button
                      key={g.key || 'all'}
                      type="button"
                      onClick={() => setGroup(g.key)}
                      style={{
                        flexShrink: 0, padding: '7px 14px', borderRadius: S.rPill, cursor: 'pointer',
                        fontFamily: 'inherit', fontSize: S.xs, fontWeight: 800,
                        background: on ? g.color : C.surface2,
                        color: on ? C.onAccent : C.text,
                        border: `1px solid ${on ? g.color : C.border}`,
                      }}
                    >
                      {g.title}
                    </button>
                  );
                })}
              </div>
            )}

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: S.s2 }}>
                {[0, 1].map((i) => <Shimmer key={i} height={110} />)}
              </div>
            ) : tab === 'browse' ? (
              shown.length === 0 ? (
                <EmptyState icon={<CalendarCheck className="h-6 w-6" />} title="هنوز مکانی ثبت نشده" sub="شهرداری به‌زودی اماکن قابل رزرو را این‌جا منتشر می‌کند." />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: S.s2 }}>
                  {shown.map((venue, i) => (
                    <div key={venue._id} className="pm-fade-up" style={{ animationDelay: `${Math.min(i, 6) * 35}ms` }}>
                      <Card onClick={() => { setOpenDate(''); setOpen(venue); }}>
                        <div style={{ padding: `${S.s3}px ${S.s4}px`, display: 'flex', gap: S.s3, alignItems: 'center' }}>
                          {/* A room somebody has never seen is a room they will
                              not book. The badge stays for venues without one. */}
                          {venue.photos?.[0] ? (
                            <img
                              src={venue.photos[0]}
                              alt=""
                              loading="lazy"
                              style={{
                                width: 64, height: 64, borderRadius: S.r2, objectFit: 'cover', flexShrink: 0,
                                border: `1px solid ${C.border}`,
                              }}
                            />
                          ) : (
                            <IconBadge color={C.violet} size={48}><CalendarCheck className="h-5 w-5" /></IconBadge>
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: S.sm, fontWeight: 800, color: C.textStrong }}>{venue.title}</p>
                            <p style={{ margin: '4px 0 0', fontSize: S.xs, color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {venue.kindTitle || 'مکان'}{venue.address ? ` · ${venue.address}` : ''}
                            </p>
                            <div style={{ display: 'flex', gap: 5, marginTop: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                              {(venue.audiences || []).filter((a) => a !== 'all').slice(0, 3).map((key) => (
                                <AudienceTag key={key} audience={audienceOf(key)} size="xs" />
                              ))}
                              {venue.nextOpen ? (
                                <span className="tnum" style={{ fontSize: 10, color: C.green, fontWeight: 700 }}>
                                  نزدیک‌ترین روز باز: {venue.nextOpen.weekdayName} {venue.nextOpen.date}
                                </span>
                              ) : (
                                <span style={{ fontSize: 10, color: C.subtle, fontWeight: 700 }}>فعلاً روز بازی ندارد</span>
                              )}
                            </div>
                          </div>
                          <span className="tnum" style={{ flexShrink: 0, textAlign: 'start' }}>
                            <span style={{ display: 'block', fontSize: S.sm, fontWeight: 800, color: C.textStrong }}>
                              {venue.price ? fa(venue.price) : 'رایگان'}
                            </span>
                            {!!venue.price && <span style={{ display: 'block', fontSize: 10, color: C.muted }}>تومان / سانس</span>}
                          </span>
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>
              )
            ) : bookings.length === 0 ? (
              <EmptyState icon={<Ticket className="h-6 w-6" />} title="رزروی ندارید" sub="از فهرست اماکن، سانس دلخواهتان را رزرو کنید." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: S.s4 }}>
                {[
                  { key: 'up', title: 'پیشِ رو', rows: upcomingList },
                  { key: 'past', title: 'گذشته', rows: pastList },
                ].filter((part) => part.rows.length).map((part) => (
                  <div key={part.key}>
                    <p style={{ margin: `0 0 ${S.s2}px`, fontSize: S.xs, fontWeight: 800, color: C.muted }}>
                      {part.title} ({fa(part.rows.length)})
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: S.s2 }}>
                      {part.rows.map((booking) => (
                        <BookingRow
                          key={booking._id}
                          booking={booking}
                          audience={audienceOf(booking.audience || 'all')}
                          onOpen={() => setDetail(booking._id)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </Screen>

      {open && (
        <ReserveSheet
          venue={open}
          initialDate={openDate}
          onClose={() => { setOpen(null); setOpenDate(''); }}
          onBooked={(message, bookingId) => {
            setOpen(null);
            setOpenDate('');
            setTab('mine');
            toast({ variant: 'success', title: 'ثبت شد', description: message });
            load();
            // Straight onto the ticket: the code and the address are what
            // somebody wants the moment a booking succeeds, and hunting for
            // the new row in a list is the opposite of a confirmation.
            if (bookingId) setDetail(bookingId);
          }}
        />
      )}

      {detail && (
        <BookingDetailSheet
          id={detail}
          onClose={() => setDetail(null)}
          onChanged={(message) => {
            setDetail(null);
            toast({ variant: 'success', title: 'انجام شد', description: message });
            load();
          }}
        />
      )}
    </>
  );
}

/**
 * یک رزرو در فهرست.
 *
 * A row, not a screen: where and when, how far away it is, and what state it
 * is in. Everything else — the code, the seat, the address, the telephone, the
 * rules and the only button that moves money — is one tap away in the ticket,
 * which is where a decision that costs something belongs. The card used to
 * carry «لغو رزرو» itself, and pressing it refunded a booking with no question
 * asked and nothing said about the policy.
 */
function BookingRow({
  booking,
  audience,
  onOpen,
}: {
  booking: Booking;
  audience: Audience;
  onOpen: () => void;
}) {
  const status = BOOKING_STATUS[booking.status] || BOOKING_STATUS.pending;
  const colour = TONE[status.tone];
  const ahead = booking.ahead ?? 0;
  const soon = ['pending', 'confirmed'].includes(booking.status) && ahead >= 0;

  return (
    <Card onClick={onOpen}>
      <div style={{ padding: S.s4, display: 'flex', alignItems: 'center', gap: S.s3 }}>
        <IconBadge color={colour} size={44}><Ticket className="h-5 w-5" /></IconBadge>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: S.sm, fontWeight: 800, color: C.textStrong }}>
            {booking.venue?.title || 'مکان'}
          </p>
          <p className="tnum" style={{ margin: '4px 0 0', fontSize: S.xs, color: C.muted }}>
            {booking.say || booking.date} · {booking.from} تا {booking.to}
          </p>
          <div style={{ display: 'flex', gap: 5, marginTop: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <AudienceTag audience={audience} size="xs" />
            {booking.sessionLabel && (
              <span style={{ fontSize: 10, color: C.muted, fontWeight: 700 }}>{booking.sessionLabel}</span>
            )}
            <span className="tnum" style={{ fontSize: 10, color: C.subtle, fontWeight: 700 }}>
              کد <span dir="ltr">{booking.codeText || faDigits(booking.code)}</span>
            </span>
          </div>
        </div>

        <div style={{ flexShrink: 0, display: 'grid', gap: 5, justifyItems: 'end' }}>
          <span
            style={{
              fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: S.rPill,
              background: alpha(colour, 12), color: colour, border: `1px solid ${alpha(colour, 24)}`,
            }}
          >
            {status.label}
          </span>
          {/* «۲ روز دیگر» is the thing a person actually wants off this list. */}
          {soon && (
            <span className="tnum" style={{ fontSize: 10, fontWeight: 800, color: ahead <= 1 ? C.green : C.muted }}>
              {ahead === 0 ? 'امروز' : ahead === 1 ? 'فردا' : `${fa(ahead)} روز دیگر`}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}

function ReserveSheet({
  venue, initialDate, onClose, onBooked,
}: {
  venue: Venue;
  /** The day the citizen already chose on the public page, if they came from one. */
  initialDate?: string;
  onClose: () => void;
  onBooked: (message: string, bookingId?: string) => void;
}) {
  /**
   * `selected` is what the citizen tapped; `dateKey` is the day the server
   * actually answered about. They are separate so that the first load — which
   * sends no date and means «امروز» — does not look like a change and fetch
   * the same day twice.
   */
  const [selected, setSelected] = useState(initialDate || '');
  const [dateKey, setDateKey] = useState('');
  const [day, setDay] = useState<{ date: string; say: string; weekdayName: string; closed: boolean; reason: string } | null>(null);
  /** The venue as the API returns it here — with the rules of booking on it. */
  const [rules, setRules] = useState<VenueRules | null>(null);
  const [calendar, setCalendar] = useState<CalendarDay[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [catalogue, setCatalogue] = useState<Catalogue>(EMPTY_CATALOGUE);
  const [session, setSession] = useState<Session | null>(null);
  const [payment, setPayment] = useState<'wallet' | 'onsite'>('onsite');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const audienceOf = useAudience(catalogue);

  /**
   * The day is asked for by key and the server answers with the whole window,
   * so the strip below is the schedule rather than a guess at it. Leaving the
   * date out on the first call means «امروز» — which only the server knows,
   * since it is the one holding Tehran's clock.
   */
  useEffect(() => {
    setLoading(true);
    setSession(null);
    axiosService({
      url: `/api/v1/venues/${venue._id}/availability`,
      method: 'get',
      params: selected ? { date: selected } : {},
      token: Cookies.get('auth_token'),
    })
      .then((res: any) => {
        const data = res?.data || {};

        /**
         * Open on the first day something can still be taken.
         *
         * At six in the evening every one of today's sessions has already
         * started, and landing on a screen of «رزرو این سانس تا … ممکن بود» is
         * a dead end dressed as a choice. Only on the first load, and only
         * forward: once the citizen picks a day, it is theirs.
         */
        // The strip and the catalogue are kept either way, so the day that is
        // about to be asked for is already drawn rather than flashing empty.
        setCalendar(data.calendar || []);
        if (data.catalogue) setCatalogue(data.catalogue);

        const nothingLeft = !selected && (data.closed || (data.sessions || []).every((s: Session) => !s.available));
        if (nothingLeft) {
          const next = (data.calendar || []).find((d: CalendarDay) => !d.closed && !d.isToday);
          if (next) { setSelected(next.dateKey); return; }
        }

        setSessions(data.sessions || []);
        setDateKey(data.dateKey || '');
        setDay({ date: data.date, say: data.say || '', weekdayName: data.weekdayName, closed: !!data.closed, reason: data.reason || '' });
        if (data.venue) setRules(data.venue);
      })
      .catch((err: any) => {
        setSessions([]);
        setDay({ date: '', say: '', weekdayName: '', closed: true, reason: err?.data?.message || 'دریافت ساعت‌ها انجام نشد.' });
      })
      .finally(() => setLoading(false));
  }, [venue._id, selected]);

  const book = () => {
    if (!session) return;
    setBusy(true);
    setError('');
    axiosService({
      url: '/api/v1/bookings',
      method: 'post',
      token: Cookies.get('auth_token'),
      body: { venue: venue._id, date: dateKey, from: session.from, payment },
    })
      .then((res: any) => onBooked(res?.data?.message || 'رزرو ثبت شد.', res?.data?.booking?._id))
      .catch((err: any) => {
        const data = err?.data || err?.response?.data;
        if (data?.code === 'WALLET_TOPUP_REQUIRED' && data?.url) {
          window.location.assign(data.url);
          return;
        }
        setError(data?.message || 'رزرو انجام نشد.');
        setBusy(false);
      });
  };

  return (
    <Modal onClose={onClose} wide>
      <div style={{ padding: S.s5, display: 'flex', flexDirection: 'column', gap: S.s4 }}>
        <div>
          <p style={{ margin: 0, fontSize: S.md, fontWeight: 800, color: C.textStrong }}>{venue.title}</p>
          <p style={{ margin: '5px 0 0', fontSize: S.xs, color: C.muted }}>
            {venue.kindTitle || 'مکان'}
            {venue.capacity ? ` · ظرفیت ${fa(venue.capacity)} نفر` : ''}
          </p>
        </div>

        {!!venue.photos?.length && (
          <div className="pm-scroll-x" style={{ display: 'flex', gap: 8, paddingBottom: 4 }}>
            {venue.photos.map((url) => (
              <img
                key={url}
                src={url}
                alt=""
                loading="lazy"
                style={{
                  height: 148, borderRadius: S.r2, objectFit: 'cover', flexShrink: 0,
                  border: `1px solid ${C.border}`,
                }}
              />
            ))}
          </div>
        )}

        {venue.description && <p style={{ margin: 0, fontSize: S.sm, color: C.text, lineHeight: 2 }}>{venue.description}</p>}

        {venue.address && (
          <p style={{ margin: 0, display: 'flex', gap: 7, fontSize: S.xs, color: C.muted }}>
            <MapPin className="h-4 w-4" style={{ color: C.green, flexShrink: 0 }} />
            {venue.address}
          </p>
        )}

        {!!venue.facilities?.length && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {venue.facilities.map((item) => (
              <span
                key={item}
                style={{
                  fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: S.rPill,
                  background: C.surface2, color: C.muted, border: `1px solid ${C.border}`,
                }}
              >
                {item}
              </span>
            ))}
          </div>
        )}

        {/* The booking window, as taps — closed days shown, not hidden — with
            the rest of it behind a calendar rather than a longer scroll. */}
        <div>
          <DateStrip days={calendar} value={dateKey} onPick={setSelected} />
        </div>

        <div>
          <p style={{ margin: `0 0 ${S.s2}px`, fontSize: S.xs, fontWeight: 700, color: C.muted }}>
            سانس‌ها{day?.weekdayName ? ` — ${day.weekdayName}` : ''}
          </p>
          {loading ? (
            <Shimmer height={64} />
          ) : day?.closed ? (
            <p
              style={{
                margin: 0, padding: S.s3, borderRadius: S.r1, fontSize: S.xs, lineHeight: 1.9,
                background: C.surface2, color: C.muted, border: `1px solid ${C.border}`,
              }}
            >
              {day.reason || 'در این روز تعطیل است.'}
            </p>
          ) : sessions.length === 0 ? (
            <p style={{ margin: 0, fontSize: S.xs, color: C.muted }}>برای این روز سانسی تعریف نشده است.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {sessions.map((item) => {
                const on = session?.from === item.from;
                const audience = audienceOf(item.audience);
                return (
                  <button
                    key={item._id || item.from}
                    type="button"
                    disabled={!item.available}
                    onClick={() => setSession(item)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: S.s3, textAlign: 'start',
                      padding: `${S.s3}px ${S.s3}px`, borderRadius: S.r2, fontFamily: 'inherit',
                      cursor: item.available ? 'pointer' : 'not-allowed',
                      background: on ? alpha(C.green, 10) : item.available ? C.surface2 : C.bgSubtle,
                      border: `1.5px solid ${on ? C.green : C.border}`,
                      opacity: item.available ? 1 : 0.7,
                    }}
                  >
                    <span
                      style={{
                        width: 4, alignSelf: 'stretch', borderRadius: 4, flexShrink: 0,
                        background: item.available ? audience.color : C.borderStrong,
                      }}
                    />
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span className="tnum" style={{ fontSize: S.sm, fontWeight: 800, color: C.textStrong }}>
                          {item.from} تا {item.to}
                        </span>
                        <AudienceTag audience={audience} />
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5, flexWrap: 'wrap' }}>
                        {item.label && <span style={{ fontSize: 10, color: C.muted, fontWeight: 700 }}>{item.label}</span>}
                        {item.capacity > 1 && (
                          <span className="tnum" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, color: item.left ? C.muted : C.statusDanger, fontWeight: 700 }}>
                            <Users className="h-3 w-3" />
                            {item.left ? `${fa(item.left)} جای خالی از ${fa(item.capacity)}` : 'تکمیل'}
                          </span>
                        )}
                        {!item.available && item.blockedReason && (
                          <span style={{ fontSize: 10, color: C.statusDanger, fontWeight: 700 }}>{item.blockedReason}</span>
                        )}
                      </span>
                    </span>
                    <span className="tnum" style={{ flexShrink: 0, fontSize: S.xs, fontWeight: 800, color: C.textStrong }}>
                      {item.price ? `${fa(item.price)} تومان` : 'رایگان'}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {session && session.price > 0 && (
          <div>
            <p style={{ margin: `0 0 ${S.s2}px`, fontSize: S.xs, fontWeight: 700, color: C.muted }}>پرداخت</p>
            <Segmented<'wallet' | 'onsite'>
              value={payment}
              onChange={setPayment}
              options={[
                { value: 'onsite', label: 'در محل' },
                { value: 'wallet', label: 'از کیف پول' },
              ]}
            />
          </div>
        )}

        {/* ── what is about to be booked, and under which rules ──
            Everything a person needs to agree to belongs *here*, before the
            button: what they are taking, what it costs, whether a human still
            has to approve it, and what happens if they cannot come. A refund
            policy discovered at cancellation time is not a policy. */}
        {session && (
          <div
            style={{
              display: 'grid', gap: S.s2, padding: S.s3, borderRadius: S.r2,
              background: C.surface2, border: `1px solid ${C.border}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: S.s3 }}>
              <span style={{ fontSize: S.xs, color: C.textStrong, fontWeight: 800 }}>
                {day?.say || day?.date}
              </span>
              <span className="tnum" style={{ fontSize: S.base, fontWeight: 800, color: C.textStrong }}>
                {session.price ? `${fa(session.price)} تومان` : 'رایگان'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span className="tnum" style={{ fontSize: S.xs, color: C.muted }}>
                {session.from} تا {session.to}
              </span>
              <AudienceTag audience={audienceOf(session.audience)} size="xs" />
              {session.capacity > 1 && (
                <span className="tnum" style={{ fontSize: 10, color: C.muted, fontWeight: 700 }}>
                  {fa(session.left)} جای خالی
                </span>
              )}
            </div>

            <p style={{ margin: 0, fontSize: 11, color: C.muted, lineHeight: 1.9 }}>
              {venue.needsApproval
                ? 'پس از تأیید شهرداری قطعی می‌شود؛ تا آن زمان جای شما نگه داشته می‌شود.'
                : 'بلافاصله قطعی می‌شود.'}
              {' '}
              {/* Only promise a refund when money would actually be taken now:
                  a session paid at the door has nothing to give back. */}
              {rules?.cancelDeadlineHours
                ? `لغو رایگان تا ${fa(rules.cancelDeadlineHours)} ساعت پیش از شروع.`
                : session.price > 0 && payment === 'wallet'
                  ? 'تا پیش از شروع سانس می‌توانید لغو کنید و مبلغ برمی‌گردد.'
                  : 'تا پیش از شروع سانس می‌توانید لغو کنید.'}
            </p>
          </div>
        )}

        {venue.rules && (
          <p style={{ margin: 0, padding: S.s3, borderRadius: S.r1, fontSize: 11, lineHeight: 1.9, background: alpha(C.amber, 8), color: C.text, border: `1px solid ${alpha(C.amber, 20)}` }}>
            {venue.rules}
          </p>
        )}

        {!session && !!rules?.minNoticeHours && (
          <p style={{ margin: 0, fontSize: 11, color: C.muted, lineHeight: 1.9 }}>
            رزرو هر سانس تا {fa(rules.minNoticeHours)} ساعت پیش از شروع آن ممکن است.
          </p>
        )}

        {error && (
          <p style={{ margin: 0, padding: S.s3, borderRadius: S.r1, fontSize: S.xs, lineHeight: 1.9, background: alpha(C.statusDanger, 10), color: C.statusDanger, border: `1px solid ${alpha(C.statusDanger, 22)}` }}>
            {error}
          </p>
        )}

        <div style={{ display: 'flex', gap: S.s2 }}>
          <Btn full onClick={book} disabled={!session || busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : payment === 'wallet' ? <Wallet className="h-4 w-4" /> : <Ticket className="h-4 w-4" />}
            {session?.price ? (payment === 'wallet' ? 'پرداخت و رزرو' : 'رزرو و پرداخت در محل') : 'رزرو'}
          </Btn>
          <Btn variant="ghost" onClick={onClose}>انصراف</Btn>
        </div>
      </div>
    </Modal>
  );
}
