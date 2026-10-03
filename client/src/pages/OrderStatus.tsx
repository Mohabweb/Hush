import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLang } from '../i18n.jsx';
import { api, type ApiOrderStatus } from '../api.js';
import { formatEGP } from '../cart.jsx';

export default function OrderStatus() {
  const { lang, t } = useLang();
  const [params] = useSearchParams();
  const ref = params.get('ref') || '';
  const token = params.get('t') || '';
  const [order, setOrder] = useState<ApiOrderStatus | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!ref || !token) return;
    let stop = false;
    async function poll() {
      try {
        const o = await api.orderStatus(ref, token);
        if (!stop) { setOrder(o); setError(false); }
      } catch {
        if (!stop) setError(true);
      }
    }
    poll();
    const iv = setInterval(poll, 10000);
    return () => { stop = true; clearInterval(iv); };
  }, [ref, token]);

  if (!ref || !token) {
    return <div className="container order-page"><h1>{t.order.title}</h1><p className="muted">{t.order.notFound}</p></div>;
  }

  return (
    <div className="container order-page">
      <h1>{t.order.title}</h1>
      <p className="order-ref">{t.order.refLabel}: <strong>{ref}</strong></p>
      {error ? <p className="form-error">{t.order.notFound}</p> : null}
      {!order && !error ? <p className="muted">{t.order.loading}</p> : null}
      {order && (
        <>
          <p className={`status-pill status-${order.status}`}>
            {(t.order.status as Record<string, string>)[order.status] || order.status}
          </p>
          <ul className="order-lines">
            {order.lines.map((l, i) => (
              <li key={i}>
                <span>{lang === 'ar' ? l.nameAr : l.nameEn}{l.variantAr || l.variantEn ? ` · ${lang === 'ar' ? l.variantAr : l.variantEn}` : ''} ×{l.quantity}</span>
                <strong>{formatEGP(l.lineTotal, lang)}</strong>
              </li>
            ))}
          </ul>
          <div className="cart-total">
            <span>{t.cart.total}</span>
            <strong>{formatEGP(order.total, lang)}</strong>
          </div>
          <p className="muted small">{t.cart.pickupNote}</p>
        </>
      )}
    </div>
  );
}
