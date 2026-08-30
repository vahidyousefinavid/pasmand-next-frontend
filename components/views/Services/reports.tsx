'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Cookies from 'js-cookie';
import 'leaflet/dist/leaflet.css';
import {
  Camera, CheckCircle2, Loader2, MapPin, Megaphone, Star, X,
} from 'lucide-react';

import { axiosService } from '@/lib/axiosService';
import { useToast } from '@/hooks/use-toast';
import { useCity } from '@/context/data-context';
import { C, S, alpha, fa } from '@/components/ui/tokens';
import { Btn, Card, EmptyState, Field, Hero, IconBadge, Modal, Screen, Shimmer } from '@/components/ui/kit';
import { REPORT_CATEGORIES, REPORT_STATUS } from '@/lib/cityServices';
import { faDigits, jalaliDateTime, relative } from '@/lib/when';

/**
 * سامانهٔ ۱۳۷ — the citizen's side.
 *
 * A report is three things and the form asks for them in that order: what is
 * wrong, where it is, and what it looks like. The map is not optional — a
 * report the municipality cannot dispatch anybody to is a complaint — and the
 * camera is one tap because the photograph is what makes it undeniable.
 *
 * Afterwards the same screen is the tracking screen: every answer the
 * municipality writes lands in the report's own thread, and once it is closed
 * the citizen is asked what they thought. That last part is the only honest
 * measure of whether ۱۳۷ works.
 */

const MapPicker = dynamic(() => import('@/components/views/NewRequest/steps/map-component'), {
  ssr: false,
  loading: () => (
    <div style={{ height: '100%', display: 'grid', placeItems: 'center', background: C.surface2, color: C.muted, fontSize: S.xs }}>
      در حال بارگذاری نقشه…
    </div>
  ),
});

interface Report {
  _id: string;
  code: string;
  title: string;
  description: string;
  category: string;
  status: keyof typeof REPORT_STATUS;
  isUrgent: boolean;
  assignedName?: string;
  photos: string[];
  location: { lat: number; lng: number; address: string };
  responses: { _id: string; text: string; status: string; byName: string; at: string }[];
  rating?: { stars: number; comment: string };
  createdAt: string;
}

const TONE: Record<string, string> = {
  wait: C.statusWarn,
  work: C.statusInfo,
  done: C.statusOk,
  stop: C.statusNeutral,
};

const statusColour = (status: string) => TONE[REPORT_STATUS[status]?.tone || 'wait'];

