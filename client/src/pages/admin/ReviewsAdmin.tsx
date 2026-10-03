import { useEffect, useState } from 'react';
import { adminApi } from '../../api.js';

export default function ReviewsAdmin() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [testResult, setTestResult] = useState<Record<string, unknown> | null>(null);

  async function load() { setTestimonials((await adminApi.testimonials()).testimonials); }
  useEffect(() => { load().catch(() => {}); }, []);

  async function runTest() {
    try {
      const r = await fetch('/api/admin/reviews/test', { method: 'POST', headers: csrfHeaders() });
      setTestResult(await r.json());
    } catch { setTestResult({ error: 'failed' }); }
  }

  return (
    <div>
      <h1>Reviews</h1>
      <section>
        <h2>Google Places</h2>
        <button className="btn btn-olive small-btn" onClick={runTest}>Test connection</button>
        {testResult ? <pre className="admin-pre">{JSON.stringify(testResult, null, 2)}</pre> : null}
      </section>
      <section>
        <h2>Manual testimonials</h2>
        <table className="admin-table">
          <thead><tr><th>Author</th><th>Quote (EN)</th><th>Rating</th><th>Published</th></tr></thead>
          <tbody>
            {testimonials.map((tt) => (
              <tr key={tt.id}><td>{tt.author_name}</td><td>{tt.quote_en}</td><td>{tt.rating ?? '—'}</td><td>{tt.is_published ? '✓' : '✗'}</td></tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function csrfHeaders(): Record<string, string> {
  const session = JSON.parse(localStorage.getItem('hush-admin-session') || '{}');
  return { 'x-csrf-token': session.csrfToken || '' };
}
