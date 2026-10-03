import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../i18n.jsx';
import { api, type ApiMenu, type ApiBranch } from '../api.js';
import { formatEGP } from '../cart.jsx';

export default function Home() {
  const { lang, t } = useLang();
  const [menu, setMenu] = useState<ApiMenu | null>(null);
  const [branches, setBranches] = useState<ApiBranch[]>([]);

  useEffect(() => {
    api.menu().then(setMenu).catch(() => {});
    api.branches().then((r) => setBranches(r.branches)).catch(() => {});
  }, []);

  const featured = (menu?.categories || []).flatMap((c) => c.items).filter((i) => i.isFeatured && i.isAvailable).slice(0, 6);

  return (
    <div className="home">
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="kicker">{t.home.heroKicker}</p>
            <h1>{t.home.heroTitle}</h1>
            <Link to="/menu" className="btn btn-olive">{t.home.heroCta}</Link>
          </div>
          <div className="hero-arch" aria-hidden="false">
            <img src="/img/hero.webp" alt="HUSH café" loading="eager" />
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="section container">
          <h2 className="section-title">{t.home.featured}</h2>
          <div className="featured-grid">
            {featured.map((item) => (
              <Link to="/menu" className="featured-card" key={item.slug}>
                <div className="featured-body">
                  <h3>{lang === 'ar' ? item.nameAr : item.name}</h3>
                  {item.description ? <p className="muted">{item.description}</p> : null}
                </div>
                <div className="dots" aria-hidden="true" />
                {item.variants[0] ? <span className="price">{formatEGP(item.variants[0].price, lang)}</span> : null}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="about-band">
        <div className="container">
          <p>{t.home.aboutBand}</p>
          <Link to="/about" className="btn btn-ghost-light">{t.nav.about}</Link>
        </div>
      </section>

      <section className="section container">
        <h2 className="section-title">{t.home.branches}</h2>
        <div className="branch-grid">
          {branches.map((b) => (
            <div className="branch-card" key={b.slug}>
              <h3>{b.name}</h3>
              <p>{b.address}</p>
              {b.mapsUrl ? <a href={b.mapsUrl} target="_blank" rel="noopener noreferrer">{t.locations.directions} ↗</a> : null}
            </div>
          ))}
        </div>
        <div className="reserve-cta">
          <Link to="/contact" className="btn btn-rust">{t.home.reserveCta}</Link>
          <p className="muted small">{t.home.reserveNote}</p>
        </div>
      </section>
    </div>
  );
}
