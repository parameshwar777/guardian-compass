import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
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
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
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
