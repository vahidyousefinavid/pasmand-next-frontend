'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { IRAN_RING } from '@/lib/iran';
import type { PublicCity } from '@/lib/publicData';

/**
 * نقشهٔ پوشش — where شهرشهر runs, and where it is going.
 *
 * The country is drawn from Iran's real border (175 points, Natural Earth), not
 * an illustration, and every city on it sits at its true coordinates. That is
 * the whole argument of the picture: a service that shows you a real map with
 * two cities lit is more credible than one that shows a stylised map covered in
 * invented pins. The cities that have not opened are drawn differently and
 * labelled «به‌زودی» — the map is allowed to show ambition, not to claim it.
 *
 * Canvas rather than SVG because of the halftone: a few hundred dots inside a
 * clipped path, re-rendered on a slow pulse, is a handful of drawing calls here
 * and a few hundred DOM nodes there. Nothing is fetched — the outline ships in
 * the bundle, since a CDN is not reachable from parts of Iran.
 *
 * The map is decoration in the accessibility sense: the same cities are listed
 * beside it as real links, which is what a keyboard, a screen reader and a
 * crawler use. Nothing here is the only copy of anything.
 */

interface MapCity extends PublicCity {
  lat: number;
  lng: number;
}

const RING_POINTS = IRAN_RING.length / 2;

/** Longitude/latitude bounds of the outline, computed once. */
const BOUNDS = (() => {
  let minLon = Infinity; let maxLon = -Infinity; let minLat = Infinity; let maxLat = -Infinity;
  for (let i = 0; i < IRAN_RING.length; i += 2) {
    minLon = Math.min(minLon, IRAN_RING[i]);
    maxLon = Math.max(maxLon, IRAN_RING[i]);
    minLat = Math.min(minLat, IRAN_RING[i + 1]);
    maxLat = Math.max(maxLat, IRAN_RING[i + 1]);
  }
  return { minLon, maxLon, minLat, maxLat };
})();

/**
 * Equirectangular, with longitudes squeezed by cos(mid-latitude).
 *
 * Iran spans fourteen degrees of latitude, where a degree of longitude is about
 * a fifth shorter at the top than at the bottom; without the correction the
 * country comes out visibly wide and stops looking like itself.
 */
const MID_LAT_COS = Math.cos(((BOUNDS.minLat + BOUNDS.maxLat) / 2) * (Math.PI / 180));

function project(lon: number, lat: number, w: number, h: number, pad: number) {
  const spanX = (BOUNDS.maxLon - BOUNDS.minLon) * MID_LAT_COS;
  const spanY = BOUNDS.maxLat - BOUNDS.minLat;
  const scale = Math.min((w - pad * 2) / spanX, (h - pad * 2) / spanY);

  const offsetX = (w - spanX * scale) / 2;
  const offsetY = (h - spanY * scale) / 2;

  return {
    x: offsetX + (lon - BOUNDS.minLon) * MID_LAT_COS * scale,
    y: offsetY + (BOUNDS.maxLat - lat) * scale,
  };
}

