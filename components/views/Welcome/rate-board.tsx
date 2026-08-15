'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Scale } from 'lucide-react';

import { fa } from '@/components/ui/tokens';
import type { BoardCity } from '@/lib/publicData';

/**
 * تابلوی نرخ امروز — the page's centre of gravity.
 *
 * A visitor arrives here having asked one question, usually of a search engine:
 * «امروز کیلویی چند می‌خرند؟». Every other way of opening this page — a slogan
 * over a photograph, a row of statistics — makes them scroll to find out. So the
 * answer *is* the hero: today's real prices, for their city, rendered on the
 * server so they are in the HTML a crawler reads and on screen before any
 * JavaScript runs.
 *
 * Under the prices sits the thing that turns a number into a decision: kilograms
 * in, تومان out. It is the whole product in one control — put waste on a scale,
 * money comes back — and it is honest about being an estimate, because the real
 * figure comes from a scale at the door.
 */

const MAX_KG = 60;

/** Grouped Persian digits, the way the amount is written on a receipt. */
const toman = (value: number) => fa(Math.round(value));

export default function RateBoard({ cities }: { cities: BoardCity[] }) {
  const [cityIndex, setCityIndex] = useState(0);
  const city = cities[cityIndex];

  const materials = city?.materials ?? [];
  const [materialId, setMaterialId] = useState(materials[0]?._id ?? '');
  const [kilos, setKilos] = useState(10);

  const material = useMemo(
    () => materials.find((m) => m._id === materialId) ?? materials[0],
    [materials, materialId],
  );

  // Switching city keeps the *kind* of material where it can — somebody
  // comparing نهاوند with ملایر is comparing the same copper, not whatever
  // happens to sort first in the other city's list.
  useEffect(() => {
    if (!materials.length) return;
    const sameTitle = materials.find((m) => m.title === material?.title);
    setMaterialId((sameTitle ?? materials[0])._id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityIndex]);

  const total = (material?.pricePerUnit ?? 0) * kilos;

  /**
   * The one animated moment on the page: the estimate counts up once, on the
   * first paint, and never again. It exists because the number is the point of
   * the control and a number that assembles itself is read; one that is simply
   * there is skipped.
   */
  const [shown, setShown] = useState(0);
  const settled = useRef(false);

  useEffect(() => {
    if (settled.current) { setShown(total); return; }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { settled.current = true; setShown(total); return; }

    const from = 0;
    const started = performance.now();
    let frame = 0;

    const step = (now: number) => {
      const t = Math.min(1, (now - started) / 900);
      // Ease out: fast at first, so the number is legible almost immediately.
      const eased = 1 - (1 - t) ** 3;
      setShown(from + (total - from) * eased);
      if (t < 1) frame = requestAnimationFrame(step);
      else settled.current = true;
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { if (settled.current) setShown(total); }, [total]);

  if (!city || !materials.length) return null;

  return (
    <div className="ss-board ss-rise" style={{ animationDelay: '120ms' }}>
      {/* ── which city's prices these are ── */}
      <div style={{ padding: '18px 18px 14px', borderBottom: '1px solid var(--ss-line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <Scale className="h-4 w-4" style={{ color: 'var(--ss-brass)' }} aria-hidden />
          <p className="ss-display" style={{ margin: 0, flex: 1, fontSize: 15, color: '#f4f9f6' }}>
            نرخ امروز خرید
          </p>
          <span style={{ fontSize: 11, color: 'rgba(233,244,239,0.6)' }}>تومان بر کیلوگرم</span>
        </div>

        {cities.length > 1 && (
          <div role="tablist" aria-label="انتخاب شهر" style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {cities.map((c, i) => (
              <button
                key={c._id}
                type="button"
                role="tab"
                aria-selected={i === cityIndex}
                className="ss-chip"
                data-on={i === cityIndex}
                onClick={() => setCityIndex(i)}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── the prices themselves ── */}
      <div>
        {materials.slice(0, 6).map((m, i) => (
          <div
            key={m._id}
            className="ss-board-row ss-rise"
            style={{ animationDelay: `${180 + i * 55}ms` }}
          >
            <span style={{ fontSize: 14, fontWeight: 600, color: '#dfeae5' }}>{m.title}</span>
            <span className="ss-fig" style={{ fontSize: 19, color: 'var(--ss-brass)' }}>
              {toman(m.pricePerUnit)}
            </span>
          </div>
        ))}
      </div>

      {/* ── kilograms in, تومان out ── */}
      <div style={{ padding: 18, borderTop: '1px solid var(--ss-line-strong)', background: 'rgba(0,0,0,0.18)' }}>
        <p style={{ margin: '0 0 11px', fontSize: 12, fontWeight: 700, color: 'rgba(233,244,239,0.72)' }}>
          بار شما چقدر می‌ارزد؟
        </p>

        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 14 }}>
          {materials.slice(0, 5).map((m) => (
            <button
              key={m._id}
              type="button"
              className="ss-chip"
              data-on={m._id === material?._id}
              onClick={() => setMaterialId(m._id)}
            >
              {m.title}
            </button>
          ))}
        </div>

        <label style={{ display: 'block' }}>
          <span style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(233,244,239,0.72)' }}>
            <span>وزن تقریبی</span>
            <span className="ss-fig">{fa(kilos)} کیلوگرم</span>
          </span>
          <input
            className="ss-range"
            type="range"
            min={1}
            max={MAX_KG}
            step={1}
            value={kilos}
            onChange={(e) => setKilos(Number(e.target.value))}
            aria-label="وزن تقریبی بار به کیلوگرم"
          />
        </label>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, marginTop: 6 }}>
          <div style={{ minWidth: 0 }}>
            <p className="ss-fig" style={{ margin: 0, fontSize: 'var(--ss-num)', color: 'var(--ss-brass)', lineHeight: 1.2 }}>
              {toman(shown)}
              <span style={{ fontSize: 13, fontWeight: 700, marginInlineStart: 6, color: 'rgba(233,244,239,0.7)' }}>تومان</span>
            </p>
            <p style={{ margin: '5px 0 0', fontSize: 11, color: 'rgba(233,244,239,0.55)', lineHeight: 1.8 }}>
              برآورد بر پایهٔ نرخ امروز {city.name}؛ مبلغ نهایی پس از توزین در محل ثبت می‌شود.
            </p>
          </div>

          <Link
            // The city's own page, not the generic one: whoever is reading
            // نهاوند's board wants نهاوند's full list.
            href={city.slug ? `/tariff/${city.slug}` : '/tariff'}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0,
              padding: '10px 15px', borderRadius: 999, textDecoration: 'none',
              background: 'rgba(255,255,255,0.1)', border: '1px solid var(--ss-line-strong)',
              color: '#eef5f1', fontSize: 12, fontWeight: 700,
            }}
          >
            همهٔ نرخ‌ها
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}
