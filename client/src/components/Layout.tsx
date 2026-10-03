import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useLang } from '../i18n.jsx';
import { useCart } from '../cart.jsx';
import { api, type ApiConfig } from '../api.js';

export default function Layout() {
  const { lang, setLang, t } = useLang();
  const { count } = useCart();
  const [cfg, setCfg] = useState<ApiConfig | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    api.config().then(setCfg).catch(() => {});
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const banner = cfg?.banner?.enabled ? (lang === 'ar' ? cfg.banner.textAr : cfg.banner.textEn) : null;

  return (
    <div className="site">
      <a className="skip-link" href="#main">Skip to content</a>
      {banner ? <div className="banner" role="note">{banner}</div> : null}
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="brand" aria-label="HUSH home">
            <img src="/img/logo-mark.png" alt="" width="34" height="34" />
            <span className="brand-word">HUSH</span>
          </Link>
          <nav className="main-nav" aria-label="Main">
            <NavLink to="/">{t.nav.home}</NavLink>
            <NavLink to="/menu">{t.nav.menu}</NavLink>
            <NavLink to="/about">{t.nav.about}</NavLink>
            <NavLink to="/locations">{t.nav.locations}</NavLink>
            <NavLink to="/reviews">{t.nav.reviews}</NavLink>
            <NavLink to="/contact">{t.nav.contact}</NavLink>
          </nav>
          <div className="header-actions">
            <button className="lang-btn" onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} aria-label="Switch language">
              {lang === 'en' ? 'عربي' : 'EN'}
            </button>
            <button className="cart-btn" onClick={() => setDrawerOpen(true)} aria-label={`${t.nav.cart} (${count})`}>
              {t.nav.cart}{count > 0 ? <span className="cart-count">{count}</span> : null}
            </button>
          </div>
        </div>
      </header>

      <main id="main" className="site-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <div>
            <div className="brand-word gold">HUSH</div>
            <p>{t.footer.tagline}</p>
            {cfg?.site?.instagram ? <a href={cfg.site.instagram} rel="noopener noreferrer" target="_blank">Instagram</a> : null}
          </div>
          <div className="footer-links">
            <Link to="/privacy">{t.footer.legal}</Link>
            <Link to="/terms">{t.footer.terms}</Link>
            <Link to="/admin">{t.nav.admin}</Link>
          </div>
        </div>
      </footer>

      <CartDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}

function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { cart, count, total, setQuantity, removeLine, clear } = useCart();
  const { lang, t } = useLang();
  if (!open) return null;
  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={t.cart.title} onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <h2>{t.cart.title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label={t.common.close}>✕</button>
        </div>
        {count === 0 ? (
          <p className="muted">{t.cart.empty}</p>
        ) : (
          <>
            <ul className="cart-lines">
              {cart.lines.map((l) => {
                const addonSum = l.addOns.reduce((a, x) => a + x.price * x.quantity, 0);
                return (
                  <li key={l.key}>
                    <div className="cart-line-main">
                      <span>{lang === 'ar' ? l.nameAr : l.name}{l.variantLabel ? <em> · {lang === 'ar' && l.variantLabelAr ? l.variantLabelAr : l.variantLabel}</em> : null}</span>
                      <span className="price">{((l.unitPrice + addonSum) * l.quantity / 100).toFixed(0)} {lang === 'ar' ? 'جنيه' : 'EGP'}</span>
                    </div>
                    {l.addOns.length > 0 ? (
                      <div className="cart-line-addons">
                        {l.addOns.map((a) => <small key={a.slug}>+ {lang === 'ar' ? a.nameAr : a.name} ×{a.quantity}</small>)}
                      </div>
                    ) : null}
                    <div className="cart-line-qty">
                      <button onClick={() => setQuantity(l.key, l.quantity - 1)} aria-label="−">−</button>
                      <span>{l.quantity}</span>
                      <button onClick={() => setQuantity(l.key, l.quantity + 1)} aria-label="+">+</button>
                      <button className="link-danger" onClick={() => removeLine(l.key)}>{t.common.close}</button>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="cart-total">
              <span>{t.cart.total}</span>
              <strong>{(total / 100).toFixed(0)} {lang === 'ar' ? 'جنيه' : 'EGP'}</strong>
            </div>
            <Link to="/checkout" className="btn btn-olive" onClick={onClose}>{t.cart.checkout}</Link>
            <button className="link-muted" onClick={clear}>{t.cart.clear}</button>
            <p className="muted small">{t.cart.pickupNote}</p>
          </>
        )}
      </aside>
    </div>
  );
}