export default function IranMap({ cities }: { cities: MapCity[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [hover, setHover] = useState<{ city: MapCity; x: number; y: number } | null>(null);
  const pointsRef = useRef<{ city: MapCity; x: number; y: number }[]>([]);

  const draw = useCallback((time: number, reduced: boolean) => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    if (!w || !h) return;

    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const pad = Math.max(18, Math.min(w, h) * 0.06);
    const at = (lon: number, lat: number) => project(lon, lat, w, h, pad);

    // ── the country ──
    const path = new Path2D();
    for (let i = 0; i < RING_POINTS; i += 1) {
      const { x, y } = at(IRAN_RING[i * 2], IRAN_RING[i * 2 + 1]);
      if (i === 0) path.moveTo(x, y);
      else path.lineTo(x, y);
    }
    path.closePath();

    const fill = ctx.createLinearGradient(0, 0, 0, h);
    fill.addColorStop(0, 'rgba(255,255,255,0.055)');
    fill.addColorStop(1, 'rgba(255,255,255,0.015)');
    ctx.fillStyle = fill;
    ctx.fill(path);

    // ── the halftone, clipped to the country ──
    // Texture, not data: it says «the whole country» without putting a mark
    // anywhere the service does not run.
    const active = pointsRef.current.find((p) => p.city.isActive);
    ctx.save();
    ctx.clip(path);
    const step = Math.max(11, Math.min(w, h) / 26);
    const wave = reduced ? 0 : (time % 6200) / 6200;

    for (let y = pad / 2; y < h; y += step) {
      for (let x = pad / 2; x < w; x += step) {
        let alpha = 0.16;
        if (active) {
          // Brighter near the city that is running, fading outward: coverage
          // spreading from where it actually started.
          const d = Math.hypot(x - active.x, y - active.y) / Math.max(w, h);
          const ring = reduced ? 0 : Math.max(0, 1 - Math.abs(d - wave) * 6) * 0.42;
          alpha = 0.1 + Math.max(0, 0.3 - d * 0.5) + ring;
        }
        ctx.fillStyle = `rgba(220,240,232,${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(x, y, 1.15, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    // ── the border ──
    ctx.strokeStyle = 'rgba(120, 220, 185, 0.55)';
    ctx.lineWidth = 1.4;
    ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(53, 185, 138, 0.55)';
    ctx.shadowBlur = 14;
    ctx.stroke(path);
    ctx.shadowBlur = 0;

    // ── the cities ──
    const points = cities
      .filter((c) => Number.isFinite(c.lat) && Number.isFinite(c.lng))
      .map((city) => ({ city, ...at(city.lng, city.lat) }));
    pointsRef.current = points;

    // A thin line from the running city to each one that is next — the shape of
    // the expansion, drawn only between cities that really exist.
    const origin = points.find((p) => p.city.isActive);
    if (origin) {
      ctx.setLineDash([3, 5]);
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(227, 173, 85, 0.35)';
      points.filter((p) => !p.city.isActive).forEach((p) => {
        ctx.beginPath();
        ctx.moveTo(origin.x, origin.y);
        const midX = (origin.x + p.x) / 2;
        const midY = (origin.y + p.y) / 2 - Math.hypot(p.x - origin.x, p.y - origin.y) * 0.18;
        ctx.quadraticCurveTo(midX, midY, p.x, p.y);
        ctx.stroke();
      });
      ctx.setLineDash([]);
    }

    const pulse = reduced ? 0.5 : (Math.sin(time / 620) + 1) / 2;
    /** Label boxes already on the map, so the next one can avoid them. */
    const placed: { lx: number; ly: number; w: number }[] = [];

    points.forEach(({ city, x, y }) => {
      const live = city.isActive;
      const colour = live ? '#4ade9f' : '#e3ad55';

      if (live) {
        // A halo that breathes: the one place on this page where motion says
        // something — this city is running right now.
        const r = 12 + pulse * 9;
        const halo = ctx.createRadialGradient(x, y, 2, x, y, r);
        halo.addColorStop(0, 'rgba(74, 222, 159, 0.45)');
        halo.addColorStop(1, 'rgba(74, 222, 159, 0)');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = `rgba(74, 222, 159, ${0.5 - pulse * 0.35})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(x, y, 9 + pulse * 7, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.setLineDash([2, 3]);
        ctx.strokeStyle = 'rgba(227, 173, 85, 0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.fillStyle = colour;
      ctx.beginPath();
      ctx.arc(x, y, live ? 4.6 : 3.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = `700 ${live ? 13 : 12}px IRANSans, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = live ? 'rgba(240, 253, 247, 0.96)' : 'rgba(233, 244, 239, 0.68)';

      /**
       * Where the name goes.
       *
       * نهاوند and ملایر are forty kilometres apart, which at this scale is a
       * few pixels: placed identically, the second name lands under the first
       * and disappears. So each label takes the first free spot around its
       * dot — above, below, then to either side — and the dots themselves never
       * move, because their positions are the one thing on this map that is
       * data rather than layout.
       */
      const width = ctx.measureText(city.name).width;
      const spots = [
        { lx: x, ly: y - (live ? 22 : 18) },
        { lx: x, ly: y + (live ? 24 : 20) },
        { lx: x - width / 2 - 14, ly: y },
        { lx: x + width / 2 + 14, ly: y },
      ];

      const spot = spots.find((candidate) => !placed.some((box) =>
        Math.abs(box.lx - candidate.lx) < (box.w + width) / 2 + 6
        && Math.abs(box.ly - candidate.ly) < 15)) || spots[0];

      placed.push({ lx: spot.lx, ly: spot.ly, w: width });
      ctx.fillText(city.name, spot.lx, spot.ly);
    });
  }, [cities]);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame = 0;
    let stopped = false;

    const loop = (time: number) => {
      if (stopped) return;
      draw(time, reduced);
      // A still map for anybody who asked for one — drawn once, then left.
      if (!reduced) frame = requestAnimationFrame(loop);
    };

    frame = requestAnimationFrame(loop);

    const observer = new ResizeObserver(() => draw(performance.now(), reduced));
    if (wrapRef.current) observer.observe(wrapRef.current);

    return () => { stopped = true; cancelAnimationFrame(frame); observer.disconnect(); };
  }, [draw]);

  /** Hit-testing in canvas space, so the whole picture is one control. */
  const onMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const found = pointsRef.current.find((p) => Math.hypot(p.x - x, p.y - y) < 22);
    setHover(found ? { city: found.city, x: found.x, y: found.y } : null);
  };

  const onClick = () => {
    if (hover?.city.slug) router.push(`/tariff/${hover.city.slug}`);
  };

  return (
    <div
      ref={wrapRef}
      style={{ position: 'relative', width: '100%', aspectRatio: '1 / 0.86', minHeight: 260 }}
    >
      <canvas
        ref={canvasRef}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
        onClick={onClick}
        aria-hidden
        style={{
          width: '100%', height: '100%', display: 'block',
          cursor: hover ? 'pointer' : 'default',
        }}
      />

      {hover && (
        <div
          style={{
            position: 'absolute', insetInlineStart: hover.x, top: hover.y - 54,
            transform: 'translateX(50%)', pointerEvents: 'none', whiteSpace: 'nowrap',
            padding: '7px 12px', borderRadius: 12,
            background: 'rgba(6, 32, 26, 0.94)', border: '1px solid rgba(255,255,255,0.16)',
            color: '#eef5f1', fontSize: 12, fontWeight: 800,
          }}
        >
          {hover.city.name}
          <span style={{ marginInlineStart: 7, fontWeight: 700, color: hover.city.isActive ? '#4ade9f' : '#e3ad55' }}>
            {hover.city.isActive ? 'فعال' : 'به‌زودی'}
          </span>
        </div>
      )}
    </div>
  );
}
