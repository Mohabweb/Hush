import crypto from 'node:crypto';
import type { DB } from '../db.js';
import { badRequest, notFound, HttpError } from '../http.js';
import { ORDER_STATUS_TRANSITIONS, type OrderStatus, type PaymentStatus } from '../../shared/constants.js';
import { getSettingBool } from '../settings.js';

export interface AddOnSelection {
  slug: string;
  quantity: number;
}

export interface OrderLineInput {
  itemSlug: string;
  variantId?: number;
  quantity: number;
  addOns?: AddOnSelection[];
}

export interface CreateOrderInput {
  branchSlug: string;
  customerName: string;
  customerPhone: string;
  note?: string;
  lang: 'en' | 'ar';
  lines: OrderLineInput[];
}

export interface PricedLine {
  itemId: number;
  itemNameEn: string;
  itemNameAr: string;
  variantLabelEn: string | null;
  variantLabelAr: string | null;
  unitPrice: number;
  quantity: number;
  addOns: { slug: string; nameEn: string; nameAr: string; price: number; quantity: number }[];
  lineTotal: number;
}

export interface CreatedOrder {
  id: number;
  ref: string;
  token: string;
  total: number;
  currency: string;
  lines: PricedLine[];
}

function newRef(): string {
  // e.g. HSH-7F3K2Q — no ambiguous characters
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) s += alphabet[crypto.randomInt(alphabet.length)];
  return `HSH-${s}`;
}

function newAccessToken(): string {
  return crypto.randomBytes(24).toString('base64url');
}

export function hashAccessToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Price the order entirely on the server. Client-supplied price fields are
 * rejected by the strict Zod schema (unknown keys), and prices here come only
 * from the database. Returns snapshot data suitable for order_lines.
 */
export function priceOrder(db: DB, input: CreateOrderInput): { lines: PricedLine[]; subtotal: number } {
  const branch = db.prepare('SELECT id, is_active FROM branches WHERE slug = ?').get(input.branchSlug) as { id: number; is_active: number } | undefined;
  if (!branch || !branch.is_active) throw badRequest('Branch unavailable');

  if (!getSettingBool(db, 'ordering.enabled')) throw badRequest('Ordering is currently disabled');

  const priced: PricedLine[] = [];

  for (const line of input.lines) {
    const item = db.prepare('SELECT id, name_en, name_ar, is_available FROM items WHERE slug = ?').get(line.itemSlug) as
      | { id: number; name_en: string; name_ar: string; is_available: number }
      | undefined;
    if (!item) throw badRequest(`Unknown item: ${line.itemSlug}`);
    if (!item.is_available) throw badRequest(`Item unavailable: ${line.itemSlug}`);

    let unitPrice: number;
    let variantLabelEn: string | null = null;
    let variantLabelAr: string | null = null;

    if (line.variantId != null) {
      const variant = db.prepare('SELECT label_en, label_ar, price, is_available FROM variants WHERE id = ? AND item_id = ?').get(line.variantId, item.id) as
        | { label_en: string; label_ar: string; price: number; is_available: number }
        | undefined;
      if (!variant) throw badRequest(`Unknown variant for item: ${line.itemSlug}`);
      if (!variant.is_available) throw badRequest(`Variant unavailable: ${variant.label_en}`);
      unitPrice = variant.price;
      variantLabelEn = variant.label_en;
      variantLabelAr = variant.label_ar;
    } else {
      // No variant: item must have exactly one available variant (its default).
      const variants = db.prepare('SELECT id, label_en, label_ar, price, is_available, sort_order FROM variants WHERE item_id = ? AND is_available = 1 ORDER BY sort_order, id').all(item.id) as any[];
      if (variants.length === 1) {
        unitPrice = variants[0]!.price;
        variantLabelEn = variants[0]!.label_en;
        variantLabelAr = variants[0]!.label_ar;
      } else if (variants.length === 0) {
        throw badRequest(`Item unavailable: ${line.itemSlug}`);
      } else {
        throw badRequest(`Please choose a size for: ${line.itemSlug}`);
      }
    }

    // Add-ons must be valid, active, and applicable to this item's category.
    const categoryRow = db.prepare('SELECT c.slug FROM categories c JOIN items i ON i.category_id = c.id WHERE i.id = ?').get(item.id) as { slug: string } | undefined;
    const catSlug = categoryRow?.slug ?? '';
    const addOns: PricedLine['addOns'] = [];
    let addOnTotal = 0;
    const seen = new Set<string>();
    for (const sel of line.addOns || []) {
      if (seen.has(sel.slug)) throw badRequest(`Duplicate add-on: ${sel.slug}`);
      seen.add(sel.slug);
      const ao = db.prepare('SELECT slug, name_en, name_ar, price, categories, is_active FROM add_ons WHERE slug = ?').get(sel.slug) as
        | { slug: string; name_en: string; name_ar: string; price: number; categories: string; is_active: number }
        | undefined;
      if (!ao || !ao.is_active) throw badRequest(`Unknown add-on: ${sel.slug}`);
      const applies = (ao.categories || '').split(',').map((s) => s.trim()).filter(Boolean);
      if (applies.length > 0 && !applies.includes(catSlug)) throw badRequest(`Add-on not available for this item: ${ao.name_en}`);
      addOns.push({ slug: ao.slug, nameEn: ao.name_en, nameAr: ao.name_ar, price: ao.price, quantity: sel.quantity });
      addOnTotal += ao.price * sel.quantity;
    }

    const unitWithAddOns = unitPrice + addOnTotal;
    priced.push({
      itemId: item.id,
      itemNameEn: item.name_en,
      itemNameAr: item.name_ar,
      variantLabelEn,
      variantLabelAr,
      unitPrice: unitWithAddOns,
      quantity: line.quantity,
      addOns,
      lineTotal: unitWithAddOns * line.quantity
    });
  }

  const subtotal = priced.reduce((sum, l) => sum + l.lineTotal, 0);
  return { lines: priced, subtotal };
}

