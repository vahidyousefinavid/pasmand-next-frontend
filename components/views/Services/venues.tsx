'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Cookies from 'js-cookie';
import moment from 'jalali-moment';
import { CalendarCheck, Loader2, MapPin, Ticket, Wallet } from 'lucide-react';

import { axiosService } from '@/lib/axiosService';
import { useToast } from '@/hooks/use-toast';
import { C, S, alpha, fa } from '@/components/ui/tokens';
import { Btn, Card, EmptyState, Hero, IconBadge, Modal, Screen, Segmented, Shimmer } from '@/components/ui/kit';
import { BOOKING_STATUS, VENUE_KINDS } from '@/lib/cityServices';

/**
 * رزرو اماکن.
 *
 * Booking a hall is one question — «کدام ساعت خالی است؟» — so the screen is
 * built around the answer: pick a day from the next fortnight, see the windows,
 * take one. Nothing is a form field that could be a tap.
 *
 * Payment is the citizen's choice between the wallet they already have and
 * paying at the door, because a municipality's hall is often settled in person
 * and pretending otherwise would strand anybody without a balance.
 */

interface Slot { _id: string; from: string; to: string; price: number; available: boolean }
interface Venue {
  _id: string; title: string; kind: string; description: string; address: string;
  price: number; capacity?: number; needsApproval: boolean; photos: string[];
  slots: { _id: string; from: string; to: string }[];
}
interface Booking {
  _id: string; code: string; date: string; from: string; to: string; amount: number;
  payment: 'wallet' | 'onsite'; status: keyof typeof BOOKING_STATUS; rejectionReason?: string;
  venue?: { title: string; kind: string; address: string };
}

const TONE: Record<string, string> = {
  wait: C.statusWarn, work: C.statusInfo, done: C.statusOk, stop: C.statusNeutral,
};

/** The next fortnight, which is as far ahead as anybody books a local hall. */
function nextDays(count = 14) {
  const today = moment().locale('fa');
  return Array.from({ length: count }, (_, i) => {
    const day = today.clone().add(i, 'day');
    return {
      value: day.format('YYYY/MM/DD').replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]),
      weekday: day.format('dddd'),
      day: day.format('D').replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]),
      month: day.format('MMMM'),
      isToday: i === 0,
    };
  });
}

