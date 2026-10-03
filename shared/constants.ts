/**
 * Shared constants (used by both server and client).
 * Money is integer piastres: 1 EGP = 100 piastres.
 */

export const CURRENCY = 'EGP';
export const PIASTRES_PER_EGP = 100;

export const ROLES = ['admin', 'manager', 'staff'] as const;
export type Role = (typeof ROLES)[number];

/** What each role may do. Admin can do everything. */
export const PERMISSIONS: Record<Role, string[]> = {
  admin: ['*'],
  manager: ['orders', 'inquiries', 'menu', 'branches', 'reviews', 'content'],
  staff: ['orders', 'inquiries']
};

export const ORDER_STATUSES = ['new', 'preparing', 'ready', 'completed', 'cancelled'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** Allowed status transitions (server-enforced). */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  new: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['completed', 'cancelled'],
  completed: [],
  cancelled: []
};

export const PAYMENT_STATUSES = ['unpaid', 'paid'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const FULFILMENT_TYPES = ['pickup'] as const;
export type FulfilmentType = (typeof FULFILMENT_TYPES)[number];

export const MAX_QTY_PER_LINE = 20;
export const MAX_LINES = 30;

export const SESSION_COOKIE = 'hush_admin';
export const CSRF_HEADER = 'x-csrf-token';
export const LANG_HEADER = 'x-lang';
export const LANGS = ['en', 'ar'] as const;
export type Lang = (typeof LANGS)[number];

export const RESERVATION_WINDOW_DAYS = 90;

export const BRANCH_ADDRESSES = {
  fouad: '66 Fouad St, next to the Lebanese Embassy, Alexandria',
  farah: '12 Farah St, El Geash Road, Camp Chezar, Alexandria'
} as const;
