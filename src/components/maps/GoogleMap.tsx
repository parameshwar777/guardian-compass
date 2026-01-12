import { useCallback, useState } from 'react';
import { GoogleMap as GoogleMapComponent, useJsApiLoader, Marker, Circle } from '@react-google-maps/api';
import { MapPin } from 'lucide-react';

interface GoogleMapProps {
  center?: { lat: number; lng: number };
  markers?: Array<{
    position: { lat: number; lng: number };
    label?: string;
    type?: 'current' | 'predicted' | 'history';
  }>;
  zoom?: number;
  height?: string;
  showCurrentLocation?: boolean;
  predictedLocation?: { lat: number; lng: number };
  onMapClick?: (lat: number, lng: number) => void;
}

const containerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '0.75rem',
};

const darkMapStyles = [
  { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8b8ba7' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#c4b5fd' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#8b8ba7' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#1e3a2f' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#4ade80' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#2d2d44' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1a1a2e' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#3d3d5c' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1a1a2e' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#2d2d44' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0f172a' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#4f6d7a' }],
  },
];

const lightMapStyles = [
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'transit',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
];

const GoogleMapWrapper = ({
  center = { lat: 40.7128, lng: -74.006 },
  markers = [],
  zoom = 14,
  height = '300px',
  showCurrentLocation = false,
  predictedLocation,
  onMapClick,
}: GoogleMapProps) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng && onMapClick) {
      onMapClick(e.latLng.lat(), e.latLng.lng());
    }
  };

  // Check if it's dark mode
  const isDarkMode = document.documentElement.classList.contains('dark');

  if (loadError) {
    return (
      <div 
        className="bg-secondary/50 rounded-xl flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-center p-4">
          <MapPin className="w-8 h-8 text-destructive mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Failed to load map</p>
        </div>
      </div>
    );
  }

  if (!apiKey) {
    return (
      <div 
        className="bg-secondary/50 rounded-xl flex items-center justify-center relative overflow-hidden"
        style={{ height }}
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />
          <div className="grid grid-cols-8 grid-rows-6 h-full w-full">
            {Array.from({ length: 48 }).map((_, i) => (
              <div key={i} className="border border-muted/20" />
            ))}
          </div>
        </div>
        <div className="text-center p-4 relative z-10">
          <MapPin className="w-10 h-10 text-primary mx-auto mb-2" />
          <p className="text-sm font-medium">Google Maps</p>
          <p className="text-xs text-muted-foreground mt-1">Add VITE_GOOGLE_MAPS_API_KEY</p>
        </div>
        {showCurrentLocation && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <div className="w-4 h-4 rounded-full bg-primary shadow-lg" />
              <div className="absolute inset-0 w-4 h-4 rounded-full bg-primary animate-ping opacity-75" />
            </div>
          </div>
        )}
        {predictedLocation && (
          <div className="absolute top-1/3 left-2/3 -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <div className="w-4 h-4 rounded-full bg-accent shadow-lg" />
              <div className="absolute inset-0 w-4 h-4 rounded-full bg-accent animate-pulse opacity-75" />
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div 
        className="bg-secondary/50 rounded-xl flex items-center justify-center animate-pulse"
        style={{ height }}
      >
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height }} className="rounded-xl overflow-hidden shadow-lg">
      <GoogleMapComponent
        mapContainerStyle={containerStyle}
        center={center}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={handleClick}
        options={{
          styles: isDarkMode ? darkMapStyles : lightMapStyles,
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        }}
      >
        {showCurrentLocation && (
          <>
            <Marker
              position={center}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: '#8b5cf6',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 3,
              }}
            />
            <Circle
              center={center}
              radius={100}
              options={{
                fillColor: '#8b5cf6',
                fillOpacity: 0.1,
                strokeColor: '#8b5cf6',
                strokeOpacity: 0.3,
                strokeWeight: 2,
              }}
            />
          </>
        )}

        {predictedLocation && (
          <>
            <Marker
              position={predictedLocation}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: '#06b6d4',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 3,
              }}
            />
            <Circle
              center={predictedLocation}
              radius={150}
              options={{
                fillColor: '#06b6d4',
                fillOpacity: 0.1,
                strokeColor: '#06b6d4',
                strokeOpacity: 0.3,
                strokeWeight: 2,
              }}
            />
          </>
        )}

        {markers.map((marker, index) => (
          <Marker
            key={index}
            position={marker.position}
            label={marker.label}
            icon={
              marker.type === 'predicted'
                ? {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: '#06b6d4',
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeWeight: 2,
                  }
                : marker.type === 'history'
                ? {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 6,
                    fillColor: '#8b8ba7',
                    fillOpacity: 0.7,
                    strokeColor: '#ffffff',
                    strokeWeight: 1,
                  }
                : undefined
            }
          />
        ))}
      </GoogleMapComponent>
    </div>
  );
};

export default GoogleMapWrapper;
