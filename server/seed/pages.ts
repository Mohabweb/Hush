import { BRANCH_ADDRESSES } from '../../shared/constants.js';

export const BRANCHES = [
  {
    slug: 'fouad',
    name_en: 'HUSH — Fouad St',
    name_ar: 'هَش — شارع فؤاد',
    address_en: BRANCH_ADDRESSES.fouad,
    address_ar: '٦٦ شارع فؤاد، بجوار السفارة اللبنانية، الإسكندرية',
    phone: null as string | null,
    maps_url: 'https://www.google.com/maps/search/?api=1&query=HUSH+Caf%C3%A9+66+Fouad+St+Alexandria',
    place_id: null as string | null,
    is_active: 1,
    sort_order: 1
  },
  {
    slug: 'farah',
    name_en: 'HUSH — Farah St',
    name_ar: 'هَش — شارع فرح',
    address_en: BRANCH_ADDRESSES.farah,
    address_ar: '١٢ شارع فرح، طريق الجيش، كامب شيزار، الإسكندرية',
    phone: null as string | null,
    maps_url: 'https://www.google.com/maps/search/?api=1&query=HUSH+Caf%C3%A9+12+Farah+St+Camp+Chezar+Alexandria',
    place_id: null as string | null,
    is_active: 1,
    sort_order: 2
  }
];

export const PAGES = [
  {
    slug: 'privacy',
    title_en: 'Privacy Policy',
    title_ar: 'سياسة الخصوصية',
    body_en: `[Owner to confirm] This policy is a draft prepared from the brief and must be reviewed by the owner before publication.

HUSH café respects your privacy. When you place a pickup order through this website we store only the information needed to fulfil it: your name, phone number, chosen branch, the items you ordered and any note you write. Order records are kept for our own bookkeeping and are not shared with third parties.

Messages and reservation requests sent through the contact and reservation forms are stored so our staff can reply to you. We do not use your details for advertising and we do not sell data.

Payments are taken in cash at the counter. The website never collects card data.

If you have questions about your data, contact us through the website contact form. [Owner to confirm: retention periods and data-contact details.]`,
    body_ar: `[ Owner to confirm ] هذه السياسة مسودة أُعدت من الموجز ويجب مراجعتها من المالك قبل النشر.

يحترم مقهى هَش خصوصيتك. عند تقديم طلب استلام عبر هذا الموقع نخزّن فقط المعلومات اللازمة لتنفيذه: الاسم ورقم الهاتف والفرع المختار والعناصر المطلوبة وأي ملاحظة تكتبها. تُحفظ سجلات الطلبات لأغراضنا الداخلية ولا تُشارك مع أي طرف ثالث.

تُخزَّن الرسائل وطلبات الحجز المرسلة عبر نماذج الموقع ليتمكن فريقنا من الرد عليك. لا نستخدم بياناتك في الإعلانات ولا نبيعها.

الدفع نقدًا عند الطاولة/الكاونتر، والموقع لا يجمع أي بيانات بطاقات.

لأي استفسار عن بياناتك، تواصل معنا عبر نموذج التواصل. [ Owner to confirm: مدد الاحتفاظ وتفاصيل جهة الاتصال. ]`,
    is_published: 1
  },
  {
    slug: 'terms',
    title_en: 'Terms of Service',
    title_ar: 'الشروط والأحكام',
    body_en: `[Owner to confirm] This policy is a draft prepared from the brief and must be reviewed by the owner before publication.

Orders. Orders placed on this website are pickup orders, paid in cash at the branch counter when you collect. The price shown at checkout is calculated on our server from our current menu and is the price you pay. An order is accepted once our staff confirm it at the branch.

Pickup. Please collect your order within a reasonable time after the "ready" status appears on your order-status page. [Owner to confirm: pickup holding time.]

Reservations. Reservation requests submitted through this website are requests only; they become confirmed only when our staff contact you. We cannot guarantee tables until confirmed.

Availability. Menu items may become unavailable without notice. If an item is unavailable after you order, we will contact you to adjust the order.

Liability. Nothing in these terms limits liability that cannot be limited by law. [Owner to confirm: final legal wording.]`,
    body_ar: `[ Owner to confirm ] هذه السياسة مسودة أُعدت من الموجز ويجب مراجعتها من المالك قبل النشر.

الطلبات. الطلبات المقدمة عبر الموقع هي طلبات استلام، ويتم الدفع نقدًا عند الكاونتر عند الاستلام. السعر المعروض عند إتمام الطلب يُحسب على خوادمنا من قائمة الطعام الحالية وهو السعر النهائي. يُقبل الطلب عند تأكيد فريقنا في الفرع.

الاستلام. يُرجى استلام الطلب في وقت معقول بعد ظهور حالة "جاهز" في صفحة متابعة الطلب. [ Owner to confirm: مدة الاحتفاظ بالطلب. ]

الحجوزات. طلبات الحجز عبر الموقع هي طلبات فقط، ولا تُصبح مؤكدة إلا عند تواصل فريقنا معك. لا يمكننا ضمان الطاولات قبل التأكيد.

التوفر. قد تصبح بعض المنتجات غير متاحة دون إشعار مسبق. إذا كان المنتج غير متاح بعد تقديم الطلب سنتواصل معك لتعديل الطلب.

المسؤولية. لا يُخوِّل أي بند من هذه الشروط إخلاء مسؤولية لا يجوز إخلاؤه بموجب القانون. [ Owner to confirm: الصياغة القانونية النهائية. ]`,
    is_published: 1
  },
  {
    slug: 'about',
    title_en: 'About HUSH',
    title_ar: 'عن هَش',
    body_en: `HUSH is a coffee & croffle café with two branches in Alexandria, Egypt — one on Fouad Street next to the Lebanese Embassy, and one on Farah Street, El Geash Road, Camp Chezar.

We keep it simple: good espresso, fresh croffles straight from the press, and a calm place to sit. [Owner to confirm: brand story wording.]`,
    body_ar: `هَش هو مقهى قهوة وكروفل بفرعين في الإسكندرية بمصر — أحدهما في شارع فؤاد بجوار السفارة اللبنانية، والآخر في شارع فرح، طريق الجيش، كامب شيزار.

نبقي الأمر بسيطًا: إسبريسو جيد، وكروفل طازج مباشرة من المكبس، ومكان هادئ للجلوس. [ Owner to confirm: صياغة قصة العلامة. ]`,
    is_published: 1
  }
];