export default function VenuesPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState<'browse' | 'mine'>('browse');

  /**
   * A booking decision links straight to the citizen's own bookings. Read
   * after mounting, never during render — the server has no query string to
   * read and the two would disagree.
   */
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('tab') === 'mine') setTab('mine');
  }, []);

  const [venues, setVenues] = useState<Venue[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState('');
  const [open, setOpen] = useState<Venue | null>(null);

  const token = () => Cookies.get('auth_token');

  const load = useCallback(() => {
    Promise.all([
      axiosService({ url: '/api/v1/venues', method: 'get', token: token() })
        .then((res: any) => setVenues(res?.data?.venues || [])),
      axiosService({ url: '/api/v1/bookings', method: 'get', token: token() })
        .then((res: any) => setBookings(res?.data?.bookings || [])),
    ])
      .then(() => setBlocked(''))
      .catch((err: any) => setBlocked(err?.data?.message || 'دریافت اطلاعات انجام نشد.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const cancel = (booking: Booking) => {
    axiosService({ url: `/api/v1/bookings/${booking._id}/cancel`, method: 'post', token: token() })
      .then((res: any) => {
        toast({ variant: 'success', title: 'لغو شد', description: res?.data?.message || 'رزرو لغو شد.' });
        load();
      })
      .catch((err: any) => toast({ variant: 'destructive', title: 'ناموفق', description: err?.data?.message || 'لغو انجام نشد.' }));
  };

  const upcoming = bookings.filter((b) => ['pending', 'confirmed'].includes(b.status)).length;

  return (
    <>
      <Screen>
        <Hero
          icon={<CalendarCheck className="h-6 w-6" />}
          title="رزرو اماکن"
          sub="سالن‌های ورزشی، فرهنگسراها و غرفه‌های بازارچه — ساعت خالی را ببینید و همان‌جا رزرو کنید."
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

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: S.s2 }}>
                {[0, 1].map((i) => <Shimmer key={i} height={110} />)}
              </div>
            ) : tab === 'browse' ? (
              venues.length === 0 ? (
                <EmptyState icon={<CalendarCheck className="h-6 w-6" />} title="هنوز مکانی ثبت نشده" sub="شهرداری به‌زودی اماکن قابل رزرو را این‌جا منتشر می‌کند." />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: S.s2 }}>
                  {venues.map((venue, i) => (
                    <div key={venue._id} className="pm-fade-up" style={{ animationDelay: `${Math.min(i, 6) * 35}ms` }}>
                      <Card onClick={() => setOpen(venue)}>
                        <div style={{ padding: `${S.s3}px ${S.s4}px`, display: 'flex', gap: S.s3, alignItems: 'center' }}>
                          <IconBadge color={C.violet} size={48}><CalendarCheck className="h-5 w-5" /></IconBadge>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: S.sm, fontWeight: 800, color: C.textStrong }}>{venue.title}</p>
                            <p style={{ margin: '4px 0 0', fontSize: S.xs, color: C.muted }}>
                              {VENUE_KINDS[venue.kind] || 'مکان'}{venue.address ? ` · ${venue.address}` : ''}
                            </p>
                          </div>
                          <span className="tnum" style={{ flexShrink: 0, textAlign: 'start' }}>
                            <span style={{ display: 'block', fontSize: S.sm, fontWeight: 800, color: C.textStrong }}>
                              {venue.price ? fa(venue.price) : 'رایگان'}
                            </span>
                            {!!venue.price && <span style={{ display: 'block', fontSize: 10, color: C.muted }}>تومان / هر نوبت</span>}
                          </span>
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>
              )
            ) : bookings.length === 0 ? (
              <EmptyState icon={<Ticket className="h-6 w-6" />} title="رزروی ندارید" sub="از فهرست اماکن، ساعت دلخواهتان را رزرو کنید." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: S.s2 }}>
                {bookings.map((booking) => {
                  const status = BOOKING_STATUS[booking.status] || BOOKING_STATUS.pending;
                  const colour = TONE[status.tone];
                  const cancellable = ['pending', 'confirmed'].includes(booking.status);
                  return (
                    <Card key={booking._id}>
                      <div style={{ padding: S.s4, display: 'flex', flexDirection: 'column', gap: S.s3 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: S.s3 }}>
                          <IconBadge color={colour} size={44}><Ticket className="h-5 w-5" /></IconBadge>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: S.sm, fontWeight: 800, color: C.textStrong }}>
                              {booking.venue?.title || 'مکان'}
                            </p>
                            <p className="tnum" style={{ margin: '4px 0 0', fontSize: S.xs, color: C.muted }}>
                              {booking.date} · {booking.from} تا {booking.to}
                            </p>
                          </div>
                          <span
                            style={{
                              flexShrink: 0, fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: S.rPill,
                              background: alpha(colour, 12), color: colour, border: `1px solid ${alpha(colour, 24)}`,
                            }}
                          >
                            {status.label}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: S.s3, flexWrap: 'wrap', fontSize: S.xs, color: C.muted }}>
                          <span className="tnum">کد <span dir="ltr">{fa(booking.code)}</span></span>
                          <span className="tnum">
                            {booking.amount ? `${fa(booking.amount)} تومان` : 'رایگان'}
                            {booking.amount ? (booking.payment === 'wallet' ? ' — پرداخت‌شده از کیف پول' : ' — پرداخت در محل') : ''}
                          </span>
                          {cancellable && (
                            <button
                              type="button"
                              onClick={() => cancel(booking)}
                              style={{
                                marginInlineStart: 'auto', padding: '7px 14px', borderRadius: S.rPill, cursor: 'pointer',
                                fontFamily: 'inherit', fontSize: S.xs, fontWeight: 800,
                                background: alpha(C.statusDanger, 8), color: C.statusDanger,
                                border: `1px solid ${alpha(C.statusDanger, 22)}`,
                              }}
                            >
                              لغو رزرو
                            </button>
                          )}
                        </div>

                        {booking.rejectionReason && (
                          <p style={{ margin: 0, fontSize: S.xs, color: C.statusDanger }}>{booking.rejectionReason}</p>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </Screen>

      {open && (
        <BookingSheet
          venue={open}
          onClose={() => setOpen(null)}
          onBooked={(message) => {
            setOpen(null);
            setTab('mine');
            toast({ variant: 'success', title: 'ثبت شد', description: message });
            load();
          }}
        />
      )}
    </>
  );
}

