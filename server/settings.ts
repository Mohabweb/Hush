import type { DB } from './db.js';

const DEFAULTS: Record<string, string> = {
  'banner.enabled': '0',
  'banner.text_en': '',
  'banner.text_ar': '',
  'site.tagline_en': 'Coffee & croffle, done quietly well.',
  'site.tagline_ar': 'قهوة وكروفل ببساطة مميزة.',
  'site.instagram': '',
  'site.phone': '',
  'ordering.enabled': '1',
  'ordering.dinein_enabled': '0',
  'ordering.delivery_enabled': '0',
  'ordering.note_en': 'Pickup only. Pay cash at the counter.',
  'ordering.note_ar': 'استلام من الفرع فقط. الدفع نقدًا.'
};

export function getSetting(db: DB, key: string): string | null {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string | null } | undefined;
  if (row && row.value != null) return row.value;
  return DEFAULTS[key] ?? null;
}

export function getSettingBool(db: DB, key: string): boolean {
  return getSetting(db, key) === '1';
}

export function setSetting(db: DB, key: string, value: string): void {
  db.prepare(
    `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, unixepoch())
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = unixepoch()`
  ).run(key, value);
}

export function getAllSettings(db: DB): Record<string, string> {
  const rows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string | null }[];
  const out: Record<string, string> = { ...DEFAULTS };
  for (const r of rows) out[r.key] = r.value ?? '';
  return out;
}
