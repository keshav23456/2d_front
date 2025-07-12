import { API_CONFIG } from './apiConfig.js';

export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const handleApiResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new ApiError(
      errorData?.detail || `HTTP ${response.status}: ${response.statusText}`,
      response.status,
      errorData
    );
  }
  return response.json();
};

export const createApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};