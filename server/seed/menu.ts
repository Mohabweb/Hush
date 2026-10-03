import type { DB } from '../db.js';

/**
 * Full supplied menu for HUSH cafe (coffee & croffle).
 * Prices are integer piastres (1 EGP = 100 piastres).
 * Arabic names are transliterated/translated from the supplied menu.
 * NOTE: Iced Black Tea has no price on the supplied menu, so it is seeded
 * with no variant and is_available = 0 (cannot be ordered).
 */

export interface SeedVariant {
  labelEn: string;
  labelAr: string;
  price: number; // piastres
  isAvailable?: boolean;
}

export interface SeedItem {
  slug: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  featured?: boolean;
  available?: boolean;
  variants: SeedVariant[];
}

export interface SeedCategory {
  slug: string;
  nameEn: string;
  nameAr: string;
  items: SeedItem[];
}

export const MENU: SeedCategory[] = [
  {
    slug: 'espresso',
    nameEn: 'Espresso',
    nameAr: 'إسبريسو',
    items: [
      {
        slug: 'espresso-single',
        nameEn: 'Espresso',
        nameAr: 'إسبريسو',
        descriptionEn: 'A concentrated shot of our house blend.',
        descriptionAr: 'جرعة مركزة من خلطة المحمصة الخاص بنا.',
        variants: [{ labelEn: 'Single', labelAr: 'سنجل', price: 3500 }]
      },
      {
        slug: 'espresso-double',
        nameEn: 'Espresso Doppio',
        nameAr: 'دوبيو إسبريسو',
        variants: [{ labelEn: 'Double', labelAr: 'دبل', price: 4500 }]
      },
      {
        slug: 'americano',
        nameEn: 'Americano',
        nameAr: 'أمريكانو',
        variants: [
          { labelEn: 'Single', labelAr: 'سنجل', price: 4000 },
          { labelEn: 'Double', labelAr: 'دبل', price: 5000 }
        ]
      },
      {
        slug: 'cortado',
        nameEn: 'Cortado',
        nameAr: 'كورتادو',
        variants: [{ labelEn: 'Regular', labelAr: 'ريجولار', price: 5500 }]
      },
      {
        slug: 'flat-white',
        nameEn: 'Flat White',
        nameAr: 'فلات وايت',
        variants: [{ labelEn: 'Regular', labelAr: 'ريجولار', price: 6500 }]
      },
      {
        slug: 'cappuccino',
        nameEn: 'Cappuccino',
        nameAr: 'كابتشينو',
        variants: [
          { labelEn: 'Regular', labelAr: 'ريجولار', price: 6000 },
          { labelEn: 'Large', labelAr: 'كبير', price: 7500 }
        ]
      },
      {
        slug: 'cafe-latte',
        nameEn: 'Caffè Latte',
        nameAr: 'كافيه لاتيه',
        variants: [
          { labelEn: 'Regular', labelAr: 'ريجولار', price: 6500 },
          { labelEn: 'Large', labelAr: 'كبير', price: 8000 }
        ]
      },
      {
        slug: 'spanish-latte',
        nameEn: 'Spanish Latte',
        nameAr: 'سبانش لاتيه',
        variants: [
          { labelEn: 'Regular', labelAr: 'ريجولار', price: 7500 },
          { labelEn: 'Large', labelAr: 'كبير', price: 9000 }
        ]
      },
      {
        slug: 'pistachio-latte',
        nameEn: 'Pistachio Latte',
        nameAr: 'لاتيه الفستق',
        variants: [
          { labelEn: 'Regular', labelAr: 'ريجولار', price: 8500 },
          { labelEn: 'Large', labelAr: 'كبير', price: 10000 }
        ]
      },
      {
        slug: 'mocha',
        nameEn: 'Mocha',
        nameAr: 'موكا',
        variants: [
          { labelEn: 'Regular', labelAr: 'ريجولار', price: 7500 },
          { labelEn: 'Large', labelAr: 'كبير', price: 9000 }
        ]
      },
      {
        slug: 'macchiato',
        nameEn: 'Macchiato',
        nameAr: 'ماكياتو',
        variants: [{ labelEn: 'Regular', labelAr: 'ريجولار', price: 5500 }]
      },
      {
        slug: 'turkish-coffee',
        nameEn: 'Turkish Coffee',
        nameAr: 'قهوة تركي',
        variants: [{ labelEn: 'Regular', labelAr: 'ريجولار', price: 4500 }]
      },
      {
        slug: 'french-coffee',
        nameEn: 'French Coffee',
        nameAr: 'قهوة فرنسي',
        variants: [{ labelEn: 'Regular', labelAr: 'ريجولار', price: 7000 }]
      }
    ]
  },
  {
    slug: 'cold-coffee',
    nameEn: 'Cold Coffee',
    nameAr: 'قهوة باردة',
    items: [
      {
        slug: 'iced-latte',
        nameEn: 'Iced Latte',
        nameAr: 'آيس لاتيه',
        variants: [
          { labelEn: 'Regular', labelAr: 'ريجولار', price: 7000 },
          { labelEn: 'Large', labelAr: 'كبير', price: 8500 }
        ]
      },
      {
        slug: 'iced-spanish-latte',
        nameEn: 'Iced Spanish Latte',
        nameAr: 'آيس سبانش لاتيه',
        variants: [
          { labelEn: 'Regular', labelAr: 'ريجولار', price: 8000 },
          { labelEn: 'Large', labelAr: 'كبير', price: 9500 }
        ]
      },
      {
        slug: 'iced-pistachio-latte',
        nameEn: 'Iced Pistachio Latte',
        nameAr: 'آيس لاتيه الفستق',
        variants: [
          { labelEn: 'Regular', labelAr: 'ريجولار', price: 9000 },
          { labelEn: 'Large', labelAr: 'كبير', price: 10500 }
        ]
      },
      {
        slug: 'iced-americano',
        nameEn: 'Iced Americano',
        nameAr: 'آيس أمريكانو',
        variants: [
          { labelEn: 'Regular', labelAr: 'ريجولار', price: 4500 },
          { labelEn: 'Large', labelAr: 'كبير', price: 5500 }
        ]
      },
      {
        slug: 'iced-mocha',
        nameEn: 'Iced Mocha',
        nameAr: 'آيس موكا',
        variants: [
          { labelEn: 'Regular', labelAr: 'ريجولار', price: 8000 },
          { labelEn: 'Large', labelAr: 'كبير', price: 9500 }
        ]
      },
      {
        slug: 'frappe',
        nameEn: 'Frappe',
        nameAr: 'فرابيه',
        variants: [
          { labelEn: 'Regular', labelAr: 'ريجولار', price: 7000 },
          { labelEn: 'Large', labelAr: 'كبير', price: 8500 }
        ]
      },
      {
        slug: 'affogato',
        nameEn: 'Affogato',
        nameAr: 'أفوجاتو',
        variants: [{ labelEn: 'Regular', labelAr: 'ريجولار', price: 8500 }]
      }
    ]
  },
  {
    slug: 'tea',
    nameEn: 'Tea',
    nameAr: 'شاي',
    items: [
      {
        slug: 'black-tea',
        nameEn: 'Black Tea',
        nameAr: 'شاي أخضر',
        variants: [{ labelEn: 'Pot', labelAr: 'براد', price: 3000 }]
      },
      {
        slug: 'green-tea',
        nameEn: 'Green Tea',
        nameAr: 'شاي أخضر',
        variants: [{ labelEn: 'Pot', labelAr: 'براد', price: 3000 }]
      },
      {
        slug: 'mint-tea',
        nameEn: 'Fresh Mint Tea',
        nameAr: 'شاي نعناع',
        variants: [{ labelEn: 'Pot', labelAr: 'براد', price: 3500 }]
      },
      {
        slug: 'hibiscus',
        nameEn: 'Hibiscus',
        nameAr: 'كركديه',
        variants: [{ labelEn: 'Pot', labelAr: 'براد', price: 3500 }]
      },
      {
        slug: 'iced-black-tea',
        nameEn: 'Iced Black Tea',
        nameAr: 'آيس تي',
        descriptionEn: 'Currently unavailable.',
        descriptionAr: 'غير متاح حاليًا.',
        available: false,
        variants: []
      }
    ]
  },
  {
    slug: 'hot-chocolate',
    nameEn: 'Hot Chocolate',
    nameAr: 'هوت شوكليت',
    items: [
      {
        slug: 'hot-chocolate',
        nameEn: 'Hot Chocolate',
        nameAr: 'هوت شوكليت',
        variants: [
          { labelEn: 'Regular', labelAr: 'ريجولار', price: 6500 },
          { labelEn: 'Large', labelAr: 'كبير', price: 8000 }
        ]
      },
      {
        slug: 'white-hot-chocolate',
        nameEn: 'White Hot Chocolate',
        nameAr: 'وايت هوت شوكليت',
        variants: [
          { labelEn: 'Regular', labelAr: 'ريجولار', price: 7000 },
          { labelEn: 'Large', labelAr: 'كبير', price: 8500 }
        ]
      },
      {
        slug: 'nutella-hot-chocolate',
        nameEn: 'Nutella Hot Chocolate',
        nameAr: 'هوت شوكليت نوتيلا',
        variants: [
          { labelEn: 'Regular', labelAr: 'ريجولار', price: 8000 },
          { labelEn: 'Large', labelAr: 'كبير', price: 9500 }
        ]
      }
    ]
  },
  {
    slug: 'matcha',
    nameEn: 'Matcha',
    nameAr: 'ماتشا',
    items: [
      {
        slug: 'matcha-latte',
        nameEn: 'Matcha Latte',
        nameAr: 'ماتشا لاتيه',
        variants: [
          { labelEn: 'Regular', labelAr: 'ريجولار', price: 8500 },
          { labelEn: 'Large', labelAr: 'كبير', price: 10000 }
        ]
      },
      {
        slug: 'iced-matcha-latte',
        nameEn: 'Iced Matcha Latte',
        nameAr: 'آيس ماتشا لاتيه',
        variants: [
          { labelEn: 'Regular', labelAr: 'ريجولار', price: 9000 },
          { labelEn: 'Large', labelAr: 'كبير', price: 10500 }
        ]
      },
      {
        slug: 'matcha-espresso-fusion',
        nameEn: 'Matcha Espresso Fusion',
        nameAr: 'ماتشا إسبريسو فيوجن',
        variants: [{ labelEn: 'Regular', labelAr: 'ريجولار', price: 9500 }]
      }
    ]
  },
  {
    slug: 'smoothies',
    nameEn: 'Smoothies',
    nameAr: 'سموذي',
    items: [
      {
        slug: 'mango-smoothie',
        nameEn: 'Mango Smoothie',
        nameAr: 'سموذي مانجو',
        variants: [{ labelEn: 'Regular', labelAr: 'ريجولار', price: 7500 }]
      },
      {
        slug: 'strawberry-smoothie',
        nameEn: 'Strawberry Smoothie',
        nameAr: 'سموذي فراولة',
        variants: [{ labelEn: 'Regular', labelAr: 'ريجولار', price: 7500 }]
      },
      {
        slug: 'mixed-berry-smoothie',
        nameEn: 'Mixed Berry Smoothie',
        nameAr: 'سموذي توت مشكل',
        variants: [{ labelEn: 'Regular', labelAr: 'ريجولار', price: 8000 }]
      },
      {
        slug: 'banana-peanut-smoothie',
        nameEn: 'Banana Peanut Butter Smoothie',
        nameAr: 'سموذي موز وزبدة الفول السوداني',
        variants: [{ labelEn: 'Regular', labelAr: 'ريجولار', price: 8000 }]
      },
      {
        slug: 'avocado-smoothie',
        nameEn: 'Avocado Smoothie',
        nameAr: 'سموذي أفوكادو',
        variants: [{ labelEn: 'Regular', labelAr: 'ريجولار', price: 8500 }]
      }
    ]
  },
  {
    slug: 'fresh-juices',
    nameEn: 'Fresh Juices',
    nameAr: 'عصائر طازجة',
    items: [
      {
        slug: 'orange-juice',
        nameEn: 'Fresh Orange Juice',
        nameAr: 'عصير برتقال',
        variants: [{ labelEn: 'Regular', labelAr: 'ريجولار', price: 6000 }]
      },
      {
        slug: 'lemon-mint-juice',
        nameEn: 'Lemon & Mint',
        nameAr: 'ليمون ونعناع',
        variants: [{ labelEn: 'Regular', labelAr: 'ريجولار', price: 5500 }]
      },
      {
        slug: 'watermelon-juice',
        nameEn: 'Watermelon Juice',
        nameAr: 'عصير بطيخ',
        variants: [{ labelEn: 'Regular', labelAr: 'ريجولار', price: 5500 }]
      },
      {
        slug: 'cocktail-juice',
        nameEn: 'Cocktail Juice',
        nameAr: 'كوكتيل',
        variants: [{ labelEn: 'Regular', labelAr: 'ريجولار', price: 7000 }]
      },
      {
        slug: 'sugarcane-juice',
        nameEn: 'Sugarcane Juice',
        nameAr: 'عصير قصب',
        variants: [{ labelEn: 'Regular', labelAr: 'ريجولار', price: 5000 }]
      }
    ]
  },
  {
    slug: 'mojitos',
    nameEn: 'Mojitos',
    nameAr: 'موهيتو',
    items: [
      {
        slug: 'classic-mojito',
        nameEn: 'Classic Mojito',
        nameAr: 'موهيتو كلاسيك',
        variants: [{ labelEn: 'Regular', labelAr: 'ريجولار', price: 6500 }]
      },
      {
        slug: 'strawberry-mojito',
        nameEn: 'Strawberry Mojito',
        nameAr: 'موهيتو فراولة',
        variants: [{ labelEn: 'Regular', labelAr: 'ريجولار', price: 7000 }]
      },
      {
        slug: 'passion-fruit-mojito',
        nameEn: 'Passion Fruit Mojito',
        nameAr: 'موهيتو باشون فروت',
        variants: [{ labelEn: 'Regular', labelAr: 'ريجولار', price: 7000 }]
      },
      {
        slug: 'blue-mojito',
        nameEn: 'Blue Mojito',
        nameAr: 'موهيتو أزرق',
        variants: [{ labelEn: 'Regular', labelAr: 'ريجولار', price: 7000 }]
      }
    ]
  },
  {
    slug: 'croffle',
    nameEn: 'Croffle',
    nameAr: 'كروفل',
    items: [
      {
        slug: 'plain-croffle',
        nameEn: 'Plain Croffle',
        nameAr: 'كروفل سادة',
        descriptionEn: 'Buttery croissant-waffle, dusted with sugar.',
        descriptionAr: 'كرواسون وافل بالزبدة مرشوش بالسكر.',
        variants: [{ labelEn: 'Regular', labelAr: 'ريجولار', price: 6000 }]
      },
      {
        slug: 'nutella-croffle',
        nameEn: 'Nutella Croffle',
        nameAr: 'كروفل نوتيلا',
        featured: true,
        variants: [{ labelEn: 'Regular', labelAr: 'ريجولار', price: 8500 }]
      },
      {
        slug: 'lotus-croffle',
        nameEn: 'Lotus Croffle',
        nameAr: 'كروفل لوتس',
        featured: true,
        variants: [{ labelEn: 'Regular', labelAr: 'ريجولار', price: 8500 }]
      },
      {
        slug: 'pistachio-croffle',
        nameEn: 'Pistachio Croffle',
        nameAr: 'كروفل فستق',
        featured: true,
        variants: [{ labelEn: 'Regular', labelAr: 'ريجولار', price: 9500 }]
      },
      {
        slug: 'cheese-croffle',
        nameEn: 'Cheese Croffle',
        nameAr: 'كروفل جبنة',
        variants: [{ labelEn: 'Regular', labelAr: 'ريجولار', price: 8000 }]
      },
      {
        slug: 'chocolate-hazelnut-croffle',
        nameEn: 'Chocolate Hazelnut Croffle',
        nameAr: 'كروفل شوكولاتة بالبندق',
        variants: [{ labelEn: 'Regular', labelAr: 'ريجولار', price: 9000 }]
      }
    ]
  },
  {
    slug: 'bakery',
    nameEn: 'Bakery',
    nameAr: 'مخبوزات',
    items: [
      {
        slug: 'butter-croissant',
        nameEn: 'Butter Croissant',
        nameAr: 'كرواسون زبدة',
        variants: [{ labelEn: 'Regular', labelAr: 'ريجولار', price: 4500 }]
      },
      {
        slug: 'chocolate-croissant',
        nameEn: 'Chocolate Croissant',
        nameAr: 'كرواسون شوكولاتة',
        variants: [{ labelEn: 'Regular', labelAr: 'ريجولار', price: 5500 }]
      },
      {
        slug: 'cheese-danish',
        nameEn: 'Cheese Danish',
        nameAr: 'دانش جبنة',
        variants: [{ labelEn: 'Regular', labelAr: 'ريجولار', price: 6000 }]
      },
      {
        slug: 'cinnamon-roll',
        nameEn: 'Cinnamon Roll',
        nameAr: 'سينا رول',
        variants: [{ labelEn: 'Regular', labelAr: 'ريجولار', price: 6000 }]
      },
      {
        slug: 'cookie',
        nameEn: 'Chocolate Chip Cookie',
        nameAr: 'كوكيز شوكولاتة',
        variants: [{ labelEn: 'Regular', labelAr: 'ريجولار', price: 3500 }]
      }
    ]
  },
  {
    slug: 'sandwiches',
    nameEn: 'Sandwiches',
    nameAr: 'ساندويتشات',
    items: [
      {
        slug: 'croissant-sandwich-turkey',
        nameEn: 'Turkey Cheese Croissant Sandwich',
        nameAr: 'ساندويتش كرواسون تركي وجبنة',
        variants: [{ labelEn: 'Regular', labelAr: 'ريجولار', price: 11000 }]
      },
      {
        slug: 'croissant-sandwich-chicken',
        nameEn: 'Chicken Pesto Croissant Sandwich',
        nameAr: 'ساندويتش كرواسون دجاج بيستو',
        variants: [{ labelEn: 'Regular', labelAr: 'ريجولار', price: 11500 }]
      },
      {
        slug: 'foul-sandwich',
        nameEn: 'Foul Sandwich',
        nameAr: 'ساندويتش فول',
        variants: [{ labelEn: 'Regular', labelAr: 'ريجولار', price: 4500 }]
      },
      {
        slug: 'cheese-tomato-sandwich',
        nameEn: 'Cheese & Tomato Sandwich',
        nameAr: 'ساندويتش جبنة وطماطم',
        variants: [{ labelEn: 'Regular', labelAr: 'ريجولار', price: 5500 }]
      },
      {
        slug: 'halloumi-sandwich',
        nameEn: 'Halloumi Sandwich',
        nameAr: 'ساندويتش حلومي',
        variants: [{ labelEn: 'Regular', labelAr: 'ريجولار', price: 9500 }]
      }
    ]
  },
  {
    slug: 'salads',
    nameEn: 'Salads',
    nameAr: 'سلطات',
    items: [
      {
        slug: 'caesar-salad',
        nameEn: 'Caesar Salad',
        nameAr: 'سلطة سيزر',
        variants: [{ labelEn: 'Regular', labelAr: 'ريجولار', price: 9500 }]
      },
      {
        slug: 'greek-salad',
        nameEn: 'Greek Salad',
        nameAr: 'سلطة يوناني',
        variants: [{ labelEn: 'Regular', labelAr: 'ريجولار', price: 8500 }]
      },
      {
        slug: 'fruit-salad',
        nameEn: 'Fruit Salad',
        nameAr: 'سلطة فواكه',
        variants: [{ labelEn: 'Regular', labelAr: 'ريجولار', price: 7000 }]
      }
    ]
  },
  {
    slug: 'desserts',
    nameEn: 'Desserts',
    nameAr: 'حلويات',
    items: [
      {
        slug: 'basque-cheesecake',
        nameEn: 'Basque Cheesecake',
        nameAr: 'تشيز كيك باسك',
        variants: [{ labelEn: 'Slice', labelAr: 'قطعة', price: 9500 }]
      },
      {
        slug: 'brownie',
        nameEn: 'Chocolate Brownie',
        nameAr: 'براوني شوكولاتة',
        variants: [{ labelEn: 'Regular', labelAr: 'ريجولار', price: 7000 }]
      },
      {
        slug: 'lotus-cheesecake',
        nameEn: 'Lotus Cheesecake',
        nameAr: 'تشيز كيك لوتس',
        variants: [{ labelEn: 'Slice', labelAr: 'قطعة', price: 9000 }]
      },
      {
        slug: 'molten-cake',
        nameEn: 'Molten Chocolate Cake',
        nameAr: 'كيك شوكولاتة سايح',
        variants: [{ labelEn: 'Regular', labelAr: 'ريجولار', price: 8500 }]
      },
      {
        slug: 'rice-pudding',
        nameEn: 'Rice Pudding',
        nameAr: 'رز بلبن',
        variants: [{ labelEn: 'Regular', labelAr: 'ريجولار', price: 5500 }]
      }
    ]
  }
];

