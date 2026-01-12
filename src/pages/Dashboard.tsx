import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Brain,
  MessageSquare,
  Hotel,
  AlertTriangle,
  Navigation,
  Clock,
  Shield,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { FadeIn, StaggerContainer, StaggerItem, Float } from '@/components/animations/MotionWrapper';
import { useAuthStore, useLocationStore } from '@/store/useStore';
import { useToast } from '@/hooks/use-toast';
import LeafletMap from '@/components/maps/LeafletMap';

const featureCards = [
  {
    path: '/location',
    icon: MapPin,
    title: 'Track Location',
    description: 'Monitor your current position and view history',
    gradient: 'gradient-primary',
    color: 'text-primary',
  },
  {
    path: '/predict',
    icon: Brain,
    title: 'AI Prediction',
    description: 'Predict your next destination with AI',
    gradient: 'gradient-accent',
    color: 'text-accent',
  },
  {
    path: '/assistant',
    icon: MessageSquare,
    title: 'AI Assistant',
    description: 'Chat with your personal travel safety guide',
    gradient: 'gradient-success',
    color: 'text-success',
  },
  {
    path: '/stays',
    icon: Hotel,
    title: 'Find Stays',
    description: 'Discover safe accommodations nearby',
    gradient: 'bg-warning',
    color: 'text-warning',
  },
];

const Dashboard = () => {
  const { user } = useAuthStore();
  const { currentLocation, setCurrentLocation } = useLocationStore();
  const { toast } = useToast();
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (!currentLocation) {
      requestLocation();
    }
  }, []);

  const requestLocation = async () => {
    setIsLocating(true);
    
    if (!navigator.geolocation) {
      toast({
        title: 'Location not supported',
        description: 'Your browser doesn\'t support geolocation.',
        variant: 'destructive',
      });
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setIsLocating(false);
      },
      (error) => {
        console.error('Location error:', error);
        toast({
          title: 'Location access denied',
          description: 'Please enable location access for better experience.',
          variant: 'destructive',
        });
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <DashboardLayout>
      <div className="px-4 lg:px-8 py-6 space-y-6">
        {/* Welcome Section */}
        <FadeIn>
          <div className="space-y-2">
            <h1 className="font-display text-2xl lg:text-3xl font-bold">
              {greeting()}, {user?.email?.split('@')[0] || 'Traveler'} 👋
            </h1>
            <p className="text-muted-foreground">
              Your safety is our priority. What would you like to do today?
            </p>
          </div>
        </FadeIn>

        {/* Map Section */}
        <FadeIn delay={0.05}>
          <div className="glass-card overflow-hidden p-0">
            <LeafletMap
              center={
                currentLocation
                  ? { lat: currentLocation.latitude, lng: currentLocation.longitude }
                  : { lat: 20.5937, lng: 78.9629 } // Default to India center
              }
              showCurrentLocation={!!currentLocation}
              height="200px"
              zoom={currentLocation ? 14 : 4}
            />
          </div>
        </FadeIn>

        {/* Location Status Card */}
        <FadeIn delay={0.1}>
          <motion.div
            className="glass-card p-5 relative overflow-hidden"
            whileHover={{ scale: 1.01 }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 gradient-primary opacity-10 rounded-full blur-3xl" />
            
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                  <Navigation className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Current Location</h3>
                  {currentLocation ? (
                    <p className="text-muted-foreground text-sm mt-1">
                      {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
                    </p>
                  ) : (
                    <p className="text-muted-foreground text-sm mt-1">
                      {isLocating ? 'Detecting...' : 'Location not available'}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <div className={`w-2 h-2 rounded-full ${currentLocation ? 'bg-success' : 'bg-warning'} animate-pulse`} />
                    <span className="text-xs text-muted-foreground">
                      {currentLocation ? 'Tracking active' : 'Enable location'}
                    </span>
                  </div>
                </div>
              </div>
              
              <motion.button
                onClick={requestLocation}
                className="p-2 rounded-xl hover:bg-secondary transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </motion.button>
            </div>
          </motion.div>
        </FadeIn>

        {/* Quick Actions */}
        <FadeIn delay={0.15}>
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-lg">Quick Actions</h2>
            <Float>
              <Sparkles className="w-5 h-5 text-primary" />
            </Float>
          </div>
        </FadeIn>

        {/* Feature Cards */}
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 gap-4" staggerDelay={0.08}>
          {featureCards.map((card) => (
            <StaggerItem key={card.path}>
              <Link to={card.path}>
                <motion.div
                  className="feature-card relative overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={`absolute top-0 right-0 w-24 h-24 ${card.gradient} opacity-10 rounded-full blur-2xl`} />
                  
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl ${card.gradient} flex items-center justify-center flex-shrink-0`}>
                      <card.icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold">{card.title}</h3>
                      <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
                        {card.description}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  </div>
                </motion.div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Safety Stats */}
        <FadeIn delay={0.2}>
          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-success" />
              <h3 className="font-semibold">Safety Overview</h3>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="font-display text-2xl font-bold text-primary">12</div>
                <div className="text-xs text-muted-foreground mt-1">Locations Tracked</div>
              </div>
              <div className="text-center border-x border-border">
                <div className="font-display text-2xl font-bold text-success">High</div>
                <div className="text-xs text-muted-foreground mt-1">Safety Score</div>
              </div>
              <div className="text-center">
                <div className="font-display text-2xl font-bold text-accent">5</div>
                <div className="text-xs text-muted-foreground mt-1">AI Predictions</div>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Recent Activity */}
        <FadeIn delay={0.25}>
          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Recent Activity</h3>
            </div>
            
            <div className="space-y-3">
              {[
                { text: 'Location updated', time: '2 min ago', icon: MapPin },
                { text: 'AI prediction generated', time: '1 hour ago', icon: Brain },
                { text: 'Safety check completed', time: '3 hours ago', icon: Shield },
              ].map((activity, index) => (
                <div key={index} className="flex items-center gap-3 py-2">
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                    <activity.icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.text}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Emergency SOS Card (Desktop only) */}
        <FadeIn delay={0.3} className="hidden lg:block">
          <Link to="/sos">
            <motion.div
              className="glass-card p-6 border-destructive/20 relative overflow-hidden group"
              whileHover={{ scale: 1.01 }}
            >
              <div className="absolute inset-0 gradient-sos opacity-5 group-hover:opacity-10 transition-opacity" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <motion.div
                    className="w-14 h-14 rounded-xl gradient-sos flex items-center justify-center"
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <AlertTriangle className="w-7 h-7 text-destructive-foreground" />
                  </motion.div>
                  <div>
                    <h3 className="font-display font-bold text-lg">Emergency SOS</h3>
                    <p className="text-muted-foreground text-sm">
                      One-tap emergency alert to your contacts
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-destructive" />
              </div>
            </motion.div>
          </Link>
        </FadeIn>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
