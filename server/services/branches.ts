import type { DB } from '../db.js';

export interface PublicBranch {
  id: number;
  slug: string;
  nameEn: string;
  nameAr: string;
  addressEn: string;
  addressAr: string;
  phone: string | null;
  mapsUrl: string | null;
}

export function listBranches(db: DB, includeInactive = false): PublicBranch[] {
  const rows = db
    .prepare(`SELECT id, slug, name_en, name_ar, address_en, address_ar, phone, maps_url, place_id FROM branches ${includeInactive ? '' : 'WHERE is_active = 1'} ORDER BY sort_order, id`)
    .all() as any[];
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    nameEn: r.name_en,
    nameAr: r.name_ar,
    addressEn: r.address_en,
    addressAr: r.address_ar,
    phone: r.phone || null,
    mapsUrl: r.maps_url || null
  }));
}

export function getBranchBySlug(db: DB, slug: string): PublicBranch | null {
  const rows = listBranches(db, true);
  return rows.find((b) => b.slug === slug) || null;
}

export function branchInUse(db: DB, branchId: number): boolean {
  const o = db.prepare('SELECT 1 FROM orders WHERE branch_id = ? LIMIT 1').get(branchId);
  const r = db.prepare('SELECT 1 FROM reservations WHERE branch_id = ? LIMIT 1').get(branchId);
  return !!(o || r);
}
