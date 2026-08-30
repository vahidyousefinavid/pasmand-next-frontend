'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import {
  CalendarCheck, ChevronLeft, FileText, ListChecks, Megaphone, Recycle, type LucideIcon,
} from 'lucide-react';

import { axiosService } from '@/lib/axiosService';
import { C, S, alpha, fa } from '@/components/ui/tokens';
import { Card, EmptyState, Hero, IconBadge, Screen, Shimmer } from '@/components/ui/kit';
import { faDigits } from '@/lib/when';

/**
 * کارهای من.
 *
 * The tab this replaced was «پیگیری», and it meant one thing: the history of
 * waste-collection requests. That was the whole product once. It is one of five
 * services now, and the other four each kept their own list inside their own
 * screen — so a citizen with a pending ۱۳۷ report, a hall booked for Thursday
 * and a letter waiting on a signature had to open three screens to find out
 * where anything stood, and nothing told them when one of them moved.
 *
 * This screen is the answer to «چه کارهایی دارم؟» rather than to «درخواست‌های
 * پسماند من کجاست؟». One merged list, built by the API (`/api/v1/activity`) so
 * a phone makes one request and a module the city has switched off is never
 * asked for. Everything on it links into the screen that owns it.
 *
 * The ordering is the design: what is still open comes first and, within that,
 * what arrives soonest — a hall booked for tomorrow outranks a report filed
 * this morning, because one of them is a place somebody has to be.
 */

interface Item {
  kind: 'waste' | 'booking' | 'report' | 'letter';
  service: string;
  id: string;
  title: string;
  sub: string;
  code?: string;
  amount?: number;
  status: string;
  label: string;
  tone: 'wait' | 'work' | 'done' | 'stop';
  open: boolean;
  at: string | null;
  say: string;
  ahead: number | null;
  href: string;
}

const TONE: Record<Item['tone'], string> = {
  wait: C.statusWarn,
  work: C.statusInfo,
  done: C.statusOk,
  stop: C.statusNeutral,
};

const KIND: Record<Item['kind'], { icon: LucideIcon; color: string; title: string; module: string }> = {
  waste: { icon: Recycle, color: C.green, title: 'جمع‌آوری پسماند', module: 'waste' },
  booking: { icon: CalendarCheck, color: C.violet, title: 'رزرو اماکن', module: 'venues' },
  report: { icon: Megaphone, color: C.amber, title: 'گزارش ۱۳۷', module: 'report137' },
  letter: { icon: FileText, color: C.blue, title: 'کارتابل', module: 'cartable' },
};

/** «فردا»، «۳ روز دیگر»، «دیروز» — what a person would actually say. */
function whenText(item: Item): string {
  if (item.ahead === null || item.ahead === undefined) return item.say || '';
  if (item.ahead === 0) return `امروز · ${item.say}`;
  if (item.ahead === 1) return `فردا · ${item.say}`;
  if (item.ahead > 1) return `${faDigits(String(item.ahead))} روز دیگر · ${item.say}`;
  return item.say;
}

