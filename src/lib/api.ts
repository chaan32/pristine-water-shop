// Centralized API helpers and base URL
// Note: Avoid using Vite env vars per project guidelines; adjust base URL here if needed.
export const API_BASE_URL = 'http://localhost:8080';

export const getAccessToken = (): string | null => {
  try {
    return localStorage.getItem('accessToken');
  } catch {
    return null;
  }
};

export const authHeaders = () => {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export async function apiFetch(input: string, init: RequestInit = {}) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...authHeaders(),
    ...(init.headers || {}),
  };
  return fetch(`${API_BASE_URL}${input}`, { ...init, headers });
}

// Shared DTOs
export type CartItemDto = { productId: number; quantity: number };
