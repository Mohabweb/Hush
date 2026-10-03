import { useEffect, useState } from 'react';
import { useLang } from '../i18n.jsx';
import { api } from '../api.js';

export default function About() {
  const { t } = useLang();
  const [body, setBody] = useState<string | null>(null);

  useEffect(() => {
    api.page('about').then((p) => setBody(p.body)).catch(() => setBody(null));
  }, []);

  return (
    <div className="container about-page">
      <h1>{t.about.title}</h1>
      {body ? (
        body.split('\n').filter(Boolean).map((para, i) => <p key={i}>{para}</p>)
      ) : (
        <p className="muted">{t.common.loading}</p>
      )}
      <img className="about-photo" src="/img/about.webp" alt="HUSH café interior" loading="lazy" />
    </div>
  );
}