export default function ReportsPage() {
  const { toast } = useToast();
  const { selectedCity } = useCity();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState('');
  const [composing, setComposing] = useState(false);
  const [open, setOpen] = useState<Report | null>(null);

  const token = () => Cookies.get('auth_token');


  /**
   * Opened from a notification: the link carries the row's id, and the sheet
   * for it goes up as soon as the list arrives.
   */
  const openFromLink = (rows: Report[]) => {
    const wanted = new URLSearchParams(window.location.search).get('open');
    const row = wanted ? rows.find((r) => r._id === wanted) : null;
    if (row) setOpen(row);
  };

  const load = useCallback(() => {
    axiosService({ url: '/api/v1/reports', method: 'get', token: token() })
      .then((res: any) => { setReports(res?.data?.reports || []); setBlocked(''); openFromLink(res?.data?.reports || []); })
      .catch((err: any) => setBlocked(err?.data?.message || 'دریافت گزارش‌ها انجام نشد.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const openCount = reports.filter((r) => !['done', 'rejected'].includes(r.status)).length;

  return (
    <>
      <Screen>
        <Hero
          icon={<Megaphone className="h-6 w-6" />}
          title="سامانهٔ ۱۳۷"
          sub="هر مشکلی در شهر دیدید این‌جا ثبت کنید — با عکس و محل دقیق. تا رفع شدن، پیگیری‌اش همین‌جاست."
          aside={
            <div style={{ textAlign: 'start' }}>
              <p style={{ margin: 0, fontSize: S.xs, color: C.onHeroMuted, fontWeight: 600 }}>در حال پیگیری</p>
              <p className="tnum" style={{ margin: '6px 0 0', fontSize: S.xl, fontWeight: 800 }}>
                {loading ? '…' : fa(openCount)}
              </p>
            </div>
          }
        />

        {blocked ? (
          <EmptyState icon={<Megaphone className="h-6 w-6" />} title="این خدمت در دسترس نیست" sub={blocked} />
        ) : (
          <>
            <Btn full onClick={() => setComposing(true)}>
              <Megaphone className="h-4 w-4" />
              ثبت گزارش تازه
            </Btn>

            <p style={{ margin: `${S.s6}px 0 ${S.s3}px`, fontSize: S.md, fontWeight: 800, color: C.textStrong }}>
              گزارش‌های من
            </p>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: S.s2 }}>
                {[0, 1, 2].map((i) => <Shimmer key={i} height={92} />)}
              </div>
            ) : reports.length === 0 ? (
              <EmptyState
                icon={<Megaphone className="h-6 w-6" />}
                title="هنوز گزارشی ثبت نکرده‌اید"
                sub="سد معبر، چالهٔ آسفالت، چراغ خاموش یا زبالهٔ رهاشده — هر کدام را دیدید، عکس بگیرید و ثبت کنید."
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: S.s2 }}>
                {reports.map((report, i) => {
                  const status = REPORT_STATUS[report.status] || REPORT_STATUS.received;
                  const colour = statusColour(report.status);
                  return (
                    <div key={report._id} className="pm-fade-up" style={{ animationDelay: `${Math.min(i, 6) * 35}ms` }}>
                      <Card onClick={() => setOpen(report)} accent={report.isUrgent ? C.statusDanger : undefined}>
                        <div style={{ padding: `${S.s3}px ${S.s4}px`, display: 'flex', gap: S.s3, alignItems: 'center' }}>
                          {report.photos[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={report.photos[0]}
                              alt=""
                              style={{ width: 52, height: 52, borderRadius: 14, objectFit: 'cover', flexShrink: 0 }}
                            />
                          ) : (
                            <IconBadge color={colour} size={52}><Megaphone className="h-5 w-5" /></IconBadge>
                          )}

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: S.sm, fontWeight: 800, color: C.textStrong, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {report.title}
                            </p>
                            <p className="tnum" style={{ margin: '4px 0 0', fontSize: S.xs, color: C.muted }}>
                              <span dir="ltr">{faDigits(report.code)}</span> · {relative(report.createdAt)}
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
                      </Card>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </Screen>

      {composing && (
        <ReportForm
          city={selectedCity}
          onClose={() => setComposing(false)}
          onDone={(message) => {
            setComposing(false);
            toast({ variant: 'success', title: 'ثبت شد', description: message });
            load();
          }}
        />
      )}

      {open && (
        <ReportSheet
          report={open}
          onClose={() => setOpen(null)}
          onRated={(message) => {
            setOpen(null);
            toast({ variant: 'success', title: 'سپاسگزاریم', description: message });
            load();
          }}
        />
      )}
    </>
  );
}

/* ── the form ────────────────────────────────────────────────────────────── */

function ReportForm({
  city, onClose, onDone,
}: {
  city: { lat?: number; lng?: number; name?: string } | null;
  onClose: () => void;
  onDone: (message: string) => void;
}) {
  const [category, setCategory] = useState('obstruction');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [point, setPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // The city's own centre, so the map opens where the citizen is rather than in
  // the middle of the country.
  const centre = useMemo(
    () => ({ lat: Number(city?.lat) || 34.1884, lng: Number(city?.lng) || 48.3714 }),
    [city],
  );

  const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);
  useEffect(() => () => previews.forEach(URL.revokeObjectURL), [previews]);

  const pick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const chosen = Array.from(event.target.files || []).slice(0, 4 - files.length);
    setFiles((current) => [...current, ...chosen].slice(0, 4));
    event.target.value = '';
  };

  const submit = () => {
    if (!title.trim()) { setError('عنوان گزارش را بنویسید.'); return; }
    if (!point) { setError('محل گزارش را روی نقشه مشخص کنید.'); return; }

    setBusy(true);
    setError('');

    // Multipart, because the photographs travel with the fields.
    const form = new FormData();
    form.append('title', title.trim());
    form.append('description', description.trim());
    form.append('category', category);
    form.append('lat', String(point.lat));
    form.append('lng', String(point.lng));
    form.append('address', address.trim());
    files.forEach((file) => form.append('photos', file));

    axiosService({
      url: '/api/v1/reports',
      method: 'post',
      isFormData: true,
      token: Cookies.get('auth_token'),
      body: form as any,
    })
      .then((res: any) => onDone(res?.data?.message || 'گزارش ثبت شد.'))
      .catch((err: any) => setError(err?.data?.message || 'ثبت گزارش انجام نشد.'))
      .finally(() => setBusy(false));
  };

  return (
    <Modal onClose={onClose} wide>
      <div style={{ padding: S.s5, display: 'flex', flexDirection: 'column', gap: S.s4 }}>
        <p style={{ margin: 0, fontSize: S.md, fontWeight: 800, color: C.textStrong }}>ثبت گزارش تازه</p>

        <Field label="موضوع گزارش">
          <div className="pm-scroll-x" style={{ display: 'flex', gap: 7, paddingBottom: 4 }}>
            {REPORT_CATEGORIES.map((item) => {
              const on = item.key === category;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setCategory(item.key)}
                  style={{
                    flexShrink: 0, padding: '9px 15px', borderRadius: S.rPill, cursor: 'pointer',
                    fontFamily: 'inherit', fontSize: S.xs, fontWeight: 800, whiteSpace: 'nowrap',
                    background: on ? C.green : C.surface2,
                    color: on ? C.onAccent : C.muted,
                    border: `1px solid ${on ? C.green : C.border}`,
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="در یک جمله چه دیده‌اید؟">
          <input className="pm-field" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} placeholder="مثلاً مصالح ساختمانی روی پیاده‌رو" />
        </Field>

        <Field label="توضیح بیشتر (اختیاری)">
          <textarea className="pm-field" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={2000} rows={3} />
        </Field>

        <Field label="محل دقیق" hint="روی نقشه بزنید تا نقطه ثبت شود.">
          <div style={{ height: 240, borderRadius: S.r2, overflow: 'hidden', border: `1px solid ${C.border}` }}>
            <MapPicker
              center={centre}
              selectedLocation={point}
              onLocationSelect={(latlng: { lat: number; lng: number }) => setPoint(latlng)}
            />
          </div>
        </Field>

        {point && (
          <p className="tnum" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 6, fontSize: S.xs, color: C.green, fontWeight: 700 }}>
            <MapPin className="h-3.5 w-3.5" />
            نقطه ثبت شد
          </p>
        )}

        <Field label="نشانی (اختیاری)">
          <input className="pm-field" value={address} onChange={(e) => setAddress(e.target.value)} maxLength={200} placeholder="خیابان، کوچه، پلاک" />
        </Field>

        <Field label="عکس" hint="تا ۴ عکس، هرکدام حداکثر ۴ مگابایت.">
          <div style={{ display: 'flex', gap: S.s2, flexWrap: 'wrap' }}>
            {previews.map((src, index) => (
              <span key={src} style={{ position: 'relative' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" style={{ width: 74, height: 74, borderRadius: 14, objectFit: 'cover' }} />
                <button
                  type="button"
                  onClick={() => setFiles((current) => current.filter((_, i) => i !== index))}
                  aria-label="حذف عکس"
                  style={{
                    position: 'absolute', insetInlineEnd: -6, top: -6, width: 24, height: 24, borderRadius: '50%',
                    display: 'grid', placeItems: 'center', cursor: 'pointer',
                    background: C.statusDanger, color: C.onAccent, border: 'none',
                  }}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}

            {files.length < 4 && (
              <label
                style={{
                  width: 74, height: 74, borderRadius: 14, display: 'grid', placeItems: 'center', cursor: 'pointer',
                  background: C.surface2, border: `1.5px dashed ${C.border}`, color: C.muted,
                }}
              >
                <Camera className="h-5 w-5" />
                {/* `capture` opens the camera straight away on a phone, which is
                    where a report is written — standing in front of the thing. */}
                <input type="file" accept="image/*" capture="environment" multiple onChange={pick} style={{ display: 'none' }} />
              </label>
            )}
          </div>
        </Field>

        {error && (
          <p style={{ margin: 0, padding: S.s3, borderRadius: S.r1, fontSize: S.xs, lineHeight: 1.9, background: alpha(C.statusDanger, 10), color: C.statusDanger, border: `1px solid ${alpha(C.statusDanger, 22)}` }}>
            {error}
          </p>
        )}

        <div style={{ display: 'flex', gap: S.s2 }}>
          <Btn full onClick={submit} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            ثبت گزارش
          </Btn>
          <Btn variant="ghost" onClick={onClose}>انصراف</Btn>
        </div>
      </div>
    </Modal>
  );
}

/* ── one report ──────────────────────────────────────────────────────────── */

function ReportSheet({
  report, onClose, onRated,
}: {
  report: Report;
  onClose: () => void;
  onRated: (message: string) => void;
}) {
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);

  const status = REPORT_STATUS[report.status] || REPORT_STATUS.received;
  const colour = statusColour(report.status);
  const closed = ['done', 'rejected'].includes(report.status);

  const rate = () => {
    setBusy(true);
    axiosService({
      url: `/api/v1/reports/${report._id}/rate`,
      method: 'post',
      token: Cookies.get('auth_token'),
      body: { stars, comment },
    })
      .then((res: any) => onRated(res?.data?.message || 'امتیاز ثبت شد.'))
      .catch(() => setBusy(false));
  };

  return (
    <Modal onClose={onClose} wide>
      <div style={{ padding: S.s5, display: 'flex', flexDirection: 'column', gap: S.s4 }}>
        <div>
          <span
            style={{
              display: 'inline-block', fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: S.rPill,
              background: alpha(colour, 12), color: colour, border: `1px solid ${alpha(colour, 24)}`,
            }}
          >
            {status.label}
          </span>
          <p style={{ margin: `${S.s2}px 0 0`, fontSize: S.md, fontWeight: 800, color: C.textStrong }}>{report.title}</p>
          <p className="tnum" style={{ margin: '5px 0 0', fontSize: S.xs, color: C.muted }}>
            شمارهٔ پیگیری <span dir="ltr">{faDigits(report.code)}</span> · {jalaliDateTime(report.createdAt)}
          </p>
        </div>

        {report.description && (
          <p style={{ margin: 0, fontSize: S.sm, color: C.text, lineHeight: 2 }}>{report.description}</p>
        )}

        {report.photos.length > 0 && (
          <div className="pm-scroll-x" style={{ display: 'flex', gap: S.s2, paddingBottom: 4 }}>
            {report.photos.map((src) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={src} src={src} alt="" style={{ width: 130, height: 130, borderRadius: 16, objectFit: 'cover', flexShrink: 0 }} />
            ))}
          </div>
        )}

        {report.location?.address && (
          <p style={{ margin: 0, display: 'flex', gap: 7, fontSize: S.xs, color: C.muted }}>
            <MapPin className="h-4 w-4" style={{ color: C.green, flexShrink: 0 }} />
            {report.location.address}
          </p>
        )}

        {report.assignedName && (
          <p style={{ margin: 0, fontSize: S.xs, color: C.muted }}>
            ارجاع به: <strong style={{ color: C.textStrong }}>{report.assignedName}</strong>
          </p>
        )}

        {/* The thread: every answer the municipality wrote, oldest first. */}
        {report.responses.length > 0 && (
          <div>
            <p style={{ margin: `0 0 ${S.s2}px`, fontSize: S.sm, fontWeight: 800, color: C.textStrong }}>پاسخ‌های شهرداری</p>
            <div style={{ display: 'grid', gap: S.s2 }}>
              {report.responses.map((response) => (
                <div key={response._id} style={{ padding: S.s3, borderRadius: S.r2, background: C.surface2, border: `1px solid ${C.border}` }}>
                  <p style={{ margin: 0, fontSize: S.sm, color: C.text, lineHeight: 2 }}>{response.text}</p>
                  <p className="tnum" style={{ margin: '6px 0 0', fontSize: 10, color: C.subtle }}>
                    {response.byName} · {jalaliDateTime(response.at)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Asked once, after it is closed. */}
        {closed && !report.rating?.stars && (
          <div style={{ padding: S.s4, borderRadius: S.r2, background: alpha(C.green, 6), border: `1px solid ${alpha(C.green, 20)}` }}>
            <p style={{ margin: 0, fontSize: S.sm, fontWeight: 800, color: C.textStrong }}>از رسیدگی راضی بودید؟</p>
            <div style={{ display: 'flex', gap: 6, margin: `${S.s3}px 0` }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setStars(n)}
                  aria-label={`${n} ستاره`}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2 }}
                >
                  <Star
                    className="h-6 w-6"
                    style={{ color: n <= stars ? C.amber : C.border, fill: n <= stars ? C.amber : 'transparent' }}
                  />
                </button>
              ))}
            </div>
            <input className="pm-field" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="اگر توضیحی دارید بنویسید (اختیاری)" maxLength={400} />
            <div style={{ marginTop: S.s3 }}>
              <Btn full onClick={rate} disabled={!stars || busy}>ثبت امتیاز</Btn>
            </div>
          </div>
        )}

        {report.rating?.stars ? (
          <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 7, fontSize: S.xs, color: C.muted }}>
            <CheckCircle2 className="h-4 w-4" style={{ color: C.green }} />
            امتیاز شما: {fa(report.rating.stars)} از ۵
          </p>
        ) : null}

        <Btn full variant="ghost" onClick={onClose}>بستن</Btn>
      </div>
    </Modal>
  );
}
