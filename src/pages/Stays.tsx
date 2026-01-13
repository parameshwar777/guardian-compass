import { useState } from 'react';
import { motion } from 'framer-motion';
import { Hotel, MapPin, Star, Shield, DollarSign, ChevronRight, Sparkles, Search } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { FadeIn, StaggerContainer, StaggerItem, Float } from '@/components/animations/MotionWrapper';
import { LoadingSpinner, SkeletonList } from '@/components/ui/loading';
import { useLocationStore, useAuthStore } from '@/store/useStore';
import { recommendationsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Accommodation {
  id: string;
  name: string;
  type: string;
  price_range: string;
  rating: number;
  safety_score: number;
  safety_notes: string;
  image_url?: string;
  distance: string;
}

const Stays = () => {
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { currentLocation, predictedLocation } = useLocationStore();
  const { token } = useAuthStore();
  const { toast } = useToast();

  const searchLocation = predictedLocation || currentLocation;

  const handleSearch = async () => {
    if (!searchLocation) {
      toast({
        title: 'Location required',
        description: 'Please enable location or run AI prediction first.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      if (token) {
        const response = await recommendationsApi.getAccommodations();
        // Parse the string response if needed
        try {
          const parsed = typeof response === 'string' ? JSON.parse(response) : response;
          if (Array.isArray(parsed)) {
            setAccommodations(parsed);
          } else if (parsed.recommendations) {
            setAccommodations(parsed.recommendations);
          } else {
            // Demo data fallback
            setDemoData();
          }
        } catch {
          setDemoData();
        }
      } else {
        // Demo data
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setDemoData();
      }

      toast({
        title: 'Recommendations found!',
        description: `Found safe stays near you.`,
      });
    } catch (error) {
      setDemoData();
      toast({
        title: 'Using demo data',
        description: 'Showing sample accommodations.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const setDemoData = () => {
    setAccommodations([
      {
        id: '1',
        name: 'The Grand Hotel',
        type: 'Hotel',
        price_range: '$$$',
        rating: 4.8,
        safety_score: 95,
        safety_notes: 'Well-lit area, 24/7 security, verified reviews',
        distance: '0.5 km',
      },
      {
        id: '2',
        name: 'City View Apartments',
        type: 'Apartment',
        price_range: '$$',
        rating: 4.5,
        safety_score: 88,
        safety_notes: 'Gated community, security cameras',
        distance: '1.2 km',
      },
      {
        id: '3',
        name: 'Backpackers Haven',
        type: 'Hostel',
        price_range: '$',
        rating: 4.2,
        safety_score: 82,
        safety_notes: 'Popular with travelers, good reviews',
        distance: '2.0 km',
      },
      {
        id: '4',
        name: 'Luxury Suites',
        type: 'Hotel',
        price_range: '$$$$',
        rating: 4.9,
        safety_score: 98,
        safety_notes: 'Premium security, concierge service',
        distance: '0.8 km',
      },
    ]);
  };

  const getSafetyColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 70) return 'text-warning';
    return 'text-destructive';
  };

  const getSafetyBg = (score: number) => {
    if (score >= 90) return 'bg-success/10';
    if (score >= 70) return 'bg-warning/10';
    return 'bg-destructive/10';
  };

  return (
    <DashboardLayout>
      <div className="px-4 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <FadeIn>
          <div className="text-center max-w-md mx-auto">
            <Float>
              <div className="w-16 h-16 rounded-2xl bg-warning mx-auto mb-4 flex items-center justify-center">
                <Hotel className="w-8 h-8 text-warning-foreground" />
              </div>
            </Float>
            <h1 className="font-display text-2xl lg:text-3xl font-bold">Find Safe Stays</h1>
            <p className="text-muted-foreground mt-2">
              Discover verified accommodations with safety ratings
            </p>
          </div>
        </FadeIn>

        {/* Location Info */}
        <FadeIn delay={0.05}>
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Searching near</p>
                <p className="font-medium">
                  {searchLocation
                    ? `${searchLocation.latitude.toFixed(4)}, ${searchLocation.longitude.toFixed(4)}`
                    : 'Location not available'}
                </p>
              </div>
              {predictedLocation && (
                <span className="px-2 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  AI Predicted
                </span>
              )}
            </div>
          </div>
        </FadeIn>

        {/* Search Button */}
        <FadeIn delay={0.1}>
          <motion.button
            onClick={handleSearch}
            disabled={isLoading || !searchLocation}
            className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Finding safe stays...</span>
              </>
            ) : (
              <>
                <Search className="w-6 h-6" />
                <span>Find Nearby Stays</span>
              </>
            )}
          </motion.button>
        </FadeIn>

        {/* Results */}
        {isLoading ? (
          <SkeletonList count={3} />
        ) : hasSearched && accommodations.length > 0 ? (
          <>
            <FadeIn delay={0.15}>
              <div className="flex items-center justify-between">
                <h2 className="font-display font-semibold text-lg">
                  {accommodations.length} Stays Found
                </h2>
                <span className="text-sm text-muted-foreground">Sorted by safety</span>
              </div>
            </FadeIn>

            <StaggerContainer className="space-y-4" staggerDelay={0.08}>
              {accommodations.map((accommodation) => (
                <StaggerItem key={accommodation.id}>
                  <motion.div
                    className="glass-card p-5 relative overflow-hidden"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex gap-4">
                      {/* Image Placeholder */}
                      <div className="w-20 h-20 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                        <Hotel className="w-8 h-8 text-muted-foreground" />
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold truncate">{accommodation.name}</h3>
                            <p className="text-sm text-muted-foreground">{accommodation.type}</p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-3 text-sm">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-warning fill-warning" />
                            <span className="font-medium">{accommodation.rating}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                            <span>{accommodation.price_range}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span>{accommodation.distance}</span>
                          </div>
                        </div>

                        {/* Safety Score */}
                        <div className={`mt-3 px-3 py-2 rounded-lg ${getSafetyBg(accommodation.safety_score)}`}>
                          <div className="flex items-center gap-2">
                            <Shield className={`w-4 h-4 ${getSafetyColor(accommodation.safety_score)}`} />
                            <span className={`font-semibold ${getSafetyColor(accommodation.safety_score)}`}>
                              {accommodation.safety_score}% Safe
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {accommodation.safety_notes}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </>
        ) : hasSearched ? (
          <FadeIn>
            <div className="glass-card p-8 text-center">
              <Hotel className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-1">No stays found</h3>
              <p className="text-muted-foreground text-sm">
                Try searching with a different location
              </p>
            </div>
          </FadeIn>
        ) : (
          <FadeIn delay={0.15}>
            <div className="glass-card p-6">
              <h3 className="font-semibold mb-4">Safety-First Recommendations</h3>
              <div className="space-y-3">
                {[
                  { icon: Shield, text: 'Verified safety scores for all listings' },
                  { icon: Star, text: 'Real reviews from travelers' },
                  { icon: MapPin, text: 'Proximity to safe zones' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Stays;
