import { useEffect, useState } from 'react';
import { adminApi } from '../../api.js';

export default function MenuAdmin() {
  const [view, setView] = useState<'categories' | 'items' | 'addons'>('items');
  return (
    <div>
      <h1>Menu</h1>
      <div className="filter-row">
        <button className={view === 'items' ? 'chip active' : 'chip'} onClick={() => setView('items')}>Items</button>
        <button className={view === 'categories' ? 'chip active' : 'chip'} onClick={() => setView('categories')}>Categories</button>
        <button className={view === 'addons' ? 'chip active' : 'chip'} onClick={() => setView('addons')}>Add-ons</button>
      </div>
      {view === 'items' && <ItemsList />}
      {view === 'categories' && <CategoriesList />}
      {view === 'addons' && <AddOnsList />}
    </div>
  );
}

function ItemsList() {
  const [items, setItems] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  useEffect(() => { adminApi.items().then((r) => setItems(r.items)).catch(() => {}); }, []);

  async function save() {
    if (!editing) return;
    const payload: any = {
      category_id: editing.category_id,
      name_en: editing.name_en,
      name_ar: editing.name_ar,
      description_en: editing.description_en || '',
      description_ar: editing.description_ar || '',
      is_featured: !!editing.is_featured,
      is_available: !!editing.is_available,
      sort_order: editing.sort_order ?? 0,
      variants: (editing.variants || []).map((v: any) => ({
        id: v.id, label_en: v.label_en, label_ar: v.label_ar,
        price: Math.round(Number(v.price || 0) * 100),
        is_available: v.is_available !== 0, sort_order: v.sort_order ?? 0
      }))
    };
    await adminApi.patchItem(editing.id, payload);
    setEditing(null);
    setItems((await adminApi.items()).items);
  }

  if (editing) {
    return (
      <div className="admin-edit-form">
        <h2>Edit: {editing.name_en}</h2>
        <label>English name<input value={editing.name_en} onChange={(e) => setEditing({ ...editing, name_en: e.target.value })} /></label>
        <label>Arabic name<input value={editing.name_ar} onChange={(e) => setEditing({ ...editing, name_ar: e.target.value })} /></label>
        <label className="inline-check"><input type="checkbox" checked={!!editing.is_featured} onChange={(e) => setEditing({ ...editing, is_featured: e.target.checked })} /> Featured</label>
        <label className="inline-check"><input type="checkbox" checked={!!editing.is_available} onChange={(e) => setEditing({ ...editing, is_available: e.target.checked })} /> Available</label>
        <h3>Variants</h3>
        {(editing.variants || []).map((v: any, i: number) => (
          <div key={v.id || i} className="variant-edit">
            <input value={v.label_en} onChange={(e) => { const vs = [...editing.variants]; vs[i] = { ...v, label_en: e.target.value }; setEditing({ ...editing, variants: vs }); }} aria-label="Variant label EN" />
            <input value={v.label_ar} onChange={(e) => { const vs = [...editing.variants]; vs[i] = { ...v, label_ar: e.target.value }; setEditing({ ...editing, variants: vs }); }} aria-label="Variant label AR" />
            <input type="number" step="0.25" min="0" value={v.price / 100} onChange={(e) => { const vs = [...editing.variants]; vs[i] = { ...v, price: Math.round(Number(e.target.value) * 100) }; setEditing({ ...editing, variants: vs }); }} aria-label="Variant price EGP" />
          </div>
        ))}
        <div className="dialog-actions">
          <button className="btn btn-ghost-light" onClick={() => setEditing(null)}>Cancel</button>
          <button className="btn btn-olive" onClick={save}>Save</button>
        </div>
      </div>
    );
  }

  return (
    <table className="admin-table">
      <thead><tr><th>Item</th><th>Category</th><th>Prices</th><th>Flags</th><th></th></tr></thead>
      <tbody>
        {items.map((it) => (
          <tr key={it.id}>
            <td>{it.name_en}<br /><small className="muted">{it.name_ar}</small></td>
            <td>{it.category_id}</td>
            <td>{(it.variants || []).map((v: any) => `${v.label_en}: ${(v.price / 100).toFixed(0)}`).join(', ')}</td>
            <td>{it.is_featured ? '★ ' : ''}{it.is_available ? '' : '⛔'}</td>
            <td><button className="link" onClick={() => setEditing({ ...it })}>Edit</button></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function CategoriesList() {
  const [cats, setCats] = useState<any[]>([]);
  useEffect(() => { adminApi.categories().then((r) => setCats(r.categories)).catch(() => {}); }, []);
  return (
    <table className="admin-table">
      <thead><tr><th>Slug</th><th>EN</th><th>AR</th><th>Order</th><th>Active</th></tr></thead>
      <tbody>
        {cats.map((c) => <tr key={c.id}><td>{c.slug}</td><td>{c.name_en}</td><td>{c.name_ar}</td><td>{c.sort_order}</td><td>{c.is_active ? '✓' : '✗'}</td></tr>)}
      </tbody>
    </table>
  );
}

function AddOnsList() {
  const [addons, setAddons] = useState<any[]>([]);
  useEffect(() => { adminApi.addOns().then((r) => setAddons(r.addOns)).catch(() => {}); }, []);
  return (
    <table className="admin-table">
      <thead><tr><th>Slug</th><th>EN</th><th>Price</th><th>Applies to categories</th><th>Active</th></tr></thead>
      <tbody>
        {addons.map((a) => (
          <tr key={a.id}>
            <td>{a.slug}</td><td>{a.name_en}</td>
            <td>{(a.price / 100).toFixed(0)} EGP</td>
            <td>{a.categories || '(all)'}</td>
            <td>{a.is_active ? '✓' : '✗'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
