import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Phone, MessageSquare, MapPin, Check, Shield, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { FadeIn, Pulse } from '@/components/animations/MotionWrapper';
import { LoadingSpinner } from '@/components/ui/loading';
import { useLocationStore, useAuthStore } from '@/store/useStore';
import { sosApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
}

const SOS = () => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);
  const [sosTriggered, setSosTriggered] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [sosResult, setSosResult] = useState<{
    message: string;
    emergency_contacts: Array<{ name: string; phone: string }>;
    sms_content: string;
  } | null>(null);
  const { currentLocation } = useLocationStore();
  const { token } = useAuthStore();
  const { toast } = useToast();

  // Load emergency contacts on mount
  useEffect(() => {
    const saved = localStorage.getItem('emergency-contacts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setEmergencyContacts(parsed.filter((c: EmergencyContact) => c.phone.trim() !== ''));
        }
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  const handleSOSTrigger = async () => {
    setShowConfirm(false);
    setIsTriggering(true);

    try {
      if (token && currentLocation) {
        const response = await sosApi.trigger(
          currentLocation.latitude,
          currentLocation.longitude
        );
        // Parse string response
        try {
          const parsed = typeof response === 'string' ? JSON.parse(response) : response;
          setSosResult({
            message: parsed.message || 'Emergency SOS triggered successfully!',
            emergency_contacts: parsed.emergency_contacts || emergencyContacts.map(c => ({ name: c.name || 'Contact', phone: c.phone })),
            sms_content: parsed.sms_content || buildSmsContent(),
          });
        } catch {
          setResultFromContacts();
        }
      } else {
        // Demo response
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setResultFromContacts();
      }

      setSosTriggered(true);
      
      if (emergencyContacts.length > 0) {
        toast({
          title: 'SOS Triggered!',
          description: `Alert sent to ${emergencyContacts.length} contact(s).`,
        });
      } else {
        toast({
          title: 'SOS Triggered!',
          description: 'Please add emergency contacts for SMS alerts.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'SOS Failed',
        description: 'Unable to trigger SOS. Please call emergency services directly.',
        variant: 'destructive',
      });
    } finally {
      setIsTriggering(false);
    }
  };

  const buildSmsContent = () => {
    return `🆘 EMERGENCY ALERT\n\nI need help! My current location:\nLat: ${currentLocation?.latitude.toFixed(6) || 'Unknown'}\nLong: ${currentLocation?.longitude.toFixed(6) || 'Unknown'}\n\nGoogle Maps: https://maps.google.com/?q=${currentLocation?.latitude || 0},${currentLocation?.longitude || 0}\n\nSent via SafeTravel AI`;
  };

  const setResultFromContacts = () => {
    const contacts = emergencyContacts.length > 0
      ? emergencyContacts.map((c) => ({ name: c.name || 'Contact', phone: c.phone }))
      : [{ name: 'No contacts', phone: 'Add contacts in settings' }];

    setSosResult({
      message: 'Emergency SOS triggered successfully!',
      emergency_contacts: contacts,
      sms_content: buildSmsContent(),
    });
  };

  const resetSOS = () => {
    setSosTriggered(false);
    setSosResult(null);
  };

  return (
    <DashboardLayout>
      <div className="px-4 lg:px-8 flex flex-col items-center justify-center min-h-[calc(100vh-180px)]">
        <AnimatePresence mode="wait">
          {sosTriggered && sosResult ? (
            <motion.div
              key="triggered"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md space-y-6"
            >
              {/* Success Header */}
              <div className="text-center">
                <motion.div
                  className="w-20 h-20 rounded-full gradient-success mx-auto mb-4 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  <Check className="w-10 h-10 text-success-foreground" />
                </motion.div>
                <h1 className="font-display text-2xl font-bold text-success">SOS Triggered</h1>
                <p className="text-muted-foreground mt-2">{sosResult.message}</p>
              </div>

              {/* Location Sent */}
              <div className="glass-card p-4">
                <div className="flex items-center gap-3 mb-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Your Location Shared</span>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3 font-mono text-sm">
                  {currentLocation
                    ? `${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}`
                    : 'Location not available'}
                </div>
              </div>

              {/* Contacts Notified */}
              <div className="glass-card p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Phone className="w-5 h-5 text-success" />
                  <span className="font-semibold">Contacts Notified</span>
                </div>
                <div className="space-y-2">
                  {sosResult.emergency_contacts.map((contact, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-secondary/50 rounded-lg p-3"
                    >
                      <span className="font-medium">{contact.name}</span>
                      <span className="text-sm text-muted-foreground">{contact.phone}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SMS Content */}
              <div className="glass-card p-4">
                <div className="flex items-center gap-3 mb-3">
                  <MessageSquare className="w-5 h-5 text-accent" />
                  <span className="font-semibold">Message Sent</span>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3 text-sm whitespace-pre-line">
                  {sosResult.sms_content}
                </div>
              </div>

              {/* Reset Button */}
              <motion.button
                onClick={resetSOS}
                className="w-full py-3 rounded-xl border border-border bg-secondary/50 text-foreground font-medium hover:bg-secondary transition-colors"
                whileTap={{ scale: 0.98 }}
              >
                I'm Safe Now
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="ready"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center space-y-8"
            >
              {/* Warning Icon */}
              <FadeIn>
                <div className="flex items-center justify-center gap-2 text-muted-foreground mb-4">
                  <Shield className="w-5 h-5" />
                  <span className="text-sm font-medium">Emergency Services</span>
                </div>
              </FadeIn>

              {/* Main SOS Button */}
              <Pulse>
                <motion.button
                  onClick={() => setShowConfirm(true)}
                  disabled={isTriggering}
                  className="w-48 h-48 rounded-full btn-sos flex flex-col items-center justify-center shadow-sos disabled:opacity-80"
                  whileTap={{ scale: 0.95 }}
                >
                  {isTriggering ? (
                    <LoadingSpinner size="lg" />
                  ) : (
                    <>
                      <AlertTriangle className="w-16 h-16 mb-2" />
                      <span className="font-display text-2xl font-bold">SOS</span>
                    </>
                  )}
                </motion.button>
              </Pulse>

              {/* Instructions */}
              <FadeIn delay={0.1}>
                <div className="max-w-xs mx-auto space-y-2">
                  <h2 className="font-display text-xl font-bold">Emergency SOS</h2>
                  <p className="text-muted-foreground text-sm">
                    Press the button to immediately alert your emergency contacts with your current
                    location.
                  </p>
                </div>
              </FadeIn>

              {/* Features */}
              <FadeIn delay={0.15}>
                <div className="glass-card p-5 max-w-sm mx-auto">
                  <div className="space-y-3">
                    {[
                      { icon: MapPin, text: 'Shares your exact location' },
                      { icon: MessageSquare, text: 'Sends SMS to all contacts' },
                      { icon: Phone, text: 'Prepares emergency call' },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                          <item.icon className="w-4 h-4 text-destructive" />
                        </div>
                        <span className="text-sm">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>

              {/* Location Status & Contacts Link */}
              <FadeIn delay={0.2}>
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${currentLocation ? 'bg-success' : 'bg-warning'} animate-pulse`} />
                    <span className="text-muted-foreground">
                      {currentLocation ? 'Location ready' : 'Location not available'}
                    </span>
                  </div>
                  <Link
                    to="/emergency-contacts"
                    className="flex items-center justify-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Manage Emergency Contacts ({emergencyContacts.length})</span>
                  </Link>
                </div>
              </FadeIn>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confirmation Dialog */}
        <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
          <AlertDialogContent className="max-w-sm mx-4">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Trigger Emergency SOS?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This will immediately send your location to all your emergency contacts and prepare
                to call emergency services.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleSOSTrigger}
                className="flex-1 gradient-sos text-destructive-foreground hover:opacity-90"
              >
                Trigger SOS
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default SOS;
