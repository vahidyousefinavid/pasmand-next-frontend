'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import {
  AlertTriangle, Armchair, CalendarCheck, Check, Clock3, Loader2, MapPin, Phone, Ticket, Wallet, X,
} from 'lucide-react';

import { axiosService } from '@/lib/axiosService';
import { C, S, alpha, fa } from '@/components/ui/tokens';
import { Btn, Modal, Shimmer } from '@/components/ui/kit';
import { BOOKING_STATUS } from '@/lib/cityServices';
import { faDigits, jalaliDateTime } from '@/lib/when';

/**
 * یک رزرو، باز.
 *
 * Until now a booking was a row in a list and nothing else: the tracking code
 * was a line of small print, the address of the place was not there at all, and
 * whether it could still be cancelled was a guess the button made on its own.
 * A person standing at the door of a سالن with their phone out needs the
 * opposite of a row — the code large enough to read across a desk, the seat
 * they were given, the telephone of the place, and what the municipality said.
 *
 * The shape is a ticket on purpose: two halves and a perforation, the object
 * this replaces. Everything on it comes from `GET /api/v1/bookings/:id`,
 * including whether «لغو رزرو» may be pressed and whether the money would come
 * back — the same answer the API will give, because it is the same computation.
 */

export interface BookingDetail {
  _id: string;
  code: string;
  codeText: string;
  date: string;
  say: string;
  ahead: number;
  from: string;
  to: string;
  seat?: number;
  audience?: string;
  audienceTitle?: string;
  sessionLabel?: string;
  amount: number;
  payment: 'wallet' | 'onsite';
  status: keyof typeof BOOKING_STATUS;
  rejectionReason?: string;
  note?: string;
  kindTitle?: string;
  venue?: {
    _id?: string; title: string; kind?: string; address?: string; phone?: string;
    rules?: string; photos?: string[]; needsApproval?: boolean;
  };
  policy?: {
    cancellable: boolean; refundable: boolean; reason?: string; note?: string;
    hoursToStart: number | null; deadlineHours: number;
  };
  timeline?: { key: string; title: string; at: string; note?: string }[];
}

const TONE: Record<string, string> = {
  wait: C.statusWarn, work: C.statusInfo, done: C.statusOk, stop: C.statusNeutral,
};

/** «۳ روز دیگر» / «فردا» / «امروز» / «گذشته» — the distance in words. */
function whenText(ahead: number | undefined) {
  if (ahead === undefined || ahead === null) return '';
  if (ahead < 0) return 'برگزار شده';
  if (ahead === 0) return 'امروز';
  if (ahead === 1) return 'فردا';
  return `${fa(ahead)} روز دیگر`;
}

function Row({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: React.ReactNode; tone?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: S.s3 }}>
      <span style={{ color: tone || C.green, flexShrink: 0, marginTop: 2 }}>{icon}</span>
      <span style={{ minWidth: 0, flex: 1 }}>
        <span style={{ display: 'block', fontSize: 10, color: C.subtle, fontWeight: 700 }}>{label}</span>
        <span style={{ display: 'block', marginTop: 2, fontSize: S.sm, color: C.textStrong, fontWeight: 700, lineHeight: 1.8 }}>
          {value}
        </span>
      </span>
    </div>
  );
}

