'use client';

import { useEffect, useRef } from 'react';

import { IRAN_RING } from '@/lib/iran';

/**
 * «کرهٔ شهر» — the hero.
 *
 * A point-cloud globe, turning slowly, with this platform's cities burning on
 * it at their real coordinates and the services a municipality runs orbiting
 * around it. It replaces a stock photograph of a garden in همدان: a picture of
 * one city is the wrong first image for a platform whose whole argument is
 * that any city can join, and it said nothing about what the product does.
 *
 * Everything here is drawn on a plain 2D canvas — no three.js, no WebGL, no
 * image. Three reasons, in order: nothing on this site may come from a CDN and
 * a hero that waits on a download is a hero nobody sees; this box builds at the
 * edge of its disk; and a generated globe can carry *real* data — these are the
 * cities the API returned, at their real lat/lng, and the services those cities
 * actually run.
 *
 * It is 3D in the way that counts, the same way `EcoGlobe` on the login screen
 * is: real points on a real sphere, rotated and divided through by depth, so
 * the silhouette and the parallax are genuine rather than a looping animation.
 * Iran is not a texture either — the country's own outline (lib/iran.ts, 175
 * points from Natural Earth) is tested against every point of the cloud, so the
 * landmass is *denser dots* rather than a drawing pasted on a ball.
 */

export interface GlobeCity {
  name: string;
  lat: number;
  lng: number;
  isActive: boolean;
}

export interface GlobeService {
  title: string;
  color: string;
}

interface Props {
  cities: GlobeCity[];
  services: GlobeService[];
  /** CSS pixels; the backing store is this times the device pixel ratio. */
  size?: number;
  className?: string;
}

/** Enough points to read as a surface, few enough for a cheap phone. */
const SPHERE_POINTS = 1700;
/**
 * Iran, sampled on its own grid.
 *
 * The country is about 1.5% of the globe's surface, so testing a uniform cloud
 * against the outline put roughly twenty dots inside it — invisible. The
 * landmass gets its own lat/lng grid instead, which is also what makes it read
 * as a *drawn* country rather than a patch of denser noise.
 */
const LAND_STEP = 0.52;
/** Degrees per second. Slow enough to read a city name before it leaves. */
const SPIN = 7;
/** How long each city holds its label, in seconds. */
const CITY_DWELL = 3.4;

interface Pt { x: number; y: number; z: number }

/** Fibonacci sphere — even scatter; a lat/long grid bunches at the poles. */
function sphere(n: number): Pt[] {
  const out: Pt[] = [];
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const th = phi * i;
    out.push({ x: Math.cos(th) * r, y, z: Math.sin(th) * r });
  }
  return out;
}

/** A point on the unit sphere, from degrees. */
function fromLatLng(lat: number, lng: number): Pt {
  const a = (90 - lat) * (Math.PI / 180);
  const b = (lng + 180) * (Math.PI / 180);
  return {
    x: -Math.sin(a) * Math.cos(b),
    y: Math.cos(a),
    z: Math.sin(a) * Math.sin(b),
  };
}

/** Back to degrees, to ask whether a cloud point is inside the country. */
function toLatLng(p: Pt): { lat: number; lng: number } {
  const lat = 90 - (Math.acos(Math.max(-1, Math.min(1, p.y))) * 180) / Math.PI;
  const lng = (Math.atan2(p.z, -p.x) * 180) / Math.PI - 180;
  return { lat, lng: lng < -180 ? lng + 360 : lng };
}

/**
 * Ray casting against the flat [lng, lat, …] ring. Run once at setup for the
 * whole cloud, never per frame.
 */
