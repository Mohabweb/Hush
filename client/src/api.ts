// Small typed API client. Sends x-lang; admin calls send x-csrf-token.

export interface ApiConfig {
  ordering: { enabled: boolean; deliveryEnabled: boolean; dineInEnabled: boolean; noteEn: string; noteAr: string };
  banner: { enabled: boolean; textEn: string | null; textAr: string | null };
  site: { taglineEn: string; taglineAr: string; instagram: string | null; phone: string | null };
  whatsapp: 'configured' | 'off';
  googleReviews: 'configured' | 'not_configured';
}

export interface ApiVariant { id: number; label: string; labelEn: string; labelAr: string; price: number; isAvailable: boolean; }
export interface ApiItem {
  slug: string; name: string; nameEn: string; nameAr: string;
  description: string | null; image: string | null;
  isFeatured: boolean; isAvailable: boolean; variants: ApiVariant[];
}
export interface ApiCategory { slug: string; name: string; items: ApiItem[]; }
export interface ApiAddOn { slug: string; name: string; price: number; appliesTo: string[]; }
export interface ApiMenu { categories: ApiCategory[]; addOns: ApiAddOn[]; }
export interface ApiBranch { slug: string; name: string; address: string; phone: string | null; mapsUrl: string | null; }
export interface ApiOrderStatus {
  ref: string; status: string; paymentStatus: string; total: number; currency: string; createdAt: number;
  lines: { nameEn: string; nameAr: string; variantEn?: string; variantAr?: string; unitPrice: number; quantity: number; addOns: { nameEn: string; nameAr: string; price: number; quantity: number }[]; lineTotal: number }[];
}

export class ApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function getLang(): string {
  return localStorage.getItem('hush-lang') === 'ar' ? 'ar' : 'en';
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('x-lang', getLang());
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const resp = await fetch(path, { ...init, headers });
  const text = await resp.text();
  let data: unknown = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = null; }
  if (!resp.ok) {
    const err = (data || {}) as { error?: string; message?: string };
    throw new ApiError(resp.status, err.error || 'error', err.message || 'Request failed');
  }
  return data as T;
}

export const api = {
  config: () => request<ApiConfig>('/api/config'),
  menu: () => request<ApiMenu>('/api/menu'),
  branches: () => request<{ branches: ApiBranch[] }>('/api/branches'),
  reviews: () => request<import('./pages/Reviews.jsx').ReviewsData>('/api/reviews'),
  page: (slug: string) => request<{ slug: string; title: string; body: string }>(`/api/pages/${slug}`),

  order: (payload: unknown) =>
    request<{ ref: string; token: string; total: number; currency: string }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  orderStatus: (ref: string, token: string) =>
    request<ApiOrderStatus>(`/api/orders/${encodeURIComponent(ref)}?t=${encodeURIComponent(token)}`),
  contact: (payload: unknown) => request<{ ok: boolean }>('/api/contact', { method: 'POST', body: JSON.stringify(payload) }),
  reserve: (payload: unknown) => request<{ ok: boolean }>('/api/reservations', { method: 'POST', body: JSON.stringify(payload) })
};

// ---------------- Admin API ----------------

const ADMIN_SESSION_KEY = 'hush-admin-session';

export interface AdminSession { csrfToken: string; user: { email: string; name?: string; role: string } }

export function getAdminSession(): AdminSession | null {
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    return raw ? (JSON.parse(raw) as AdminSession) : null;
  } catch {
    return null;
  }
}

export function setAdminSession(s: AdminSession | null): void {
  if (s) localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(s));
  else localStorage.removeItem(ADMIN_SESSION_KEY);
}

export async function adminRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  headers.set('x-lang', getLang());
  const session = getAdminSession();
  if (session && init.method && init.method !== 'GET') headers.set('x-csrf-token', session.csrfToken);
  const resp = await fetch(`/api/admin${path}`, { ...init, headers });
  const text = await resp.text();
  let data: unknown = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = null; }
  if (resp.status === 401) setAdminSession(null);
  if (!resp.ok) {
    const err = (data || {}) as { error?: string; message?: string };
    throw new ApiError(resp.status, err.error || 'error', err.message || 'Request failed');
  }
  return data as T;
}

export const adminApi = {
  login: (email: string, password: string) =>
    adminRequest<AdminSession>('/login', { method: 'POST', body: JSON.stringify({ email, password }) }).then((s) => {
      setAdminSession(s);
      return s;
    }),
  me: () => adminRequest<{ user: { email: string; role: string } }>('/me'),
  logout: () => adminRequest<{ ok: boolean }>('/logout', { method: 'POST' }).then((r) => { setAdminSession(null); return r; }),
  dashboard: () => adminRequest<any>('/dashboard'),
  orders: (status?: string) => adminRequest<{ orders: any[] }>(`/orders${status ? `?status=${status}` : ''}`),
  order: (ref: string) => adminRequest<{ order: any }>(`/orders/${ref}`),
  patchOrder: (ref: string, body: unknown) => adminRequest<{ ok: boolean }>(`/orders/${ref}`, { method: 'PATCH', body: JSON.stringify(body) }),
  eraseOrder: (ref: string) => adminRequest<{ ok: boolean }>(`/orders/${ref}`, { method: 'DELETE' }),
  categories: () => adminRequest<{ categories: any[] }>('/categories'),
  items: () => adminRequest<{ items: any[] }>('/items'),
  addOns: () => adminRequest<{ addOns: any[] }>('/add-ons'),
  branches: () => adminRequest<{ branches: any[] }>('/branches'),
  messages: () => adminRequest<{ messages: any[] }>('/messages'),
  reservations: () => adminRequest<{ reservations: any[] }>('/reservations'),
  testimonials: () => adminRequest<{ testimonials: any[] }>('/testimonials'),
  staff: () => adminRequest<{ users: any[] }>('/staff'),
  pages: () => adminRequest<{ pages: any[] }>('/pages'),
  page: (slug: string) => adminRequest<{ page: any }>(`/pages/${slug}`),
  settings: (group: string) => adminRequest<{ settings: Record<string, string> }>(`/settings/${group}`),
  patchSettings: (group: string, body: Record<string, string>) =>
    adminRequest<{ ok: boolean }>(`/settings/${group}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deliveryZones: () => adminRequest<{ zones: any[] }>('/delivery-zones'),
  patchMessage: (id: number, status: string) => adminRequest<{ ok: boolean }>(`/messages/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  patchReservation: (id: number, status: string) => adminRequest<{ ok: boolean }>(`/reservations/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  patchItem: (id: number, body: unknown) => adminRequest<{ ok: boolean }>(`/items/${id}`, { method: 'PATCH', body: JSON.stringify(body) })
};
