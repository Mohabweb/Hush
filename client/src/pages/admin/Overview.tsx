import { useEffect, useState } from 'react';
import { adminApi } from '../../api.js';
import { useLang } from '../../i18n.jsx';

export default function Overview() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { adminApi.dashboard().then(setData).catch(() => {}); }, []);
  if (!data) return <p className="muted">Loading…</p>;
  return (
    <div>
      <h1>Overview</h1>
      <div className="stat-grid">
        <Stat label="New orders" value={data.totals.ordersNew} />
        <Stat label="Open orders" value={data.totals.ordersOpen} />
        <Stat label="Orders (24h)" value={data.totals.ordersToday} />
        <Stat label="Revenue (24h)" value={`${(data.totals.revenueToday / 100).toFixed(0)} EGP`} />
        <Stat label="New messages" value={data.totals.messagesNew} />
        <Stat label="New reservations" value={data.totals.reservationsNew} />
      </div>
      <section>
        <h2>Recent orders</h2>
        <table className="admin-table">
          <thead><tr><th>Ref</th><th>Status</th><th>Customer</th><th>Total</th></tr></thead>
          <tbody>
            {data.recent.map((o: any) => (
              <tr key={o.ref}><td>{o.ref}</td><td>{o.status}</td><td>{o.customer_name}</td><td>{(o.total / 100).toFixed(0)} EGP</td></tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="stat-card">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

export { useLang };
