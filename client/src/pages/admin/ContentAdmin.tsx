import { useEffect, useState } from 'react';
import { adminApi } from '../../api.js';

export default function ContentAdmin() {
  const [pages, setPages] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  useEffect(() => { adminApi.pages().then((r) => setPages(r.pages)).catch(() => {}); }, []);

  async function open(slug: string) {
    const p = await adminApi.page(slug);
    setEditing(p.page);
  }

  async function save() {
    if (!editing) return;
    await fetch(`/api/admin/pages/${editing.slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrf() },
      body: JSON.stringify({
        title_en: editing.title_en, title_ar: editing.title_ar,
        body_en: editing.body_en, body_ar: editing.body_ar,
        is_published: !!editing.is_published
      })
    });
    setEditing(null);
    setPages((await adminApi.pages()).pages);
  }

  return (
    <div>
      <h1>Content</h1>
      {editing ? (
        <div className="admin-edit-form">
          <h2>{editing.slug}</h2>
          <label>Title (EN)<input value={editing.title_en} onChange={(e) => setEditing({ ...editing, title_en: e.target.value })} /></label>
          <label>Title (AR)<input value={editing.title_ar} onChange={(e) => setEditing({ ...editing, title_ar: e.target.value })} /></label>
          <label>Body (EN)<textarea rows={10} value={editing.body_en} onChange={(e) => setEditing({ ...editing, body_en: e.target.value })} /></label>
          <label>Body (AR)<textarea rows={10} value={editing.body_ar} onChange={(e) => setEditing({ ...editing, body_ar: e.target.value })} /></label>
          <label className="inline-check"><input type="checkbox" checked={!!editing.is_published} onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })} /> Published</label>
          <div className="dialog-actions">
            <button className="btn btn-ghost-light" onClick={() => setEditing(null)}>Cancel</button>
            <button className="btn btn-olive" onClick={save}>Save</button>
          </div>
        </div>
      ) : (
        <table className="admin-table">
          <thead><tr><th>Slug</th><th>Title</th><th>Published</th><th></th></tr></thead>
          <tbody>
            {pages.map((p) => (
              <tr key={p.slug}><td>{p.slug}</td><td>{p.title_en}</td><td>{p.is_published ? '✓' : '✗'}</td>
                <td><button className="link" onClick={() => open(p.slug)}>Edit</button></td></tr>
            ))}
          </tbody>
        </table>
      )}
      <p className="muted small">Legal texts contain “[Owner to confirm]” placeholders — replace them only with owner-approved wording.</p>
    </div>
  );
}

function csrf(): string {
  try { return JSON.parse(localStorage.getItem('hush-admin-session') || '{}').csrfToken || ''; } catch { return ''; }
}