function BookingSheet({
  venue, onClose, onBooked,
}: {
  venue: Venue;
  onClose: () => void;
  onBooked: (message: string) => void;
}) {
  const days = useMemo(() => nextDays(), []);
  const [date, setDate] = useState(days[0].value);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [payment, setPayment] = useState<'wallet' | 'onsite'>('onsite');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setSlot(null);
    axiosService({
      url: `/api/v1/venues/${venue._id}/availability`,
      method: 'get',
      params: { date },
      token: Cookies.get('auth_token'),
    })
      .then((res: any) => setSlots(res?.data?.slots || []))
      .catch(() => setSlots([]))
      .finally(() => setLoading(false));
  }, [venue._id, date]);

  const book = () => {
    if (!slot) return;
    setBusy(true);
    setError('');
    axiosService({
      url: '/api/v1/bookings',
      method: 'post',
      token: Cookies.get('auth_token'),
      body: { venue: venue._id, date, from: slot.from, payment },
    })
      .then((res: any) => onBooked(res?.data?.message || 'رزرو ثبت شد.'))
      .catch((err: any) => setError(err?.data?.message || 'رزرو انجام نشد.'))
      .finally(() => setBusy(false));
  };

  return (
    <Modal onClose={onClose} wide>
      <div style={{ padding: S.s5, display: 'flex', flexDirection: 'column', gap: S.s4 }}>
        <div>
          <p style={{ margin: 0, fontSize: S.md, fontWeight: 800, color: C.textStrong }}>{venue.title}</p>
          <p style={{ margin: '5px 0 0', fontSize: S.xs, color: C.muted }}>
            {VENUE_KINDS[venue.kind] || 'مکان'}
            {venue.capacity ? ` · ظرفیت ${fa(venue.capacity)} نفر` : ''}
          </p>
        </div>

        {venue.description && <p style={{ margin: 0, fontSize: S.sm, color: C.text, lineHeight: 2 }}>{venue.description}</p>}

        {venue.address && (
          <p style={{ margin: 0, display: 'flex', gap: 7, fontSize: S.xs, color: C.muted }}>
            <MapPin className="h-4 w-4" style={{ color: C.green, flexShrink: 0 }} />
            {venue.address}
          </p>
        )}

        {/* The fortnight, as taps. */}
        <div>
          <p style={{ margin: `0 0 ${S.s2}px`, fontSize: S.xs, fontWeight: 700, color: C.muted }}>روز را انتخاب کنید</p>
          <div className="pm-scroll-x" style={{ display: 'flex', gap: 7, paddingBottom: 4 }}>
            {days.map((day) => {
              const on = day.value === date;
              return (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => setDate(day.value)}
                  style={{
                    flexShrink: 0, width: 68, padding: '9px 0', borderRadius: S.r2, cursor: 'pointer',
                    fontFamily: 'inherit', display: 'grid', gap: 3, justifyItems: 'center',
                    background: on ? C.green : C.surface2,
                    color: on ? C.onAccent : C.text,
                    border: `1px solid ${on ? C.green : C.border}`,
                  }}
                >
                  <span style={{ fontSize: 10, opacity: 0.85 }}>{day.isToday ? 'امروز' : day.weekday}</span>
                  <span className="tnum" style={{ fontSize: S.base, fontWeight: 800 }}>{day.day}</span>
                  <span style={{ fontSize: 10, opacity: 0.85 }}>{day.month}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p style={{ margin: `0 0 ${S.s2}px`, fontSize: S.xs, fontWeight: 700, color: C.muted }}>ساعت</p>
          {loading ? (
            <Shimmer height={54} />
          ) : slots.length === 0 ? (
            <p style={{ margin: 0, fontSize: S.xs, color: C.muted }}>برای این مکان ساعتی تعریف نشده است.</p>
          ) : (
            <div style={{ display: 'grid', gap: 7, gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}>
              {slots.map((item) => {
                const on = slot?._id === item._id;
                return (
                  <button
                    key={item._id}
                    type="button"
                    disabled={!item.available}
                    onClick={() => setSlot(item)}
                    style={{
                      padding: '11px 8px', borderRadius: S.r1, fontFamily: 'inherit',
                      cursor: item.available ? 'pointer' : 'not-allowed',
                      fontSize: S.xs, fontWeight: 800,
                      background: on ? C.green : item.available ? C.surface2 : C.bgSubtle,
                      color: on ? C.onAccent : item.available ? C.text : C.subtle,
                      border: `1px solid ${on ? C.green : C.border}`,
                      textDecoration: item.available ? 'none' : 'line-through',
                    }}
                  >
                    <span className="tnum">{item.from} تا {item.to}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {slot && slot.price > 0 && (
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

        {slot && (
          <div
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: S.s3,
              padding: S.s3, borderRadius: S.r2, background: C.surface2, border: `1px solid ${C.border}`,
            }}
          >
            <span className="tnum" style={{ fontSize: S.xs, color: C.muted }}>{date} · {slot.from} تا {slot.to}</span>
            <span className="tnum" style={{ fontSize: S.base, fontWeight: 800, color: C.textStrong }}>
              {slot.price ? `${fa(slot.price)} تومان` : 'رایگان'}
            </span>
          </div>
        )}

        {venue.needsApproval && (
          <p style={{ margin: 0, fontSize: 11, color: C.muted, lineHeight: 1.9 }}>
            این مکان پس از تأیید شهرداری قطعی می‌شود؛ تا آن زمان ساعت برای شما نگه داشته می‌شود.
          </p>
        )}

        {error && (
          <p style={{ margin: 0, padding: S.s3, borderRadius: S.r1, fontSize: S.xs, lineHeight: 1.9, background: alpha(C.statusDanger, 10), color: C.statusDanger, border: `1px solid ${alpha(C.statusDanger, 22)}` }}>
            {error}
          </p>
        )}

        <div style={{ display: 'flex', gap: S.s2 }}>
          <Btn full onClick={book} disabled={!slot || busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : payment === 'wallet' ? <Wallet className="h-4 w-4" /> : <Ticket className="h-4 w-4" />}
            {slot?.price ? (payment === 'wallet' ? 'پرداخت و رزرو' : 'رزرو و پرداخت در محل') : 'رزرو'}
          </Btn>
          <Btn variant="ghost" onClick={onClose}>انصراف</Btn>
        </div>
      </div>
    </Modal>
  );
}
