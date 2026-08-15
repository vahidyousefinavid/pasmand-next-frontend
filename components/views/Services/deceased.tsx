'use client';

import { useEffect, useMemo, useState } from 'react';
import { Flower2, MapPin, Search } from 'lucide-react';

import { axiosService } from '@/lib/axiosService';
import { C, S, alpha, fa } from '@/components/ui/tokens';
import { Card, EmptyState, Hero, IconBadge, Screen, Shimmer } from '@/components/ui/kit';

/**
 * جست‌وجوی درگذشتگان.
 *
 * The one screen here that asks for nothing: no account, no city picker if the
 * address already carries one. Somebody looking for a relative's grave is
 * usually doing it at a bad moment, often from a search engine, and every field
 * between them and the answer is a field too many.
 *
 * The result is the four things they came for — آرامستان، قطعه، ردیف، شماره —
 * and nothing else about the person. A public register does not need more, and
 * publishing more would be a harm.
 */

interface Row {
  _id: string;
  firstName: string; lastName: string; fatherName: string;
  birthDate: string; deathDate: string; burialDate: string;
  cemetery: string; section: string; row: string; number: string; note: string;
}

export default function DeceasedPage() {
  const [query, setQuery] = useState('');
  const [citySlug, setCitySlug] = useState('');
  const [rows, setRows] = useState<Row[] | null>(null);
  const [city, setCity] = useState<{ name: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // `?city=` in the address wins, so a link from a city's own page lands on
  // that city's register.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCitySlug(params.get('city') || '');
    const q = params.get('q');
    if (q) setQuery(q);
  }, []);

  const canSearch = query.trim().length >= 2;

  const search = () => {
    if (!canSearch) return;
    setLoading(true);
    setMessage('');

    axiosService({
      url: '/api/v1/deceased',
      method: 'get',
      params: { q: query.trim(), ...(citySlug ? { city: citySlug } : {}) },
    })
      .then((res: any) => {
        setRows(res?.data?.results || []);
        setCity(res?.data?.city || null);
      })
      .catch((err: any) => {
        setRows([]);
        setMessage(err?.data?.message || 'جست‌وجو انجام نشد.');
      })
      .finally(() => setLoading(false));
  };

  const summary = useMemo(() => {
    if (rows === null) return '';
    if (!rows.length) return 'نتیجه‌ای یافت نشد.';
    return `${fa(rows.length)} نتیجه${city?.name ? ` در ${city.name}` : ''}`;
  }, [rows, city]);

  return (
    <Screen>
      <Hero
        icon={<Flower2 className="h-6 w-6" />}
        title="جست‌وجوی درگذشتگان"
        sub="نام و نام خانوادگی را بنویسید تا محل دفن — آرامستان، قطعه، ردیف و شماره — را ببینید."
      />

      <form
        onSubmit={(e) => { e.preventDefault(); search(); }}
        style={{ display: 'flex', gap: S.s2, marginBottom: S.s4 }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
          <Search
            className="h-4 w-4"
            style={{ position: 'absolute', insetInlineStart: 14, top: '50%', transform: 'translateY(-50%)', color: C.muted }}
          />
          <input
            className="pm-field"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="مثلاً محمدرضا کریمی"
            style={{ paddingInlineStart: 40 }}
            autoComplete="off"
          />
        </div>
        <button
          type="submit"
          disabled={!canSearch || loading}
          style={{
            flexShrink: 0, padding: '0 22px', borderRadius: S.r2, cursor: canSearch ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit', fontSize: S.sm, fontWeight: 800,
            background: C.green, color: C.onAccent, border: 'none', opacity: canSearch ? 1 : 0.5,
          }}
        >
          جست‌وجو
        </button>
      </form>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: S.s2 }}>
          {[0, 1].map((i) => <Shimmer key={i} height={104} />)}
        </div>
      ) : rows === null ? (
        <EmptyState
          icon={<Flower2 className="h-6 w-6" />}
          title="نام را بنویسید"
          sub="جست‌وجو با نام و نام خانوادگی انجام می‌شود؛ نوشتن بخشی از نام هم کافی است."
        />
      ) : rows.length === 0 ? (
        <EmptyState icon={<Flower2 className="h-6 w-6" />} title={message || 'نتیجه‌ای یافت نشد'} sub="املای دیگری را امتحان کنید یا فقط نام خانوادگی را بنویسید." />
      ) : (
        <>
          <p style={{ margin: `0 0 ${S.s3}px`, fontSize: S.xs, color: C.muted }}>{summary}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: S.s2 }}>
            {rows.map((row, i) => (
              <div key={row._id} className="pm-fade-up" style={{ animationDelay: `${Math.min(i, 6) * 30}ms` }}>
                <Card>
                  <div style={{ padding: S.s4, display: 'flex', gap: S.s3 }}>
                    <IconBadge color={C.statusNeutral} size={44}><Flower2 className="h-5 w-5" /></IconBadge>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: S.base, fontWeight: 800, color: C.textStrong }}>
                        {row.firstName} {row.lastName}
                      </p>
                      {(row.fatherName || row.deathDate) && (
                        <p className="tnum" style={{ margin: '4px 0 0', fontSize: S.xs, color: C.muted }}>
                          {row.fatherName ? `فرزند ${row.fatherName}` : ''}
                          {row.fatherName && row.deathDate ? ' · ' : ''}
                          {row.deathDate ? `تاریخ درگذشت ${row.deathDate}` : ''}
                        </p>
                      )}

                      {/* The four things somebody came here to read. */}
                      <div
                        style={{
                          display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: S.s3,
                          padding: `${S.s2}px ${S.s3}px`, borderRadius: S.r1,
                          background: alpha(C.green, 7), border: `1px solid ${alpha(C.green, 18)}`,
                        }}
                      >
                        <MapPin className="h-3.5 w-3.5" style={{ color: C.green, flexShrink: 0, marginTop: 2 }} />
                        {[
                          row.cemetery && { label: 'آرامستان', value: row.cemetery },
                          row.section && { label: 'قطعه', value: row.section },
                          row.row && { label: 'ردیف', value: row.row },
                          row.number && { label: 'شماره', value: row.number },
                        ]
                          .filter(Boolean)
                          .map((item: any) => (
                            <span key={item.label} className="tnum" style={{ fontSize: S.xs, color: C.text }}>
                              <span style={{ color: C.muted }}>{item.label}: </span>
                              <strong style={{ color: C.textStrong, fontWeight: 800 }}>{item.value}</strong>
                            </span>
                          ))}
                      </div>

                      {row.note && <p style={{ margin: `${S.s2}px 0 0`, fontSize: S.xs, color: C.muted }}>{row.note}</p>}
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </>
      )}

      <p style={{ margin: `${S.s5}px 0 0`, fontSize: S.xs, color: C.subtle, textAlign: 'center', lineHeight: 1.9 }}>
        اطلاعات این بخش را آرامستان‌های شهرداری منتشر می‌کنند. برای اصلاح یا حذف یک ردیف با پشتیبانی تماس بگیرید.
      </p>
    </Screen>
  );
}
