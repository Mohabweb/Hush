import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { Router, type Request, Response } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import { z } from 'zod';
import { db as getDb, config as getConfig } from '../context.js';
import { badRequest, notFound, unauthorized, asyncHandler } from '../http.js';
import {
  loginSchema, orderPatchSchema, staffCreateSchema, staffPatchSchema, categoryCreateSchema, categoryUpdateSchema,
  itemCreateSchema, itemUpdateSchema, addOnSchema, addOnUpdateSchema, branchSchema, branchUpdateSchema,
  testimonialSchema, testimonialUpdateSchema, pageSchema, pageUpdateSchema, deliveryZoneSchema,
  messagePatchSchema, reservationPatchSchema, reviewStatusSchema
} from '../validation.js';
import {
  login, hashPassword, countAdmins
} from '../services/auth.js';
import {
  createSession, destroySession, destroySessionsForUser, purgeExpiredSessions,
  setSessionCookie, clearSessionCookie, readSessionCookie,
  requireAuth, requireCsrf, requirePermission, audit
} from '../middleware/auth.js';
import { rateLimit } from '../middleware/security.js';
import { transitionStatus } from '../services/orders.js';
import { branchInUse } from '../services/branches.js';
import { getAllSettings, setSetting, getSettingBool } from '../settings.js';