function insideIran(lng: number, lat: number): boolean {
  let inside = false;
  const n = IRAN_RING.length / 2;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = IRAN_RING[i * 2];
    const yi = IRAN_RING[i * 2 + 1];
    const xj = IRAN_RING[j * 2];
    const yj = IRAN_RING[j * 2 + 1];
    if ((yi > lat) !== (yj > lat) && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

const cssVar = (name: string, fallback: string) =>
  (typeof window === 'undefined'
    ? fallback
    : getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback);

export default function ServiceGlobe({ cities, services, size = 420, className }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const c = size / 2;
    /**
     * Close, not far.
     *
     * At a radius that fitted the whole sphere in the canvas, Iran was a bright
     * speck near the limb — geographically honest and visually nothing. The
     * view sits closer now: the silhouette runs past the edges, the country is
     * the size of a hand, and the services cross in front of it and behind it.
     */
    const radius = size * 0.46;
    /**
     * Tilt and starting spin are solved, not eyeballed: at 32° of tilt and
     * -217° of spin the country's centroid (32°N 53°E) lands exactly at the
     * centre of the canvas, facing the reader. Iran was floating up in the
     * corner before, half of it past the edge.
     */
    const TILT = (32 * Math.PI) / 180;

    const cloud = sphere(SPHERE_POINTS).map((p) => ({ p }));

    // The country, dot by dot, on its own grid.
    const land: Pt[] = [];
    for (let lat = 24; lat <= 40.5; lat += LAND_STEP) {
      // Meridians converge towards the pole; widening the step by 1/cos(lat)
      // keeps the dots evenly spaced on the ground instead of crowding north.
      const step = LAND_STEP / Math.max(0.35, Math.cos((lat * Math.PI) / 180));
      for (let lng = 43; lng <= 64; lng += step) {
        if (insideIran(lng, lat)) land.push(fromLatLng(lat, lng));
      }
    }

    const cityPoints = cities
      .filter((city) => Number.isFinite(city.lat) && Number.isFinite(city.lng))
      .map((city) => ({ ...city, p: fromLatLng(city.lat, city.lng) }));

    // The globe always hangs on the skin's dark enamel, so these are the
    // colours that read on it — not the page's text tokens, which are tuned
    // for a light panel.
    const palette = () => ({
      dot: 'rgba(255,255,255,0.75)',
      land: '#7fe3ef',
      live: '#ffffff',
      soon: cssVar('--ss-brass', '#d9a24e'),
      ink: '#ffffff',
    });

    let raf = 0;
    let start = performance.now();
    let stopped = false;

    const draw = (now: number) => {
      const t = reduced ? 2.2 : (now - start) / 1000;
      // Iran faces the reader on the first frame rather than a minute into the
      // rotation. -217° is not a guess: it is where the country's centroid
      // (32°N 53°E) has the greatest depth once the tilt is applied.
      const spin = ((t * SPIN - 217) * Math.PI) / 180;
      const colours = palette();

      ctx.clearRect(0, 0, size, size);

      /** Rotate about the globe's axis, then tilt the whole thing towards us. */
      const project = (p: Pt) => {
        const x = p.x * Math.cos(spin) - p.z * Math.sin(spin);
        const z = p.x * Math.sin(spin) + p.z * Math.cos(spin);
        const y = p.y * Math.cos(TILT) - z * Math.sin(TILT);
        const zz = p.y * Math.sin(TILT) + z * Math.cos(TILT);
        return { sx: c + x * radius, sy: c - y * radius, depth: zz };
      };

      // ── the services, orbiting ──
      // Behind the globe first, so the ring passes *behind* it and the depth
      // reads; the front half is drawn after the sphere.
      const orbit: { sx: number; sy: number; depth: number; s: GlobeService }[] = services.map((s, i) => {
        const a = spin * 0.85 + (i / Math.max(1, services.length)) * Math.PI * 2;
        const p = { x: Math.cos(a), y: 0, z: Math.sin(a) };
        const pr = project({ x: p.x, y: p.y * 1, z: p.z });
        return { ...pr, s };
      });
      const ORBIT = 0.88;
      const orbitAt = (o: typeof orbit[number]) => {
        const scale = 1 + o.depth * 0.18;
        const x = c + (o.sx - c) * ORBIT;
        const y = c + (o.sy - c) * ORBIT;
        return { x, y, scale };
      };

      // The path itself, faintly: without it the service marks look scattered
      // rather than in orbit.
      ctx.save();
      ctx.translate(c, c);
      ctx.scale(1, Math.abs(Math.sin(TILT)) + 0.12);
      ctx.beginPath();
      ctx.arc(0, 0, radius * ORBIT, 0, Math.PI * 2);
      ctx.restore();
      ctx.strokeStyle = colours.dot;
      ctx.globalAlpha = 0.14;
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
      const drawOrbit = (back: boolean) => {
        for (const o of orbit) {
          if (back ? o.depth > 0 : o.depth <= 0) continue;
          const { x, y, scale } = orbitAt(o);
          const near = (o.depth + 1) / 2;
          ctx.globalAlpha = back ? 0.3 : 0.55 + near * 0.45;

          ctx.beginPath();
          ctx.arc(x, y, 3.4 * scale, 0, Math.PI * 2);
          ctx.fillStyle = o.s.color;
          ctx.fill();

          ctx.font = `${Math.round(11.5 * scale)}px Estedad, system-ui, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = colours.ink;
          ctx.globalAlpha = back ? 0.32 : 0.6 + near * 0.4;
          ctx.fillText(o.s.title, x, y - 13 * scale);
          ctx.globalAlpha = 1;
        }
      };

      drawOrbit(true);

      // ── the sphere ──
      ctx.fillStyle = colours.dot;
      for (const { p } of cloud) {
        const { sx, sy, depth } = project(p);
        // Only the near hemisphere is drawn; the far side would just be noise.
        if (depth < -0.05) continue;
        const near = (depth + 1) / 2;
        // Denser and a touch brighter towards the middle: the falloff to the
        // limb is what makes a field of specks read as a ball.
        ctx.globalAlpha = 0.05 + near * 0.3;
        ctx.beginPath();
        ctx.arc(sx, sy, 0.7 + near * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── the country ──
      // A wash under the dots: the country is the subject, and on a field of
      // faint specks the eye needs telling where to land.
      {
        const centre = project(fromLatLng(32, 53));
        if (centre.depth > -0.2) {
          const glow = ctx.createRadialGradient(centre.sx, centre.sy, 0, centre.sx, centre.sy, radius * 0.42);
          glow.addColorStop(0, 'rgba(127,227,239,0.16)');
          glow.addColorStop(1, 'rgba(127,227,239,0)');
          ctx.fillStyle = glow;
          ctx.fillRect(centre.sx - radius * 0.42, centre.sy - radius * 0.42, radius * 0.84, radius * 0.84);
        }
      }

      ctx.fillStyle = colours.land;
      for (const p of land) {
        const { sx, sy, depth } = project(p);
        if (depth < -0.02) continue;
        const near = (depth + 1) / 2;
        ctx.globalAlpha = 0.3 + near * 0.68;
        ctx.beginPath();
        ctx.arc(sx, sy, 1.1 + near * 1.7, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // ── the cities ──
      // One name at a time, in turn: five labels at once on a globe this size
      // is a smudge, and the point is that a citizen sees *their* city come
      // round.
      const spot = cityPoints.length
        ? Math.floor(t / CITY_DWELL) % cityPoints.length
        : -1;

      cityPoints.forEach((city, i) => {
        const { sx, sy, depth } = project(city.p);
        if (depth < -0.02) return;
        const near = (depth + 1) / 2;
        const colour = city.isActive ? colours.live : colours.soon;

        // A halo, so a city reads as a place rather than another dot of land.
        ctx.beginPath();
        ctx.arc(sx, sy, 6 + near * 4, 0, Math.PI * 2);
        ctx.fillStyle = colour;
        ctx.globalAlpha = 0.14 * near;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(sx, sy, city.isActive ? 3 : 2.4, 0, Math.PI * 2);
        ctx.fillStyle = colour;
        ctx.globalAlpha = 0.7 + near * 0.3;
        ctx.fill();

        // A city that has not opened yet is a ring, not a filled dot — the
        // same distinction the coverage map further down the page makes.
        if (!city.isActive) {
          ctx.beginPath();
          ctx.arc(sx, sy, 5, 0, Math.PI * 2);
          ctx.strokeStyle = colour;
          ctx.globalAlpha = 0.5 * near;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        if (i === spot && depth > -0.02) {
          // Fade the label in and out inside its turn, so names arrive and
          // leave rather than blinking.
          const phase = (t % CITY_DWELL) / CITY_DWELL;
          const fade = Math.min(1, Math.sin(phase * Math.PI) * 2.2);
          ctx.globalAlpha = Math.max(0, fade) * (0.45 + near * 0.55);

          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx, sy - 26);
          ctx.strokeStyle = colour;
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.font = '700 15px Estedad, system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillStyle = colours.ink;
          ctx.fillText(city.name, sx, sy - 31);
        }
        ctx.globalAlpha = 1;
      });

      drawOrbit(false);

      if (!reduced && !stopped) raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    // A hero that keeps turning in a background tab is a hero that costs
    // somebody battery for nothing.
    const onVisibility = () => {
      if (document.hidden) {
        stopped = true;
        cancelAnimationFrame(raf);
      } else if (stopped) {
        stopped = false;
        start = performance.now() - 2200;
        raf = requestAnimationFrame(draw);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [cities, services, size]);

  return (
    <canvas
      ref={ref}
      className={className}
      // The same information is beside it as real text — the headline, the
      // service names and the coverage list — which is what a screen reader,
      // a keyboard and a crawler read.
      aria-hidden
      style={{ width: size, height: size, maxWidth: '100%', display: 'block' }}
    />
  );
}