export default function ActivityPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({ all: 0, open: 0 });
  const [modules, setModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState('');
  const [filter, setFilter] = useState<'open' | 'all' | Item['kind']>('open');

  useEffect(() => {
    axiosService({ url: '/api/v1/activity', method: 'get', token: Cookies.get('auth_token') })
      .then((res: any) => {
        setItems(res?.data?.items || []);
        setCounts(res?.data?.counts || { all: 0, open: 0 });
        setModules(res?.data?.modules || []);
      })
      .catch((err: any) => setBlocked(err?.data?.message || 'دریافت اطلاعات انجام نشد.'))
      .finally(() => setLoading(false));
  }, []);

  /**
   * The filters a city can actually offer.
   *
   * Built from the modules it runs rather than from the four kinds this screen
   * knows about: a «کارتابل» chip in a city that has never switched it on is a
   * filter that can only ever be empty.
   */
  const chips = useMemo(() => {
    const base: { key: typeof filter; label: string; n: number }[] = [
      { key: 'open', label: 'در جریان', n: counts.open || 0 },
      { key: 'all', label: 'همه', n: counts.all || 0 },
    ];

    (Object.keys(KIND) as Item['kind'][]).forEach((kind) => {
      if (!modules.includes(KIND[kind].module)) return;
      const n = counts[kind] || 0;
      if (!n) return;
      base.push({ key: kind, label: KIND[kind].title, n });
    });

    return base;
  }, [counts, modules]);

  const shown = useMemo(() => {
    if (filter === 'open') return items.filter((i) => i.open);
    if (filter === 'all') return items;
    return items.filter((i) => i.kind === filter);
  }, [items, filter]);

  return (
    <Screen>
      <Hero
        icon={<ListChecks className="h-6 w-6" />}
        title="کارهای من"
        sub="هر چیزی که در شهرداری در جریان دارید — درخواست، رزرو، گزارش و نامه — در یک فهرست."
        aside={
          <div style={{ textAlign: 'start' }}>
            <p style={{ margin: 0, fontSize: S.xs, color: C.onHeroMuted, fontWeight: 600 }}>در جریان</p>
            <p className="tnum" style={{ margin: '6px 0 0', fontSize: S.xl, fontWeight: 800 }}>
              {loading ? '…' : fa(counts.open || 0)}
            </p>
          </div>
        }
      />

      {blocked ? (
        <EmptyState icon={<ListChecks className="h-6 w-6" />} title="در دسترس نیست" sub={blocked} />
      ) : (
        <>
          {/* ── filters ── */}
          {!loading && chips.length > 2 && (
            <div className="pm-scroll-x" style={{ display: 'flex', gap: 7, marginBottom: S.s3, paddingBottom: 4 }}>
              {chips.map((chip) => {
                const on = filter === chip.key;
                return (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={() => setFilter(chip.key)}
                    style={{
                      flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '8px 14px', borderRadius: S.rPill, cursor: 'pointer',
                      fontFamily: 'inherit', fontSize: S.xs, fontWeight: 800,
                      background: on ? C.green : C.surface2,
                      color: on ? C.onAccent : C.text,
                      border: `1px solid ${on ? C.green : C.border}`,
                    }}
                  >
                    {chip.label}
                    <span className="tnum" style={{ opacity: 0.8, fontWeight: 700 }}>{fa(chip.n)}</span>
                  </button>
                );
              })}
            </div>
          )}

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: S.s2 }}>
              {[0, 1, 2].map((i) => <Shimmer key={i} height={96} />)}
            </div>
          ) : shown.length === 0 ? (
            <EmptyState
              icon={<ListChecks className="h-6 w-6" />}
              title={filter === 'open' ? 'کاری در جریان ندارید' : 'چیزی ثبت نشده است'}
              sub={
                filter === 'open'
                  ? 'هر درخواست، رزرو، گزارش یا نامه‌ای که ثبت کنید تا بسته‌شدنش همین‌جا دنبال می‌شود.'
                  : 'از خانه یکی از خدمات شهرداری را انتخاب کنید تا اولین کارتان این‌جا بنشیند.'
              }
              action={
                <Link
                  href="/"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none',
                    padding: '11px 20px', borderRadius: S.r2,
                    background: C.green, color: C.onAccent, fontSize: S.sm, fontWeight: 800,
                  }}
                >
                  خدمات شهر
                </Link>
              }
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: S.s2 }}>
              {shown.map((item, i) => {
                const meta = KIND[item.kind];
                const Icon = meta.icon;
                const colour = TONE[item.tone];

                return (
                  <div key={`${item.kind}-${item.id}`} className="pm-fade-up" style={{ animationDelay: `${Math.min(i, 6) * 35}ms` }}>
                    <Link href={item.href} style={{ textDecoration: 'none', display: 'block' }}>
                      <Card interactive accent={item.open ? meta.color : undefined}>
                        <div style={{ padding: S.s4, display: 'flex', alignItems: 'center', gap: S.s3 }}>
                          <IconBadge color={meta.color} size={44}><Icon className="h-5 w-5" /></IconBadge>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: meta.color }}>{item.service}</p>
                            <p style={{ margin: '3px 0 0', fontSize: S.sm, fontWeight: 800, color: C.textStrong }}>
                              {item.title}
                            </p>

                            {(item.sub || item.say) && (
                              <p className="tnum" style={{ margin: '4px 0 0', fontSize: S.xs, color: C.muted, lineHeight: 1.8 }}>
                                {whenText(item) || item.sub}
                                {whenText(item) && item.sub ? ` · ${item.sub}` : ''}
                              </p>
                            )}

                            <div style={{ display: 'flex', gap: 6, marginTop: 7, flexWrap: 'wrap', alignItems: 'center' }}>
                              <span
                                style={{
                                  fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: S.rPill,
                                  background: alpha(colour, 12), color: colour, border: `1px solid ${alpha(colour, 24)}`,
                                }}
                              >
                                {item.label}
                              </span>
                              {item.code && (
                                <span className="tnum" style={{ fontSize: 10, color: C.subtle, fontWeight: 700 }}>
                                  کد <span dir="ltr">{item.code}</span>
                                </span>
                              )}
                              {!!item.amount && (
                                <span className="tnum" style={{ fontSize: 10, color: C.muted, fontWeight: 700 }}>
                                  {fa(item.amount)} تومان
                                </span>
                              )}
                            </div>
                          </div>

                          <ChevronLeft className="h-4 w-4" style={{ color: C.subtle, flexShrink: 0 }} />
                        </div>
                      </Card>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </Screen>
  );
}
