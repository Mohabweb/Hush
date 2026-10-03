import { useEffect, useState } from 'react';
import { adminApi } from '../../api.js';

export default function OrdersAdmin() {
  const [orders, setOrders] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [detail, setDetail] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try { setOrders((await adminApi.orders(statusFilter || undefined)).orders); }
    catch (e) { setError(e instanceof Error ? e.message : 'Failed'); }
  }
  useEffect(() => { load(); /* eslint-disable-line */ }, [statusFilter]);

  async function patch(ref: string, body: Record<string, unknown>) {
    try {
      await adminApi.patchOrder(ref, body);
      await load();
      if (detail?.ref === ref) setDetail((await adminApi.order(ref)).order);
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed'); }
  }

  return (
    <div>
      <h1>Orders</h1>
      {error ? <p className="form-error">{error}</p> : null}
      <div className="filter-row">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter by status">
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <table className="admin-table">
        <thead><tr><th>Ref</th><th>Status</th><th>Payment</th><th>Customer</th><th>Total</th><th>Actions</th></tr></thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.ref}>
              <td><button className="link" onClick={async () => setDetail((await adminApi.order(o.ref)).order)}>{o.ref}</button></td>
              <td><span className={`status-pill status-${o.status}`}>{o.status}</span></td>
              <td>{o.paymentStatus}</td>
              <td>{o.customerName}</td>
              <td>{(o.total / 100).toFixed(0)} EGP</td>
              <td>
                <select value={o.status} onChange={(e) => patch(o.ref, { status: e.target.value })} aria-label={`Status for ${o.ref}`}>
                  <option value={o.status}>{o.status}</option>
                  {nextStatuses(o.status).map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={o.paymentStatus} onChange={(e) => patch(o.ref, { paymentStatus: e.target.value })} aria-label={`Payment for ${o.ref}`}>
                  <option value={o.paymentStatus}>{o.paymentStatus}</option>
                  <option value={o.paymentStatus === 'paid' ? 'unpaid' : 'paid'}>{o.paymentStatus === 'paid' ? 'unpaid' : 'paid'}</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {detail && (
        <dialog open className="admin-dialog" aria-label={`Order ${detail.ref}`}>
          <h2>Order {detail.ref}</h2>
          <p><span className={`status-pill status-${detail.status}`}>{detail.status}</span> · {detail.paymentStatus} · {(detail.total / 100).toFixed(0)} EGP</p>
          <p>{detail.customerName} · {detail.customerPhone}</p>
          {detail.note ? <p>Note: {detail.note}</p> : null}
          <table className="admin-table">
            <tbody>
              {(detail.lines || []).map((l: any, i: number) => (
                <tr key={i}>
                  <td>{l.item_name_en}{l.variant_label_en ? ` (${l.variant_label_en})` : ''} ×{l.quantity}</td>
                  <td>{(l.line_total / 100).toFixed(0)} EGP</td>
                </tr>
              ))}
            </tbody>
          </table>
          <label>Staff notes
            <textarea defaultValue={detail.staffNotes || ''} rows={2} onBlur={(e) => patch(detail.ref, { staffNotes: e.target.value })} />
          </label>
          <div className="dialog-actions">
            <button className="btn btn-ghost-light" onClick={() => setDetail(null)}>Close</button>
            <button className="btn btn-rust" onClick={async () => { if (confirm(`Erase order ${detail.ref}? This cannot be undone.`)) { await adminApi.eraseOrder(detail.ref); setDetail(null); load(); } }}>Erase</button>
          </div>
        </dialog>
      )}
    </div>
  );
}

function nextStatuses(status: string): string[] {
  const map: Record<string, string[]> = {
    new: ['preparing', 'cancelled'],
    preparing: ['ready', 'cancelled'],
    ready: ['completed', 'cancelled'],
    completed: [],
    cancelled: []
  };
  return map[status] || [];
}

const ORDER_STATUSES = ['new', 'preparing', 'ready', 'completed', 'cancelled'] as const;
