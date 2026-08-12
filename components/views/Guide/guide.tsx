'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen, Recycle, MapPin, Package, Truck, Info, Lightbulb,
  ChevronDown, ChevronUp, PackagePlus, HelpCircle,
} from 'lucide-react';

import { C, S, alpha, fa } from '@/components/ui/tokens';
import { Screen, Hero, Card, IconBadge } from '@/components/ui/kit';
import { GUIDE_FAQS as FAQS } from '@/lib/faq';

/**
 * راهنما.
 *
 * The five stages of a collection, on the same dotted rail as the rest of the
 * app — the guide describes exactly the route the wizard walks and the tracking
 * screen reports, so it should not invent a third way of drawing it.
 */

interface GuideStep {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  summary: string;
  points: string[];
}

const STEPS: GuideStep[] = [
  {
    id: 'request',
    title: 'ثبت درخواست',
    icon: <Recycle className="h-5 w-5" />,
    color: C.green,
    summary: 'از صفحهٔ اصلی «درخواست جمع‌آوری» را بزنید و نوع پسماند را انتخاب کنید.',
    points: ['دستهٔ پسماند را از میان شش دسته انتخاب کنید', 'اگر چند دسته دارید، برای هرکدام درخواست جدا بدهید', 'حداقل مقدار برای مراجعه، سه کیلوگرم است'],
  },
  {
    id: 'address',
    title: 'انتخاب محل',
    icon: <MapPin className="h-5 w-5" />,
    color: C.statusInfo,
    summary: 'محل را روی نقشه بگذارید یا از آدرس‌های ذخیره‌شده انتخاب کنید.',
    points: ['نقطه را دقیق روی درِ ورودی بگذارید', 'آدرس متنی را برای راهنمایی جمع‌آور کامل کنید', 'آدرس‌های پرتکرار را در «آدرس‌های من» ذخیره کنید'],
  },
  {
    id: 'prepare',
    title: 'آماده‌سازی پسماند',
    icon: <Package className="h-5 w-5" />,
    color: C.amber,
    summary: 'تا زمان مراجعه، پسماند را تفکیک‌شده و تمیز نگه دارید.',
    points: ['کاغذ، پلاستیک، شیشه و فلز را جدا کنید', 'ظرف‌ها را بشویید و خشک کنید', 'هر دسته را در کیسهٔ جداگانه بگذارید'],
  },
  {
    id: 'handover',
    title: 'تحویل به جمع‌آور',
    icon: <Truck className="h-5 w-5" />,
    color: C.violet,
    summary: 'در بازهٔ انتخابی، جمع‌آور مراجعه می‌کند و پسماند توزین می‌شود.',
    points: ['هویت جمع‌آور را با کد نمایش‌داده‌شده در برنامه تطبیق دهید', 'توزین در محل و در حضور شما انجام می‌شود', 'رسید در همان لحظه در برنامه ثبت می‌شود'],
  },
  {
    id: 'track',
    title: 'پیگیری و تسویه',
    icon: <Info className="h-5 w-5" />,
    color: C.statusNeutral,
    summary: 'مبلغ به کیف پول می‌نشیند و مسیر درخواست در «پیگیری» دیده می‌شود.',
    points: ['هر مرحله از درخواست در صفحهٔ پیگیری علامت می‌خورد', 'برداشت از کیف پول بین ۱ تا ۲۴ ساعت کاری طول می‌کشد', 'تا پیش از تأیید، درخواست قابل ویرایش یا لغو است'],
  },
];


