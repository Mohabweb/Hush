import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type Lang = 'en' | 'ar';

const dict = {
  en: {
    nav: { home: 'Home', menu: 'Menu', about: 'About', locations: 'Locations', reviews: 'Reviews', contact: 'Contact', cart: 'Cart', admin: 'Admin' },
    home: {
      heroKicker: 'Coffee & Croffle — Alexandria',
      heroTitle: 'Good coffee, quietly done well.',
      heroCta: 'See the menu',
      featured: 'Featured this week',
      aboutBand: 'A calm corner for espresso and fresh croffles — two branches in the heart of Alexandria.',
      branches: 'Our branches',
      reserveCta: 'Request a table',
      reserveNote: 'Reservation requests are confirmed by our staff.'
    },
    menu: { title: 'Menu', search: 'Search the menu…', unavailable: 'Unavailable', from: 'From', egp: 'EGP', addOns: 'Add-ons', addToCart: 'Add to cart', chooseSize: 'Choose a size', empty: 'Nothing matches your search.' },
    cart: { title: 'Your order', empty: 'Your cart is empty.', total: 'Total', checkout: 'Checkout', pickupNote: 'Pickup only · Pay cash at the counter', clear: 'Clear cart' },
    checkout: { title: 'Checkout', name: 'Name', phone: 'Phone number', branch: 'Branch', note: 'Note (optional)', place: 'Place order', placing: 'Placing order…', success: 'Order placed!', yourRef: 'Your order reference', trackCta: 'Track your order', required: 'Please fill in the required fields.', email: 'Email' },
    order: { title: 'Order status', refLabel: 'Reference', status: { new: 'Received', preparing: 'Preparing', ready: 'Ready for pickup', completed: 'Completed', cancelled: 'Cancelled' }, notFound: 'Order not found.', loading: 'Checking…' },
    about: { title: 'About HUSH' },
    locations: { title: 'Locations', directions: 'Open in Google Maps' },
    reviews: { title: 'Reviews', google: 'Google reviews', testimonials: 'What our guests say', notConfigured: 'Google reviews are not connected yet. See our profile on Google Maps instead.', mapsLink: 'View on Google Maps' },
    contact: { title: 'Contact us', message: 'Message', send: 'Send message', sent: 'Message sent. Thank you!', reserve: 'Request a table', date: 'Date', time: 'Time (optional)', party: 'Guests', reserveSend: 'Send request', reserveSent: 'Request received. We will contact you to confirm.', reserveNote: 'This is a request, not a confirmed booking.' },
    footer: { tagline: 'Coffee & croffle — Alexandria', legal: 'Privacy', terms: 'Terms' },
    admin: { title: 'Admin', signIn: 'Sign in', email: 'Email', password: 'Password', signOut: 'Sign out' },
    common: { loading: 'Loading…', error: 'Something went wrong.', close: 'Close' }
  },
  ar: {
    nav: { home: 'الرئيسية', menu: 'المنيو', about: 'من نحن', locations: 'فروعنا', reviews: 'التقييمات', contact: 'تواصل معنا', cart: 'السلة', admin: 'الإدارة' },
    home: {
      heroKicker: 'قهوة وكروفل — الإسكندرية',
      heroTitle: 'قهوة جيدة، ببساطة مميزة.',
      heroCta: 'تصفح المنيو',
      featured: 'مميز هذا الأسبوع',
      aboutBand: 'زاوية هادئة للإسبريسو والكروفل الطازج — فرعان في قلب الإسكندرية.',
      branches: 'فروعنا',
      reserveCta: 'اطلب طاولة',
      reserveNote: 'يتم تأكيد طلبات الحجز عبر فريقنا.'
    },
    menu: { title: 'المنيو', search: 'ابحث في المنيو…', unavailable: 'غير متاح', from: 'يبدأ من', egp: 'جنيه', addOns: 'إضافات', addToCart: 'أضف إلى السلة', chooseSize: 'اختر الحجم', empty: 'لا توجد نتائج.' },
    cart: { title: 'طلبك', empty: 'سلتك فارغة.', total: 'الإجمالي', checkout: 'إتمام الطلب', pickupNote: 'استلام من الفرع · الدفع نقدًا', clear: 'إفراغ السلة' },
    checkout: { title: 'إتمام الطلب', name: 'الاسم', phone: 'رقم الهاتف', branch: 'الفرع', note: 'ملاحظة (اختياري)', place: 'تأكيد الطلب', placing: 'جارٍ تأكيد الطلب…', success: 'تم إرسال طلبك!', yourRef: 'رقم طلبك', trackCta: 'متابعة الطلب', required: 'يرجى إكمال الحقول المطلوبة.', email: 'البريد الإلكتروني' },
    order: { title: 'حالة الطلب', refLabel: 'المرجع', status: { new: 'تم الاستلام', preparing: 'قيد التحضير', ready: 'جاهز للاستلام', completed: 'مكتمل', cancelled: 'ملغي' }, notFound: 'الطلب غير موجود.', loading: 'جارٍ التحقق…' },
    about: { title: 'عن هَش' },
    locations: { title: 'فروعنا', directions: 'افتح في خرائط جوجل' },
    reviews: { title: 'التقييمات', google: 'تقييمات جوجل', testimonials: 'ماذا يقول ضيوفنا', notConfigured: 'تقييمات جوجل غير متصلة بعد. يمكنك الاطلاع على ملفنا على خرائط جوجل.', mapsLink: 'عرض على خرائط جوجل' },
    contact: { title: 'تواصل معنا', message: 'الرسالة', send: 'إرسال', sent: 'تم الإرسال. شكرًا لك!', reserve: 'اطلب طاولة', date: 'التاريخ', time: 'الوقت (اختياري)', party: 'عدد الضيوف', reserveSend: 'إرسال الطلب', reserveSent: 'تم استلام الطلب. سنتواصل معك للتأكيد.', reserveNote: 'هذا طلب وليس حجزًا مؤكدًا.' },
    footer: { tagline: 'قهوة وكروفل — الإسكندرية', legal: 'الخصوصية', terms: 'الشروط' },
    admin: { title: 'الإدارة', signIn: 'تسجيل الدخول', email: 'البريد الإلكتروني', password: 'كلمة المرور', signOut: 'خروج' },
    common: { loading: 'جارٍ التحميل…', error: 'حدث خطأ ما.', close: 'إغلاق' }
  }
} as const;

type Dict = typeof dict.en;

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Dict;
}

const Ctx = createContext<LangCtx>({ lang: 'en', setLang: () => {}, t: dict.en });

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = localStorage.getItem('hush-lang');
    return stored === 'ar' || stored === 'en' ? stored : 'en';
  });

  useEffect(() => {
    localStorage.setItem('hush-lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const setLang = useCallback((l: Lang) => setLangState(l), []);

  return <Ctx.Provider value={{ lang, setLang, t: dict[lang] as unknown as Dict }}>{children}</Ctx.Provider>;
}

export function useLang(): LangCtx {
  return useContext(Ctx);
}
