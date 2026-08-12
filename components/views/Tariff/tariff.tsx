'use client';

import { useEffect, useState } from 'react';
import { ArrowUpIcon, ArrowDownIcon, Banknote, Minus } from 'lucide-react';

import { axiosService } from '@/lib/axiosService';
import { useToast } from '@/hooks/use-toast';
import { API } from '@/services/const';
import { useCity } from '@/context/data-context';
import { C, S, alpha, fa } from '@/components/ui/tokens';
import { Screen, Hero, Card, IconBadge, EmptyState, Shimmer } from '@/components/ui/kit';

interface PriceItem {
  id: string;
  title: string;
  pricePerUnit: number;
  unit: string;
  change: number;
  category: string;
}

const CATEGORIES = ['همه', 'فلزات', 'پلاستیک', 'کاغذ', 'شیشه'];

const UNITS: Record<string, string> = { g: 'گرم', kg: 'کیلوگرم', ton: 'تن' };

/** One hue per material family, so a category reads the same on every row. */
const CATEGORY_COLOR: Record<string, string> = {
  فلزات: C.statusNeutral,
  پلاستیک: C.statusInfo,
  کاغذ: C.amber,
  شیشه: C.violet,
};

/**
 * تعرفه.
 *
 * One card list at every width instead of a desktop table plus a separate
 * mobile card list — the table was five columns of two-word cells, which is a
 * layout, not information.
 */
export default function PricesPage() {
  const [selectedCategory, setSelectedCategory] = useState('همه');
  const [sortBy, setSortBy] = useState<'pricePerUnit' | 'change'>('pricePerUnit');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PriceItem[]>([]);
  const { toast } = useToast();
  const { selectedCity } = useCity();

  const getData = () => {
    setLoading(true);
    axiosService({ url: `${API.GET_MATERIAL}/${selectedCity?.id}`, method: 'get' })
      .then((res: any) => {
        setData(res?.data || []);
        setLoading(false);
      })
      .catch(() => {
        toast({ variant: 'destructive', title: 'ناموفق', description: 'دریافت تعرفه انجام نشد؛ صفحه را دوباره باز کنید.' });
        setLoading(false);
      });
  };

  useEffect(() => {
    if (selectedCity) getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCity]);

  const rows = data
    .filter((item) => selectedCategory === 'همه' || item.category === selectedCategory)
    .sort((a, b) => ((a[sortBy] || 0) - (b[sortBy] || 0)) * (sortOrder === 'asc' ? 1 : -1));

  const toggleSort = (type: 'pricePerUnit' | 'change') => {
    if (sortBy === type) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else {
      setSortBy(type);
      setSortOrder('desc');
    }
  };

  return (
    <Screen>
      <Hero
        icon={<Banknote className="h-6 w-6" />}
        title="تعرفهٔ قیمت‌ها"
        sub={
          selectedCity?.name
            ? `قیمت روز خرید اقلام بازیافتی در ${selectedCity.name}. مبلغ نهایی پس از توزین محاسبه می‌شود.`
            : 'قیمت روز خرید اقلام بازیافتی. مبلغ نهایی پس از توزین محاسبه می‌شود.'
        }
      />

      <div className="pm-scroll-x" style={{ display: 'flex', gap: S.s2, marginBottom: S.s3, paddingBottom: 4 }}>
        {CATEGORIES.map((cat) => {
          const on = selectedCategory === cat;
          const color = CATEGORY_COLOR[cat] || C.green;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              style={{
                flexShrink: 0, padding: '9px 16px', borderRadius: S.rPill, cursor: 'pointer',
                fontFamily: 'inherit', fontSize: S.xs, fontWeight: 800, whiteSpace: 'nowrap',
                background: on ? color : C.surface,
                color: on ? C.onAccent : C.muted,
                border: `1px solid ${on ? color : C.border}`,
                transition: 'background .18s ease, color .18s ease',
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: S.s2, marginBottom: S.s3 }}>
        <SortBtn label="قیمت" on={sortBy === 'pricePerUnit'} asc={sortOrder === 'asc'} onClick={() => toggleSort('pricePerUnit')} />
        <SortBtn label="تغییرات" on={sortBy === 'change'} asc={sortOrder === 'asc'} onClick={() => toggleSort('change')} />
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: S.s2 }}>
          {[0, 1, 2, 3].map((i) => <Shimmer key={i} height={78} />)}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<Banknote className="h-6 w-6" />}
          title="قیمتی برای این دسته ثبت نشده"
          sub="دستهٔ دیگری را انتخاب کنید یا بعداً دوباره سر بزنید."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: S.s2 }}>
          {rows.map((item, i) => {
            const color = CATEGORY_COLOR[item.category] || C.green;
            const up = item.change > 0;
            const flat = !item.change;
            const changeColor = flat ? C.subtle : up ? C.green : C.statusDanger;
            return (
              <div key={item.id} className="pm-fade-up" style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}>
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
