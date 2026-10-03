import type { DB } from '../db.js';
import { MENU, ADD_ONS } from './menu.js';
import { BRANCHES, PAGES } from './pages.js';
import { setSetting } from '../settings.js';
import { hashPassword } from '../services/auth.js';

/**
 * Full seed. Intended to run only when the database is empty (see isDbEmpty),
 * so admin edits are never overwritten by re-seeding. Also used by tests with
 * an empty in-memory/temp database.
 */
export function isDbEmpty(db: DB): boolean {
  const row = db.prepare('SELECT (SELECT COUNT(*) FROM items) + (SELECT COUNT(*) FROM branches) + (SELECT COUNT(*) FROM categories) AS n').get() as { n: number };
  return row.n === 0;
}

export function runSeed(db: DB): void {
  const insertCategory = db.prepare(
    'INSERT INTO categories (slug, name_en, name_ar, sort_order) VALUES (?, ?, ?, ?)'
  );
  const insertItem = db.prepare(
    `INSERT INTO items (category_id, slug, name_en, name_ar, description_en, description_ar, is_featured, is_available, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const insertVariant = db.prepare(
    'INSERT INTO variants (item_id, label_en, label_ar, price, is_available, sort_order) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const insertAddOn = db.prepare(
    'INSERT INTO add_ons (slug, name_en, name_ar, price, categories, sort_order) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const insertBranch = db.prepare(
    `INSERT INTO branches (slug, name_en, name_ar, address_en, address_ar, phone, maps_url, place_id, is_active, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const insertPage = db.prepare(
    'INSERT INTO pages (slug, title_en, title_ar, body_en, body_ar, is_published) VALUES (?, ?, ?, ?, ?, ?)'
  );

  const tx = db.transaction(() => {
    let catOrder = 0;
    for (const cat of MENU) {
      const catId = insertCategory.run(cat.slug, cat.nameEn, cat.nameAr, catOrder++).lastInsertRowid as number;
      let itemOrder = 0;
      for (const item of cat.items) {
        const itemId = insertItem.run(
          catId, item.slug, item.nameEn, item.nameAr,
          item.descriptionEn || null, item.descriptionAr || null,
          item.featured ? 1 : 0, item.available === false ? 0 : 1, itemOrder++
        ).lastInsertRowid as number;
        let vOrder = 0;
        for (const v of item.variants) {
          insertVariant.run(itemId, v.labelEn, v.labelAr, v.price, v.isAvailable === false ? 0 : 1, vOrder++);
        }
      }
    }

    let aoOrder = 0;
    for (const ao of ADD_ONS) insertAddOn.run(ao.slug, ao.nameEn, ao.nameAr, ao.price, ao.categories, aoOrder++);

    for (const b of BRANCHES) {
      insertBranch.run(b.slug, b.name_en, b.name_ar, b.address_en, b.address_ar, b.phone, b.maps_url, b.place_id, b.is_active, b.sort_order);
    }

    for (const p of PAGES) insertPage.run(p.slug, p.title_en, p.title_ar, p.body_en, p.body_ar, p.is_published);

    // Settings defaults
    setSetting(db, 'ordering.enabled', '1');
    setSetting(db, 'ordering.delivery_enabled', '0');
    setSetting(db, 'ordering.dinein_enabled', '0');
  });
  tx();
}

/** Used by scripts/seed.ts (CLI `npm run seed`). */
export async function seedCommand(db: DB): Promise<void> {
  runSeed(db);
  // Optional initial admin from env (no default credentials).
  if (process.env.HUSH_ADMIN_PASSWORD && process.env.HUSH_ADMIN_EMAIL) {
    const existing = db.prepare('SELECT 1 FROM users LIMIT 1').get();
    if (!existing) {
      const hash = await hashPassword(process.env.HUSH_ADMIN_PASSWORD);
      db.prepare('INSERT INTO users (email, name, password_hash, role) VALUES (?, ?, ?, ?)').run(
        process.env.HUSH_ADMIN_EMAIL.toLowerCase(), 'Administrator', hash, 'admin'
      );
      console.log(`Created admin user ${process.env.HUSH_ADMIN_EMAIL}`);
    }
  }
}
