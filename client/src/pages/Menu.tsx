import { useEffect, useMemo, useState } from 'react';
import { useLang } from '../i18n.jsx';
import { api, type ApiMenu, type ApiItem, type ApiVariant } from '../api.js';
import { formatEGP, useCart } from '../cart.jsx';

export default function Menu() {
  const { lang, t } = useLang();
  const [menu, setMenu] = useState<ApiMenu | null>(null);
  const [query, setQuery] = useState('');
  const [activeCat, setActiveCat] = useState<string>('all');

  useEffect(() => {
    api.menu().then(setMenu).catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    if (!menu) return [];
    const q = query.trim().toLowerCase();
    return menu.categories
      .filter((c) => activeCat === 'all' || c.slug === activeCat)
      .map((c) => ({
        ...c,
        items: c.items.filter((it) =>
          !q || it.nameEn.toLowerCase().includes(q) || it.nameAr.includes(query.trim()) || (it.description || '').toLowerCase().includes(q)
        )
      }))
      .filter((c) => c.items.length > 0);
  }, [menu, query, activeCat]);

  if (!menu) return <div className="page-loading">{t.common.loading}</div>;

  return (
    <div className="container menu-page">
      <h1>{t.menu.title}</h1>
      <input
        type="search"
        className="menu-search"
        placeholder={t.menu.search}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label={t.menu.search}
      />
      <nav className="cat-nav" aria-label="Categories">
        <button className={activeCat === 'all' ? 'cat active' : 'cat'} onClick={() => setActiveCat('all')}>{lang === 'ar' ? 'الكل' : 'All'}</button>
        {menu.categories.map((c) => (
          <button key={c.slug} className={activeCat === c.slug ? 'cat active' : 'cat'} onClick={() => setActiveCat(c.slug)}>{c.name}</button>
        ))}
      </nav>

      {filtered.length === 0 ? <p className="muted">{t.menu.empty}</p> : null}

      {filtered.map((cat) => (
        <section key={cat.slug} className="menu-section">
          <h2 className="section-title">{cat.name}</h2>
          <div className="menu-list">
            {cat.items.map((item) => (
              <MenuItem key={item.slug} item={item} addOns={menu.addOns.filter((ao) => ao.appliesTo.length === 0 || ao.appliesTo.includes(cat.slug))} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function MenuItem({ item, addOns }: { item: ApiItem; addOns: { slug: string; name: string; price: number }[] }) {
  const { lang, t } = useLang();
  const { addLine } = useCart();
  const [variant, setVariant] = useState<ApiVariant | null>(item.variants[0] ?? null);
  const [selectedAddOns, setSelectedAddOns] = useState<Record<string, number>>({});

  const addonTotal = Object.entries(selectedAddOns).reduce((sum, [slug, qty]) => {
    const ao = addOns.find((a) => a.slug === slug);
    return sum + (ao ? ao.price * qty : 0);
  }, 0);

  const available = item.isAvailable && (!item.variants.length || item.variants.some((v) => v.isAvailable));

  function add() {
    if (!variant) return;
    addLine({
      itemSlug: item.slug,
      name: item.nameEn,
      nameAr: item.nameAr,
      variantId: variant.id,
      variantLabel: variant.labelEn,
      variantLabelAr: variant.labelAr,
      unitPrice: variant.price,
      quantity: 1,
      addOns: Object.entries(selectedAddOns).flatMap(([slug, qty]) => {
        const ao = addOns.find((a) => a.slug === slug);
        return ao && qty > 0 ? [{ slug, name: ao.name, nameAr: ao.name, price: ao.price, quantity: qty }] : [];
      })
    });
  }

  return (
    <article className={available ? 'menu-item' : 'menu-item unavailable'}>
      <div className="menu-item-head">
        <h3>{lang === 'ar' ? item.nameAr : item.name}</h3>
        <span className="dots" aria-hidden="true" />
        <span className="price">
          {variant ? formatEGP(variant.price + addonTotal, lang) : item.variants.length > 1 ? `${t.menu.from} ${formatEGP(Math.min(...item.variants.map((v) => v.price)), lang)}` : ''}
        </span>
      </div>
      {item.description ? <p className="muted desc">{item.description}</p> : null}
      {!available ? <p className="badge-unavailable">{t.menu.unavailable}</p> : null}
      {available && item.variants.length > 1 && (
        <div className="variant-row" role="radiogroup" aria-label={t.menu.chooseSize}>
          {item.variants.filter((v) => v.isAvailable).map((v) => (
            <button key={v.id} role="radio" aria-checked={variant?.id === v.id} className={variant?.id === v.id ? 'chip active' : 'chip'} onClick={() => setVariant(v)}>
              {lang === 'ar' ? v.labelAr : v.label} · {formatEGP(v.price, lang)}
            </button>
          ))}
        </div>
      )}
      {available && addOns.length > 0 && (
        <div className="addon-row">
          {addOns.map((ao) => {
            const qty = selectedAddOns[ao.slug] || 0;
            return (
              <button
                key={ao.slug}
                className={qty > 0 ? 'chip active' : 'chip'}
                onClick={() => setSelectedAddOns((s) => ({ ...s, [ao.slug]: (qty + 1) % 3 }))}
                title={`${ao.name} · ${formatEGP(ao.price, lang)}`}
              >
                + {ao.name}{qty > 0 ? ` ×${qty}` : ''}
              </button>
            );
          })}
        </div>
      )}
      {available && (
        <button className="btn btn-olive small-btn" onClick={add}>
          {t.menu.addToCart}
        </button>
      )}
    </article>
  );
}
