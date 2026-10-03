import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '../i18n.jsx';
import { api, type ApiBranch } from '../api.js';
import { useCart, formatEGP } from '../cart.jsx';

export default function Checkout() {
  const { lang, t } = useLang();
  const { cart, total, setBranch, clear } = useCart();
  const navigate = useNavigate();
  const [branches, setBranches] = useState<ApiBranch[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.branches().then((r) => setBranches(r.branches)).catch(() => {});
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !phone.trim() || !cart.branchSlug) {
      setError(t.checkout.required);
      return;
    }
    setBusy(true);
    try {
      const result = await api.order({
        branchSlug: cart.branchSlug,
        customerName: name.trim(),
        customerPhone: phone.trim(),
        note: note.trim() || undefined,
        lang,
        // honeypot field left empty
        website: '',
        lines: cart.lines.map((l) => ({
          itemSlug: l.itemSlug,
          variantId: l.variantId,
          quantity: l.quantity,
          addOns: l.addOns.map((a) => ({ slug: a.slug, quantity: a.quantity }))
        }))
      });
      clear();
      navigate(`/order?ref=${encodeURIComponent(result.ref)}&t=${encodeURIComponent(result.token)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.error);
    } finally {
      setBusy(false);
    }
  }

  if (cart.lines.length === 0) {
    return (
      <div className="container checkout-page">
        <h1>{t.cart.title}</h1>
        <p className="muted">{t.cart.empty}</p>
        <Link className="btn btn-olive" to="/menu">{t.nav.menu}</Link>
      </div>
    );
  }

  return (
    <div className="container checkout-page">
      <h1>{t.checkout.title}</h1>
      <div className="checkout-grid">
        <form onSubmit={submit} className="checkout-form" noValidate>
          <label>
            {t.checkout.name}
            <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} autoComplete="name" />
          </label>
          <label>
            {t.checkout.phone}
            <input value={phone} onChange={(e) => setPhone(e.target.value)} required type="tel" autoComplete="tel" />
          </label>
          <label>
            {t.checkout.branch}
            <select value={cart.branchSlug || ''} onChange={(e) => setBranch(e.target.value)} required>
              <option value="" disabled>—</option>
              {branches.map((b) => <option key={b.slug} value={b.slug}>{b.name}</option>)}
            </select>
          </label>
          <label>
            {t.checkout.note}
            <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} rows={3} />
          </label>
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <button className="btn btn-olive" type="submit" disabled={busy}>{busy ? t.checkout.placing : t.checkout.place}</button>
          <p className="muted small">{t.cart.pickupNote}</p>
        </form>
        <aside className="checkout-summary" aria-label={t.cart.title}>
          <h2>{t.cart.title}</h2>
          <ul>
            {cart.lines.map((l) => {
              const addonSum = l.addOns.reduce((a, x) => a + x.price * x.quantity, 0);
              return (
                <li key={l.key}>
                  <span>{lang === 'ar' ? l.nameAr : l.name}{l.variantLabel ? ` · ${lang === 'ar' && l.variantLabelAr ? l.variantLabelAr : l.variantLabel}` : ''} ×{l.quantity}</span>
                  <strong>{formatEGP((l.unitPrice + addonSum) * l.quantity, lang)}</strong>
                </li>
              );
            })}
          </ul>
          <div className="cart-total">
            <span>{t.cart.total}</span>
            <strong>{formatEGP(total, lang)}</strong>
          </div>
        </aside>
      </div>
    </div>
  );
}