export function createOrder(db: DB, input: CreateOrderInput): CreatedOrder {
  const { lines, subtotal } = priceOrder(db, input);

  const branch = db.prepare('SELECT id FROM branches WHERE slug = ?').get(input.branchSlug) as { id: number };
  const token = newAccessToken();

  const insertOrder = db.prepare(
    `INSERT INTO orders (ref, branch_id, customer_name, customer_phone, note, subtotal, total, currency, access_token_hash, lang)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'EGP', ?, ?)`
  );
  const insertLine = db.prepare(
    `INSERT INTO order_lines (order_id, item_id, item_name_en, item_name_ar, variant_label_en, variant_label_ar, unit_price, quantity, add_ons_json, line_total)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  let orderId: number;
  const tx = db.transaction(() => {
    let ref = newRef();
    // Ensure uniqueness
    for (let i = 0; i < 5; i++) {
      const exists = db.prepare('SELECT 1 FROM orders WHERE ref = ?').get(ref);
      if (!exists) break;
      ref = newRef();
    }
    orderId = insertOrder.run(
      ref, branch.id, input.customerName, input.customerPhone, input.note || null,
      subtotal, subtotal, hashAccessToken(token), input.lang
    ).lastInsertRowid as number;
    for (const l of lines) {
      insertLine.run(
        orderId, l.itemId, l.itemNameEn, l.itemNameAr, l.variantLabelEn, l.variantLabelAr,
        l.unitPrice, l.quantity, JSON.stringify(l.addOns), l.lineTotal
      );
    }
  });
  tx();

  return { id: orderId!, ref: (db.prepare('SELECT ref FROM orders WHERE id = ?').get(orderId!) as { ref: string }).ref, token, total: subtotal, currency: 'EGP', lines };
}

export function getOrderForStatus(db: DB, ref: string, token: string) {
  const order = db
    .prepare('SELECT id, ref, status, payment_status, total, currency, created_at, updated_at, note FROM orders WHERE ref = ? AND access_token_hash = ?')
    .get(ref, hashAccessToken(token)) as any;
  if (!order) return null;
  const lines = db.prepare('SELECT item_name_en, item_name_ar, variant_label_en, variant_label_ar, unit_price, quantity, add_ons_json, line_total FROM order_lines WHERE order_id = ?').all(order.id) as any[];
  return { ...order, lines: lines.map((l) => ({ ...l, addOns: JSON.parse(l.add_ons_json || '[]') })) };
}

export function transitionStatus(db: DB, ref: string, next: OrderStatus): void {
  const order = db.prepare('SELECT id, status FROM orders WHERE ref = ?').get(ref) as { id: number; status: OrderStatus } | undefined;
  if (!order) throw notFound('Order not found');
  const allowed = ORDER_STATUS_TRANSITIONS[order.status] || [];
  if (!allowed.includes(next)) {
    throw badRequest(`Cannot change status from ${order.status} to ${next}`);
  }
  db.prepare('UPDATE orders SET status = ?, updated_at = unixepoch() WHERE id = ?').run(next, order.id);
}

export { HttpError };
