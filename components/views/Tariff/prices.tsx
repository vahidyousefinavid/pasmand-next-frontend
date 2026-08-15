'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowDownIcon, ArrowUpIcon, Banknote, MapPin, Minus } from 'lucide-react';

import { C, S, alpha, fa } from '@/components/ui/tokens';
import { Card, EmptyState, Hero, IconBadge, Screen } from '@/components/ui/kit';
import type { PublicCity, PublicMaterial } from '@/lib/publicData';

/**
 * تعرفهٔ قیمت‌ها, for one city at a time.
 *
 * Two things changed here, and they are the same change. The prices now arrive
 * **with the page** instead of being fetched after it, so «قیمت روز ضایعات» is
 * in the HTML a crawler reads and on screen before any JavaScript runs. And the
 * city is part of the **address** — `/tariff/nahavand` — rather than a value
 * remembered in a browser, so a price list can be linked, shared and indexed
 * per city, which is how people search for it.
 *
 * What stays client-side is only what genuinely needs a click: filtering by
 * material family and reordering. Both work on data that is already here.
 */

const UNITS: Record<string, string> = { g: 'گرم', kg: 'کیلوگرم', ton: 'تن' };

/** One hue per material family, so a category reads the same on every row. */
const CATEGORY_COLOR: Record<string, string> = {
  فلزات: C.statusNeutral,
  پلاستیک: C.statusInfo,
  کاغذ: C.amber,
  شیشه: C.violet,
};

