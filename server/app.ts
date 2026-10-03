import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import type { Config } from './config.js';
import type { DB } from './db.js';
import { errorHandler, langFromReq } from './http.js';
import { securityHeaders, originCheck, langMiddleware } from './middleware/security.js';
import { publicRouter } from './routes/public.js';
import { adminRouter } from './routes/admin.js';
import { seoMiddleware, buildSitemap } from './seo.js';

export interface AppServices {
  fetchImpl?: typeof fetch;
}

export function createApp(db: DB, config: Config, _services: AppServices = {}): Express {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.set('state', { db, config });

  // Body parsing (json 100kb) + cookies
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParsing);

  // Security headers with strict CSP (no inline scripts)
  app.use(securityHeaders(config.siteUrl));

  // Origin check for state-changing requests
  app.use(originCheck(config.allowedOrigins));

  // Language resolution
  app.use(langMiddleware);

  // Admin API
  app.use('/api/admin', adminRouter());

  // Public API
  app.use('/api', publicRouter());

  // Uploaded images
  if (fs.existsSync(config.uploadsDir)) {
    app.use('/uploads', express.static(config.uploadsDir, { maxAge: '30d', fallthrough: true }));
  }

  // robots.txt — /admin is noindex
  app.get('/robots.txt', (_req: Request, res: Response) => {
    const lines = ['User-agent: *', 'Allow: /', 'Disallow: /admin', 'Disallow: /api/'];
    if (config.siteUrl) lines.push(`Sitemap: ${config.siteUrl}/sitemap.xml`);
    res.type('text/plain').send(lines.join('\n') + '\n');
  });

  // sitemap.xml (only meaningful with SITE_URL; harmless without)
  app.get('/sitemap.xml', (_req: Request, res: Response) => {
    res.type('application/xml');
    if (!config.siteUrl) {
      res.status(404).send('<!-- SITE_URL not configured -->');
      return;
    }
    res.send(buildSitemap(db, config.siteUrl));
  });

  // Static client build
  const clientDir = config.clientDistDir;
  if (fs.existsSync(clientDir)) {
    app.use(express.static(clientDir, { index: false, maxAge: config.isProd ? '1y' : 0, setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache');
    } }));

    // SEO shell for page routes (SPA fallback with per-page head tags)
    app.use(seoMiddleware(db, config.siteUrl, clientDir));
  }

  // Final SPA fallback for unknown page routes
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET' || path.extname(req.path)) return next();
    const indexFile = path.join(clientDir, 'index.html');
    if (fs.existsSync(indexFile)) {
      res.setHeader('Cache-Control', 'no-cache');
      res.sendFile(indexFile);
    } else {
      res.status(404).send('Client build not found. Run `npm run build:client`.');
    }
  });

  app.use(errorHandler);
  return app;
}

/** Tiny cookie parser (avoids an extra dependency). */
function cookieParsing(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.cookie;
  if (!header) return next();
  const cookies: Record<string, string> = {};
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const name = part.slice(0, idx).trim();
    try {
      cookies[name] = decodeURIComponent(part.slice(idx + 1).trim());
    } catch {
      cookies[name] = part.slice(idx + 1).trim();
    }
  }
  (req as unknown as { cookies: Record<string, string> }).cookies = cookies;
  next();
}

export { langFromReq };
