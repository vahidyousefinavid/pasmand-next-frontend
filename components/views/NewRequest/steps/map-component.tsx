// import { useEffect } from 'react';
// import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';

// interface MapComponentProps {
//   center: { lat: number; lng: number };
//   onLocationSelect: (latlng: { lat: number; lng: number }) => void;
//   selectedLocation: { lat: number; lng: number } | null;
// }

// // This component handles updating the map's center
// function ChangeView({ center, selectedLocation }: { 
//   center: { lat: number; lng: number };
//   selectedLocation: { lat: number; lng: number } | null;
// }) {
//   const map = useMap();
  
//   useEffect(() => {
//     if (selectedLocation) {
//       map.setView([selectedLocation.lat, selectedLocation.lng], map.getZoom());
//     }
//   }, [selectedLocation, map]);

//   return null;
// }

// function LocationMarker({ onLocationSelect, selectedLocation }: { 
//   onLocationSelect: (latlng: { lat: number; lng: number }) => void;
//   selectedLocation: { lat: number; lng: number } | null;
// }) {
//   const map = useMapEvents({
//     click(e) {
//       onLocationSelect(e.latlng);
//     },
//   });

//   useEffect(() => {
//     const L = require('leaflet');
//     delete L.Icon.Default.prototype._getIconUrl;
//     L.Icon.Default.mergeOptions({
//       iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
//       iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
//       shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
//     });
//   }, []);

//   return selectedLocation ? <Marker position={selectedLocation} /> : null;
// }

// export default function MapComponent({ center, onLocationSelect, selectedLocation }: MapComponentProps) {
//   return (
//     <MapContainer
//       center={center}
//       zoom={13}
//       style={{ height: '100%', width: '100%' }}
//     >
//       <ChangeView center={center} selectedLocation={selectedLocation} />
//       <TileLayer
//         attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
//         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//       />
//       <LocationMarker onLocationSelect={onLocationSelect} selectedLocation={selectedLocation} />
//     </MapContainer>
//   );
// }

// app/(یا هر کجا)/map-component.tsx
"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  ImageOverlay,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapComponentProps {
  center: { lat: number; lng: number };
  onLocationSelect: (latlng: { lat: number; lng: number }) => void;
  selectedLocation: { lat: number; lng: number } | null;
  onStaticMapFetched?: (imgBase64: string) => void;
}

const MAP_API_KEY = "service.891bcedbc31543bd83cceee7f2dd0610";

// ----------------------------
//  مارکر سفارشی (SVG محلی)
// ----------------------------
const customMarkerIcon = L.icon({
  iconUrl: "/markers/blue.svg",
  iconSize: [27, 41],
  iconAnchor: [13, 41], // نوک مارکر دقیقاً پایین باشد
});

// دریافت دقیق StaticMap
async function fetchStaticMap(
  lat: number,
  lng: number,
  zoom: number,
  width: number,
  height: number
) {
  const url = `https://api.neshan.org/v4/static?key=${MAP_API_KEY}&type=neshan&width=${width}&height=${height}&zoom=${zoom}&center=${lat},${lng}`;
  const response = await fetch(url);
  const blob = await response.blob();

  return await new Promise<string>((r) => {
    const reader = new FileReader();
    reader.onloadend = () => r(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

// محاسبه bounds برابر viewport
function computeBounds(map: any, width: number, height: number) {
  const zoom = map.getZoom();
  const center = map.getCenter();
  const centerPoint = map.project(center, zoom);

  const halfW = width / 2;
  const halfH = height / 2;

  const topLeft = map.unproject(
    [centerPoint.x - halfW, centerPoint.y - halfH],
    zoom
  );
  const bottomRight = map.unproject(
    [centerPoint.x + halfW, centerPoint.y + halfH],
    zoom
  );

  return [
    [topLeft.lat, topLeft.lng],
    [bottomRight.lat, bottomRight.lng],
  ];
}

function EventsHandler({
  onLocationSelect,
  selectedLocation,
  setImg,
  setBounds,
  onStaticMapFetched,
}: any) {
  const map = useMap();

  async function refresh() {
    const size = map.getSize();
    const width = size.x;
    const height = size.y;

    const center = map.getCenter();
    const zoom = map.getZoom();

    const img = await fetchStaticMap(
      center.lat,
      center.lng,
      zoom,
      width,
      height
    );

    setImg(img);
    onStaticMapFetched?.(img);

    const b = computeBounds(map, width, height);
    setBounds(b);
  }

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    map.on("moveend", refresh);
    map.on("zoomend", refresh);

    return () => {
      map.off("moveend", refresh);
      map.off("zoomend", refresh);
    };
  }, []);

  // کلیک کردن
  useMapEvents({
    click: async (e) => {
      onLocationSelect(e.latlng);
      await refresh();
    },
  });

  return selectedLocation ? (
    <Marker position={selectedLocation} icon={customMarkerIcon} />
  ) : null;
}

export default function MapComponent({
  center,
  onLocationSelect,
  selectedLocation,
  onStaticMapFetched,
}: MapComponentProps) {
  const [img, setImg] = useState<string | null>(null);
  const [bounds, setBounds] = useState<any>(null);

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={13}
      style={{ width: "100%", height: "100%" }}
      scrollWheelZoom
    >
      {img && bounds && (
        <ImageOverlay url={img} bounds={bounds} opacity={1} />
      )}

      <EventsHandler
        selectedLocation={selectedLocation}
        onLocationSelect={onLocationSelect}
        setImg={setImg}
        setBounds={setBounds}
        onStaticMapFetched={onStaticMapFetched}
      />
    </MapContainer>
  );
}
