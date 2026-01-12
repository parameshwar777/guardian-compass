import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AlertTriangle, Moon, Sun, LogOut, User } from 'lucide-react';
import { BottomNav, DesktopSidebar } from './Navigation';
import { useAuthStore, useThemeStore } from '@/store/useStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-background flex">
        {/* Desktop Sidebar */}
        <DesktopSidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Mobile Header */}
          <header className="lg:hidden sticky top-0 z-40 bg-card/90 backdrop-blur-xl border-b border-border safe-area-inset-top">
            <div className="flex items-center justify-between px-4 py-3">
              <Link to="/dashboard" className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-display font-bold text-lg">SafeTravel AI</span>
              </Link>

              <div className="flex items-center gap-2">
                {/* Theme Toggle */}
                <motion.button
                  onClick={toggleTheme}
                  className="p-2 rounded-xl hover:bg-secondary transition-colors"
                  whileTap={{ scale: 0.95 }}
                >
                  {isDark ? (
                    <Sun className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <Moon className="w-5 h-5 text-muted-foreground" />
                  )}
                </motion.button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.button
                      className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center"
                      whileTap={{ scale: 0.95 }}
                    >
                      <User className="w-5 h-5 text-muted-foreground" />
                    </motion.button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2">
                      <p className="font-medium">{user?.name || 'User'}</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Desktop Header */}
          <header className="hidden lg:flex sticky top-0 z-40 bg-card/90 backdrop-blur-xl border-b border-border">
            <div className="flex-1 flex items-center justify-between px-6 py-4">
              <div />
              
              <div className="flex items-center gap-4">
                {/* Theme Toggle */}
                <motion.button
                  onClick={toggleTheme}
                  className="p-2 rounded-xl hover:bg-secondary transition-colors"
                  whileTap={{ scale: 0.95 }}
                >
                  {isDark ? (
                    <Sun className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <Moon className="w-5 h-5 text-muted-foreground" />
                  )}
                </motion.button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.button
                      className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-secondary transition-colors"
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
                        <User className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-sm">{user?.name || 'User'}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                    </motion.button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 pb-24 lg:pb-8">
            {children}
          </main>

          {/* Mobile SOS Button */}
          <Link
            to="/sos"
            className="lg:hidden fixed bottom-20 right-4 z-50"
          >
            <motion.div
              className="w-14 h-14 rounded-full btn-sos flex items-center justify-center animate-pulse-glow"
              whileTap={{ scale: 0.9 }}
            >
              <AlertTriangle className="w-6 h-6" />
            </motion.div>
          </Link>

          {/* Bottom Navigation */}
          <BottomNav />
        </div>
      </div>
    </div>
  );
};
