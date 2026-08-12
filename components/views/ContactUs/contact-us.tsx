'use client';

import { useState } from 'react';
import {
  Phone, Mail, MessageCircle, Clock, Instagram, Twitter, Facebook,
  Headphones, ChevronLeft, ChevronDown, ChevronUp, Loader2,
} from 'lucide-react';

import { Chat } from '@/components/ui/chat';
import { C, S, alpha } from '@/components/ui/tokens';
import { Screen, Hero, Card, IconBadge } from '@/components/ui/kit';

/**
 * پشتیبانی.
 *
 * The old page opened on four vanity statistics — "۹۸٪ رضایت مشتری", "+۵ کاربر
 * فعال" — none of which came from anywhere. What someone on this page wants is
 * a way to reach a human, so that is what it opens on now.
 */

const CHANNELS = [
  {
    id: 'phone',
    title: 'تماس تلفنی',
    description: 'روزهای کاری، ۸ صبح تا ۸ شب',
    action: '۰۹۱۸۲۱۴۴۹۷۰',
    href: 'tel:989182144970',
    icon: <Phone className="h-5 w-5" />,
    color: C.statusInfo,
  },
  {
    id: 'email',
    title: 'ایمیل پشتیبانی',
    description: 'پاسخ در کمتر از ۲۴ ساعت کاری',
    action: 'support@shahrshahr.ir',
    href: 'mailto:support@shahrshahr.ir',
    icon: <Mail className="h-5 w-5" />,
    color: C.violet,
  },
  {
    id: 'chat',
    title: 'گفتگوی آنلاین',
    description: 'پاسخ فوری در ساعات کاری',
    action: 'شروع گفتگو',
    href: '#chat',
    icon: <MessageCircle className="h-5 w-5" />,
    color: C.green,
  },
];

const SOCIAL = [
  { name: 'اینستاگرام', icon: <Instagram className="h-4 w-4" />, link: 'https://instagram.com/shahrshahr' },
  { name: 'ایتا', icon: <MessageCircle className="h-4 w-4" />, link: 'https://eitaa.com/shahrshahr' },
  { name: 'بله', icon: <MessageCircle className="h-4 w-4" />, link: 'https://ble.ir/shahrshahr' },
  { name: 'توییتر', icon: <Twitter className="h-4 w-4" />, link: 'https://twitter.com/shahrshahr' },
  { name: 'فیسبوک', icon: <Facebook className="h-4 w-4" />, link: 'https://facebook.com/shahrshahr' },
];

const FAQS = [
  { q: 'ساعات پاسخگویی تلفنی چگونه است؟', a: 'روزهای کاری از ۸ صبح تا ۸ شب پاسخگو هستیم. خارج از این ساعت، پیام‌ها در اولین فرصت کاری بررسی می‌شود.' },
  { q: 'درخواستم ثبت شده ولی کسی نیامده، چه کنم؟', a: 'ابتدا وضعیت را در صفحهٔ «پیگیری» ببینید؛ اگر هنوز روی «بررسی و تأیید» مانده، درخواست در نوبت است. اگر بازهٔ زمانی گذشته، با پشتیبانی تماس بگیرید.' },
  { q: 'مبلغ واریزی با انتظارم فرق دارد.', a: 'مبلغ بر اساس توزین در محل و تعرفهٔ روز همان شهر محاسبه می‌شود. جزئیات اقلام و وزن‌ها در همان درخواست، در صفحهٔ پیگیری، قابل مشاهده است.' },
];

