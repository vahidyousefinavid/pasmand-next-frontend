'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { IRAN_RING } from '@/lib/iran';
import { serviceIcon } from '@/lib/cityServices';

/**
 * The hero: Iran in dots, one city at a time, and the services passing under it.
 *
 * It replaces a photograph of a garden in همدان — a picture of one city is the
 * wrong first image for a platform whose argument is that any municipality can
 * join — and it replaces a globe, which was the same idea told from too far
 * away: Iran is 1.5% of a sphere, so the country ended up a speck and the whole
 * picture read as decoration.
 *
 * Flat, close and literal instead:
 *   · the country drawn as a field of dots, on its own lat/lng grid
 *   · every city this platform runs in, at its true coordinates
 *   · one city at a time stepped through, its name and its state beside it
 *   · the services that city runs sliding past underneath, with their icons
 *
 * All of it is real: the cities are the ones the API returned, and a city that
 * has not opened yet is a ring rather than a filled dot — the same distinction
 * the coverage map further down the page makes. Canvas and CSS, no image and no
 * library, because nothing on this site may come from a CDN.
 */

export interface HeroCity {
  name: string;
  slug: string;
  lat: number;
  lng: number;
  isActive: boolean;
  /** Keys of the modules this municipality runs. */
  services: string[];
}

export interface HeroService {
  key: string;
  title: string;
  icon: string;
  color: string;
}

/** Seconds each city holds the slide. */
const DWELL = 3.6;
/** Grid spacing for sampling the country, in degrees. */
const LAND_STEP = 0.34;

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

/** Equirectangular, squeezed by cos(mid-latitude) — or Iran comes out too wide. */
const MID_LAT_COS = Math.cos(((BOUNDS.minLat + BOUNDS.maxLat) / 2) * (Math.PI / 180));

function inside(lng: number, lat: number): boolean {
  let is = false;
  const n = IRAN_RING.length / 2;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = IRAN_RING[i * 2];
    const yi = IRAN_RING[i * 2 + 1];
    const xj = IRAN_RING[j * 2];
    const yj = IRAN_RING[j * 2 + 1];
    if ((yi > lat) !== (yj > lat) && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) is = !is;
  }
  return is;
}