export default function Prices({
  city,
  cities,
  materials,
}: {
  city: PublicCity | null;
  cities: PublicCity[];
  materials: PublicMaterial[];
}) {
  const [category, setCategory] = useState('همه');
  const [sortBy, setSortBy] = useState<'pricePerUnit' | 'change'>('pricePerUnit');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  // Derived from the city's own list rather than hard-coded: a city that only
  // buys metals should not be offered four empty tabs.
  const categories = useMemo(
    () => ['همه', ...Array.from(new Set(materials.map((m) => m.category).filter(Boolean)))],
    [materials],
  );

  const rows = useMemo(
    () =>
      materials
        .filter((m) => category === 'همه' || m.category === category)
        .sort((a, b) => ((a[sortBy] || 0) - (b[sortBy] || 0)) * (order === 'asc' ? 1 : -1)),
    [materials, category, sortBy, order],
  );

  const toggleSort = (key: 'pricePerUnit' | 'change') => {
    if (sortBy === key) setOrder(order === 'asc' ? 'desc' : 'asc');
    else { setSortBy(key); setOrder('desc'); }
  };

  return (
    <Screen>
      <Hero
        icon={<Banknote className="h-6 w-6" />}
        title="تعرفهٔ قیمت‌ها"
        sub={
          city
            ? `قیمت روز خرید اقلام بازیافتی در ${city.name}. مبلغ نهایی پس از توزین در محل محاسبه می‌شود.`
            : 'قیمت روز خرید اقلام بازیافتی. مبلغ نهایی پس از توزین در محل محاسبه می‌شود.'
        }
      />

      {/* ── the city, as a set of links rather than a remembered preference ── */}
      {cities.length > 1 && (
        <nav aria-label="انتخاب شهر" style={{ marginBottom: S.s4 }}>
          <p style={{ display: 'flex', alignItems: 'center', gap: 6, margin: `0 0 ${S.s2}px`, fontSize: S.xs, fontWeight: 700, color: C.muted }}>
            <MapPin className="h-3.5 w-3.5" style={{ color: C.green }} aria-hidden />
            تعرفهٔ کدام شهر؟
          </p>
          <div className="pm-scroll-x" style={{ display: 'flex', gap: S.s2, paddingBottom: 4 }}>
            {cities.map((option) => {
              const on = option._id === city?._id;
              const open = option.isActive && option.materialCount > 0;
              return (
                <Link
                  key={option._id}
                  href={`/tariff/${option.slug}`}
                  aria-current={on ? 'page' : undefined}
                  style={{
                    flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 7,
                    padding: '9px 15px', borderRadius: S.rPill, textDecoration: 'none',
                    fontSize: S.xs, fontWeight: 800, whiteSpace: 'nowrap',
                    background: on ? C.green : C.surface,
                    color: on ? C.onAccent : open ? C.text : C.subtle,
                    border: `1px solid ${on ? C.green : C.border}`,
                  }}
                >
                  {option.name}
                  {!open && (
                    <span
                      style={{
                        fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999,
                        background: on ? 'rgba(255,255,255,0.2)' : alpha(C.amber, 14),
                        color: on ? C.onAccent : C.amber,
                      }}
                    >
                      به‌زودی
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      {materials.length > 0 && (
        <>
          <div className="pm-scroll-x" style={{ display: 'flex', gap: S.s2, marginBottom: S.s3, paddingBottom: 4 }}>
            {categories.map((name) => {
              const on = category === name;
              const color = CATEGORY_COLOR[name] || C.green;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setCategory(name)}
                  style={{
                    flexShrink: 0, padding: '9px 16px', borderRadius: S.rPill, cursor: 'pointer',
                    fontFamily: 'inherit', fontSize: S.xs, fontWeight: 800, whiteSpace: 'nowrap',
                    background: on ? color : C.surface,
                    color: on ? C.onAccent : C.muted,
                    border: `1px solid ${on ? color : C.border}`,
                    transition: 'background .18s ease, color .18s ease',
                  }}
                >
                  {name}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: S.s2, marginBottom: S.s3 }}>
            <SortBtn label="قیمت" on={sortBy === 'pricePerUnit'} asc={order === 'asc'} onClick={() => toggleSort('pricePerUnit')} />
            <SortBtn label="تغییرات" on={sortBy === 'change'} asc={order === 'asc'} onClick={() => toggleSort('change')} />
          </div>
        </>
      )}

      {materials.length === 0 ? (
        <EmptyState
          icon={<Banknote className="h-6 w-6" />}
          title={city ? `هنوز تعرفه‌ای برای ${city.name} ثبت نشده` : 'هنوز تعرفه‌ای ثبت نشده'}
          sub={
            city && !city.isActive
              ? 'خدمات شهرشهر هنوز در این شهر آغاز نشده است. با آغاز کار، قیمت‌های همین‌جا منتشر می‌شود.'
              : 'قیمت‌ها را شهرداری همین شهر منتشر می‌کند؛ به‌زودی این‌جا خواهند بود.'
          }
          action={
            <Link
              href="/tariff"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none',
                padding: '12px 20px', borderRadius: S.r2,
                background: alpha(C.green, 10), color: C.green, border: `1px solid ${alpha(C.green, 24)}`,
                fontSize: S.sm, fontWeight: 800,
              }}
            >
              دیدن شهری که فعال است
            </Link>
          }
        />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<Banknote className="h-6 w-6" />}
          title="قیمتی در این دسته نیست"
          sub="دستهٔ دیگری را انتخاب کنید."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: S.s2 }}>
          {rows.map((item, i) => {
            const color = CATEGORY_COLOR[item.category] || C.green;
            const up = item.change > 0;
            const flat = !item.change;
            const changeColor = flat ? C.subtle : up ? C.green : C.statusDanger;

            return (
              <div key={item._id} className="pm-fade-up" style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}>
                <Card>
                  <div style={{ padding: `${S.s3}px ${S.s4}px`, display: 'flex', alignItems: 'center', gap: S.s3 }}>
                    {/* The category's initial rather than a banknote on every
                        row: eight identical glyphs down a price list carry no
                        information, and the letter tells the families apart. */}
                    <IconBadge color={color} size={38}>
                      <span style={{ fontSize: S.sm, fontWeight: 800 }}>{(item.category || '؟').slice(0, 1)}</span>
                    </IconBadge>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: S.sm, fontWeight: 800, color: C.textStrong }}>{item.title}</p>
                      <p style={{ margin: '4px 0 0', fontSize: S.xs, color: C.muted }}>
                        {item.category} • هر {UNITS[item.unit] || item.unit}
                      </p>
                    </div>

                    <div style={{ textAlign: 'start', flexShrink: 0 }}>
                      <p className="tnum" style={{ margin: 0, fontSize: S.base, fontWeight: 800, color: C.textStrong, whiteSpace: 'nowrap' }}>
                        {fa(item.pricePerUnit)}
                        <span style={{ fontSize: 10, fontWeight: 600, color: C.muted, marginInlineStart: 4 }}>تومان</span>
                      </p>
                      <span
                        className="tnum"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 3, marginTop: 5,
                          fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: S.rPill,
                          background: alpha(changeColor, 12), color: changeColor,
                          border: `1px solid ${alpha(changeColor, 22)}`,
                        }}
                      >
                        {flat ? <Minus size={10} /> : up ? <ArrowUpIcon size={10} /> : <ArrowDownIcon size={10} />}
                        {fa(Math.abs(item.change || 0))}٪
                      </span>
                    </div>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      )}

      <p style={{ margin: `${S.s5}px 0 0`, fontSize: S.xs, color: C.subtle, textAlign: 'center', lineHeight: 1.9 }}>
        قیمت‌ها میانگین و تقریبی‌اند و بسته به کیفیت و مقدار اقلام تغییر می‌کنند.
      </p>
    </Screen>
  );
}

function SortBtn({ label, on, asc, onClick }: { label: string; on: boolean; asc: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '9px 14px', borderRadius: S.r1, cursor: 'pointer', fontFamily: 'inherit',
        fontSize: S.xs, fontWeight: 700,
        background: C.surface, border: `1px solid ${on ? alpha(C.green, 35) : C.border}`,
        color: on ? C.green : C.muted,
      }}
    >
      {label}
      {on && (asc ? <ArrowUpIcon size={13} /> : <ArrowDownIcon size={13} />)}
    </button>
  );
}
