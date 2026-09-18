'use client';

import { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Map as MapIcon, Layers, Info, Search, MapPin, Crosshair, X } from 'lucide-react';

import { axiosService } from '@/lib/axiosService';
import { C, S, alpha, fa } from '@/components/ui/tokens';
import { Card, Chip, EmptyState, Shimmer, Btn } from '@/components/ui/kit';
import { featuresAt, boundsOf } from './geo';
import { ruleFor } from './city-map-canvas';
import type { Layer } from './city-map-canvas';

/**
 * نقشهٔ شهر — the published plan, for anybody.
 *
 * No account, deliberately: somebody checking the density band of a plot is
 * often deciding whether to buy it, and a login wall at that moment is the
 * wrong answer to a question the municipality has already published.
 *
 * The layer index and the geometry are fetched separately. The index is a few
 * hundred bytes and draws the whole switcher; a single layer's polygons are
 * megabytes. Loading every layer to render a legend is exactly how a map page
 * becomes unusable on a phone, so a layer's geometry is fetched only when it is
 * the one being drawn.
 */

const Canvas = dynamic(() => import('./city-map-canvas'), {
  ssr: false,
  loading: () => <div style={{ height: 460, borderRadius: S.r3, background: C.surface2 }} />,
});

const KIND_TITLES: Record<string, string> = {
  boundary: 'محدودهٔ شهری',
  zoning: 'کاربری اراضی',
  density: 'تراکم ساختمانی',
  green: 'فضای سبز',
  district: 'مناطق و محلات',
  other: 'سایر',
};

