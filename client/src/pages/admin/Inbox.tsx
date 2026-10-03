import { useEffect, useState } from 'react';
import { adminApi } from '../../api.js';

export default function Inbox() {
  const [messages, setMessages] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);

  async function load() {
    const [m, r] = await Promise.all([adminApi.messages(), adminApi.reservations()]);
    setMessages(m.messages);
    setReservations(r.reservations);
  }
  useEffect(() => { load().catch(() => {}); }, []);

  return (
    <div>
      <h1>Inbox</h1>
      <section>
        <h2>Messages</h2>
        <table className="admin-table">
          <thead><tr><th>From</th><th>Message</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {messages.map((m) => (
              <tr key={m.id}>
                <td>{m.name}<br /><small className="muted">{m.email || m.phone || ''}</small></td>
                <td>{m.message}</td>
                <td>{m.status}</td>
                <td>
                  <button className="link" onClick={async () => { await adminApi.patchMessage(m.id, m.status === 'read' ? 'archived' : 'read'); load(); }}>
                    {m.status === 'new' ? 'Mark read' : 'Archive'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section>
        <h2>Reservation requests</h2>
        <table className="admin-table">
          <thead><tr><th>Name</th><th>Date</th><th>Party</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {reservations.map((r) => (
              <tr key={r.id}>
                <td>{r.name}<br /><small className="muted">{r.phone}</small></td>
                <td>{r.date} {r.time || ''}</td>
                <td>{r.party_size}</td>
                <td>{r.status}</td>
                <td>
                  {r.status === 'new' && (<>
                    <button className="link" onClick={async () => { await adminApi.patchReservation(r.id, 'confirmed'); load(); }}>Confirm</button>{' '}
                    <button className="link" onClick={async () => { await adminApi.patchReservation(r.id, 'declined'); load(); }}>Decline</button>
                  </>)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
