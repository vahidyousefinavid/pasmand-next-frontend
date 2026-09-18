/**
 * The legend of a city-map layer, and the rule a feature falls under.
 *
 * This lives apart from `city-map-canvas.tsx` for one reason: that file
 * imports Leaflet, and Leaflet touches `window` the moment it is imported.
 * The canvas is loaded with `dynamic(..., { ssr: false })` precisely so it
 * never runs on the server — but `city-map.tsx` also imported `ruleFor` and
 * `Layer` from it *statically*, which pulled Leaflet into the server bundle
 * anyway and made `/city-map` fail to prerender with
 * `ReferenceError: window is not defined`.
 *
 * Nothing here draws anything, so nothing here needs a browser.
 */

export interface LegendRule {
  label: string;
  property?: string;
  match?: string;
  color: string;
  fillColor?: string;
  fillOpacity?: number;
  weight?: number;
  note?: string;
}

export interface Layer {
  _id: string;
  key: string;
  title: string;
  kind: string;
  property?: string;
  legend?: LegendRule[];
  center?: { lat: number; lng: number; zoom?: number };
  source?: string;
  geojson?: any;
}

/**
 * Which legend rule a feature's properties match, or the catch-all rule the
 * municipality defined, or nothing.
 */
export function ruleFor(layer: Layer, properties: Record<string, any> | undefined): LegendRule | null {
  const rules = layer.legend || [];
  if (!rules.length) return null;
  for (const rule of rules) {
    if (!rule.match) continue;
    const key = rule.property || layer.property;
    if (!key) continue;
    if (String(properties?.[key] ?? '') === String(rule.match)) return rule;
  }
  return rules.find((r) => !r.match) || null;
}
