import { useAuthStore } from '@/store/useStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  token?: string | null;
  params?: Record<string, string | number>;
}

function getAuthToken(): string | null {
  // Prefer the explicit token key (used by backend fetch pattern),
  // but fall back to Zustand persisted state if it's missing.
  return localStorage.getItem('token') || useAuthStore.getState().token;
}

async function apiCall<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, token, params } = options;
  
  // Use provided token or get from localStorage
  const authToken = token || getAuthToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  let url = `${API_BASE_URL}${endpoint}`;
  
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
    url += `?${searchParams.toString()}`;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
    throw new Error(error.detail || error.message || 'Request failed');
  }

  return response.json();
}

// Auth APIs (no token required)
export const authApi = {
  login: (email: string, password: string) =>
    apiCall<{ access_token: string; token_type: string }>('/api/v1/auth/login', {
      method: 'POST',
      body: { email, password },
    }),

  register: (email: string, password: string) =>
    apiCall<{ id: number; email: string; is_active: boolean }>('/api/v1/auth/register', {
      method: 'POST',
      body: { email, password },
    }),
};

// Location APIs (auto-uses token from localStorage)
export const locationApi = {
  saveLocation: (latitude: number, longitude: number, accuracy: number) =>
    apiCall<{ id: number; latitude: number; longitude: number; accuracy: number; created_at: string }>(
      '/api/v1/locations/',
      {
        method: 'POST',
        body: { latitude, longitude, accuracy },
      }
    ),

  getHistory: (limit: number = 50) =>
    apiCall<Array<{ id: number; latitude: number; longitude: number; accuracy: number; created_at: string }>>(
      '/api/v1/locations/history',
      { params: { limit } }
    ),
};

// Prediction API
export const predictionApi = {
  predictNextLocation: () =>
    apiCall<string>('/api/v1/prediction/next-location', {
      method: 'POST',
    }),
};

// Assistant API
export const assistantApi = {
  chat: (question: string) =>
    apiCall<string>('/api/v1/assistant/chat', {
      method: 'POST',
      params: { question },
    }),
};

// Recommendations API
export const recommendationsApi = {
  getAccommodations: () =>
    apiCall<string>('/api/v1/recommendations/accommodation', {
      method: 'POST',
    }),
};

// SOS API
export const sosApi = {
  trigger: (latitude: number, longitude: number) =>
    apiCall<string>('/api/v1/sos/trigger', {
      method: 'POST',
      body: { latitude, longitude },
    }),
};

// Federated Learning API
export const federatedApi = {
  trainLocal: () =>
    apiCall<string>('/api/v1/federated/train-local', {
      method: 'POST',
    }),

  aggregate: () =>
    apiCall<string>('/api/v1/federated/aggregate', {
      method: 'POST',
    }),
};

// Users API
export const usersApi = {
  updateEmergencyContacts: (contacts: {
    contact1?: string;
    contact2?: string;
    contact3?: string;
    contact4?: string;
    contact5?: string;
  }) =>
    apiCall<string>('/api/v1/users/emergency-contacts', {
      method: 'POST',
      body: contacts,
    }),
};