export default function BookingSheet({
  id,
  onClose,
  onChanged,
}: {
  id: string;
  onClose: () => void;
  /** The list behind this sheet has to hear about a cancellation. */
  onChanged: (message: string) => void;
}) {
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    setLoading(true);
    axiosService({ url: `/api/v1/bookings/${id}`, method: 'get', token: Cookies.get('auth_token') })
      .then((res: any) => setBooking(res?.data?.booking || null))
      .catch((err: any) => setError(err?.data?.message || 'این رزرو باز نشد.'))
      .finally(() => setLoading(false));
  }, [id]);

  const cancel = () => {
    setBusy(true);
    setError('');
    axiosService({ url: `/api/v1/bookings/${id}/cancel`, method: 'post', token: Cookies.get('auth_token') })
      .then((res: any) => onChanged(res?.data?.message || 'رزرو لغو شد.'))
      .catch((err: any) => {
        setError(err?.data?.message || 'لغو انجام نشد.');
        setConfirming(false);
      })
      .finally(() => setBusy(false));
  };

  const status = booking ? BOOKING_STATUS[booking.status] || BOOKING_STATUS.pending : null;
  const colour = status ? TONE[status.tone] : C.green;
  const policy = booking?.policy;

  return (
    <Modal onClose={onClose}>
      {loading ? (
        <div style={{ padding: S.s5, display: 'flex', flexDirection: 'column', gap: S.s3 }}>
          <Shimmer height={120} />
          <Shimmer height={80} />
        </div>
      ) : !booking ? (
        <div style={{ padding: S.s5, display: 'flex', flexDirection: 'column', gap: S.s4 }}>
          <p style={{ margin: 0, fontSize: S.sm, color: C.statusDanger }}>{error || 'این رزرو یافت نشد.'}</p>
          <Btn variant="ghost" onClick={onClose}>بستن</Btn>
        </div>
      ) : (
        <div style={{ padding: S.s4, display: 'flex', flexDirection: 'column', gap: S.s3 }}>
          {/* ── header ── */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: S.s3 }}>
            <span
              style={{
                width: 42, height: 42, borderRadius: 14, display: 'grid', placeItems: 'center', flexShrink: 0,
                background: alpha(colour, 12), color: colour, border: `1px solid ${alpha(colour, 24)}`,
              }}
            >
              <Ticket className="h-5 w-5" />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: S.base, fontWeight: 800, color: C.textStrong }}>
                {booking.venue?.title || 'رزرو'}
              </p>
              <p style={{ margin: '3px 0 0', fontSize: S.xs, color: C.muted }}>
                {booking.kindTitle || 'مکان'}
                {booking.sessionLabel ? ` · ${booking.sessionLabel}` : ''}
              </p>
            </div>
            <span
              style={{
                flexShrink: 0, fontSize: 10, fontWeight: 800, padding: '5px 11px', borderRadius: S.rPill,
                background: alpha(colour, 12), color: colour, border: `1px solid ${alpha(colour, 24)}`,
              }}
            >
              {status?.label}
            </span>
          </div>

          {/* ── the ticket ──
              One object, split by a perforation: when and where above, the
              number they will be asked for below. */}
          <div style={{ borderRadius: S.r3, border: `1px solid ${C.border}`, background: C.surface2, overflow: 'hidden' }}>
            <div style={{ padding: S.s4, display: 'grid', gap: S.s3 }}>
              <Row
                icon={<CalendarCheck className="h-4 w-4" />}
                label="روز"
                value={
                  <>
                    {booking.say || booking.date}
                    {booking.ahead !== undefined && (
                      <span style={{ marginInlineStart: 8, fontSize: 10, fontWeight: 800, color: booking.ahead >= 0 ? C.green : C.subtle }}>
                        {whenText(booking.ahead)}
                      </span>
                    )}
                  </>
                }
              />
              <Row
                icon={<Clock3 className="h-4 w-4" />}
                label="ساعت"
                value={<span className="tnum">{booking.from} تا {booking.to}</span>}
              />
              {(booking.seat || 0) > 0 && (
                <Row
                  icon={<Armchair className="h-4 w-4" />}
                  label="شمارهٔ جای شما"
                  value={<span className="tnum">{fa(booking.seat!)}</span>}
                />
              )}
              <Row
                icon={<Wallet className="h-4 w-4" />}
                label="مبلغ"
                value={
                  <span className="tnum">
                    {booking.amount ? `${fa(booking.amount)} تومان` : 'رایگان'}
                    <span style={{ marginInlineStart: 8, fontSize: 10, fontWeight: 700, color: C.muted }}>
                      {booking.amount
                        ? booking.payment === 'wallet'
                          ? 'پرداخت‌شده از کیف پول'
                          : 'پرداخت در محل'
                        : ''}
                    </span>
                  </span>
                }
              />
            </div>

            {/* The perforation. */}
            <div style={{ position: 'relative', height: 1, background: `repeating-linear-gradient(90deg, ${C.border} 0 6px, transparent 6px 12px)` }} />

            <div style={{ padding: `${S.s3}px ${S.s4}px ${S.s4}px`, textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: 10, color: C.subtle, fontWeight: 700 }}>کد پیگیری</p>
              <p
                className="tnum"
                dir="ltr"
                style={{ margin: '6px 0 0', fontSize: S.lg, fontWeight: 800, color: C.textStrong, letterSpacing: '0.06em' }}
              >
                {booking.codeText || faDigits(booking.code)}
              </p>
              <p style={{ margin: '6px 0 0', fontSize: 10, color: C.muted }}>
                این کد را هنگام ورود اعلام کنید.
              </p>
            </div>
          </div>

          {/* ── where, and how to ask ── */}
          {(booking.venue?.address || booking.venue?.phone) && (
            <div style={{ display: 'grid', gap: S.s3, padding: S.s3, borderRadius: S.r2, border: `1px solid ${C.border}` }}>
              {booking.venue?.address && (
                <Row icon={<MapPin className="h-4 w-4" />} label="نشانی" value={booking.venue.address} />
              )}
              {booking.venue?.phone && (
                <Row
                  icon={<Phone className="h-4 w-4" />}
                  label="تلفن مکان"
                  value={
                    <a
                      href={`tel:${booking.venue.phone}`}
                      dir="ltr"
                      className="tnum"
                      style={{ color: C.green, fontWeight: 800, textDecoration: 'none' }}
                    >
                      {faDigits(booking.venue.phone)}
                    </a>
                  }
                />
              )}
            </div>
          )}

          {booking.audienceTitle && booking.audience !== 'all' && (
            <p style={{ margin: 0, fontSize: S.xs, color: C.muted }}>
              این سانس <strong style={{ color: C.textStrong }}>{booking.audienceTitle}</strong> است.
            </p>
          )}

          {booking.rejectionReason && (
            <p
              style={{
                margin: 0, padding: S.s3, borderRadius: S.r1, fontSize: S.xs, lineHeight: 1.9,
                background: alpha(C.statusDanger, 8), color: C.statusDanger,
                border: `1px solid ${alpha(C.statusDanger, 20)}`,
              }}
            >
              {booking.rejectionReason}
            </p>
          )}

          {booking.venue?.rules && (
            <p
              style={{
                margin: 0, padding: S.s3, borderRadius: S.r1, fontSize: 11, lineHeight: 1.9,
                background: alpha(C.amber, 8), color: C.text, border: `1px solid ${alpha(C.amber, 20)}`,
              }}
            >
              {booking.venue.rules}
            </p>
          )}

          {/* ── what happened, in order ── */}
          {!!booking.timeline?.length && (
            <div style={{ display: 'grid', gap: 8 }}>
              {booking.timeline.map((step) => (
                <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: S.s2 }}>
                  <span
                    aria-hidden
                    style={{
                      width: 18, height: 18, borderRadius: '50%', display: 'grid', placeItems: 'center', flexShrink: 0,
                      background: alpha(C.green, 12), color: C.green,
                    }}
                  >
                    <Check className="h-3 w-3" />
                  </span>
                  <span style={{ fontSize: S.xs, color: C.text, fontWeight: 700 }}>{step.title}</span>
                  <span className="tnum" style={{ marginInlineStart: 'auto', fontSize: 10, color: C.subtle }}>
                    {jalaliDateTime(step.at)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* ── the policy, and the only action there is ── */}
          {policy?.note && (
            <p style={{ margin: 0, fontSize: 11, color: C.muted, lineHeight: 1.9 }}>{policy.note}</p>
          )}

          {error && (
            <p
              style={{
                margin: 0, padding: S.s3, borderRadius: S.r1, fontSize: S.xs, lineHeight: 1.9,
                background: alpha(C.statusDanger, 10), color: C.statusDanger,
                border: `1px solid ${alpha(C.statusDanger, 22)}`,
              }}
            >
              {error}
            </p>
          )}

          {policy?.cancellable ? (
            confirming ? (
              <div style={{ display: 'grid', gap: S.s2, padding: S.s3, borderRadius: S.r2, background: alpha(C.statusDanger, 6), border: `1px solid ${alpha(C.statusDanger, 20)}` }}>
                <p style={{ margin: 0, display: 'flex', gap: 7, fontSize: S.xs, color: C.text, lineHeight: 1.9 }}>
                  <AlertTriangle className="h-4 w-4" style={{ color: C.statusDanger, flexShrink: 0 }} />
                  {policy.refundable
                    ? `این رزرو لغو می‌شود${booking.amount && booking.payment === 'wallet' ? ` و ${fa(booking.amount)} تومان به کیف پول شما بازمی‌گردد` : ''}.`
                    : 'این رزرو لغو می‌شود، ولی به دلیل نزدیکی به زمان شروع مبلغ بازنمی‌گردد.'}
                </p>
                <div style={{ display: 'flex', gap: S.s2 }}>
                  <Btn full onClick={cancel} disabled={busy}>
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                    بله، لغو کن
                  </Btn>
                  <Btn variant="ghost" onClick={() => setConfirming(false)}>پشیمان شدم</Btn>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                style={{
                  padding: '12px 16px', borderRadius: S.r2, cursor: 'pointer', fontFamily: 'inherit',
                  fontSize: S.sm, fontWeight: 800,
                  background: alpha(C.statusDanger, 8), color: C.statusDanger,
                  border: `1px solid ${alpha(C.statusDanger, 22)}`,
                }}
              >
                لغو رزرو
              </button>
            )
          ) : (
            policy?.reason && (
              <p style={{ margin: 0, fontSize: 11, color: C.subtle, lineHeight: 1.9 }}>{policy.reason}</p>
            )
          )}

          <Btn variant="ghost" full onClick={onClose}>بستن</Btn>
        </div>
      )}
    </Modal>
  );
}
