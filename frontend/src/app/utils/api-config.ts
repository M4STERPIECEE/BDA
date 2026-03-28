const isLocalDevHost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_HOST = typeof window !== 'undefined' && !isLocalDevHost ? window.location.origin : 'http://localhost:8080';
export const API_VERSION = 'v1';
export const API_BASE_URL = `${API_HOST}/api`;
export const API_ENDPOINTS = {
  auth: {
    login: `${API_BASE_URL}/${API_VERSION}/auth/login`,
  },
} as const;

