const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const CLIENT_KEY = import.meta.env.VITE_CLIENT_KEY;
const CLIENT_SECRET = import.meta.env.VITE_CLIENT_SECRET;

const defaultHeaders = {
  'Content-Type': 'application/json',
  'x-client-key': CLIENT_KEY,
  'x-client-secret': CLIENT_SECRET
};

export const apiService = {
  async get(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: defaultHeaders
    });
    return response.json();
  },

  async post(endpoint, data) {
    const isFormData = data instanceof FormData;
    const headers = { ...defaultHeaders };
    if (isFormData) delete headers['Content-Type'];

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: isFormData ? data : JSON.stringify(data)
    });
    return response.json();
  },

  async put(endpoint, data) {
    const isFormData = data instanceof FormData;
    const headers = { ...defaultHeaders };
    if (isFormData) delete headers['Content-Type'];

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: isFormData ? data : JSON.stringify(data)
    });
    return response.json();
  },

  async delete(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: defaultHeaders
    });
    return response.json();
  }
};
