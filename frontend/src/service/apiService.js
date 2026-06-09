const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function getToken() {
  return localStorage.getItem('wf_token');
}

async function request(method, path, body = null, auth = true) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const cleanBaseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const res = await fetch(`${cleanBaseUrl}${cleanPath}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan.');
  return data;
}

export async function apiRegister({ username, email, password }) {
  const data = await request('POST', '/auth/register', { username, email, password }, false);
  localStorage.setItem('wf_token', data.token);
  return data;
}

export async function apiLogin({ username, password }) {
  const data = await request('POST', '/auth/login', { username, password }, false);
  localStorage.setItem('wf_token', data.token);
  return data;
}

export function apiLogout() { 
  localStorage.removeItem('wf_token');
}

export async function apiGetMe() {
  return request('GET', '/auth/me');
}

export async function apiUpdateProfile({ username, email }) {
  return request('PATCH', '/auth/me', { username, email });
}

export async function apiChangePassword({ currentPassword, newPassword }) {
  return request('PATCH', '/auth/me/password', { currentPassword, newPassword });
}

export async function apiGetPreferences() {
  return request('GET', '/preferences');
}

export async function apiUpdatePreferences(prefs) {
  return request('PATCH', '/preferences', prefs);
}

export async function apiGetFavorites() {
  return request('GET', '/locations/favorites');
}

export async function apiAddFavorite({ city_name, lat, lon }) {
  return request('POST', '/locations/favorites', { city_name, lat, lon });
}

export async function apiRemoveFavorite(id) {
  return request('DELETE', `/locations/favorites/${id}`);
}

export async function apiGetSearchHistory() {
  return request('GET', '/locations/history');
}

export async function apiAddSearchHistory(city_name) {
  return request('POST', '/locations/history', { city_name });
}

export async function apiClearSearchHistory() {
  return request('DELETE', '/locations/history');
}
