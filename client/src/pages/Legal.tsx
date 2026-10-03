import { useEffect, useState } from 'react';
import { useLang } from '../i18n.jsx';
import { api } from '../api.js';

export default function Legal({ slug }: { slug: string }) {
  const { t } = useLang();
  const [page, setPage] = useState<{ title: string; body: string } | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    setPage(null);
    setMissing(false);
    api.page(slug).then(setPage).catch(() => setMissing(true));
  }, [slug]);

  if (missing) return <div className="container legal-page"><p className="muted">{t.common.error}</p></div>;
  if (!page) return <div className="page-loading">{t.common.loading}</div>;

  return (
    <div className="container legal-page">
      <h1>{page.title}</h1>
      {page.body.split('\n').filter((p) => p.trim()).map((para, i) => <p key={i}>{para}</p>)}
    </div>
  );
}
