'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { CheckCircle2, MapPin, CalendarClock, PackagePlus, ChevronRight, Loader2, FileClock } from 'lucide-react';

import FirstStep from './steps/first';
import SecondStep from './steps/second';
import ThirdStep from './steps/third';
import { API } from '@/services/const';
import { useToast } from '@/hooks/use-toast';
import { axiosService } from '@/lib/axiosService';
import { useCity } from '@/context/data-context';
import { wasteMeta } from '@/lib/wasteTypes';
import { C, S, alpha } from '@/components/ui/tokens';
import { Screen, Hero, Card, IconBadge, Btn, StepRail, type Step } from '@/components/ui/kit';

interface RequestData {
  wasteType?: string;
  location?: { lat: number; lng: number; address: string };
  timeSlot?: { date: string; time: string };
}

/**
 * The four stages the citizen walks through, named as the thing being decided
 * rather than "مرحله ۲". The rail shows all four from the start: knowing what
 * is still ahead is most of what makes a multi-step form tolerable.
 */
const WIZARD_STEPS: Step[] = [
  { key: 'type', title: 'نوع پسماند' },
  { key: 'place', title: 'محل جمع‌آوری' },
  { key: 'time', title: 'زمان مراجعه' },
  { key: 'review', title: 'بازبینی و ثبت' },
];

/** What happens after the citizen presses ثبت — the same rail, other side. */
const AFTER_STEPS: Step[] = [
  { key: 'sent', title: 'درخواست ثبت شد', detail: 'در سامانه ثبت شد و برای شهر شما ارسال شد.' },
  { key: 'review', title: 'بررسی و تأیید', detail: 'کارشناس زمان و محل را بررسی و تأیید می‌کند.' },
  { key: 'collect', title: 'جمع‌آوری در محل', detail: 'جمع‌آور در بازهٔ انتخابی به آدرس شما مراجعه می‌کند.' },
  { key: 'settle', title: 'توزین و تسویه', detail: 'پس از توزین، مبلغ به کیف پول شما واریز می‌شود.' },
];

const ORDER = ['first', 'second', 'third', 'review'] as const;
type StepName = (typeof ORDER)[number] | 'success';

