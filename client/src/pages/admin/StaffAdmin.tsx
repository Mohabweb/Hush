import { useEffect, useState } from 'react';
import { adminApi, type AdminSession } from '../../api.js';

export default function StaffAdmin({ session }: { session: AdminSession }) {
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ email: '', name: '', password: '', role: 'staff' });

  async function load() { setUsers((await adminApi.staff()).users); }
  useEffect(() => { load().catch((e) => setError(e instanceof Error ? e.message : 'Failed')); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await adminRequestJson('/staff', 'POST', form);
      setForm({ email: '', name: '', password: '', role: 'staff' });
      await load();
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed'); }
  }

  async function patchUser(id: number, body: Record<string, unknown>) {
    setError(null);
    try {
      await adminRequestJson(`/staff/${id}`, 'PATCH', body);
      await load();
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed'); }
  }

  return (
    <div>
      <h1>Staff</h1>
      {error ? <p className="form-error">{error}</p> : null}
      <table className="admin-table">
        <thead><tr><th>Email</th><th>Name</th><th>Role</th><th>Disabled</th></tr></thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.email}</td><td>{u.name}</td>
              <td>
                <select value={u.role} onChange={(e) => patchUser(u.id, { role: e.target.value })} aria-label={`Role for ${u.email}`}>
                  <option value="admin">admin</option><option value="manager">manager</option><option value="staff">staff</option>
                </select>
              </td>
              <td>
                <input type="checkbox" checked={!!u.disabled} onChange={(e) => patchUser(u.id, { disabled: e.target.checked })} aria-label={`Disabled for ${u.email}`} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <section>
        <h2>Add staff member</h2>
        <form onSubmit={create} className="admin-edit-form">
          <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
          <label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
          <label>Password (min 10 chars)<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={10} /></label>
          <label>Role
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="staff">staff</option><option value="manager">manager</option><option value="admin">admin</option>
            </select>
          </label>
          <button className="btn btn-olive" type="submit">Create</button>
        </form>
      </section>
    </div>
  );
}

function adminRequestJson(path: string, method: string, body: unknown): Promise<Response> {
  return fetch(`/api/admin${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'x-csrf-token': sessionCsrf() },
    body: JSON.stringify(body)
  }).then(async (r) => {
    if (!r.ok) throw new Error((await r.json()).message || 'Failed');
    return r;
  });
}

function sessionCsrf(): string {
  try { return JSON.parse(localStorage.getItem('hush-admin-session') || '{}').csrfToken || ''; } catch { return ''; }
}
