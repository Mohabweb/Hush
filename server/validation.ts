import { z } from 'zod';
import {
  MAX_QTY_PER_LINE, MAX_LINES, RESERVATION_WINDOW_DAYS, ORDER_STATUSES, PAYMENT_STATUSES, ROLES
} from '../shared/constants.js';

// ---------------------------------------------------------------------------
// Public
// ---------------------------------------------------------------------------

export const addOnSelectionSchema = z.object({
  slug: z.string().min(1).max(80).regex(/^[a-z0-9-]+$/),
  quantity: z.number().int().min(1).max(5).default(1)
});

export const orderLineSchema = z.object({
  itemSlug: z.string().min(1).max(120).regex(/^[a-z0-9-]+$/),
  variantId: z.number().int().positive().optional(),
  quantity: z.number().int().min(1).max(MAX_QTY_PER_LINE),
  addOns: z.array(addOnSelectionSchema).max(5).default([])
});

export const orderSchema = z
  .object({
    branchSlug: z.string().min(1).max(80).regex(/^[a-z0-9-]+$/),
    customerName: z.string().trim().min(2).max(80),
    customerPhone: z.string().trim().regex(/^[0-9+\-\s()]{7,20}$/, 'Invalid phone number'),
    note: z.string().trim().max(500).optional(),
    lang: z.enum(['en', 'ar']).default('en'),
    website: z.string().max(0).optional().or(z.literal('').optional()), // honeypot
    lines: z.array(orderLineSchema).min(1).max(MAX_LINES)
  })
  .strict();

export const contactSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    email: z.string().trim().email().max(120).optional().or(z.literal('')),
    phone: z.string().trim().max(20).optional().or(z.literal('')),
    message: z.string().trim().min(5).max(2000),
    website: z.string().max(0).optional().or(z.literal('').optional()) // honeypot
  })
  .strict();

export const reservationSchema = z
  .object({
    branchSlug: z.string().min(1).max(80).regex(/^[a-z0-9-]+$/),
    name: z.string().trim().min(2).max(80),
    phone: z.string().trim().regex(/^[0-9+\-\s()]{7,20}$/, 'Invalid phone number'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
    time: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM').optional().or(z.literal('')),
    partySize: z.number().int().min(1).max(40),
    note: z.string().trim().max(500).optional(),
    website: z.string().max(0).optional().or(z.literal('').optional()) // honeypot
  })
  .strict();

export const orderStatusQuerySchema = z.object({ t: z.string().min(10).max(200) }).strict();

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export const loginSchema = z
  .object({
    email: z.string().trim().email().max(120),
    password: z.string().min(1).max(200)
  })
  .strict();

export const categoryCreateSchema = z
  .object({
    slug: z.string().min(1).max(80).regex(/^[a-z0-9-]+$/),
    name_en: z.string().trim().min(1).max(120),
    name_ar: z.string().trim().min(1).max(120),
    sort_order: z.number().int().min(0).max(9999).default(0),
    is_active: z.boolean().default(true)
  })
  .strict();

export const categoryUpdateSchema = categoryCreateSchema.partial();

export const variantSchema = z.object({
  label_en: z.string().trim().min(1).max(120),
  label_ar: z.string().trim().min(1).max(120),
  price: z.number().int().min(0).max(10000000),
  is_available: z.boolean().default(true),
  sort_order: z.number().int().min(0).max(9999).default(0)
});

export const itemCreateSchema = z
  .object({
    category_id: z.number().int().positive(),
    slug: z.string().min(1).max(120).regex(/^[a-z0-9-]+$/),
    name_en: z.string().trim().min(1).max(160),
    name_ar: z.string().trim().min(1).max(160),
    description_en: z.string().trim().max(1000).optional().or(z.literal('')),
    description_ar: z.string().trim().max(1000).optional().or(z.literal('')),
    image: z.string().max(300).optional().or(z.literal('')),
    is_featured: z.boolean().default(false),
    is_available: z.boolean().default(true),
    sort_order: z.number().int().min(0).max(9999).default(0),
    variants: z.array(variantSchema).max(20).default([])
  })
  .strict();

export const itemUpdateSchema = itemCreateSchema.partial().extend({
  variants: z.array(z.object({ id: z.number().int().positive().optional(), ...variantSchema.shape })).max(20).optional()
});

export const addOnSchema = z
  .object({
    slug: z.string().min(1).max(80).regex(/^[a-z0-9-]+$/),
    name_en: z.string().trim().min(1).max(120),
    name_ar: z.string().trim().min(1).max(120),
    price: z.number().int().min(0).max(10000000),
    categories: z.string().max(500).default(''),
    is_active: z.boolean().default(true),
    sort_order: z.number().int().min(0).max(9999).default(0)
  })
  .strict();

export const addOnUpdateSchema = addOnSchema.partial();

export const branchSchema = z
  .object({
    slug: z.string().min(1).max(80).regex(/^[a-z0-9-]+$/),
    name_en: z.string().trim().min(1).max(120),
    name_ar: z.string().trim().min(1).max(120),
    address_en: z.string().trim().min(1).max(250),
    address_ar: z.string().trim().min(1).max(250),
    phone: z.string().trim().max(30).optional().or(z.literal('')),
    maps_url: z.string().trim().url().max(400).optional().or(z.literal('')),
    place_id: z.string().trim().max(120).optional().or(z.literal('')),
    is_active: z.boolean().default(true),
    sort_order: z.number().int().min(0).max(999).default(0)
  })
  .strict();

export const branchUpdateSchema = branchSchema.partial();

export const orderPatchSchema = z
  .object({
    status: z.enum(ORDER_STATUSES).optional(),
    paymentStatus: z.enum(PAYMENT_STATUSES).optional(),
    staffNotes: z.string().trim().max(2000).optional()
  })
  .strict();

export const staffCreateSchema = z
  .object({
    email: z.string().trim().email().max(120),
    name: z.string().trim().min(1).max(120),
    password: z.string().min(10).max(200),
    role: z.enum(ROLES)
  })
  .strict();

export const staffPatchSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    password: z.string().min(10).max(200).optional(),
    role: z.enum(ROLES).optional(),
    disabled: z.boolean().optional()
  })
  .strict();