export default function NewRequestView() {
  const { toast } = useToast();
  const { selectedCity } = useCity();

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<StepName>('first');
  const [requestData, setRequestData] = useState<RequestData>({});

  // Read `?type=` without useSearchParams: that hook forces a Suspense boundary
  // on this route at build time, and the value is only ever a starting hint.
  useEffect(() => {
    const type = new URLSearchParams(window.location.search).get('type');
    if (type) {
      setRequestData((d) => ({ ...d, wasteType: type }));
      setStep('second');
    }
  }, []);

  const submit = () => {
    setLoading(true);
    axiosService({
      url: API.NEW_REQUEST,
      method: 'post',
      body: requestData,
      token: Cookies.get('auth_token'),
    })
      .then(() => {
        toast({ variant: 'success', title: 'ثبت شد', description: 'درخواست جمع‌آوری شما ثبت شد.' });
        setLoading(false);
        setStep('success');
      })
      .catch(() => {
        toast({ variant: 'destructive', title: 'ناموفق', description: 'ثبت درخواست انجام نشد؛ دوباره تلاش کنید.' });
        setLoading(false);
      });
  };

  const meta = wasteMeta(requestData.wasteType);
  const currentIndex = step === 'success' ? WIZARD_STEPS.length : ORDER.indexOf(step as any);
  const accent = requestData.wasteType ? meta.color : C.green;

  // The header and tab bar are rendered once by app/(user)/layout.tsx.
  return (
    <Screen>
        <Hero
          icon={<PackagePlus className="h-6 w-6" />}
          title="درخواست جمع‌آوری"
          sub={
            step === 'success'
              ? 'درخواست شما ثبت شد و وارد صف بررسی شده است.'
              : 'در چهار قدم مشخص می‌کنید چه چیزی، کجا و چه زمانی تحویل داده می‌شود.'
          }
        />

        {step !== 'success' && (
          <Card style={{ marginBottom: S.s4 }}>
            <div style={{ padding: `${S.s4}px` }}>
              <StepRail steps={WIZARD_STEPS} current={currentIndex} color={accent} compact />
            </div>
          </Card>
        )}

        {step === 'first' && (
          <FirstStep
            selected={requestData.wasteType}
            onNext={(wasteType: string) => {
              setRequestData((d) => ({ ...d, wasteType }));
              setStep('second');
            }}
          />
        )}

        {step === 'second' && (
          <SecondStep
            onNext={(location: { lat: number; lng: number; address: string }) => {
              setRequestData((d) => ({ ...d, location }));
              setStep('third');
            }}
            onBack={() => setStep('first')}
          />
        )}

        {step === 'third' && (
          <ThirdStep
            loading={false}
            onComplete={(timeSlot: { date: string; time: string }) => {
              setRequestData((d) => ({ ...d, timeSlot }));
              setStep('review');
            }}
            onBack={() => setStep('second')}
          />
        )}

        {step === 'review' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: S.s3 }}>
            <Card accent={accent}>
              <div style={{ padding: `${S.s5}px ${S.s4}px` }}>
                <p style={{ margin: `0 0 ${S.s4}px`, fontSize: S.md, fontWeight: 800, color: C.textStrong }}>
                  بازبینی درخواست
                </p>

                <Row
                  icon={<meta.Icon className="h-4 w-4" />}
                  color={meta.color}
                  label="نوع پسماند"
                  value={meta.name}
                  onEdit={() => setStep('first')}
                />
                <Row
                  icon={<MapPin className="h-4 w-4" />}
                  color={C.statusInfo}
                  label="محل جمع‌آوری"
                  value={requestData.location?.address || '—'}
                  onEdit={() => setStep('second')}
                />
                <Row
                  icon={<CalendarClock className="h-4 w-4" />}
                  color={C.amber}
                  label="زمان مراجعه"
                  value={`${requestData.timeSlot?.date || '—'} • ${requestData.timeSlot?.time || '—'}`}
                  onEdit={() => setStep('third')}
                  last
                />

                {selectedCity?.name && (
                  <p
                    style={{
                      margin: `${S.s4}px 0 0`, padding: `${S.s3}px ${S.s3}px`, borderRadius: S.r1,
                      background: alpha(C.amber, 10), border: `1px solid ${alpha(C.amber, 22)}`,
                      color: C.text, fontSize: S.xs, lineHeight: 1.9,
                    }}
                  >
                    این درخواست در شهر <strong>{selectedCity.name}</strong> بررسی می‌شود. اگر آدرس در شهر دیگری است،
                    پیش از ثبت شهر را از منوی بالا تغییر دهید.
                  </p>
                )}
              </div>
            </Card>

            <div style={{ display: 'flex', gap: S.s3 }}>
              <Btn variant="ghost" onClick={() => setStep('third')}>
                <ChevronRight className="h-4 w-4" />
                بازگشت
              </Btn>
              <Btn
                onClick={submit}
                disabled={loading || !requestData.wasteType || !requestData.location || !requestData.timeSlot}
                color={accent}
                full
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                {loading ? 'در حال ثبت…' : 'ثبت نهایی درخواست'}
              </Btn>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: S.s3 }}>
            <Card accent={C.green}>
              <div style={{ padding: `${S.s6}px ${S.s4}px`, display: 'grid', justifyItems: 'center', gap: S.s3, textAlign: 'center' }}>
                <IconBadge color={C.green} size={58}><CheckCircle2 className="h-7 w-7" /></IconBadge>
                <p style={{ margin: 0, fontSize: S.lg, fontWeight: 800, color: C.textStrong }}>درخواست شما ثبت شد</p>
                <p style={{ margin: 0, fontSize: S.sm, color: C.muted, lineHeight: 1.9, maxWidth: '44ch' }}>
                  پسماند «{meta.name}» در تاریخ {requestData.timeSlot?.date} و بازهٔ {requestData.timeSlot?.time} جمع‌آوری می‌شود.
                </p>
              </div>
            </Card>

            <Card>
              <div style={{ padding: `${S.s5}px ${S.s4}px` }}>
                <p style={{ margin: `0 0 ${S.s4}px`, fontSize: S.base, fontWeight: 800, color: C.textStrong }}>از این‌جا به بعد</p>
                <StepRail steps={AFTER_STEPS} current={1} />
              </div>
            </Card>

            <div style={{ display: 'flex', gap: S.s3 }}>
              <Link href="/history" style={{ flex: 1, textDecoration: 'none' }}>
                <span
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: S.s2,
                    padding: '13px 20px', borderRadius: S.r2, background: C.green, color: C.onAccent,
                    fontSize: S.base, fontWeight: 800, boxShadow: `0 8px 20px ${alpha(C.green, 26)}`,
                  }}
                >
                  <FileClock className="h-4 w-4" />
                  پیگیری درخواست
                </span>
              </Link>
              <Btn
                variant="soft"
                onClick={() => {
                  setRequestData({});
                  setStep('first');
                }}
              >
                درخواست جدید
              </Btn>
            </div>
          </div>
        )}
    </Screen>
  );
}

function Row({
  icon,
  color,
  label,
  value,
  onEdit,
  last,
}: {
  icon: React.ReactNode;
  color: string;
  label: string;
  value: string;
  onEdit: () => void;
  last?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: S.s3,
        paddingBottom: last ? 0 : S.s3,
        marginBottom: last ? 0 : S.s3,
        borderBottom: last ? undefined : `1px dashed ${C.border}`,
      }}
    >
      <IconBadge color={color} size={36}>{icon}</IconBadge>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: S.xs, color: C.muted, fontWeight: 600 }}>{label}</p>
        <p style={{ margin: '3px 0 0', fontSize: S.sm, fontWeight: 700, color: C.textStrong, lineHeight: 1.7, overflowWrap: 'anywhere' }}>
          {value}
        </p>
      </div>
      <button
        type="button"
        onClick={onEdit}
        style={{
          flexShrink: 0, background: 'transparent', border: `1px solid ${C.border}`,
          borderRadius: S.rPill, padding: '6px 13px', fontSize: S.xs, fontWeight: 700,
          color: C.muted, cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        ویرایش
      </button>
    </div>
  );
}
