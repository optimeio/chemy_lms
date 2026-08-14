import { getApiBaseUrl } from './apiConfig';

const CLIENT_KEY = import.meta.env.VITE_CLIENT_KEY;
const CLIENT_SECRET = import.meta.env.VITE_CLIENT_SECRET;

const defaultHeaders = {
  'Content-Type': 'application/json',
  'x-client-key': CLIENT_KEY,
  'x-client-secret': CLIENT_SECRET
};

export const apiService = {
  async get(endpoint) {
    const API_BASE_URL = getApiBaseUrl();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: defaultHeaders
    });
    const contentType = response.headers.get('content-type') || '';
    if (!response.ok) {
      // try to provide helpful payload when possible
      if (contentType.includes('application/json')) {
        const err = await response.json();
        return { success: false, status: response.status, error: err };
      }
      const text = await response.text();
      return { success: false, status: response.status, error: text };
    }
    if (contentType.includes('application/json')) {
      return response.json();
    }
    // non-json successful response
    return { success: true, data: await response.text() };
  },

  async post(endpoint, data) {
    const API_BASE_URL = getApiBaseUrl();
    const isFormData = data instanceof FormData;
    const headers = { ...defaultHeaders };
    if (isFormData) delete headers['Content-Type'];

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: isFormData ? data : JSON.stringify(data)
    });
    const contentType = response.headers.get('content-type') || '';
    if (!response.ok) {
      if (contentType.includes('application/json')) return { success: false, status: response.status, error: await response.json() };
      return { success: false, status: response.status, error: await response.text() };
    }
    if (contentType.includes('application/json')) return response.json();
    return { success: true, data: await response.text() };
  },

  async put(endpoint, data) {
    const API_BASE_URL = getApiBaseUrl();
    const isFormData = data instanceof FormData;
    const headers = { ...defaultHeaders };
    if (isFormData) delete headers['Content-Type'];

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: isFormData ? data : JSON.stringify(data)
    });
    const contentType = response.headers.get('content-type') || '';
    if (!response.ok) {
      if (contentType.includes('application/json')) return { success: false, status: response.status, error: await response.json() };
      return { success: false, status: response.status, error: await response.text() };
    }
    if (contentType.includes('application/json')) return response.json();
    return { success: true, data: await response.text() };
  },

  async delete(endpoint) {
    const API_BASE_URL = getApiBaseUrl();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: defaultHeaders
    });
    const contentType = response.headers.get('content-type') || '';
    if (!response.ok) {
      if (contentType.includes('application/json')) return { success: false, status: response.status, error: await response.json() };
      return { success: false, status: response.status, error: await response.text() };
    }
    if (contentType.includes('application/json')) return response.json();
    return { success: true, data: await response.text() };
  }
};
