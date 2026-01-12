const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  token?: string | null;
  params?: Record<string, string | number>;
}

async function apiCall<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, token, params } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
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

// Auth APIs
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

// Location APIs
export const locationApi = {
  saveLocation: (latitude: number, longitude: number, accuracy: number, token: string) =>
    apiCall<{ id: number; latitude: number; longitude: number; accuracy: number; created_at: string }>(
      '/api/v1/locations/',
      {
        method: 'POST',
        body: { latitude, longitude, accuracy },
        token,
      }
    ),

  getHistory: (token: string, limit: number = 50) =>
    apiCall<Array<{ id: number; latitude: number; longitude: number; accuracy: number; created_at: string }>>(
      '/api/v1/locations/history',
      { token, params: { limit } }
    ),
};

// Prediction API
export const predictionApi = {
  predictNextLocation: (token: string) =>
    apiCall<string>('/api/v1/prediction/next-location', {
      method: 'POST',
      token,
    }),
};

// Assistant API
export const assistantApi = {
  chat: (question: string, token: string) =>
    apiCall<string>('/api/v1/assistant/chat', {
      method: 'POST',
      token,
      params: { question },
    }),
};

// Recommendations API
export const recommendationsApi = {
  getAccommodations: (token: string) =>
    apiCall<string>('/api/v1/recommendations/accommodation', {
      method: 'POST',
      token,
    }),
};

// SOS API
export const sosApi = {
  trigger: (latitude: number, longitude: number, token: string) =>
    apiCall<string>('/api/v1/sos/trigger', {
      method: 'POST',
      body: { latitude, longitude },
      token,
    }),
};

// Federated Learning API
export const federatedApi = {
  trainLocal: (token: string) =>
    apiCall<string>('/api/v1/federated/train-local', {
      method: 'POST',
      token,
    }),

  aggregate: (token: string) =>
    apiCall<string>('/api/v1/federated/aggregate', {
      method: 'POST',
      token,
    }),
};

// Users API
export const usersApi = {
  updateEmergencyContacts: (
    contacts: {
      contact1?: string;
      contact2?: string;
      contact3?: string;
      contact4?: string;
      contact5?: string;
    },
    token: string
  ) =>
    apiCall<string>('/api/v1/users/emergency-contacts', {
      method: 'POST',
      body: contacts,
      token,
    }),
};
