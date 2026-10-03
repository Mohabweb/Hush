import { useEffect, useState } from 'react';
import { useLang } from '../i18n.jsx';
import { api, type ApiBranch } from '../api.js';

export default function Locations() {
  const { t } = useLang();
  const [branches, setBranches] = useState<ApiBranch[]>([]);

  useEffect(() => {
    api.branches().then((r) => setBranches(r.branches)).catch(() => {});
  }, []);

  return (
    <div className="container locations-page">
      <h1>{t.locations.title}</h1>
      <div className="branch-grid">
        {branches.map((b) => (
          <div className="branch-card" key={b.slug}>
            <h2>{b.name}</h2>
            <p>{b.address}</p>
            {b.phone ? <p><a href={`tel:${b.phone}`}>{b.phone}</a></p> : null}
            {b.mapsUrl ? <a className="btn btn-olive small-btn" href={b.mapsUrl} target="_blank" rel="noopener noreferrer">{t.locations.directions} ↗</a> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
