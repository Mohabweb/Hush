import { useEffect, useState } from 'react';
import { useLang } from '../i18n.jsx';
import { api, type ApiBranch } from '../api.js';

export interface ReviewsData {
  google: Record<string, { status: string; rating?: number; reviewsCount?: number; reviews: { author: string; rating: number; text: string; relativeTime?: string }[] }>;
  googleStatus: string;
  testimonials: { author: string; quote: string; rating: number | null }[];
}

export default function Reviews() {
  const { t } = useLang();
  const [data, setData] = useState<ReviewsData | null>(null);
  const [branches, setBranches] = useState<ApiBranch[]>([]);

  useEffect(() => {
    api.reviews().then(setData).catch(() => {});
    api.branches().then((r) => setBranches(r.branches)).catch(() => {});
  }, []);

  if (!data) return <div className="page-loading">{t.common.loading}</div>;

  const googleConfigured = Object.values(data.google).some((g) => g.status === 'ok' && g.reviews.length > 0);

  return (
    <div className="container reviews-page">
      <h1>{t.reviews.title}</h1>

      <section aria-label={t.reviews.google}>
        <h2 className="section-title">{t.reviews.google}</h2>
        {!googleConfigured && (
          <div className="notice">
            <p>{t.reviews.notConfigured}</p>
            {branches.map((b) =>
              b.mapsUrl ? <p key={b.slug}><a href={b.mapsUrl} target="_blank" rel="noopener noreferrer">{b.name} — {t.reviews.mapsLink} ↗</a></p> : null
            )}
          </div>
        )}
        {googleConfigured && Object.entries(data.google).map(([slug, g]) => {
          const branch = branches.find((b) => b.slug === slug);
          if (g.status !== 'ok' || g.reviews.length === 0) return null;
          return (
            <div key={slug} className="google-reviews">
              <p className="muted">
                {branch?.name}
                {typeof g.rating === 'number' ? ` · ${g.rating} ★` : ''}
                {typeof g.reviewsCount === 'number' ? ` · ${g.reviewsCount}` : ''}
              </p>
              <div className="review-grid">
                {g.reviews.map((r, i) => (
                  <blockquote className="review-card" key={i}>
                    <footer>{r.author} · {'★'.repeat(Math.max(0, Math.min(5, r.rating)))}</footer>
                    <p>{r.text}</p>
                    {r.relativeTime ? <small className="muted">{r.relativeTime}</small> : null}
                  </blockquote>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {data.testimonials.length > 0 && (
        <section aria-label={t.reviews.testimonials}>
          <h2 className="section-title">{t.reviews.testimonials}</h2>
          <div className="review-grid">
            {data.testimonials.map((tt, i) => (
              <blockquote className="review-card" key={i}>
                <footer>{tt.author}{tt.rating ? ` · ${'★'.repeat(tt.rating)}` : ''}</footer>
                <p>{tt.quote}</p>
              </blockquote>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
