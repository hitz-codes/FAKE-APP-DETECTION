import axios from 'axios';

// API base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface AppData {
  app_name: string;
  package_name: string;
  publisher: string;
  brand: 'phonepe' | 'paytm' | 'gpay';
  risk_score: number;
  is_official?: boolean;
}

export interface DetectionRequest {
  brand?: 'all' | 'phonepe' | 'paytm' | 'gpay';
  threshold?: number;
}

export interface DetectionResponse {
  results: AppData[];
  total_detected: number;
  suspicious_count: number;
}

export interface SingleAppRequest {
  app_name: string;
  package_name: string;
  publisher: string;
  brand: 'phonepe' | 'paytm' | 'gpay';
}

export interface SingleAppResponse {
  risk_score: number;
  evidence: string;
  app_data: AppData;
}

export interface EvidenceRequest {
  app_ids?: string[];
  threshold?: number;
}

export interface EvidenceResponse {
  evidence_text: string;
  apps_processed: number;
}

export interface TakedownRequest {
  app_id: string;
}

export interface TakedownResponse {
  email_text: string;
  app_details: AppData;
}

export interface PaginatedResponse {
  results: AppData[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface Brand {
  value: string;
  label: string;
}

// API Functions

// Detection APIs
export const runDetection = async (request: DetectionRequest = {}): Promise<DetectionResponse> => {
  const response = await api.post('/api/detection/run', {
    brand: request.brand || 'all',
    threshold: request.threshold || 50
  });
  return response.data;
};

export const getDetectionResults = async (
  brand?: string,
  threshold?: number,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResponse> => {
  const params = new URLSearchParams();
  if (brand && brand !== 'all') params.append('brand', brand);
  if (threshold !== undefined) params.append('threshold', threshold.toString());
  params.append('page', page.toString());
  params.append('limit', limit.toString());

  const response = await api.get(`/api/detection/results?${params}`);
  return response.data;
};

export const checkSingleApp = async (request: SingleAppRequest): Promise<SingleAppResponse> => {
  const response = await api.post('/api/detection/single', request);
  return response.data;
};

export const getSupportedBrands = async (): Promise<Brand[]> => {
  try {
    const response = await api.get('/api/detection/brands');
    return response.data;
  } catch (error) {
    // Fallback brands if API fails
    return [
      { value: 'all', label: 'All Brands' },
      { value: 'phonepe', label: 'PhonePe' },
      { value: 'paytm', label: 'Paytm' },
      { value: 'gpay', label: 'GPay' }
    ];
  }
};

// Evidence APIs
export const generateEvidence = async (request: EvidenceRequest = {}): Promise<EvidenceResponse> => {
  const response = await api.post('/api/evidence/generate', {
    app_ids: request.app_ids || [],
    threshold: request.threshold || 50
  });
  return response.data;
};

export const generateTakedownEmail = async (request: TakedownRequest): Promise<TakedownResponse> => {
  const response = await api.post('/api/evidence/takedown', request);
  return response.data;
};

export const getAppEvidence = async (appId: string): Promise<{ app: AppData; evidence: string }> => {
  const response = await api.get(`/api/evidence/app/${appId}/evidence`);
  return response.data;
};

// Utility APIs
export const healthCheck = async (): Promise<{ status: string; message: string }> => {
  const response = await api.get('/api/health');
  return response.data;
};

export const getAllApps = async (): Promise<AppData[]> => {
  const response = await api.get('/api/apps');
  return response.data;
};

// Error handling
export const handleApiError = (error: any): string => {
  if (error.response) {
    // Server responded with error status
    return error.response.data?.detail || error.response.statusText || 'Server error occurred';
  } else if (error.request) {
    // Network error
    return 'Network error. Please check your connection.';
  } else {
    // Other error
    return error.message || 'An unexpected error occurred';
  }
};

// Request/Response interceptors for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    return Promise.reject(error);
  }
);

export default api;
