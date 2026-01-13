import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  email: string;
  is_active: boolean;
}

interface Location {
  id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  address?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  loginWithToken: (token: string, email: string) => void;
  logout: () => void;
}

interface LocationState {
  currentLocation: { latitude: number; longitude: number } | null;
  locationHistory: Location[];
  predictedLocation: { latitude: number; longitude: number; confidence: number } | null;
  setCurrentLocation: (location: { latitude: number; longitude: number }) => void;
  setLocationHistory: (history: Location[]) => void;
  setPredictedLocation: (location: { latitude: number; longitude: number; confidence: number } | null) => void;
}

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => {
        localStorage.setItem('token', token);
        set({ user, token, isAuthenticated: true });
      },
      loginWithToken: (token, email) => {
        localStorage.setItem('token', token);
        set({ 
          user: { id: 0, email, is_active: true }, 
          token, 
          isAuthenticated: true 
        });
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    { name: 'auth-storage' }
  )
);

export const useLocationStore = create<LocationState>((set) => ({
  currentLocation: null,
  locationHistory: [],
  predictedLocation: null,
  setCurrentLocation: (location) => set({ currentLocation: location }),
  setLocationHistory: (history) => set({ locationHistory: history }),
  setPredictedLocation: (location) => set({ predictedLocation: location }),
}));

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: false,
      toggleTheme: () => set((state) => ({ isDark: !state.isDark })),
    }),
    { name: 'theme-storage' }
  )
);
