import { useEffect, useState } from 'react';
import { adminApi } from '../../api.js';

export default function SettingsAdmin() {
  const [ordering, setOrdering] = useState<Record<string, string>>({});
  const [content, setContent] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    adminApi.settings('ordering').then((r) => setOrdering(r.settings)).catch(() => {});
    adminApi.settings('content').then((r) => setContent(r.settings)).catch(() => {});
  }, []);

  async function save(group: string, settings: Record<string, string>) {
    await adminApi.patchSettings(group, settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const boolKeys = (s: Record<string, string>, keys: string[]) =>
    keys.map((k) => (
      <label key={k} className="inline-check">
        <input type="checkbox" checked={s[k] === '1'} onChange={(e) => { const next = { ...s, [k]: e.target.checked ? '1' : '0' }; if (s === ordering) setOrdering(next); else setContent(next); }} />
        {k}
      </label>
    ));

  return (
    <div>
      <h1>Settings</h1>
      {saved ? <p className="success">Saved.</p> : null}
      <section>
        <h2>Ordering</h2>
        {boolKeys(ordering, ['ordering.enabled', 'ordering.dinein_enabled', 'ordering.delivery_enabled'])}
        <label>Ordering note (EN)<input value={ordering['ordering.note_en'] || ''} onChange={(e) => setOrdering({ ...ordering, 'ordering.note_en': e.target.value })} /></label>
        <label>Ordering note (AR)<input value={ordering['ordering.note_ar'] || ''} onChange={(e) => setOrdering({ ...ordering, 'ordering.note_ar': e.target.value })} /></label>
        <button className="btn btn-olive small-btn" onClick={() => save('ordering', ordering)}>Save ordering</button>
      </section>
      <section>
        <h2>Content / banner</h2>
        {boolKeys(content, ['banner.enabled'])}
        <label>Banner text (EN)<input value={content['banner.text_en'] || ''} onChange={(e) => setContent({ ...content, 'banner.text_en': e.target.value })} /></label>
        <label>Banner text (AR)<input value={content['banner.text_ar'] || ''} onChange={(e) => setContent({ ...content, 'banner.text_ar': e.target.value })} /></label>
        <label>Instagram URL<input value={content['site.instagram'] || ''} onChange={(e) => setContent({ ...content, 'site.instagram': e.target.value })} /></label>
        <label>Phone<input value={content['site.phone'] || ''} onChange={(e) => setContent({ ...content, 'site.phone': e.target.value })} /></label>
        <button className="btn btn-olive small-btn" onClick={() => save('content', content)}>Save content</button>
      </section>
    </div>
  );
}
