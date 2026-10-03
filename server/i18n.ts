import type { Lang } from '../shared/constants.js';

/**
 * Minimal i18n for server-generated strings (validation messages, emails).
 * The client has its own dictionary; these are for API responses.
 */
const MESSAGES: Record<string, Record<Lang, string>> = {
  spam: { en: 'spam', ar: 'spam' },
  order_not_found: { en: 'Order not found', ar: 'الطلب غير موجود' },
  reservation_saved: { en: 'Reservation request received. We will contact you to confirm.', ar: 'تم استلام طلب الحجز. سنتواصل معك للتأكيد.' },
  contact_saved: { en: 'Message received. Thank you!', ar: 'تم استلام رسالتك. شكرًا لك!' },
  item_unavailable: { en: 'Some items are unavailable', ar: 'بعض المنتجات غير متاحة' },
  branch_closed: { en: 'Branch unavailable', ar: 'الفرع غير متاح' },
  delivery_disabled: { en: 'Delivery is not available. Pickup only.', ar: 'التوصيل غير متاح. الاستلام من الفرع فقط.' }
};

export function t(key: string, lang: Lang): string {
  const entry = MESSAGES[key];
  if (!entry) return key;
  return entry[lang] ?? entry.en;
}
