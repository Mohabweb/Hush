import fs from 'node:fs';
import path from 'node:path';
import type { Request, Response, NextFunction } from 'express';
import type { DB } from './db.js';

interface SeoSpec {
  title: string;
  description: string;
  path?: string;
  ogType?: string;
  jsonLd?: Record<string, unknown>;
}

const SITE_NAME = 'HUSH — Coffee & Croffle';

/**
 * Page specs. SEO tags are injected ONLY when SITE_URL is configured.
 * JSON-LD is limited to verified data: name, phone, Instagram and the
 * supplied addresses. No invented opening hours, ratings or coordinates.
 */
function pageSpecs(db: DB): Record<string, SeoSpec> {
  const branches = db.prepare('SELECT name_en, address_en, phone FROM branches WHERE is_active = 1 ORDER BY sort_order').all() as any[];
  const sameAs: string[] = [];
  const instagram = db.prepare("SELECT value FROM settings WHERE key = 'site.instagram'").get() as { value: string | null } | undefined;
  if (instagram?.value) sameAs.push(instagram.value);

  const cafeJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'CafeOrCoffeeShop',
    name: 'HUSH',
    address: branches.map((b) => ({ '@type': 'PostalAddress', streetAddress: b.address_en, addressLocality: 'Alexandria', addressCountry: 'EG' })),
    ...(branches.length && branches[0].phone ? { telephone: branches[0].phone } : {}),
    ...(sameAs.length ? { sameAs } : {})
    // NOTE: no openingHours, no aggregateRating — not verified data.
  };

  return {
    '/': { title: `${SITE_NAME} — Alexandria`, description: 'Coffee & croffle café with two branches in Alexandria. Order pickup online.', ogType: 'website', jsonLd: cafeJsonLd },
    '/menu': { title: `Menu — ${SITE_NAME}`, description: 'Espresso, cold coffee, croffles, bakery and more. Prices in EGP.', ogType: 'website' },
    '/about': { title: `About — ${SITE_NAME}`, description: 'About HUSH café in Alexandria.', ogType: 'website' },
    '/locations': { title: `Locations — ${SITE_NAME}`, description: 'Find our branches in Alexandria.', ogType: 'website' },
    '/reviews': { title: `Reviews — ${SITE_NAME}`, description: 'What guests say about HUSH.', ogType: 'website' },
    '/contact': { title: `Contact — ${SITE_NAME}`, description: 'Send us a message or request a table.', ogType: 'website' },
    '/cart': { title: `Cart — ${SITE_NAME}`, description: 'Your pickup order.' },
    '/checkout': { title: `Checkout — ${SITE_NAME}`, description: 'Complete your pickup order.' },
    '/order': { title: `Order status — ${SITE_NAME}`, description: 'Track your HUSH order.' },
    '/privacy': { title: `Privacy Policy — ${SITE_NAME}`, description: 'Privacy policy.' },
    '/terms': { title: `Terms of Service — ${SITE_NAME}`, description: 'Terms of service.' }
  };
}

export function seoPaths(db: DB): string[] {
  return Object.keys(pageSpecs(db));
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildHeadTags(spec: SeoSpec, siteUrl: string): string {
  const url = `${siteUrl}${spec.path === '/' || !spec.path ? '/' : spec.path}`;
  const ogImage = `${siteUrl}/img/logo-mark.png`;
  const tags = [
    `<title>${escapeHtml(spec.title)}</title>`,
    `<meta name="description" content="${escapeHtml(spec.description)}">`,
    `<link rel="canonical" href="${escapeHtml(url)}">`,
    `<meta property="og:title" content="${escapeHtml(spec.title)}">`,
    `<meta property="og:description" content="${escapeHtml(spec.description)}">`,
    `<meta property="og:url" content="${escapeHtml(url)}">`,
    `<meta property="og:type" content="${spec.ogType || 'website'}">`,
    `<meta property="og:image" content="${escapeHtml(ogImage)}">`,
    `<meta name="twitter:card" content="summary">`
  ];
  if (spec.jsonLd) {
    tags.push(`<script type="application/ld+json">${JSON.stringify(spec.jsonLd).replace(/</g, '\\u003c')}</script>`);
  }
  return tags.join('\n');
}

/**
 * Middleware that serves dist/client/index.html with per-page SEO tags
 * injected at the <!--HEAD--> marker. If SITE_URL is unset, the raw
 * index.html is served without any SEO injection.
 */
export function seoMiddleware(db: DB, siteUrl: string | null, clientDistDir: string) {
  const cache = new Map<string, string>();

  function renderTemplate(): string {
    const file = path.join(clientDistDir, 'index.html');
    return fs.readFileSync(file, 'utf8');
  }

  return function seo(req: Request, res: Response, next: NextFunction): void {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    const urlPath = req.path;
    // /admin is noindex; only the shell is served anyway.
    const isDeep = urlPath === '/' || !path.extname(urlPath);
    if (!isDeep) return next();

    try {
      const template = cache.get('template') || renderTemplate();
      if (!cache.has('template')) cache.set('template', template);

      let html = template;
      if (siteUrl) {
        const specs = pageSpecs(db);
        const spec = specs[urlPath] || { title: `${SITE_NAME}`, description: 'Coffee & croffle café in Alexandria.', path: urlPath };
        const head = buildHeadTags(spec, siteUrl);
        if (html.includes('<!--HEAD-->')) {
          html = html.replace('<!--HEAD-->', head);
        } else {
          html = html.replace('</title>', `</title>\n${head}`);
        }
      }
      if (urlPath.startsWith('/admin')) {
        html = html.replace('</title>', '</title>\n<meta name="robots" content="noindex">');
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache');
      res.send(html);
    } catch {
      next();
    }
  };
}

export function buildSitemap(db: DB, siteUrl: string): string {
  const paths = seoPaths(db);
  const urls = paths
    .map((p) => `  <url><loc>${siteUrl}${p === '/' ? '/' : p}</loc></url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}
