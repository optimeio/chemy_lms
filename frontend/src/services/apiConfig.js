// Centralized API and Media URL configuration with automatic Localhost / Production detection

export const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }
  }
  return import.meta.env.VITE_API_BASE_URL || 'https://chemy-lms.onrender.com/api';
};

export const getServerBaseUrl = () => {
  const apiBase = getApiBaseUrl();
  return apiBase.replace('/api', '');
};

export const getFullMediaUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  const serverBase = getServerBaseUrl();
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${serverBase}${cleanUrl}`;
};