export default function HeroMap({
  cities,
  catalogue,
}: {
  cities: HeroCity[];
  catalogue: HeroService[];
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [slide, setSlide] = useState(0);

  // Cities with coordinates, running ones first: the slideshow should open on
  // a city somebody can actually use.
  const shown = useMemo(
    () => cities
      .filter((c) => Number.isFinite(c.lat) && Number.isFinite(c.lng))
      .sort((a, b) => Number(b.isActive) - Number(a.isActive)),
    [cities],
  );

  const active = shown[slide % Math.max(1, shown.length)];

  // The slideshow. It stops for `prefers-reduced-motion`: a hero that changes
  // under somebody who asked for less movement is the thing they asked to
  // avoid.
  useEffect(() => {
    if (shown.length < 2) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const id = setInterval(() => setSlide((n) => (n + 1) % shown.length), DWELL * 1000);
    return () => clearInterval(id);
  }, [shown.length]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const width = canvas.clientWidth || 520;
    const height = canvas.clientHeight || 380;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const pad = 18;
    const spanX = (BOUNDS.maxLon - BOUNDS.minLon) * MID_LAT_COS;
    const spanY = BOUNDS.maxLat - BOUNDS.minLat;
    const scale = Math.min((width - pad * 2) / spanX, (height - pad * 2) / spanY);
    const offsetX = (width - spanX * scale) / 2;
    const offsetY = (height - spanY * scale) / 2;
    const at = (lon: number, lat: number) => ({
      x: offsetX + (lon - BOUNDS.minLon) * MID_LAT_COS * scale,
      y: offsetY + (BOUNDS.maxLat - lat) * scale,
    });

    // ── the country, dot by dot ──
    ctx.fillStyle = '#7fe3ef';
    for (let lat = BOUNDS.minLat; lat <= BOUNDS.maxLat; lat += LAND_STEP) {
      // Meridians converge towards the pole; widening the step by 1/cos(lat)
      // keeps the dots evenly spaced on the ground rather than crowding north.
      const step = LAND_STEP / Math.max(0.4, Math.cos((lat * Math.PI) / 180));
      for (let lon = BOUNDS.minLon; lon <= BOUNDS.maxLon; lon += step) {
        if (!inside(lon, lat)) continue;
        const { x, y } = at(lon, lat);
        // A soft vertical falloff, so the field reads as lit from above rather
        // than as a flat stencil.
        ctx.globalAlpha = 0.22 + 0.5 * (1 - (y - offsetY) / (spanY * scale));
        ctx.beginPath();
        ctx.arc(x, y, 1.35, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    // ── the cities ──
    shown.forEach((city, i) => {
      const { x, y } = at(city.lng, city.lat);
      const isCurrent = active && city.slug === active.slug;
      const colour = city.isActive ? '#ffffff' : 'rgba(217,162,78,0.95)';

      if (isCurrent) {
        const halo = ctx.createRadialGradient(x, y, 0, x, y, 30);
        halo.addColorStop(0, 'rgba(255,255,255,0.32)');
        halo.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(x, y, 30, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, 11, 0, Math.PI * 2);
        ctx.strokeStyle = colour;
        ctx.globalAlpha = 0.75;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      ctx.beginPath();
      ctx.arc(x, y, isCurrent ? 5 : 3.2, 0, Math.PI * 2);
      ctx.fillStyle = colour;
      ctx.globalAlpha = isCurrent ? 1 : 0.62;
      ctx.fill();

      // A city that has not opened yet is a ring, not a filled dot.
      if (!city.isActive) {
        ctx.beginPath();
        ctx.arc(x, y, 6.5, 0, Math.PI * 2);
        ctx.strokeStyle = colour;
        ctx.globalAlpha = 0.5;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      if (isCurrent) {
        // The name rides on the map itself, tied to its dot by a short leader.
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.moveTo(x, y - 12);
        ctx.lineTo(x, y - 26);
        ctx.strokeStyle = colour;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.font = '700 15px Estedad, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(city.name, x, y - 30);
      }
      ctx.globalAlpha = 1;
    });
  }, [shown, active]);

  const activeServices = active
    ? catalogue.filter((s) => active.services.includes(s.key))
    : catalogue;
  /**
   * Repeated until the row is long enough to loop.
   *
   * Doubling was right for a city running five modules and silly for one
   * running a single service — ملایر showed «جمع‌آوری پسماند» twice, side by
   * side, which reads as a bug rather than as a loop. The row is filled to at
   * least eight chips and always an even number of copies, so translating by
   * half its width lands exactly where it started.
   */
  const marquee = useMemo(() => {
    if (!activeServices.length) return [];
    const copies = Math.max(2, Math.ceil(8 / activeServices.length) * 2);
    return Array.from({ length: copies }, () => activeServices).flat();
  }, [activeServices]);

  return (
    <div style={{ display: 'grid', gap: 14, width: '100%' }}>
      <div style={{ position: 'relative' }}>
        <canvas
          ref={canvasRef}
          // The same facts are in the text beside and below it: the city names,
          // their state and the service list.
          aria-hidden
          style={{ width: '100%', height: 'clamp(240px, 32vw, 340px)', display: 'block' }}
        />

        {/* The slide's caption, as real text rather than pixels: it is the one
            thing here a screen reader and a crawler should read. */}
        {active && (
          <p
            aria-live="polite"
            style={{
              position: 'absolute', insetInlineStart: 0, bottom: 0, margin: 0,
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontSize: 13, color: 'rgba(255,255,255,0.86)',
            }}
          >
            <span
              aria-hidden
              style={{
                width: 8, height: 8, borderRadius: 999, flexShrink: 0,
                background: active.isActive ? '#fff' : 'transparent',
                border: active.isActive ? 'none' : '1.5px solid rgba(217,162,78,0.95)',
              }}
            />
            <strong style={{ color: '#fff', fontWeight: 800 }}>{active.name}</strong>
            <span>
              {active.isActive
                ? `${activeServices.length ? 'خدمات فعال' : 'به‌زودی'}`
                : 'هنوز باز نشده'}
            </span>
          </p>
        )}
      </div>

      {/* ── the services, sliding past ──
          One row, the city's own modules, each with the icon it carries
          everywhere else in the product. */}
      <div className="ss-hero-ticker" aria-hidden>
        <div className="ss-hero-track">
          {marquee.map((service, i) => {
            const Icon = serviceIcon(service.icon);
            return (
              <span key={`${service.key}-${i}`} className="ss-hero-chip">
                <Icon className="h-4 w-4" style={{ color: service.color }} />
                {service.title}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
