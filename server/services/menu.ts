import type { DB } from '../db.js';
import { notFound } from '../http.js';

export interface PublicVariant {
  id: number;
  labelEn: string;
  labelAr: string;
  price: number;
  isAvailable: boolean;
}

export interface PublicItem {
  id: number;
  slug: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string | null;
  descriptionAr: string | null;
  image: string | null;
  isFeatured: boolean;
  isAvailable: boolean;
  variants: PublicVariant[];
}

export interface PublicCategory {
  id: number;
  slug: string;
  nameEn: string;
  nameAr: string;
  items: PublicItem[];
}

export function listCategories(db: DB, includeInactive = false): PublicCategory[] {
  const cats = db
    .prepare(`SELECT id, slug, name_en, name_ar, sort_order FROM categories ${includeInactive ? '' : 'WHERE is_active = 1'} ORDER BY sort_order, id`)
    .all() as { id: number; slug: string; name_en: string; name_ar: string; sort_order: number }[];
  const items = db
    .prepare(
      `SELECT i.id, i.category_id, i.slug, i.name_en, i.name_ar, i.description_en, i.description_ar, i.image,
              i.is_featured, i.is_available, i.sort_order
       FROM items i ${includeInactive ? '' : 'JOIN categories c ON c.id = i.category_id AND c.is_active = 1'}
       ${includeInactive ? '' : 'WHERE i.is_available = 1 OR 1=1'}
       ORDER BY i.sort_order, i.id`
    )
    .all() as any[];
  const variants = db.prepare('SELECT id, item_id, label_en, label_ar, price, is_available, sort_order FROM variants ORDER BY sort_order, id').all() as any[];

  const variantsByItem = new Map<number, PublicVariant[]>();
  for (const v of variants) {
    if (!variantsByItem.has(v.item_id)) variantsByItem.set(v.item_id, []);
    variantsByItem.get(v.item_id)!.push({ id: v.id, labelEn: v.label_en, labelAr: v.label_ar, price: v.price, isAvailable: !!v.is_available });
  }

  const itemsByCat = new Map<number, PublicItem[]>();
  for (const it of items) {
    const item: PublicItem = {
      id: it.id,
      slug: it.slug,
      nameEn: it.name_en,
      nameAr: it.name_ar,
      descriptionEn: it.description_en || null,
      descriptionAr: it.description_ar || null,
      image: it.image || null,
      isFeatured: !!it.is_featured,
      isAvailable: !!it.is_available,
      variants: variantsByItem.get(it.id) || []
    };
    if (!itemsByCat.has(it.category_id)) itemsByCat.set(it.category_id, []);
    itemsByCat.get(it.category_id)!.push(item);
  }

  return cats.map((c) => ({
    id: c.id,
    slug: c.slug,
    nameEn: c.name_en,
    nameAr: c.name_ar,
    items: itemsByCat.get(c.id) || []
  }));
}

export function listAddOns(db: DB, categorySlug?: string) {
  const rows = db.prepare('SELECT slug, name_en, name_ar, price, categories, is_active, sort_order FROM add_ons WHERE is_active = 1 ORDER BY sort_order, id').all() as any[];
  return rows
    .filter((r) => {
      if (!categorySlug) return true;
      const cats = (r.categories || '').split(',').map((s: string) => s.trim()).filter(Boolean);
      return cats.length === 0 || cats.includes(categorySlug);
    })
    .map((r) => ({ slug: r.slug, nameEn: r.name_en, nameAr: r.name_ar, price: r.price, appliesTo: (r.categories || '').split(',').map((s: string) => s.trim()).filter(Boolean) }));
}

export function getFeaturedItems(db: DB, limit = 6): PublicItem[] {
  const cats = listCategories(db);
  const featured: PublicItem[] = [];
  for (const c of cats) for (const it of c.items) if (it.isFeatured) featured.push(it);
  return featured.slice(0, limit);
}

export function getItemBySlug(db: DB, slug: string): PublicItem | null {
  const cats = listCategories(db, true);
  for (const c of cats) for (const it of c.items) if (it.slug === slug) return it;
  return null;
}

export function requireItem(db: DB, slug: string): PublicItem {
  const item = getItemBySlug(db, slug);
  if (!item) throw notFound('Item not found');
  return item;
}
