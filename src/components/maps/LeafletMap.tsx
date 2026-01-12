import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useThemeStore } from '@/store/useStore';

// Fix default marker icons
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icons
const createCustomIcon = (color: string) => new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="
    width: 24px;
    height: 24px;
    background: ${color};
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const currentLocationIcon = createCustomIcon('#22c55e');
const predictedLocationIcon = createCustomIcon('#8b5cf6');
const historyLocationIcon = createCustomIcon('#6366f1');

interface MarkerData {
  position: { lat: number; lng: number };
  type: 'current' | 'predicted' | 'history';
  label?: string;
}

interface LeafletMapProps {
  center: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  showCurrentLocation?: boolean;
  predictedLocation?: { lat: number; lng: number };
  markers?: MarkerData[];
}

// Component to handle map center updates
const MapCenterHandler = ({ center }: { center: { lat: number; lng: number } }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView([center.lat, center.lng], map.getZoom());
  }, [center.lat, center.lng, map]);
  
  return null;
};

const LeafletMap = ({
  center,
  zoom = 13,
  height = '300px',
  showCurrentLocation = false,
  predictedLocation,
  markers = [],
}: LeafletMapProps) => {
  const { isDark } = useThemeStore();

  const tileLayer = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const attribution = isDark
    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  return (
    <div style={{ height, width: '100%' }} className="rounded-xl overflow-hidden">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer attribution={attribution} url={tileLayer} />
        <MapCenterHandler center={center} />

        {/* Current location marker */}
        {showCurrentLocation && (
          <Marker position={[center.lat, center.lng]} icon={currentLocationIcon}>
            <Popup>
              <div className="text-center">
                <p className="font-semibold">Your Location</p>
                <p className="text-xs text-gray-500">
                  {center.lat.toFixed(6)}, {center.lng.toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Predicted location marker */}
        {predictedLocation && (
          <Marker position={[predictedLocation.lat, predictedLocation.lng]} icon={predictedLocationIcon}>
            <Popup>
              <div className="text-center">
                <p className="font-semibold">Predicted Location</p>
                <p className="text-xs text-gray-500">
                  {predictedLocation.lat.toFixed(6)}, {predictedLocation.lng.toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* History markers */}
        {markers.map((marker, index) => (
          <Marker
            key={index}
            position={[marker.position.lat, marker.position.lng]}
            icon={
              marker.type === 'current'
                ? currentLocationIcon
                : marker.type === 'predicted'
                ? predictedLocationIcon
                : historyLocationIcon
            }
          >
            <Popup>
              <div className="text-center">
                <p className="font-semibold">{marker.label || `Location ${index + 1}`}</p>
                <p className="text-xs text-gray-500">
                  {marker.position.lat.toFixed(6)}, {marker.position.lng.toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default LeafletMap;