export function adminRouter(): Router {
  const router = Router();

  // Multer for image uploads (memory storage; validated + re-encoded below)
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }
  });

  const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, keyBy: (req) => req.ip || 'unknown' });

  // ---------------------------------------------------------------------------
  // Auth (pre-middleware routes)
  // ---------------------------------------------------------------------------

  router.post('/login', loginLimiter, asyncHandler(async (req, res) => {
    const body = loginSchema.parse(req.body);
    const database = getDb(res);
    const appCfg = getConfig(res);
    const result = await login(database, body.email, body.password, {
      ttlMs: appCfg.sessionTtlMs,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
    setSessionCookie(res, result.session.raw, Math.floor(appCfg.sessionTtlMs / 1000), appCfg.isProd);
    audit(database, req, 'login', 'user', result.userId);
    res.json({ user: { email: result.email, name: result.name, role: result.role }, csrfToken: result.session.csrf });
  }));

  router.get('/me', requireAuth, (req, res) => {
    res.json({ user: { id: req.userId, email: req.userEmail, role: req.userRole } });
  });

  router.post('/logout', requireAuth, (req, res) => {
    const database = getDb(res);
    const raw = readSessionCookie(req);
    if (raw) destroySession(database, raw);
    clearSessionCookie(res, getConfig(res).isProd);
    audit(database, req, 'logout', 'user', req.userId);
    res.json({ ok: true });
  });

  // Everything below requires an authenticated session.
  router.use(requireAuth);
  // State-changing routes require the CSRF header.
  router.use(requireCsrf);

  // ---------------------------------------------------------------------------
  // Dashboard
  // ---------------------------------------------------------------------------

  router.get('/dashboard', requirePermission('orders'), (req, res) => {
    const database = getDb(res);
    const totals = {
      ordersNew: (database.prepare("SELECT COUNT(*) n FROM orders WHERE status = 'new'").get() as { n: number }).n,
      ordersOpen: (database.prepare("SELECT COUNT(*) n FROM orders WHERE status IN ('new','preparing','ready')").get() as { n: number }).n,
      ordersToday: (database.prepare('SELECT COUNT(*) n FROM orders WHERE created_at >= unixepoch() - 86400').get() as { n: number }).n,
      revenueToday: (database.prepare("SELECT COALESCE(SUM(total),0) n FROM orders WHERE created_at >= unixepoch() - 86400 AND status != 'cancelled'").get() as { n: number }).n,
      messagesNew: (database.prepare("SELECT COUNT(*) n FROM contact_messages WHERE status = 'new'").get() as { n: number }).n,
      reservationsNew: (database.prepare("SELECT COUNT(*) n FROM reservations WHERE status = 'new'").get() as { n: number }).n
    };
    const byBranch = database
      .prepare(
        `SELECT b.name_en, b.name_ar, COUNT(o.id) orders, COALESCE(SUM(o.total),0) revenue
         FROM branches b LEFT JOIN orders o ON o.branch_id = b.id AND o.created_at >= unixepoch() - 86400
         GROUP BY b.id ORDER BY b.sort_order`
      )
      .all();
    const topItems = database
      .prepare(
        `SELECT ol.item_name_en, ol.item_name_ar, SUM(ol.quantity) qty
         FROM order_lines ol JOIN orders o ON o.id = ol.order_id
         WHERE o.created_at >= unixepoch() - 86400 * 7
         GROUP BY ol.item_name_en ORDER BY qty DESC LIMIT 5`
      )
      .all();
    const recent = database
      .prepare('SELECT ref, status, total, customer_name, created_at FROM orders ORDER BY id DESC LIMIT 10')
      .all();
    const inbox = [
      ...database.prepare("SELECT id, 'message' kind, name, message body, created_at FROM contact_messages WHERE status = 'new' ORDER BY id DESC LIMIT 5").all(),
      ...database.prepare("SELECT id, 'reservation' kind, name, date body, created_at FROM reservations WHERE status = 'new' ORDER BY id DESC LIMIT 5").all()
    ];
    res.json({ totals, byBranch, topItems, recent, inbox });
  });

  // ---------------------------------------------------------------------------
  // Orders
  // ---------------------------------------------------------------------------

  router.get('/orders', requirePermission('orders'), (req, res) => {
    const database = getDb(res);
    const status = typeof req.query.status === 'string' ? req.query.status : null;
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const rows = status
      ? database.prepare('SELECT * FROM orders WHERE status = ? ORDER BY id DESC LIMIT ?').all(status, limit)
      : database.prepare('SELECT * FROM orders ORDER BY id DESC LIMIT ?').all(limit);
    res.json({ orders: rows.map(publicOrder) });
  });

  router.get('/orders/:ref', requirePermission('orders'), (req, res) => {
    const database = getDb(res);
    const order = database.prepare('SELECT * FROM orders WHERE ref = ?').get(param(req, 'ref')) as any;
    if (!order) throw notFound('Order not found');
    const lines = database.prepare('SELECT * FROM order_lines WHERE order_id = ?').all(order.id);
    res.json({ order: { ...publicOrder(order), lines } });
  });

  router.patch('/orders/:ref', requirePermission('orders'), (req, res) => {
    const database = getDb(res);
    const body = orderPatchSchema.parse(req.body);
    const order = database.prepare('SELECT id FROM orders WHERE ref = ?').get(param(req, 'ref')) as { id: number } | undefined;
    if (!order) throw notFound('Order not found');

    if (body.status) transitionStatus(database, param(req, 'ref'), body.status);
    if (body.paymentStatus) {
      database.prepare('UPDATE orders SET payment_status = ?, updated_at = unixepoch() WHERE id = ?').run(body.paymentStatus, order.id);
    }
    if (body.staffNotes !== undefined) {
      database.prepare('UPDATE orders SET staff_notes = ?, updated_at = unixepoch() WHERE id = ?').run(body.staffNotes, order.id);
    }
    audit(database, req, 'order.update', 'order', param(req, 'ref'), body);
    res.json({ ok: true });
  });

  router.delete('/orders/:ref', requirePermission('orders'), (req, res) => {
    const database = getDb(res);
    const order = database.prepare('SELECT id FROM orders WHERE ref = ?').get(param(req, 'ref')) as { id: number } | undefined;
    if (!order) throw notFound('Order not found');
    database.prepare('DELETE FROM order_lines WHERE order_id = ?').run(order.id);
    database.prepare('DELETE FROM orders WHERE id = ?').run(order.id);
    audit(database, req, 'order.erase', 'order', param(req, 'ref'));
    res.json({ ok: true });
  });

  // ---------------------------------------------------------------------------
  // Categories
  // ---------------------------------------------------------------------------

  router.get('/categories', requirePermission('menu'), (req, res) => {
    res.json({ categories: getDb(res).prepare('SELECT * FROM categories ORDER BY sort_order, id').all() });
  });

  router.post('/categories', requirePermission('menu'), (req, res) => {
    const body = categoryCreateSchema.parse(req.body);
    const database = getDb(res);
    const info = database
      .prepare('INSERT INTO categories (slug, name_en, name_ar, sort_order, is_active) VALUES (?, ?, ?, ?, ?)')
      .run(body.slug, body.name_en, body.name_ar, body.sort_order, body.is_active ? 1 : 0);
    audit(database, req, 'category.create', 'category', info.lastInsertRowid as number);
    res.status(201).json({ ok: true, id: info.lastInsertRowid });
  });

  router.patch('/categories/:id', requirePermission('menu'), (req, res) => {
    const body = categoryUpdateSchema.parse(req.body);
    const database = getDb(res);
    const existing = database.prepare('SELECT id FROM categories WHERE id = ?').get(param(req, 'id'));
    if (!existing) throw notFound('Category not found');
    const sets: string[] = [];
    const vals: unknown[] = [];
    for (const [k, v] of Object.entries(body)) {
      sets.push(`${k} = ?`);
      vals.push(typeof v === 'boolean' ? (v ? 1 : 0) : v);
    }
    if (sets.length) database.prepare(`UPDATE categories SET ${sets.join(', ')} WHERE id = ?`).run(...vals, param(req, 'id'));
    audit(database, req, 'category.update', 'category', param(req, 'id'), body);
    res.json({ ok: true });
  });

  router.delete('/categories/:id', requirePermission('menu'), (req, res) => {
    const database = getDb(res);
    database.prepare('DELETE FROM categories WHERE id = ?').run(param(req, 'id'));
    audit(database, req, 'category.delete', 'category', param(req, 'id'));
    res.json({ ok: true });
  });

  // ---------------------------------------------------------------------------
  // Items
  // ---------------------------------------------------------------------------

  router.get('/items', requirePermission('menu'), (req, res) => {
    const database = getDb(res);
    const items = database.prepare('SELECT * FROM items ORDER BY category_id, sort_order, id').all() as any[];
    const variants = database.prepare('SELECT * FROM variants ORDER BY sort_order, id').all() as any[];
    const byItem = new Map<number, any[]>();
    for (const v of variants) {
      if (!byItem.has(v.item_id)) byItem.set(v.item_id, []);
      byItem.get(v.item_id)!.push(v);
    }
    res.json({ items: items.map((it) => ({ ...it, variants: byItem.get(it.id) || [] })) });
  });

  router.post('/items', requirePermission('menu'), (req, res) => {
    const body = itemCreateSchema.parse(req.body);
    const database = getDb(res);
    const tx = database.transaction(() => {
      const itemId = database
        .prepare(
          `INSERT INTO items (category_id, slug, name_en, name_ar, description_en, description_ar, image, is_featured, is_available, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          body.category_id, body.slug, body.name_en, body.name_ar,
          body.description_en || null, body.description_ar || null, body.image || null,
          body.is_featured ? 1 : 0, body.is_available ? 1 : 0, body.sort_order
        ).lastInsertRowid as number;
      let vOrder = 0;
      for (const v of body.variants) {
        database
          .prepare('INSERT INTO variants (item_id, label_en, label_ar, price, is_available, sort_order) VALUES (?, ?, ?, ?, ?, ?)')
          .run(itemId, v.label_en, v.label_ar, v.price, v.is_available ? 1 : 0, v.sort_order || vOrder++);
      }
      return itemId;
    });
    const id = tx();
    audit(database, req, 'item.create', 'item', id);
    res.status(201).json({ ok: true, id });
  });

  router.patch('/items/:id', requirePermission('menu'), (req, res) => {
    const body = itemUpdateSchema.parse(req.body);
    const database = getDb(res);
    const existing = database.prepare('SELECT id FROM items WHERE id = ?').get(param(req, 'id'));
    if (!existing) throw notFound('Item not found');
    const tx = database.transaction(() => {
      const fields = ['category_id', 'slug', 'name_en', 'name_ar', 'description_en', 'description_ar', 'image', 'is_featured', 'is_available', 'sort_order'];
      const sets: string[] = [];
      const vals: unknown[] = [];
      for (const f of fields) {
        if (f in body) {
          const v = (body as any)[f];
          sets.push(`${f} = ?`);
          vals.push(typeof v === 'boolean' ? (v ? 1 : 0) : v === '' ? null : v);
        }
      }
      if (sets.length) database.prepare(`UPDATE items SET ${sets.join(', ')} WHERE id = ?`).run(...vals, param(req, 'id'));
      if (body.variants) {
        const keepIds: number[] = [];
        for (const v of body.variants) {
          if (v.id) {
            database
              .prepare('UPDATE variants SET label_en = ?, label_ar = ?, price = ?, is_available = ?, sort_order = ? WHERE id = ? AND item_id = ?')
              .run(v.label_en, v.label_ar, v.price, v.is_available ? 1 : 0, v.sort_order, v.id, param(req, 'id'));
            keepIds.push(v.id);
          } else {
            const info = database
              .prepare('INSERT INTO variants (item_id, label_en, label_ar, price, is_available, sort_order) VALUES (?, ?, ?, ?, ?, ?)')
              .run(param(req, 'id'), v.label_en, v.label_ar, v.price, v.is_available ? 1 : 0, v.sort_order);
            keepIds.push(info.lastInsertRowid as number);
          }
        }
        // delete variants not present anymore
        const all = database.prepare('SELECT id FROM variants WHERE item_id = ?').all(param(req, 'id')) as { id: number }[];
        for (const row of all) if (!keepIds.includes(row.id)) database.prepare('DELETE FROM variants WHERE id = ?').run(row.id);
      }
    });
    tx();
    audit(database, req, 'item.update', 'item', param(req, 'id'));
    res.json({ ok: true });
  });

  router.delete('/items/:id', requirePermission('menu'), (req, res) => {
    const database = getDb(res);
    database.prepare('DELETE FROM items WHERE id = ?').run(param(req, 'id'));
    audit(database, req, 'item.delete', 'item', param(req, 'id'));
    res.json({ ok: true });
  });

  // ---------------------------------------------------------------------------
  // Add-ons
  // ---------------------------------------------------------------------------

  router.get('/add-ons', requirePermission('menu'), (req, res) => {
    res.json({ addOns: getDb(res).prepare('SELECT * FROM add_ons ORDER BY sort_order, id').all() });
  });

  router.post('/add-ons', requirePermission('menu'), (req, res) => {
    const body = addOnSchema.parse(req.body);
    const database = getDb(res);
    const info = database
      .prepare('INSERT INTO add_ons (slug, name_en, name_ar, price, categories, is_active, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(body.slug, body.name_en, body.name_ar, body.price, body.categories, body.is_active ? 1 : 0, body.sort_order);
    audit(database, req, 'addon.create', 'add_on', info.lastInsertRowid as number);
    res.status(201).json({ ok: true, id: info.lastInsertRowid });
  });

  router.patch('/add-ons/:id', requirePermission('menu'), (req, res) => {
    const body = addOnUpdateSchema.parse(req.body);
    const database = getDb(res);
    const sets: string[] = [];
    const vals: unknown[] = [];
    for (const [k, v] of Object.entries(body)) {
      sets.push(`${k} = ?`);
      vals.push(typeof v === 'boolean' ? (v ? 1 : 0) : v);
    }
    if (sets.length) database.prepare(`UPDATE add_ons SET ${sets.join(', ')} WHERE id = ?`).run(...vals, param(req, 'id'));
    audit(database, req, 'addon.update', 'add_on', param(req, 'id'), body);
    res.json({ ok: true });
  });

  router.delete('/add-ons/:id', requirePermission('menu'), (req, res) => {
    const database = getDb(res);
    database.prepare('DELETE FROM add_ons WHERE id = ?').run(param(req, 'id'));
    audit(database, req, 'addon.delete', 'add_on', param(req, 'id'));
    res.json({ ok: true });
  });

  // ---------------------------------------------------------------------------
  // Image upload (multer + sharp: validate, re-encode webp, strip metadata, UUID)
  // ---------------------------------------------------------------------------

  router.post('/images', requirePermission('content'), upload.single('image'), asyncHandler(async (req, res) => {
    if (!req.file) throw badRequest('No image uploaded');
    const appCfg = getConfig(res);
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(req.file.mimetype)) throw badRequest('Only JPEG, PNG or WebP images are allowed');
    try {
      const webp = await sharp(req.file.buffer)
        .rotate() // respect EXIF orientation, then strip
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer(); // sharp strips metadata by default on re-encode
      const name = `${crypto.randomUUID()}.webp`;
      fs.mkdirSync(appCfg.uploadsDir, { recursive: true });
      fs.writeFileSync(path.join(appCfg.uploadsDir, name), webp);
      audit(getDb(res), req, 'image.upload', 'image', name);
      res.status(201).json({ ok: true, url: `/uploads/${name}` });
    } catch {
      throw badRequest('Invalid image file');
    }
  }));

  // ---------------------------------------------------------------------------
  // Branches
  // ---------------------------------------------------------------------------

  router.get('/branches', requirePermission('branches'), (req, res) => {
    res.json({ branches: getDb(res).prepare('SELECT * FROM branches ORDER BY sort_order, id').all() });
  });

  router.post('/branches', requirePermission('branches'), (req, res) => {
    const body = branchSchema.parse(req.body);
    const database = getDb(res);
    const info = database
      .prepare(
        `INSERT INTO branches (slug, name_en, name_ar, address_en, address_ar, phone, maps_url, place_id, is_active, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(body.slug, body.name_en, body.name_ar, body.address_en, body.address_ar, body.phone || null, body.maps_url || null, body.place_id || null, body.is_active ? 1 : 0, body.sort_order);
    audit(database, req, 'branch.create', 'branch', info.lastInsertRowid as number);
    res.status(201).json({ ok: true, id: info.lastInsertRowid });
  });

  router.patch('/branches/:id', requirePermission('branches'), (req, res) => {
    const body = branchUpdateSchema.parse(req.body);
    const database = getDb(res);
    const sets: string[] = [];
    const vals: unknown[] = [];
    for (const [k, v] of Object.entries(body)) {
      sets.push(`${k} = ?`);
      vals.push(typeof v === 'boolean' ? (v ? 1 : 0) : v === '' ? null : v);
    }
    if (sets.length) database.prepare(`UPDATE branches SET ${sets.join(', ')} WHERE id = ?`).run(...vals, param(req, 'id'));
    audit(database, req, 'branch.update', 'branch', param(req, 'id'), body);
    res.json({ ok: true });
  });

  router.delete('/branches/:id', requirePermission('branches'), (req, res) => {
    const database = getDb(res);
    const id = Number(param(req, 'id'));
    if (branchInUse(database, id)) throw badRequest('Branch is in use by orders or reservations and cannot be deleted; deactivate it instead');
    database.prepare('DELETE FROM branches WHERE id = ?').run(id);
    audit(database, req, 'branch.delete', 'branch', id);
    res.json({ ok: true });
  });

  // ---------------------------------------------------------------------------
  // Reviews (status/testing) + testimonials CRUD
  // ---------------------------------------------------------------------------

  router.post('/reviews/test', requirePermission('reviews'), asyncHandler(async (req, res) => {
    const database = getDb(res);
    const { getReviewsForBranch } = await import('../services/reviews.js');
    const branches = database.prepare('SELECT id, slug, name_en, place_id FROM branches').all() as any[];
    const appCfg = getConfig(res);
    const out: Record<string, unknown> = {};
    for (const b of branches) {
      out[b.slug] = await getReviewsForBranch(database, appCfg, { id: b.id, slug: b.slug, nameEn: b.name_en, placeId: b.place_id });
    }
    res.json({ results: out });
  }));

  router.get('/testimonials', requirePermission('reviews'), (req, res) => {
    res.json({ testimonials: getDb(res).prepare('SELECT * FROM testimonials ORDER BY sort_order, id').all() });
  });

  router.post('/testimonials', requirePermission('reviews'), (req, res) => {
    const body = testimonialSchema.parse(req.body);
    const database = getDb(res);
    const info = database
      .prepare('INSERT INTO testimonials (author_name, quote_en, quote_ar, rating, is_published, sort_order) VALUES (?, ?, ?, ?, ?, ?)')
      .run(body.author_name, body.quote_en, body.quote_ar, body.rating ?? null, body.is_published ? 1 : 0, body.sort_order);
    audit(database, req, 'testimonial.create', 'testimonial', info.lastInsertRowid as number);
    res.status(201).json({ ok: true, id: info.lastInsertRowid });
  });

  router.patch('/testimonials/:id', requirePermission('reviews'), (req, res) => {
    const body = testimonialUpdateSchema.parse(req.body);
    const database = getDb(res);
    const sets: string[] = [];
    const vals: unknown[] = [];
    for (const [k, v] of Object.entries(body)) {
      sets.push(`${k} = ?`);
      vals.push(typeof v === 'boolean' ? (v ? 1 : 0) : v);
    }
    if (sets.length) database.prepare(`UPDATE testimonials SET ${sets.join(', ')} WHERE id = ?`).run(...vals, param(req, 'id'));
    audit(database, req, 'testimonial.update', 'testimonial', param(req, 'id'), body);
    res.json({ ok: true });
  });

  router.delete('/testimonials/:id', requirePermission('reviews'), (req, res) => {
    getDb(res).prepare('DELETE FROM testimonials WHERE id = ?').run(param(req, 'id'));
    audit(getDb(res), req, 'testimonial.delete', 'testimonial', param(req, 'id'));
    res.json({ ok: true });
  });

  // ---------------------------------------------------------------------------
  // Inbox: contact messages + reservations
  // ---------------------------------------------------------------------------

  router.get('/messages', requirePermission('inquiries'), (req, res) => {
    res.json({ messages: getDb(res).prepare('SELECT * FROM contact_messages ORDER BY id DESC LIMIT 200').all() });
  });

  router.patch('/messages/:id', requirePermission('inquiries'), (req, res) => {
    const body = messagePatchSchema.parse(req.body);
    getDb(res).prepare('UPDATE contact_messages SET status = ? WHERE id = ?').run(body.status, param(req, 'id'));
    res.json({ ok: true });
  });

  router.delete('/messages/:id', requirePermission('inquiries'), (req, res) => {
    getDb(res).prepare('DELETE FROM contact_messages WHERE id = ?').run(param(req, 'id'));
    res.json({ ok: true });
  });

  router.get('/reservations', requirePermission('inquiries'), (req, res) => {
    res.json({ reservations: getDb(res).prepare('SELECT * FROM reservations ORDER BY id DESC LIMIT 200').all() });
  });

  router.patch('/reservations/:id', requirePermission('inquiries'), (req, res) => {
    const body = reservationPatchSchema.parse(req.body);
    getDb(res).prepare('UPDATE reservations SET status = ? WHERE id = ?').run(body.status, param(req, 'id'));
    res.json({ ok: true });
  });

  router.delete('/reservations/:id', requirePermission('inquiries'), (req, res) => {
    getDb(res).prepare('DELETE FROM reservations WHERE id = ?').run(param(req, 'id'));
    res.json({ ok: true });
  });

  // ---------------------------------------------------------------------------
  // Settings (grouped) + delivery zones (stored as settings JSON)
  // ---------------------------------------------------------------------------

  const SETTINGS_GROUPS: Record<string, { keys: string[]; permission: string }> = {
    content: { keys: ['banner.enabled', 'banner.text_en', 'banner.text_ar', 'site.tagline_en', 'site.tagline_ar', 'site.instagram', 'site.phone'], permission: 'content' },
    ordering: { keys: ['ordering.enabled', 'ordering.dinein_enabled', 'ordering.delivery_enabled', 'ordering.note_en', 'ordering.note_ar'], permission: 'settings' },
    site: { keys: ['site.instagram', 'site.phone'], permission: 'settings' }
  };

  router.get('/settings/:group', requirePermission('settings'), (req, res) => {
    const group = SETTINGS_GROUPS[param(req, 'group')];
    if (!group) throw notFound('Unknown settings group');
    const all = getAllSettings(getDb(res));
    const out: Record<string, string> = {};
    for (const k of group.keys) out[k] = all[k] ?? '';
    res.json({ settings: out });
  });

  router.patch('/settings/:group', requirePermission('settings'), (req, res) => {
    const group = SETTINGS_GROUPS[param(req, 'group')];
    if (!group) throw notFound('Unknown settings group');
    const database = getDb(res);
    const allowed = new Set(group.keys);
    for (const [k, v] of Object.entries(req.body as Record<string, unknown>)) {
      if (!allowed.has(k)) throw badRequest(`Unknown setting: ${k}`);
      if (typeof v !== 'string') throw badRequest('Setting values must be strings');
      setSetting(database, k, v);
    }
    audit(database, req, 'settings.update', 'settings', param(req, 'group'));
    res.json({ ok: true });
  });

  // Delivery zones stored as JSON in settings for simplicity.
  router.get('/delivery-zones', requirePermission('settings'), (req, res) => {
    const raw = getSettingOrNull(getDb(res), 'delivery.zones');
    res.json({ zones: raw ? JSON.parse(raw) : [] });
  });

  router.put('/delivery-zones', requirePermission('settings'), (req, res) => {
    const zones = z.array(deliveryZoneSchema).parse(req.body?.zones);
    setSetting(getDb(res), 'delivery.zones', JSON.stringify(zones));
    res.json({ ok: true });
  });

  // ---------------------------------------------------------------------------
  // Pages (legal etc.)
  // ---------------------------------------------------------------------------

  router.get('/pages', requirePermission('content'), (req, res) => {
    res.json({ pages: getDb(res).prepare('SELECT id, slug, title_en, title_ar, is_published, updated_at FROM pages ORDER BY slug').all() });
  });

  router.get('/pages/:slug', requirePermission('content'), (req, res) => {
    const page = getDb(res).prepare('SELECT * FROM pages WHERE slug = ?').get(param(req, 'slug'));
    if (!page) throw notFound('Page not found');
    res.json({ page });
  });

  router.put('/pages/:slug', requirePermission('content'), (req, res) => {
    const body = pageUpdateSchema.parse(req.body);
    const database = getDb(res);
    const existing = database.prepare('SELECT id FROM pages WHERE slug = ?').get(param(req, 'slug'));
    const sets: string[] = [];
    const vals: unknown[] = [];
    for (const [k, v] of Object.entries(body)) {
      sets.push(`${k} = ?`);
      vals.push(typeof v === 'boolean' ? (v ? 1 : 0) : v);
    }
    if (existing) {
      if (sets.length) database.prepare(`UPDATE pages SET ${sets.join(', ')}, updated_at = unixepoch() WHERE slug = ?`).run(...vals, param(req, 'slug'));
    } else {
      const full = pageSchema.parse({ slug: param(req, 'slug'), ...body });
      database
        .prepare('INSERT INTO pages (slug, title_en, title_ar, body_en, body_ar, is_published) VALUES (?, ?, ?, ?, ?, ?)')
        .run(full.slug, full.title_en, full.title_ar, full.body_en, full.body_ar, full.is_published ? 1 : 0);
    }
    audit(database, req, 'page.update', 'page', param(req, 'slug'));
    res.json({ ok: true });
  });

  // ---------------------------------------------------------------------------
  // Staff users
  // ---------------------------------------------------------------------------

  router.get('/staff', requirePermission('orders'), (req, res) => {
    // Only admins may manage staff; managers can list (view only) as part of ops? Keep it admin-only.
    res.json({ users: getDb(res).prepare('SELECT id, email, name, role, disabled, created_at FROM users ORDER BY id').all() });
  });

  router.post('/staff', requirePermission('settings'), asyncHandler(async (req, res) => {
    const body = staffCreateSchema.parse(req.body);
    const database = getDb(res);
    if (req.userRole !== 'admin') throw unauthorized('Only admins can create staff');
    const hash = await hashPassword(body.password);
    const info = database
      .prepare('INSERT INTO users (email, name, password_hash, role) VALUES (?, ?, ?, ?)')
      .run(body.email.toLowerCase(), body.name, hash, body.role);
    audit(database, req, 'staff.create', 'user', info.lastInsertRowid as number, { role: body.role });
    res.status(201).json({ ok: true, id: info.lastInsertRowid });
  }));

  router.patch('/staff/:id', asyncHandler(async (req, res) => {
    const body = staffPatchSchema.parse(req.body);
    const database = getDb(res);
    if (req.userRole !== 'admin') throw unauthorized('Only admins can modify staff');
    const targetId = Number(param(req, 'id'));
    const target = database.prepare('SELECT id, role, disabled FROM users WHERE id = ?').get(targetId) as { id: number; role: string; disabled: number } | undefined;
    if (!target) throw notFound('User not found');

    // Last-admin protection
    if ((body.role && body.role !== 'admin' && target.role === 'admin') || body.disabled === true) {
      if (target.role === 'admin' && countAdmins(database) <= 1) {
        throw badRequest('Cannot demote or disable the last admin');
      }
    }

    if (body.name) database.prepare('UPDATE users SET name = ? WHERE id = ?').run(body.name, targetId);
    if (body.password) {
      const hash = await hashPassword(body.password);
      database.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, targetId);
    }
    if (body.role) database.prepare('UPDATE users SET role = ? WHERE id = ?').run(body.role, targetId);
    if (body.disabled !== undefined) database.prepare('UPDATE users SET disabled = ? WHERE id = ?').run(body.disabled ? 1 : 0, targetId);

    // Any role/password/disable change destroys the target's sessions.
    if (body.password || body.role || body.disabled !== undefined) {
      destroySessionsForUser(database, targetId);
    }

    audit(database, req, 'staff.update', 'user', targetId, { fields: Object.keys(body) });
    res.json({ ok: true });
  }));

  router.delete('/staff/:id', asyncHandler(async (req, res) => {
    const database = getDb(res);
    if (req.userRole !== 'admin') throw unauthorized('Only admins can delete staff');
    const targetId = Number(param(req, 'id'));
    const target = database.prepare('SELECT id, role FROM users WHERE id = ?').get(targetId) as { id: number; role: string } | undefined;
    if (!target) throw notFound('User not found');
    if (target.role === 'admin' && countAdmins(database) <= 1) throw badRequest('Cannot delete the last admin');
    destroySessionsForUser(database, targetId);
    database.prepare('DELETE FROM users WHERE id = ?').run(targetId);
    audit(database, req, 'staff.delete', 'user', targetId);
    res.json({ ok: true });
  }));

  // Maintenance: purge expired sessions (also run hourly by index.ts)
  router.post('/maintenance/purge-sessions', requirePermission('settings'), (req, res) => {
    const n = purgeExpiredSessions(getDb(res));
    res.json({ purged: n });
  });

  return router;
}

/** Express req.params values can be string|string[]; coerce to a plain string. */
function param(req: Request, name: string): string {
  const v = req.params[name];
  return Array.isArray(v) ? String(v[0]) : String(v);
}

function publicOrder(o: any) {
  return {
    ref: o.ref,
    status: o.status,
    paymentStatus: o.payment_status,
    fulfilment: o.fulfilment,
    customerName: o.customer_name,
    customerPhone: o.customer_phone,
    note: o.note,
    subtotal: o.subtotal,
    total: o.total,
    currency: o.currency,
    staffNotes: o.staff_notes,
    lang: o.lang,
    createdAt: o.created_at
  };
}

function getSettingOrNull(db: ReturnType<typeof getDb>, key: string): string | null {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string | null } | undefined;
  return row?.value ?? null;
}
