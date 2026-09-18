import { NextResponse } from 'next/server';

/**
 * «آدرسم کجای نقشه است» — forward geocoding for the city-map page.
 *
 * Proxied rather than called from the browser for two reasons: Nominatim asks
 * for an identifying User-Agent and refuses without one, which a browser
 * cannot set, and its usage policy expects one caller rather than every
 * visitor's device. The search is also pinned to the city's own bounding box,
 * so «بوعلی» finds the street in همدان and not a namesake elsewhere in Iran.
 */
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();
  const viewbox = searchParams.get('viewbox') || '';

  if (q.length < 2) return NextResponse.json({ results: [] });

  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', q);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '6');
  url.searchParams.set('accept-language', 'fa');
  if (viewbox) {
    url.searchParams.set('viewbox', viewbox);
    // Bounded, so a search inside a city cannot answer with another province.
    url.searchParams.set('bounded', '1');
  }

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'shahrshahr-citymap/1.0 (municipal services platform)' },
      signal: AbortSignal.timeout(12000),
      next: { revalidate: 3600 },
    });
    if (!res.ok) return NextResponse.json({ results: [] });

    const rows = await res.json();
    return NextResponse.json({
      results: (Array.isArray(rows) ? rows : []).map((r: any) => ({
        label: String(r.display_name || '').split('،').slice(0, 3).join('،'),
        lat: Number(r.lat),
        lng: Number(r.lon),
      })),
    });
  } catch {
    // A geocoder that is slow or unreachable must not break the map; the
    // citizen can still tap the point they mean.
    return NextResponse.json({ results: [] });
  }
}