export default function ContactUsView() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [faq, setFaq] = useState<number | null>(null);

  const handleStartChat = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsChatOpen(true);
    }, 600);
  };

  return (
    <>
      <Screen>
        <Hero
          icon={<Headphones className="h-6 w-6" />}
          title="پشتیبانی"
          sub="اگر چیزی مطابق انتظار پیش نرفت، از یکی از این راه‌ها با ما حرف بزنید."
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: S.s3 }}>
          {CHANNELS.map((ch, i) => {
            const inner = (
              <Card accent={ch.color} interactive style={{ height: '100%' }}>
                <div style={{ padding: `${S.s4}px`, display: 'flex', alignItems: 'center', gap: S.s3 }}>
                  <IconBadge color={ch.color}>{ch.icon}</IconBadge>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: S.base, fontWeight: 800, color: C.textStrong }}>{ch.title}</p>
                    <p style={{ margin: '5px 0 0', fontSize: S.xs, color: C.muted, lineHeight: 1.7 }}>{ch.description}</p>
                    <p
                      className={ch.id === 'phone' ? 'tnum' : undefined}
                      style={{ margin: '8px 0 0', fontSize: S.sm, fontWeight: 800, color: ch.color, overflowWrap: 'anywhere' }}
                    >
                      {ch.id === 'chat' && isLoading ? 'در حال اتصال…' : ch.action}
                    </p>
                  </div>
                  {ch.id === 'chat' && isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" style={{ color: ch.color, flexShrink: 0 }} />
                  ) : (
                    <ChevronLeft className="h-4 w-4" style={{ color: C.subtle, flexShrink: 0 }} />
                  )}
                </div>
              </Card>
            );

            return (
              <div key={ch.id} className="pm-fade-up" style={{ animationDelay: `${i * 45}ms` }}>
                {ch.id === 'chat' ? (
                  <button
                    type="button"
                    onClick={handleStartChat}
                    style={{ display: 'block', width: '100%', padding: 0, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'start' }}
                  >
                    {inner}
                  </button>
                ) : (
                  <a href={ch.href} style={{ textDecoration: 'none', display: 'block' }}>
                    {inner}
                  </a>
                )}
              </div>
            );
          })}
        </div>

        {/* ── hours ── */}
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: S.s3, marginTop: S.s4,
            padding: `${S.s4}px`, borderRadius: S.r3,
            background: alpha(C.amber, 9), border: `1px solid ${alpha(C.amber, 20)}`,
          }}
        >
          <Clock className="h-5 w-5" style={{ color: C.amber, flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: S.sm, color: C.text, lineHeight: 1.9 }}>
            شنبه تا چهارشنبه <span className="tnum">۸:۰۰</span> تا <span className="tnum">۲۰:۰۰</span> — پنجشنبه‌ها تا <span className="tnum">۱۳:۰۰</span>
          </p>
        </div>

        {/* ── FAQ ── */}
        <p style={{ margin: `${S.s6}px 0 ${S.s3}px`, fontSize: S.md, fontWeight: 800, color: C.textStrong }}>پیش از تماس، این‌ها را ببینید</p>

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
                  <span style={{ flex: 1, minWidth: 0, fontSize: S.sm, fontWeight: 800, color: C.textStrong }}>{item.q}</span>
                  <span style={{ color: C.subtle, flexShrink: 0 }}>
                    {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </span>
                </button>
                {isOpen && (
                  <p className="pm-fade-up" style={{ margin: 0, padding: `0 ${S.s4}px ${S.s4}px`, fontSize: S.sm, color: C.muted, lineHeight: 2 }}>
                    {item.a}
                  </p>
                )}
              </Card>
            );
          })}
        </div>

        {/* ── social ── */}
        <p style={{ margin: `${S.s6}px 0 ${S.s3}px`, fontSize: S.md, fontWeight: 800, color: C.textStrong }}>ما را دنبال کنید</p>

        <div className="pm-scroll-x" style={{ display: 'flex', gap: S.s2, paddingBottom: 4 }}>
          {SOCIAL.map((s) => (
            <a
              key={s.name}
              href={s.link}
              target="_blank"
              rel="noreferrer noopener"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7, flexShrink: 0, textDecoration: 'none',
                padding: '10px 16px', borderRadius: S.rPill,
                background: C.surface, border: `1px solid ${C.border}`, color: C.text,
                fontSize: S.xs, fontWeight: 700, whiteSpace: 'nowrap',
              }}
            >
              {s.icon}
              {s.name}
            </a>
          ))}
        </div>
      </Screen>

      <Chat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
}
