// Central HTTP API Client with automatic fallback to localStorage for demo continuity
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('digitailor_jwt_token') || localStorage.getItem('digitailor_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
    if (!response.ok) {
      throw new Error(`API HTTP Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn(`[DigiTailor Service Layer] Backend offline or endpoint ${endpoint} unreachable. Using demo fallback mode.`, error.message);
    return null; // Signals caller to use seamless fallback
  }
}
