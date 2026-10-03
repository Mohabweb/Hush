// Cart state in localStorage "hush-cart-v1" with a live count.
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export interface CartAddOn {
  slug: string;
  name: string;
  nameAr: string;
  price: number;
  quantity: number;
}

export interface CartLine {
  key: string;
  itemSlug: string;
  name: string;
  nameAr: string;
  variantId?: number;
  variantLabel?: string;
  variantLabelAr?: string;
  unitPrice: number; // piastres, from the API only
  quantity: number;
  addOns: CartAddOn[];
}

export interface Cart {
  lines: CartLine[];
  branchSlug: string | null;
}

const STORAGE_KEY = 'hush-cart-v1';

function load(): Cart {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { lines: [], branchSlug: null };
    const parsed = JSON.parse(raw) as Cart;
    if (!Array.isArray(parsed.lines)) return { lines: [], branchSlug: null };
    return parsed;
  } catch {
    return { lines: [], branchSlug: null };
  }
}

interface CartCtx {
  cart: Cart;
  count: number;
  total: number; // piastres, display only — the server always recomputes
  addLine: (line: Omit<CartLine, 'key'>) => void;
  setQuantity: (key: string, qty: number) => void;
  removeLine: (key: string) => void;
  clear: () => void;
  setBranch: (slug: string) => void;
}

const Ctx = createContext<CartCtx | null>(null);

function lineKey(l: Omit<CartLine, 'key'>): string {
  const addons = l.addOns.map((a) => `${a.slug}x${a.quantity}`).sort().join(',');
  return `${l.itemSlug}|${l.variantId ?? ''}|${addons}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const value = useMemo<CartCtx>(() => {
    const count = cart.lines.reduce((s, l) => s + l.quantity, 0);
    const total = cart.lines.reduce((s, l) => {
      const addonSum = l.addOns.reduce((a, x) => a + x.price * x.quantity, 0);
      return s + (l.unitPrice + addonSum) * l.quantity;
    }, 0);
    return {
      cart,
      count,
      total,
      addLine: (line) =>
        setCart((c) => {
          const key = lineKey(line);
          const existing = c.lines.find((l) => l.key === key);
          if (existing) {
            return {
              ...c,
              lines: c.lines.map((l) => (l.key === key ? { ...l, quantity: Math.min(20, l.quantity + line.quantity) } : l))
            };
          }
          return { ...c, lines: [...c.lines, { ...line, key }] };
        }),
      setQuantity: (key, qty) =>
        setCart((c) => ({
          ...c,
          lines: qty <= 0 ? c.lines.filter((l) => l.key !== key) : c.lines.map((l) => (l.key === key ? { ...l, quantity: Math.min(20, qty) } : l))
        })),
      removeLine: (key) => setCart((c) => ({ ...c, lines: c.lines.filter((l) => l.key !== key) })),
      clear: () => setCart((c) => ({ ...c, lines: [] })),
      setBranch: (slug) => setCart((c) => ({ ...c, branchSlug: slug }))
    };
  }, [cart]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart(): CartCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

/** Format piastres as an EGP string. */
export function formatEGP(piastres: number, lang: string): string {
  const egp = piastres / 100;
  return lang === 'ar' ? `${egp.toFixed(0)} جنيه` : `${egp.toFixed(0)} EGP`;
}
