import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { LatLng, Icon } from 'leaflet';

interface MapComponentProps {
  center: { lat: number; lng: number };
  onLocationSelect: (latlng: LatLng) => void;
  selectedLocation: LatLng | null;
}

function LocationMarker({ onLocationSelect, selectedLocation }: { 
  onLocationSelect: (latlng: LatLng) => void;
  selectedLocation: LatLng | null;
}) {
  const map = useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
    },
  });

  useEffect(() => {
    const L = require('leaflet');
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  return selectedLocation ? <Marker position={selectedLocation} /> : null;
}

export default function MapComponent({ center, onLocationSelect, selectedLocation }: MapComponentProps) {
  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker onLocationSelect={onLocationSelect} selectedLocation={selectedLocation} />
    </MapContainer>
  );
}