export default function CityMapView({ slug }: { slug?: string }) {
  const [layers, setLayers] = useState<Layer[]>([]);
  const [city, setCity] = useState<any>(null);
  const [active, setActive] = useState<Layer | null>(null);
  const [loading, setLoading] = useState(true);
  const [drawing, setDrawing] = useState(false);
  const [error, setError] = useState('');

  /** The point the citizen is asking about, and what the plan says about it. */
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(null);
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<{ label: string; lat: number; lng: number }[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchNote, setSearchNote] = useState('');

  /**
   * Which city's plan is this?
   *
   * The page used to call the *authenticated* `/api/v1/city-map`, which reads
   * the caller's own city — and answered `401` to the visitor with no account
   * this page exists for, shown as «نقشه‌ای منتشر نشده». So the city is
   * resolved first and the public endpoint is used throughout: from the route
   * when the page is a city's own, otherwise from `?city=`, otherwise the
   * cities that actually publish a map, with a chooser when there is a choice.
   */
  const [slugs, setSlugs] = useState<{ name: string; slug: string }[]>([]);
  const [chosen, setChosen] = useState<string>(slug || '');

  useEffect(() => {
    if (slug) return;
    const wanted = new URLSearchParams(window.location.search).get('city');
    axiosService({ url: '/api/v1/cities?includeInactive=true', method: 'get' })
      .then((res: any) => {
        const withMap = (res?.data?.cities || [])
          .filter((c: any) => (c.services || []).includes('citymap'))
          .map((c: any) => ({ name: c.name, slug: c.slug }));
        setSlugs(withMap);
        setChosen((current) => current || wanted || withMap[0]?.slug || '');
      })
      .catch(() => setSlugs([]));
  }, [slug]);

  const base = chosen ? `/api/v1/public/city-map/${chosen}` : '';

  useEffect(() => {
    if (!base) return;
    setLoading(true);
    setActive(null);
    setMarker(null);
    axiosService({ url: base, method: 'get' })
      .then((res: any) => {
        setLayers(res?.data?.layers || []);
        setCity(res?.data?.city || null);
        setError('');
      })
      .catch((e: any) => setError(e?.data?.message || 'نقشهٔ این شهر در دسترس نیست.'))
      .finally(() => setLoading(false));
  }, [base]);

  /** Fetch a layer's geometry the first time it is chosen, then keep it. */
  const choose = useCallback(
    (layer: Layer) => {
      if (layer.geojson) return setActive(layer);
      setDrawing(true);
      axiosService({ url: `${base}/${layer.key}`, method: 'get' })
        .then((res: any) => {
          const full = { ...layer, ...(res?.data?.layer || {}) };
          setLayers((all) => all.map((l) => (l.key === layer.key ? full : l)));
          setActive(full);
        })
        .catch((e: any) => setError(e?.data?.message || 'این لایه بارگذاری نشد.'))
        .finally(() => setDrawing(false));
    },
    [base],
  );

  // Open on the first layer, so the page is a map rather than a menu.
  useEffect(() => {
    if (!active && layers.length) choose(layers[0]);
  }, [layers, active, choose]);

  /**
   * Once a point is chosen, the answer must cover every layer — not only the
   * one being drawn. The others are fetched in the background so «کدام پهنه»
   * is answered completely rather than one tab at a time.
   */
  useEffect(() => {
    if (!marker) return;
    const missing = layers.filter((l) => !l.geojson);
    if (!missing.length) return;

    let alive = true;
    Promise.all(
      missing.map((l) =>
        axiosService({ url: `${base}/${l.key}`, method: 'get' })
          .then((res: any) => ({ key: l.key, full: res?.data?.layer }))
          .catch(() => null),
      ),
    ).then((loaded) => {
      if (!alive) return;
      const byKey = new Map(loaded.filter(Boolean).map((r: any) => [r.key, r.full]));
      setLayers((all) => all.map((l) => (byKey.has(l.key) ? { ...l, ...byKey.get(l.key) } : l)));
    });
    return () => { alive = false; };
  }, [marker, layers, base]);

  /**
   * What every *loaded* layer says about this point — not just the one on
   * screen. A citizen asking «چه چیزی روی زمین من اثر دارد» wants the green
   * reserve as much as the land use, and switching layers to find out is a
   * game of hide and seek.
   */
  const report = marker
    ? layers
        .filter((l) => l.geojson)
        .map((l) => ({ layer: l, found: featuresAt(l.geojson, marker) }))
        .filter((r) => r.found.length > 0)
    : [];

  const search = async () => {
    const q = query.trim();
    if (q.length < 2) return;
    setSearching(true);
    setSearchNote('');
    setHits([]);
    try {
      /**
       * Pinned to the city, or «بوعلی» answers with گرگان and قزوین — which is
       * exactly what it did before this box existed. The boundary layer is the
       * precise extent when it is loaded; otherwise a degree-and-a-bit around
       * the city's own centre, which is still enough to exclude other provinces.
       */
      const drawn = layers.find((l) => l.kind === 'boundary' && l.geojson) || (active?.geojson ? active : null);
      const box = drawn?.geojson ? boundsOf(drawn.geojson) : null;
      const pad = 0.12;
      const viewbox = box
        ? `${box.west},${box.north},${box.east},${box.south}`
        : city?.lat
          ? `${city.lng - pad},${city.lat + pad},${city.lng + pad},${city.lat - pad}`
          : '';
      const res = await fetch(`/geo-search?q=${encodeURIComponent(q)}&viewbox=${viewbox}`);
      const data = await res.json();
      const rows = data.results || [];
      if (!rows.length) {
        setSearchNote('نشانی در این شهر پیدا نشد؛ می‌توانید مستقیم روی نقشه بزنید.');
        return;
      }
      // Answer immediately with the best match and keep the rest as
      // alternatives: the question is «ملک من کجاست», not «کدام‌یک از شش».
      setMarker({ lat: rows[0].lat, lng: rows[0].lng });
      setHits(rows.length > 1 ? rows : []);
    } catch {
      setSearchNote('جست‌وجو انجام نشد؛ روی نقشه بزنید.');
    } finally {
      setSearching(false);
    }
  };

  const pick = (row: { lat: number; lng: number }) => {
    setMarker({ lat: row.lat, lng: row.lng });
    setHits([]);
  };

  if (loading || (!slug && !chosen && slugs.length === 0 && !error)) {
    return (
      <div style={{ display: 'grid', gap: S.s4 }}>
        <Shimmer height={40} />
        <Shimmer height={460} />
      </div>
    );
  }

  if (error || layers.length === 0) {
    return (
      <EmptyState
        icon={<MapIcon className="h-6 w-6" />}
        title="نقشه‌ای منتشر نشده"
        sub={error || 'شهرداری این شهر هنوز لایه‌ای از طرح تفصیلی را منتشر نکرده است.'}
      />
    );
  }

  return (
    <div style={{ display: 'grid', gap: S.s4 }}>
      {!slug && slugs.length > 1 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: S.s2, alignItems: 'center' }}>
          <span style={{ fontSize: S.xs, color: C.muted, fontWeight: 700 }}>شهر:</span>
          {slugs.map((c) => (
            <Chip key={c.slug} active={chosen === c.slug} onClick={() => setChosen(c.slug)}>{c.name}</Chip>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: S.s2 }}>
        {layers.map((layer) => (
          <Chip key={layer.key} active={active?.key === layer.key} onClick={() => choose(layer)}>
            {layer.title}
          </Chip>
        ))}
      </div>

      {/* «آدرسم در کدام پهنه است» — the question this page exists for. */}
      <Card>
        <div style={{ padding: S.s4, display: 'grid', gap: S.s3 }}>
          <div style={{ display: 'flex', gap: S.s2, flexWrap: 'wrap' }}>
            <input
              className="pm-field"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') search(); }}
              placeholder="نشانی یا نام خیابان را بنویسید"
              style={{ flex: 1, minWidth: 200 }}
            />
            <Btn onClick={search} disabled={searching}>
              <Search className="h-4 w-4" />
              {searching ? 'جست‌وجو…' : 'پیدا کن'}
            </Btn>
          </div>
          <p style={{ margin: 0, fontSize: 11, color: C.subtle, lineHeight: 1.8 }}>
            یا مستقیم روی نقشه بزنید تا وضعیت همان نقطه را ببینید.
          </p>

          {hits.length > 1 && (
            <div style={{ display: 'grid', gap: 4 }}>
              {hits.map((h, i) => (
                <button
                  key={i}
                  onClick={() => pick(h)}
                  style={{
                    textAlign: 'start', padding: `${S.s2}px ${S.s3}px`, borderRadius: S.r2,
                    background: C.surface2, border: `1px solid ${C.border}`,
                    color: C.text, fontSize: S.xs, cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  {h.label}
                </button>
              ))}
            </div>
          )}
          {searchNote && <p style={{ margin: 0, fontSize: 11, color: C.statusWarn }}>{searchNote}</p>}

          {marker && (
            <div style={{ display: 'grid', gap: S.s2, paddingTop: S.s3, borderTop: `1px solid ${C.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <MapPin className="h-4 w-4" style={{ color: C.green }} />
                <span style={{ fontSize: S.xs, fontWeight: 800, color: C.textStrong }}>وضعیت این نقطه</span>
                <button
                  onClick={() => setMarker(null)}
                  aria-label="پاک‌کردن نقطه"
                  style={{ marginInlineStart: 'auto', background: 'none', border: 0, cursor: 'pointer', color: C.subtle }}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {report.length === 0 ? (
                <p style={{ margin: 0, fontSize: S.xs, color: C.muted, lineHeight: 1.9 }}>
                  این نقطه در هیچ‌کدام از لایه‌های بارگذاری‌شده نیست. لایه‌های دیگر را باز کنید تا
                  بررسی شوند.
                </p>
              ) : (
                report.map(({ layer, found }) => {
                  const rule = ruleFor(layer, found[0]?.properties);
                  return (
                    <div key={layer.key} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <span
                        aria-hidden
                        style={{
                          width: 12, height: 12, borderRadius: 3, marginTop: 4, flexShrink: 0,
                          background: rule?.fillColor || rule?.color || C.statusInfo,
                          border: `1.5px solid ${rule?.color || C.statusInfo}`,
                        }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <span style={{ fontSize: S.xs, fontWeight: 700, color: C.text }}>{layer.title}</span>
                        <span style={{ marginInlineStart: 6, fontSize: S.xs, color: C.muted }}>
                          {rule?.label || found[0]?.properties?.name || found[0]?.properties?.usage || 'در این پهنه است'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}

              <p style={{ margin: 0, fontSize: 10, color: C.subtle, lineHeight: 1.8 }}>
                این نتیجه راهنماست و جای استعلام رسمی از شهرداری را نمی‌گیرد.
              </p>
            </div>
          )}
        </div>
      </Card>

      <div style={{ position: 'relative' }}>
        <Canvas
          layer={active}
          center={marker || { lat: city?.lat || 34.7992, lng: city?.lng || 48.5146 }}
          marker={marker}
          onPick={(p) => setMarker(p)}
          markerLabel={
            report.length
              ? report.map((r) => `${r.layer.title}: ${ruleFor(r.layer, r.found[0]?.properties)?.label || r.found[0]?.properties?.name || '—'}`).join(' — ')
              : 'در هیچ لایهٔ بارگذاری‌شده‌ای نیست'
          }
        />
        {drawing && (
          <div
            style={{
              position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
              background: alpha(C.surface, 70), borderRadius: S.r3, pointerEvents: 'none',
            }}
          >
            <span style={{ fontSize: S.xs, fontWeight: 800, color: C.muted }}>در حال بارگذاری لایه…</span>
          </div>
        )}
      </div>

      {active && (
        <Card>
          <div style={{ padding: S.s4, display: 'grid', gap: S.s3 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: S.s2 }}>
              <Layers className="h-4 w-4" style={{ color: C.muted }} />
              <span style={{ fontSize: S.sm, fontWeight: 800, color: C.textStrong }}>{active.title}</span>
              <span style={{ fontSize: 11, color: C.subtle }}>{KIND_TITLES[active.kind] || ''}</span>
            </div>

            {(active.legend || []).length > 0 && (
              <div style={{ display: 'grid', gap: S.s2 }}>
                {(active.legend || []).map((rule, i) => (
                  <div key={`${rule.label}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: S.s2 }}>
                    <span
                      aria-hidden
                      style={{
                        width: 14, height: 14, borderRadius: 4, flexShrink: 0,
                        background: rule.fillColor || rule.color,
                        border: `1.5px solid ${rule.color}`,
                      }}
                    />
                    <span style={{ fontSize: S.xs, color: C.text, fontWeight: 700 }}>{rule.label}</span>
                    {rule.note && (
                      <span style={{ fontSize: 11, color: C.muted }}>— {rule.note}</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {active.source && (
              <p style={{ margin: 0, display: 'flex', gap: 6, alignItems: 'flex-start', fontSize: 11, color: C.subtle, lineHeight: 1.8 }}>
                <Info className="h-3.5 w-3.5" style={{ flexShrink: 0, marginTop: 2 }} />
                منبع: {active.source}
              </p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
