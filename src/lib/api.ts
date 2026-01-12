const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  token?: string | null;
}

async function apiCall<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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
  saveLocation: (latitude: number, longitude: number, token: string) =>
    apiCall<{ id: string; latitude: number; longitude: number; timestamp: string }>('/locations/', {
      method: 'POST',
      body: { latitude, longitude },
      token,
    }),

  getHistory: (token: string) =>
    apiCall<{ locations: Array<{ id: string; latitude: number; longitude: number; timestamp: string; address?: string }> }>(
      '/locations/history',
      { token }
    ),
};

// Prediction API
export const predictionApi = {
  predictNextLocation: (latitude: number, longitude: number, token: string) =>
    apiCall<{ predicted_latitude: number; predicted_longitude: number; confidence: number }>(
      '/prediction/next-location',
      {
        method: 'POST',
        body: { current_latitude: latitude, current_longitude: longitude },
        token,
      }
    ),
};

// Assistant API
export const assistantApi = {
  chat: (message: string, token: string) =>
    apiCall<{ response: string; suggestions?: string[] }>('/assistant/chat', {
      method: 'POST',
      body: { message },
      token,
    }),
};

// Recommendations API
export const recommendationsApi = {
  getAccommodations: (latitude: number, longitude: number, token: string) =>
    apiCall<{
      recommendations: Array<{
        id: string;
        name: string;
        type: string;
        price_range: string;
        rating: number;
        safety_score: number;
        safety_notes: string;
        image_url?: string;
        distance: string;
      }>;
    }>('/recommendations/accommodation', {
      method: 'POST',
      body: { latitude, longitude },
      token,
    }),
};

// SOS API
export const sosApi = {
  trigger: (latitude: number, longitude: number, token: string) =>
    apiCall<{
      success: boolean;
      message: string;
      emergency_contacts: Array<{ name: string; phone: string }>;
      sms_content: string;
    }>('/sos/trigger', {
      method: 'POST',
      body: { latitude, longitude },
      token,
    }),
};