export const testimonialSchema = z
  .object({
    author_name: z.string().trim().min(1).max(120),
    quote_en: z.string().trim().min(1).max(1000),
    quote_ar: z.string().trim().min(1).max(1000),
    rating: z.number().int().min(1).max(5).optional(),
    is_published: z.boolean().default(true),
    sort_order: z.number().int().min(0).max(9999).default(0)
  })
  .strict();

export const testimonialUpdateSchema = testimonialSchema.partial();

export const pageSchema = z
  .object({
    slug: z.string().min(1).max(80).regex(/^[a-z0-9-]+$/),
    title_en: z.string().trim().min(1).max(200),
    title_ar: z.string().trim().min(1).max(200),
    body_en: z.string().trim().min(1).max(20000),
    body_ar: z.string().trim().min(1).max(20000),
    is_published: z.boolean().default(true)
  })
  .strict();

export const pageUpdateSchema = pageSchema.partial();

export const deliveryZoneSchema = z
  .object({
    name_en: z.string().trim().min(1).max(120),
    name_ar: z.string().trim().min(1).max(120),
    fee: z.number().int().min(0).max(1000000),
    min_order: z.number().int().min(0).max(10000000).default(0),
    is_active: z.boolean().default(false)
  })
  .strict();

export const messagePatchSchema = z
  .object({ status: z.enum(['new', 'read', 'archived']) })
  .strict();

export const reservationPatchSchema = z
  .object({ status: z.enum(['new', 'confirmed', 'declined']) })
  .strict();

export const reviewStatusSchema = z
  .object({ status: z.enum(['published', 'hidden']) })
  .strict();

/** Reservation date must be Cairo today .. +90 days. */
export function reservationDateBounds(now: Date = new Date()): { min: string; max: string } {
  // Cairo is UTC+2/+3; using UTC-anchored date with +2h shift is precise enough for a date window.
  const cairo = new Date(now.getTime() + 2 * 3600 * 1000);
  const min = cairo.toISOString().slice(0, 10);
  const maxDate = new Date(cairo.getTime() + RESERVATION_WINDOW_DAYS * 24 * 3600 * 1000);
  const max = maxDate.toISOString().slice(0, 10);
  return { min, max };
}
