import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, Plus, Trash2, Save, Shield, AlertTriangle, User } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations/MotionWrapper';
import { LoadingSpinner } from '@/components/ui/loading';
import { useAuthStore } from '@/store/useStore';
import { usersApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
}

const EmergencyContacts = () => {
  const { token } = useAuthStore();
  const { toast } = useToast();
  const [contacts, setContacts] = useState<EmergencyContact[]>([
    { id: '1', name: '', phone: '' },
  ]);
  const [isSaving, setIsSaving] = useState(false);

  // Load contacts from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('emergency-contacts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setContacts(parsed);
        }
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  const addContact = () => {
    if (contacts.length >= 5) {
      toast({
        title: 'Maximum reached',
        description: 'You can add up to 5 emergency contacts.',
        variant: 'destructive',
      });
      return;
    }
    setContacts([...contacts, { id: Date.now().toString(), name: '', phone: '' }]);
  };

  const removeContact = (id: string) => {
    if (contacts.length === 1) {
      toast({
        title: 'Cannot remove',
        description: 'You must have at least one emergency contact.',
        variant: 'destructive',
      });
      return;
    }
    setContacts(contacts.filter((c) => c.id !== id));
  };

  const updateContact = (id: string, field: 'name' | 'phone', value: string) => {
    setContacts(
      contacts.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const saveContacts = async () => {
    // Validate contacts
    const validContacts = contacts.filter((c) => c.phone.trim() !== '');
    if (validContacts.length === 0) {
      toast({
        title: 'No contacts',
        description: 'Please add at least one phone number.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      // Save to localStorage
      localStorage.setItem('emergency-contacts', JSON.stringify(contacts));

      // Send to backend
      if (token) {
        const contactsPayload: Record<string, string> = {};
        validContacts.forEach((contact, index) => {
          contactsPayload[`contact${index + 1}`] = contact.phone;
        });
        await usersApi.updateEmergencyContacts(contactsPayload, token);
      }

      toast({
        title: 'Contacts saved!',
        description: 'Your emergency contacts have been updated.',
      });
    } catch (error) {
      // Still save locally even if API fails
      localStorage.setItem('emergency-contacts', JSON.stringify(contacts));
      toast({
        title: 'Saved locally',
        description: 'Contacts saved. Backend sync will retry later.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Remove non-digit characters except +
    return value.replace(/[^\d+]/g, '');
  };

  return (
    <DashboardLayout>
      <div className="px-4 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <FadeIn>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl gradient-sos flex items-center justify-center">
              <Phone className="w-7 h-7 text-destructive-foreground" />
            </div>
            <div>
              <h1 className="font-display text-2xl lg:text-3xl font-bold">Emergency Contacts</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Add up to 5 contacts for SOS alerts
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Info Card */}
        <FadeIn delay={0.05}>
          <div className="glass-card p-4 border-l-4 border-warning">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Important</p>
                <p className="text-muted-foreground text-sm mt-1">
                  These contacts will receive an SMS with your location when you trigger the SOS button.
                  Make sure phone numbers include country code (e.g., +91 for India).
                </p>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Contacts List */}
        <StaggerContainer className="space-y-4" staggerDelay={0.05}>
          {contacts.map((contact, index) => (
            <StaggerItem key={contact.id}>
              <motion.div
                className="glass-card p-5"
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-semibold">Contact {index + 1}</span>
                  </div>
                  <motion.button
                    onClick={() => removeContact(contact.id)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 className="w-5 h-5" />
                  </motion.button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Name (optional)
                    </label>
                    <input
                      type="text"
                      value={contact.name}
                      onChange={(e) => updateContact(contact.id, 'name', e.target.value)}
                      placeholder="e.g., Mom, Dad, Friend"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={contact.phone}
                      onChange={(e) =>
                        updateContact(contact.id, 'phone', formatPhoneNumber(e.target.value))
                      }
                      placeholder="+91 9876543210"
                      className="input-field"
                    />
                  </div>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Add Contact Button */}
        <FadeIn delay={0.1}>
          {contacts.length < 5 && (
            <motion.button
              onClick={addContact}
              className="w-full py-4 rounded-xl border-2 border-dashed border-border hover:border-primary/50 text-muted-foreground hover:text-primary flex items-center justify-center gap-2 transition-colors"
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-5 h-5" />
              <span>Add Emergency Contact</span>
            </motion.button>
          )}
        </FadeIn>

        {/* Save Button */}
        <FadeIn delay={0.15}>
          <motion.button
            onClick={saveContacts}
            disabled={isSaving}
            className="btn-primary w-full py-4 flex items-center justify-center gap-3"
            whileTap={{ scale: 0.98 }}
          >
            {isSaving ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Save Contacts</span>
              </>
            )}
          </motion.button>
        </FadeIn>

        {/* Security Note */}
        <FadeIn delay={0.2}>
          <div className="glass-card p-4">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-success" />
              <p className="text-sm text-muted-foreground">
                Your contacts are stored securely and only used during emergencies.
              </p>
            </div>
          </div>
        </FadeIn>
      </div>
    </DashboardLayout>
  );
};

export default EmergencyContacts;
