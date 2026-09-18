'use client';

import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap, useMapEvents, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { C, S } from '@/components/ui/tokens';

/**
 * لایه‌های نقشهٔ شهر روی نقشه.
 *
 * This is the first real tile map in the app. The picker used everywhere else
 * paints a Neshan *static image* per viewport, which is right for «drop a pin
 * on my house» and wrong here: a زون‌بندی layer is thousands of polygons that
 * have to stay registered to the ground while somebody pans and zooms around
 * their own plot, and an image cannot do that.
 *
 * The polygons are GeoJSON straight from the municipality's own plan, styled
 * by the legend rules the panel defined — so «مسکونی» is the colour that city
 * chose for it, on the map and in the legend, from one definition.
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
 * The default Leaflet marker loads its icon from a relative path that Next's
 * asset pipeline does not serve, so it renders as a broken image. The app
 * already ships its own pin for the request picker.
 */
const pin = L.icon({
  iconUrl: '/markers/blue.svg',
  iconSize: [27, 41],
  iconAnchor: [13, 41],
  popupAnchor: [0, -38],
});

/** Tapping the map is the answer that always works, geocoder or not. */
function ClickToInspect({ onPick }: { onPick?: (p: { lat: number; lng: number }) => void }) {
  useMapEvents({
    click(e) {
      if (onPick) onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

/** Recentre when the chosen layer changes; `MapContainer` only reads its props once. */
function Recentre({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
    // Leaflet measures itself on creation; inside a tab or a freshly grown
    // container that measurement is stale and half the tiles never paint.
    setTimeout(() => map.invalidateSize(), 200);
  }, [map, center[0], center[1], zoom]);
  return null;
}

/** The rule a feature is drawn with — the first whose `match` fits, else the default. */
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

export default function CityMapCanvas({
  layer,
  center,
  height = 460,
  marker,
  onPick,
  markerLabel,
}: {
  layer: Layer | null;
  center: { lat: number; lng: number };
  height?: number;
  /** Where the citizen's own point is, once they have chosen one. */
  marker?: { lat: number; lng: number } | null;
  onPick?: (p: { lat: number; lng: number }) => void;
  markerLabel?: string;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  const middle: [number, number] = useMemo(
    () => [layer?.center?.lat ?? center.lat, layer?.center?.lng ?? center.lng],
    [layer?.center?.lat, layer?.center?.lng, center.lat, center.lng],
  );
  const zoom = layer?.center?.zoom || 13;

  if (!ready) {
    return <div style={{ height, borderRadius: S.r3, background: C.surface2 }} />;
  }

  return (
    <div style={{ height, borderRadius: S.r3, overflow: 'hidden', border: `1px solid ${C.border}` }}>
      <MapContainer center={middle} zoom={zoom} style={{ width: '100%', height: '100%' }} scrollWheelZoom>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap"
        />
        <Recentre center={middle} zoom={zoom} />
        <ClickToInspect onPick={onPick} />

        {marker && (
          <Marker position={[marker.lat, marker.lng]} icon={pin}>
            {markerLabel && (
              <Popup>
                <div dir="rtl" style={{ fontFamily: 'inherit', fontSize: 12, lineHeight: 1.9 }}>{markerLabel}</div>
              </Popup>
            )}
          </Marker>
        )}

        {layer?.geojson && (
          <GeoJSON
            // Remount when the layer changes: react-leaflet's GeoJSON does not
            // re-read `data`, so without this the previous plan stays drawn.
            key={layer._id}
            data={layer.geojson}
            style={(feature: any) => {
              const rule = ruleFor(layer, feature?.properties);
              return {
                color: rule?.color || '#2563eb',
                fillColor: rule?.fillColor || rule?.color || '#2563eb',
                fillOpacity: rule?.fillOpacity ?? 0.35,
                weight: rule?.weight ?? 1.5,
              };
            }}
            onEachFeature={(feature: any, leafletLayer: any) => {
              const rule = ruleFor(layer, feature?.properties);
              const title = rule?.label || layer.title;
              const note = rule?.note ? `<br/><span style="opacity:.75">${rule.note}</span>` : '';
              // Persian text inside a Leaflet popup needs the direction stated;
              // the popup is created outside the app's own RTL tree.
              leafletLayer.bindPopup(
                `<div dir="rtl" style="font-family:inherit;font-size:12px;line-height:1.9"><b>${title}</b>${note}</div>`,
              );
              /**
               * A polygon with a popup swallows the click: Leaflet stops it
               * reaching the map so the popup is not closed by the same tap.
               * That made «روی نقشه بزنید» silently do nothing exactly where a
               * citizen would tap — on their own plot. So the feature reports
               * the point itself.
               */
              leafletLayer.on('click', (e: any) => {
                if (onPick && e?.latlng) onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
              });
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}