export default function GuideView() {
  const [open, setOpen] = useState<string | null>(STEPS[0].id);
  const [faq, setFaq] = useState<number | null>(null);

  return (
    <Screen>
      <Hero
        icon={<BookOpen className="h-6 w-6" />}
        title="راهنمای استفاده"
        sub="از ثبت درخواست تا واریز مبلغ، پنج قدم — همان مسیری که در صفحهٔ پیگیری دنبال می‌کنید."
      />

      <div style={{ position: 'relative', paddingInlineStart: 34 }}>
        <span
          aria-hidden
          style={{
            position: 'absolute', insetInlineStart: 14, top: 26, bottom: 26, width: 2,
            backgroundImage: `linear-gradient(to bottom, ${alpha(C.green, 50)} 55%, transparent 0)`,
            backgroundSize: '2px 10px',
            backgroundRepeat: 'repeat-y',
            maskImage: 'linear-gradient(to bottom, #000 0%, #000 84%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, #000 0%, #000 84%, transparent 100%)',
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: S.s3 }}>
          {STEPS.map((step, i) => {
            const isOpen = open === step.id;
            return (
              <div key={step.id} className="pm-fade-up" style={{ position: 'relative', animationDelay: `${i * 45}ms` }}>
                {/* Numbered node: on a guide the order is the content. */}
                <span
                  aria-hidden
                  className="tnum"
                  style={{
                    position: 'absolute', insetInlineStart: -27, top: 22,
                    width: 26, height: 26, borderRadius: '50%',
                    display: 'grid', placeItems: 'center',
                    background: isOpen ? step.color : C.bg,
                    color: isOpen ? C.onAccent : step.color,
                    border: `2px solid ${step.color}`,
                    fontSize: 11, fontWeight: 800,
                    boxShadow: isOpen ? `0 0 0 5px ${alpha(step.color, 14)}` : undefined,
                    transition: 'background .22s ease, color .22s ease',
                  }}
                >
                  {fa(i + 1)}
                </span>

                <Card
                  accent={step.color}
                  style={{ borderColor: isOpen ? alpha(step.color, 35) : C.border, boxShadow: isOpen ? C.shadowLift : C.shadowCard }}
                >
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : step.id)}
                    aria-expanded={isOpen}
                    style={{
                      display: 'flex', alignItems: 'center', gap: S.s3, width: '100%',
                      padding: `${S.s4}px`, background: 'transparent', border: 'none',
                      fontFamily: 'inherit', color: 'inherit', cursor: 'pointer', textAlign: 'start',
                    }}
                  >
                    <IconBadge color={step.color}>{step.icon}</IconBadge>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: S.base, fontWeight: 800, color: C.textStrong }}>{step.title}</span>
                      <span style={{ display: 'block', fontSize: S.xs, color: C.muted, marginTop: 5, lineHeight: 1.7 }}>{step.summary}</span>
                    </span>
                    <span style={{ color: C.subtle, flexShrink: 0 }}>
                      {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </span>
                  </button>

                  {isOpen && (
                    <ul
                      className="pm-fade-up"
                      style={{
                        listStyle: 'none', margin: 0,
                        padding: `${S.s4}px ${S.s4}px ${S.s4}px`,
                        borderTop: `1px dashed ${alpha(step.color, 24)}`,
                        display: 'flex', flexDirection: 'column', gap: S.s2,
                      }}
                    >
                      {step.points.map((p) => (
                        <li key={p} style={{ display: 'flex', gap: 9, fontSize: S.sm, color: C.text, lineHeight: 1.9 }}>
                          <span
                            aria-hidden
                            style={{ width: 6, height: 6, borderRadius: '50%', background: step.color, flexShrink: 0, marginTop: 9 }}
                          />
                          {p}
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── FAQ ── */}
      <p style={{ margin: `${S.s6}px 0 ${S.s3}px`, fontSize: S.md, fontWeight: 800, color: C.textStrong }}>پرسش‌های پرتکرار</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: S.s2 }}>
        {FAQS.map((item, i) => {
          const isOpen = faq === i;
          return (
            <Card key={item.q}>
              <button
                type="button"
                onClick={() => setFaq(isOpen ? null : i)}
                aria-expanded={isOpen}
                style={{
                  display: 'flex', alignItems: 'center', gap: S.s3, width: '100%',
                  padding: `${S.s3}px ${S.s4}px`, background: 'transparent', border: 'none',
                  fontFamily: 'inherit', color: 'inherit', cursor: 'pointer', textAlign: 'start',
                }}
              >
                <HelpCircle className="h-4 w-4" style={{ color: C.green, flexShrink: 0 }} />
                <span style={{ flex: 1, minWidth: 0, fontSize: S.sm, fontWeight: 800, color: C.textStrong }}>{item.q}</span>
                <span style={{ color: C.subtle, flexShrink: 0 }}>
                  {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </span>
              </button>
              {isOpen && (
                <p
                  className="pm-fade-up"
                  style={{
                    margin: 0, padding: `0 ${S.s4}px ${S.s4}px`, fontSize: S.sm, color: C.muted, lineHeight: 2,
                  }}
                >
                  {item.a}
                </p>
              )}
            </Card>
          );
        })}
      </div>

      {/* ── tip ── */}
      <div
        style={{
          display: 'flex', gap: S.s3, marginTop: S.s5, padding: `${S.s4}px`,
          borderRadius: S.r3, background: alpha(C.amber, 9), border: `1px solid ${alpha(C.amber, 20)}`,
        }}
      >
        <Lightbulb className="h-5 w-5" style={{ color: C.amber, flexShrink: 0 }} />
        <p style={{ margin: 0, fontSize: S.sm, color: C.text, lineHeight: 2 }}>
          هرچه پسماند تمیزتر و تفکیک‌شده‌تر تحویل شود، قیمت بالاتری می‌گیرد — پسماند مخلوط معمولاً دفن می‌شود، نه بازیافت.
        </p>
      </div>

      <Link
        href="/new-request"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: S.s2,
          marginTop: S.s5, padding: '14px 20px', borderRadius: S.r2,
          background: C.green, color: C.onAccent, textDecoration: 'none',
          fontSize: S.base, fontWeight: 800, boxShadow: `0 8px 20px ${alpha(C.green, 26)}`,
        }}
      >
        <PackagePlus className="h-4 w-4" />
        شروع کنید — ثبت درخواست
      </Link>
    </Screen>
  );
}