/**
 * Add-ons with their applicable categories (comma-separated slugs; empty = all).
 * ASSUMED applicability rules — the owner must confirm; editable in Admin > Menu > Add-ons.
 */
export const ADD_ONS = [
  { slug: 'extra-shot', nameEn: 'Extra espresso shot', nameAr: 'جرعة إسبريسو إضافية', price: 2000, categories: 'espresso,cold-coffee' },
  { slug: 'oat-milk', nameEn: 'Oat milk', nameAr: 'حليب شوفان', price: 1500, categories: 'espresso,cold-coffee,matcha' },
  { slug: 'almond-milk', nameEn: 'Almond milk', nameAr: 'حليب لوز', price: 1500, categories: 'espresso,cold-coffee,matcha' },
  { slug: 'extra-caramel', nameEn: 'Caramel syrup', nameAr: 'كراميل', price: 1000, categories: 'espresso,cold-coffee,hot-chocolate' },
  { slug: 'extra-vanilla', nameEn: 'Vanilla syrup', nameAr: 'فانيليا', price: 1000, categories: 'espresso,cold-coffee,hot-chocolate' },
  { slug: 'ice-cream-scoop', nameEn: 'Vanilla ice cream scoop', nameAr: 'كورة آيس كريم فانيليا', price: 2500, categories: 'croffle,desserts' },
  { slug: 'whipped-cream', nameEn: 'Whipped cream', nameAr: 'كريمة مخفوقة', price: 1000, categories: 'croffle,hot-chocolate,mojitos,smoothies,fresh-juices,desserts,cold-coffee' }
];
