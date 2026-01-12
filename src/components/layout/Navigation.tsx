import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  MapPin, 
  Brain, 
  MessageSquare, 
  Hotel,
  AlertTriangle,
  Phone
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { path: '/location', icon: MapPin, label: 'Location' },
  { path: '/predict', icon: Brain, label: 'Predict' },
  { path: '/assistant', icon: MessageSquare, label: 'AI Chat' },
  { path: '/stays', icon: Hotel, label: 'Stays' },
  { path: '/emergency-contacts', icon: Phone, label: 'Contacts' },
];

export const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-xl border-t border-border z-50 safe-area-inset-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center min-w-[60px] py-2"
            >
              <motion.div
                className={`p-2 rounded-xl transition-colors ${
                  isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                }`}
                whileTap={{ scale: 0.9 }}
              >
                <Icon className="w-5 h-5" />
              </motion.div>
              <span
                className={`text-xs mt-1 font-medium ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="navIndicator"
                  className="absolute -bottom-2 w-1 h-1 rounded-full bg-primary"
                />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export const DesktopSidebar = () => {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-card border-r border-border h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-xl">SafeTravel AI</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-glow'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* SOS Button */}
      <div className="p-4 border-t border-border">
        <NavLink
          to="/sos"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl btn-sos animate-pulse-glow"
        >
          <AlertTriangle className="w-5 h-5" />
          <span className="font-bold">Emergency SOS</span>
        </NavLink>
      </div>
    </aside>
  );
};
