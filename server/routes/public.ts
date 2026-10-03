import { Router, type Request, Response } from 'express';
import { db as getDb, config as getConfig } from '../context.js';
import { badRequest, notFound, asyncHandler } from '../http.js';
import { orderSchema, contactSchema, reservationSchema, orderStatusQuerySchema, reservationDateBounds } from '../validation.js';
import { listCategories, listAddOns, getFeaturedItems } from '../services/menu.js';
import { listBranches } from '../services/branches.js';
import { getReviewsForBranch } from '../services/reviews.js';
import { createOrder, getOrderForStatus } from '../services/orders.js';
import { getSetting, getSettingBool, getAllSettings } from '../settings.js';
import { t } from '../i18n.js';
import { rateLimit } from '../middleware/security.js';
import type { Lang } from '../../shared/constants.js';

export function publicRouter(): Router {
  const router = Router();

  // Write endpoints are rate limited (x100 under NODE_ENV=test).
  const writeLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 30, keyBy: (req) => req.ip || 'unknown' });

  // ---- GET /api/config -----------------------------------------------------
  router.get('/config', (req, res) => {
    const database = getDb(res);
    const settings = getAllSettings(database);
    res.json({
      currency: 'EGP',
      ordering: {
        enabled: settings['ordering.enabled'] === '1',
        dineInEnabled: settings['ordering.dinein_enabled'] === '1',
        deliveryEnabled: settings['ordering.delivery_enabled'] === '1',
        noteEn: settings['ordering.note_en'],
        noteAr: settings['ordering.note_ar']
      },
      banner: {
        enabled: settings['banner.enabled'] === '1',
        textEn: settings['banner.text_en'] || null,
        textAr: settings['banner.text_ar'] || null
      },
      site: {
        taglineEn: settings['site.tagline_en'],
        taglineAr: settings['site.tagline_ar'],
        instagram: settings['site.instagram'] || null,
        phone: settings['site.phone'] || null
      },
      whatsapp: getConfig(res).whatsappNumber ? 'configured' : 'off',
      googleReviews: getConfig(res).googlePlacesApiKey ? 'configured' : 'not_configured'
    });
  });

  // ---- GET /api/menu -------------------------------------------------------
  router.get('/menu', (req, res) => {
    const database = getDb(res);
    const lang = (res.locals.lang || 'en') as Lang;
    const categories = listCategories(database);
    const categorySlug = typeof req.query.category === 'string' ? req.query.category : undefined;
    res.json({
      categories: categories.map((c) => ({
        slug: c.slug,
        name: lang === 'ar' ? c.nameAr : c.nameEn,
        nameEn: c.nameEn,
        nameAr: c.nameAr,
        items: c.items.map((it) => ({
          slug: it.slug,
          name: lang === 'ar' ? it.nameAr : it.nameEn,
          nameEn: it.nameEn,
          nameAr: it.nameAr,
          description: lang === 'ar' ? it.descriptionAr : it.descriptionEn,
          descriptionEn: it.descriptionEn,
          descriptionAr: it.descriptionAr,
          image: it.image,
          isFeatured: it.isFeatured,
          isAvailable: it.isAvailable,
          variants: it.variants.map((v) => ({
            id: v.id,
            label: lang === 'ar' ? v.labelAr : v.labelEn,
            labelEn: v.labelEn,
            labelAr: v.labelAr,
            price: v.price,
            isAvailable: v.isAvailable
          }))
        }))
      })),
      addOns: listAddOns(database, categorySlug).map((ao) => ({
        slug: ao.slug,
        name: lang === 'ar' ? ao.nameAr : ao.nameEn,
        nameEn: ao.nameEn,
        nameAr: ao.nameAr,
        price: ao.price,
        appliesTo: ao.appliesTo
      }))
    });
  });

  // ---- GET /api/categories -------------------------------------------------
  router.get('/categories', (req, res) => {
    const database = getDb(res);
    const lang = (res.locals.lang || 'en') as Lang;
    res.json({
      categories: listCategories(database).map((c) => ({ slug: c.slug, name: lang === 'ar' ? c.nameAr : c.nameEn }))
    });
  });

  // ---- GET /api/branches ---------------------------------------------------
  router.get('/branches', (req, res) => {
    const database = getDb(res);
    const lang = (res.locals.lang || 'en') as Lang;
    res.json({
      branches: listBranches(database).map((b) => ({
        slug: b.slug,
        name: lang === 'ar' ? b.nameAr : b.nameEn,
        nameEn: b.nameEn,
        nameAr: b.nameAr,
        address: lang === 'ar' ? b.addressAr : b.addressEn,
        addressEn: b.addressEn,
        addressAr: b.addressAr,
        phone: b.phone,
        mapsUrl: b.mapsUrl
      }))
    });
  });

  // ---- GET /api/reviews ----------------------------------------------------
  router.get('/reviews', asyncHandler(async (req, res) => {
    const database = getDb(res);
    const cfg = getConfig(res);
    const branches = listBranches(database);
    const result: Record<string, unknown> = {};
    for (const b of branches) {
      const placeIdRow = database.prepare('SELECT place_id FROM branches WHERE slug = ?').get(b.slug) as { place_id: string | null };
      const reviews = await getReviewsForBranch(database, cfg, {
        id: b.id,
        slug: b.slug,
        nameEn: b.nameEn,
        placeId: placeIdRow?.place_id || null
      });
      result[b.slug] = reviews;
    }
    // Manual testimonials (staff-curated), clearly separate from Google reviews.
    const testimonials = database
      .prepare('SELECT author_name, quote_en, quote_ar, rating FROM testimonials WHERE is_published = 1 ORDER BY sort_order, id')
      .all() as { author_name: string; quote_en: string; quote_ar: string; rating: number | null }[];
    const lang = (res.locals.lang || 'en') as Lang;
    res.json({
      google: result,
      googleStatus: cfg.googlePlacesApiKey ? 'configured' : 'not_configured',
      testimonials: testimonials.map((tt) => ({
        author: tt.author_name,
        quote: lang === 'ar' ? tt.quote_ar : tt.quote_en,
        rating: tt.rating
      }))
    });
  }));

  // ---- GET /api/pages/:slug ------------------------------------------------
  router.get('/pages/:slug', (req, res) => {
    const database = getDb(res);
    const lang = (res.locals.lang || 'en') as Lang;
    const page = database
      .prepare('SELECT slug, title_en, title_ar, body_en, body_ar, is_published, updated_at FROM pages WHERE slug = ? AND is_published = 1')
      .get(req.params.slug) as { slug: string; title_en: string; title_ar: string; body_en: string; body_ar: string; is_published: number; updated_at: number } | undefined;
    if (!page) throw notFound('Page not found');
    res.json({
      slug: page.slug,
      title: lang === 'ar' ? page.title_ar : page.title_en,
      body: lang === 'ar' ? page.body_ar : page.body_en,
      updatedAt: page.updated_at
    });
  });

  // ---- POST /api/orders ----------------------------------------------------
  router.post('/orders', writeLimiter, asyncHandler(async (req, res) => {
    const lang = (res.locals.lang || 'en') as Lang;
    const body = orderSchema.parse(req.body);

    // Honeypot: pretend success without storing anything.
    if (body.website === 'spam' || (body as Record<string, unknown>).website) {
      res.status(400).json({ error: 'spam', message: t('spam', lang) });
      return;
    }

    const database = getDb(res);
    const created = createOrder(database, {
      branchSlug: body.branchSlug,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      note: body.note || undefined,
      lang: body.lang,
      lines: body.lines.map((l) => ({ itemSlug: l.itemSlug, variantId: l.variantId, quantity: l.quantity, addOns: l.addOns }))
    });

    res.status(201).json({ ref: created.ref, token: created.token, total: created.total, currency: created.currency });
  }));

  // ---- GET /api/orders/:ref?t=token ---------------------------------------
  router.get('/orders/:ref', (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    const query = orderStatusQuerySchema.parse(req.query);
    const database = getDb(res);
    const order = getOrderForStatus(database, req.params.ref, query.t);
    // Unknown ref and wrong token both 404 (no existence oracle).
    if (!order) throw notFound('Order not found');
    res.json({
      ref: order.ref,
      status: order.status,
      paymentStatus: order.payment_status,
      total: order.total,
      currency: order.currency,
      createdAt: order.created_at,
      lines: order.lines.map((l: any) => ({
        nameEn: l.item_name_en,
        nameAr: l.item_name_ar,
        variantEn: l.variant_label_en,
        variantAr: l.variant_label_ar,
        unitPrice: l.unit_price,
        quantity: l.quantity,
        addOns: l.addOns,
        lineTotal: l.line_total
      }))
    });
  });

  // ---- POST /api/contact ---------------------------------------------------
  router.post('/contact', writeLimiter, asyncHandler(async (req, res) => {
    const lang = (res.locals.lang || 'en') as Lang;
    const body = contactSchema.parse(req.body);
    if (body.website === 'spam' || (body as Record<string, unknown>).website) {
      res.status(400).json({ error: 'spam', message: t('spam', lang) });
      return;
    }
    const database = getDb(res);
    database
      .prepare('INSERT INTO contact_messages (name, email, phone, message) VALUES (?, ?, ?, ?)')
      .run(body.name, body.email || null, body.phone || null, body.message);
    res.status(201).json({ ok: true, message: t('contact_saved', lang) });
  }));

  // ---- POST /api/reservations ---------------------------------------------
  router.post('/reservations', writeLimiter, asyncHandler(async (req, res) => {
    const lang = (res.locals.lang || 'en') as Lang;
    const body = reservationSchema.parse(req.body);

    // Honeypot returns 201 without storing.
    if (body.website === 'spam' || (body as Record<string, unknown>).website) {
      res.status(201).json({ ok: true, message: t('reservation_saved', lang) });
      return;
    }

    // Date must be a real date within [Cairo today, today + 90 days].
    const { min, max } = reservationDateBounds();
    if (body.date < min || body.date > max) {
      throw badRequest(`Date must be between ${min} and ${max}`);
    }
    const parsed = new Date(`${body.date}T00:00:00Z`);
    if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== body.date) {
      throw badRequest('Invalid date');
    }

    const database = getDb(res);
    const branch = database.prepare('SELECT id, is_active FROM branches WHERE slug = ?').get(body.branchSlug) as { id: number; is_active: number } | undefined;
    if (!branch || !branch.is_active) throw badRequest(t('branch_closed', lang));

    database
      .prepare('INSERT INTO reservations (branch_id, name, phone, date, time, party_size, note) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(branch.id, body.name, body.phone, body.date, body.time || null, body.partySize, body.note || null);

    // These are REQUESTS, never confirmed bookings. The client copy must reflect that.
    res.status(201).json({ ok: true, message: t('reservation_saved', lang) });
  }));

  return router;
}
