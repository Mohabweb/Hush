import { useEffect, useState } from 'react';
import { adminApi } from '../../api.js';

export default function BranchesAdmin() {
  const [branches, setBranches] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() { setBranches((await adminApi.branches()).branches); }
  useEffect(() => { load().catch((e) => setError(String(e))); }, []);

  async function update(id: number, patch: Record<string, unknown>) {
    try {
      await fetch(`/api/admin/branches/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': JSON.parse(localStorage.getItem('hush-admin-session') || '{}').csrfToken || ''
        },
        body: JSON.stringify(patch)
      }).then(async (r) => { if (!r.ok) throw new Error((await r.json()).message); });
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Failed'); }
  }

  return (
    <div>
      <h1>Branches</h1>
      {error ? <p className="form-error">{error}</p> : null}
      <table className="admin-table">
        <thead><tr><th>Name</th><th>Address (EN)</th><th>Place ID</th><th>Active</th></tr></thead>
        <tbody>
          {branches.map((b) => (
            <tr key={b.id}>
              <td>{b.name_en}</td>
              <td>{b.address_en}</td>
              <td><input defaultValue={b.place_id || ''} onBlur={(e) => update(b.id, { place_id: e.target.value })} aria-label={`Place ID for ${b.name_en}`} /></td>
              <td><input type="checkbox" checked={!!b.is_active} onChange={(e) => update(b.id, { is_active: e.target.checked })} aria-label={`Active for ${b.name_en}`} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="muted small">Google reviews activate once the API key (env) and each branch's Place ID are set.</p>
    </div>
  );
}
