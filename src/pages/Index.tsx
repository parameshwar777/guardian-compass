import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, MapPin, Brain, MessageSquare, AlertTriangle, ChevronRight, Sparkles } from 'lucide-react';
import { FadeIn, StaggerContainer, StaggerItem, Float } from '@/components/animations/MotionWrapper';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between safe-area-inset-top">
        <FadeIn>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl">SafeTravel AI</span>
          </div>
        </FadeIn>
        <FadeIn delay={0.1}>
          <Link to="/login">
            <motion.button className="btn-primary px-5 py-2.5 text-sm" whileTap={{ scale: 0.95 }}>
              Sign In
            </motion.button>
          </Link>
        </FadeIn>
      </header>

      {/* Hero */}
      <section className="px-6 py-12 lg:py-20 text-center max-w-4xl mx-auto">
        <FadeIn delay={0.15}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            AI-Powered Safety
          </div>
        </FadeIn>
        
        <FadeIn delay={0.2}>
          <h1 className="font-display text-4xl lg:text-6xl font-bold leading-tight mb-6">
            Your Personal
            <span className="text-gradient-primary block">Safety Companion</span>
          </h1>
        </FadeIn>
        
        <FadeIn delay={0.25}>
          <p className="text-muted-foreground text-lg lg:text-xl max-w-2xl mx-auto mb-8">
            AI-powered travel safety with real-time location tracking, smart predictions, and instant emergency alerts.
          </p>
        </FadeIn>
        
        <FadeIn delay={0.3}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <motion.button className="btn-primary px-8 py-4 text-lg w-full sm:w-auto flex items-center justify-center gap-2" whileTap={{ scale: 0.98 }}>
                Get Started Free
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </Link>
            <Link to="/login">
              <motion.button className="px-8 py-4 text-lg w-full sm:w-auto rounded-xl border border-border hover:bg-secondary transition-colors" whileTap={{ scale: 0.98 }}>
                Sign In
              </motion.button>
            </Link>
          </div>
        </FadeIn>
      </section>

      {/* Features */}
      <section className="px-6 py-12 max-w-5xl mx-auto">
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6" staggerDelay={0.1}>
          {[
            { icon: MapPin, title: 'Location Tracking', desc: 'Real-time GPS monitoring with history', gradient: 'gradient-primary' },
            { icon: Brain, title: 'AI Prediction', desc: 'Smart destination forecasting', gradient: 'gradient-accent' },
            { icon: MessageSquare, title: 'AI Assistant', desc: 'Voice-enabled safety guidance', gradient: 'gradient-success' },
            { icon: AlertTriangle, title: 'SOS Emergency', desc: 'One-tap emergency alerts', gradient: 'gradient-sos' },
          ].map((item) => (
            <StaggerItem key={item.title}>
              <motion.div className="glass-card p-6" whileHover={{ scale: 1.02, y: -4 }}>
                <div className={`w-12 h-12 rounded-xl ${item.gradient} flex items-center justify-center mb-4`}>
                  <item.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 text-center">
        <Float>
          <div className="w-16 h-16 rounded-2xl gradient-primary mx-auto mb-6 flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
        </Float>
        <h2 className="font-display text-2xl lg:text-3xl font-bold mb-4">Travel with Confidence</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">Join thousands of travelers who trust SafeTravel AI for their safety.</p>
        <Link to="/register">
          <motion.button className="btn-accent px-8 py-4 text-lg" whileTap={{ scale: 0.98 }}>
            Start Your Free Trial
          </motion.button>
        </Link>
      </section>
    </div>
  );
};

export default Index;
