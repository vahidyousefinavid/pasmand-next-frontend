/**
 * «ملک من در کدام پهنه است» — answered in the browser.
 *
 * The whole layer is already downloaded to draw it, so asking the server which
 * polygon contains a point would be a round trip for something the phone is
 * holding. Ray casting is exact for the polygons a city plan is made of and
 * costs nothing at these sizes.
 */

export type Point = { lat: number; lng: number };

/** Ray casting on one ring. GeoJSON positions are [lng, lat]. */
function inRing(point: Point, ring: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const straddles = yi > point.lat !== yj > point.lat;
    if (!straddles) continue;
    // Where the edge crosses this latitude, in longitude.
    const crossing = ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi;
    if (point.lng < crossing) inside = !inside;
  }
  return inside;
}

/** A polygon is its outer ring minus any holes. */
function inPolygon(point: Point, rings: number[][][]): boolean {
  if (!rings.length || !inRing(point, rings[0])) return false;
  // Any inner ring the point falls in is a hole: the point is outside.
  for (let i = 1; i < rings.length; i += 1) {
    if (inRing(point, rings[i])) return false;
  }
  return true;
}

function inGeometry(point: Point, geometry: any): boolean {
  if (!geometry) return false;
  if (geometry.type === 'Polygon') return inPolygon(point, geometry.coordinates);
  if (geometry.type === 'MultiPolygon') {
    return (geometry.coordinates || []).some((poly: number[][][]) => inPolygon(point, poly));
  }
  return false;
}

/**
 * Every feature of a layer that contains the point.
 *
 * Plural on purpose: land-use polygons overlap in real municipal data — a plot
 * can be inside a district *and* inside a green-space reserve — and reporting
 * only the first would hide the constraint that actually matters.
 */
export function featuresAt(geojson: any, point: Point): any[] {
  return (geojson?.features || []).filter((f: any) => inGeometry(point, f.geometry));
}

/** A rough bounding box, for pinning a geocoder search to the city. */
export function boundsOf(geojson: any): { south: number; west: number; north: number; east: number } | null {
  let south = 90;
  let west = 180;
  let north = -90;
  let east = -180;
  let seen = false;

  const walk = (coords: any) => {
    if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
      const [lng, lat] = coords;
      south = Math.min(south, lat);
      north = Math.max(north, lat);
      west = Math.min(west, lng);
      east = Math.max(east, lng);
      seen = true;
      return;
    }
    if (Array.isArray(coords)) coords.forEach(walk);
  };

  for (const f of geojson?.features || []) {
    if (f.geometry?.coordinates) walk(f.geometry.coordinates);
  }
  return seen ? { south, west, north, east } : null;
}
