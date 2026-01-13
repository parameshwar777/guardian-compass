import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Navigation, RefreshCw, ChevronRight } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations/MotionWrapper';
import { LoadingSpinner, SkeletonList } from '@/components/ui/loading';
import { useLocationStore, useAuthStore } from '@/store/useStore';
import { locationApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import LeafletMap from '@/components/maps/LeafletMap';

interface LocationHistoryItem {
  id: number;
  latitude: number;
  longitude: number;
  accuracy: number;
  created_at: string;
}

const Location = () => {
  const { currentLocation, setCurrentLocation, locationHistory, setLocationHistory } = useLocationStore();
  const { token } = useAuthStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchLocationHistory();
  }, []);

  const fetchLocationHistory = async () => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      const response = await locationApi.getHistory(50);
      setLocationHistory(response.map((loc) => ({
        id: String(loc.id),
        latitude: loc.latitude,
        longitude: loc.longitude,
        timestamp: loc.created_at,
      })));
    } catch (error) {
      // Don't set demo data - let user enable location
      console.log('Failed to fetch location history');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshLocation = async () => {
    setIsRefreshing(true);
    
    if (!navigator.geolocation) {
      toast({
        title: 'Not supported',
        description: 'Geolocation is not supported by your browser.',
        variant: 'destructive',
      });
      setIsRefreshing(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setCurrentLocation(newLocation);

        // Save to backend
        if (token) {
          try {
            await locationApi.saveLocation(
              newLocation.latitude,
              newLocation.longitude,
              position.coords.accuracy || 0
            );
            await fetchLocationHistory();
            toast({
              title: 'Location updated',
              description: 'Your current location has been saved.',
            });
          } catch (error) {
            console.error('Failed to save location:', error);
          }
        }
        setIsRefreshing(false);
      },
      (error) => {
        toast({
          title: 'Location error',
          description: 'Unable to get your current location.',
          variant: 'destructive',
        });
        setIsRefreshing(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <DashboardLayout>
      <div className="px-4 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <FadeIn>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl lg:text-3xl font-bold">Location</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Track and manage your locations
              </p>
            </div>
            <motion.button
              onClick={refreshLocation}
              disabled={isRefreshing}
              className="p-3 rounded-xl bg-primary text-primary-foreground"
              whileTap={{ scale: 0.95 }}
            >
              {isRefreshing ? (
                <LoadingSpinner size="sm" />
              ) : (
                <RefreshCw className="w-5 h-5" />
              )}
            </motion.button>
          </div>
        </FadeIn>

        {/* Current Location Card */}
        <FadeIn delay={0.05}>
          <div className="glass-card p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 gradient-primary opacity-10 rounded-full blur-3xl" />
            
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center">
                <Navigation className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Current Position</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-sm text-muted-foreground">Live tracking active</span>
                </div>
              </div>
            </div>

            {currentLocation ? (
              <div className="bg-secondary/50 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Latitude</p>
                    <p className="font-mono font-semibold text-lg">{currentLocation.latitude.toFixed(6)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Longitude</p>
                    <p className="font-mono font-semibold text-lg">{currentLocation.longitude.toFixed(6)}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-secondary/50 rounded-xl p-6 text-center">
                <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Enable location access to track your position</p>
                <motion.button
                  onClick={refreshLocation}
                  className="btn-primary mt-4"
                  whileTap={{ scale: 0.98 }}
                >
                  Enable Location
                </motion.button>
              </div>
            )}
          </div>
        </FadeIn>

        {/* Leaflet Map */}
        <FadeIn delay={0.1}>
          <div className="glass-card overflow-hidden p-0">
            <LeafletMap
              center={
                currentLocation
                  ? { lat: currentLocation.latitude, lng: currentLocation.longitude }
                  : { lat: 20.5937, lng: 78.9629 } // Default to India center
              }
              showCurrentLocation={!!currentLocation}
              height="280px"
              zoom={currentLocation ? 15 : 4}
              markers={locationHistory.slice(0, 5).map((loc) => ({
                position: { lat: loc.latitude, lng: loc.longitude },
                type: 'history' as const,
              }))}
            />
          </div>
        </FadeIn>

        {/* Location History */}
        <FadeIn delay={0.15}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="font-display font-semibold text-lg">Location History</h2>
            </div>
            <span className="text-sm text-muted-foreground">
              {locationHistory.length} locations
            </span>
          </div>
        </FadeIn>

        {isLoading ? (
          <SkeletonList count={3} />
        ) : (
          <StaggerContainer className="space-y-3" staggerDelay={0.05}>
            <AnimatePresence>
              {locationHistory.map((location) => (
                <StaggerItem key={location.id}>
                  <motion.div
                    className="glass-card p-4"
                    whileHover={{ scale: 1.01 }}
                    layout
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {location.address || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatTime(location.timestamp)}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
            </AnimatePresence>
          </StaggerContainer>
        )}

        {!isLoading && locationHistory.length === 0 && (
          <FadeIn>
            <div className="glass-card p-8 text-center">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-1">No history yet</h3>
              <p className="text-muted-foreground text-sm">
                Your location history will appear here
              </p>
            </div>
          </FadeIn>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Location;
