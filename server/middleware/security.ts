import type { Request, Response, NextFunction } from 'express';
import type { Lang } from '../../shared/constants.js';
import { langFromReq } from '../http.js';

/** Minimal helmet-style security headers with strict CSP (no inline scripts). */
export function securityHeaders(siteUrl: string | null) {
  const scriptSrc = ["'self'"];
  const connectSrc = ["'self'", ...(siteUrl ? [siteUrl] : [])];
  const imgSrc = ["'self'", 'data:', ...(siteUrl ? [siteUrl] : [])];
  return function securityHeadersMiddleware(_req: Request, res: Response, next: NextFunction) {
    res.setHeader(
      'Content-Security-Policy',
      [
        `default-src 'self'`,
        `script-src ${scriptSrc.join(' ')}`,
        `style-src 'self'`,
        `img-src ${imgSrc.join(' ')}`,
        `font-src 'self'`,
        `connect-src ${connectSrc.join(' ')}`,
        `object-src 'none'`,
        `base-uri 'self'`,
        `form-action 'self'`,
        `frame-ancestors 'none'`
      ].join('; ')
    );
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    if (siteUrl) res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  };
}

/**
 * Origin check for state-changing requests. If no allowed origins are configured
 * (typical same-origin deployment) the check still guards against cross-site
 * form posts by comparing Host and Origin when Origin is present.
 */
export function originCheck(allowedOrigins: string[]) {
  return function originCheckMiddleware(req: Request, res: Response, next: NextFunction) {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    const origin = req.headers.origin;
    if (!origin) return next(); // same-origin non-browser clients (curl) are gated by CSRF
    const originNorm = String(origin).replace(/\/+$/, '');
    if (allowedOrigins.length > 0) {
      if (!allowedOrigins.includes(originNorm)) {
        return res.status(403).json({ error: 'forbidden', message: 'Origin not allowed' });
      }
      return next();
    }
    // no configured origins: accept if origin host matches host header
    try {
      const host = req.headers['x-forwarded-host'] || req.headers.host;
      if (host && new URL(originNorm).host === String(host)) return next();
    } catch {
      /* fallthrough */
    }
    return res.status(403).json({ error: 'forbidden', message: 'Origin not allowed' });
  };
}

interface Bucket {
  count: number;
  resetAt: number;
}

/** Simple in-memory fixed-window rate limiter. Multiplied x100 under NODE_ENV=test. */
export function rateLimit(options: { windowMs: number; max: number; keyBy?: (req: Request) => string }) {
  const windowMs = process.env.NODE_ENV === 'test' ? options.windowMs : options.windowMs;
  const max = process.env.NODE_ENV === 'test' ? options.max * 100 : options.max;
  const buckets = new Map<string, Bucket>();
  return function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
    const key = options.keyBy ? options.keyBy(req) : req.ip || 'unknown';
    const now = Date.now();
    let bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(key, bucket);
      if (buckets.size > 10000) {
        // opportunistic cleanup
        for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
      }
    }
    bucket.count++;
    if (bucket.count > max) {
      res.setHeader('Retry-After', Math.ceil((bucket.resetAt - now) / 1000));
      return res.status(429).json({ error: 'rate_limited', message: 'Too many requests' });
    }
    next();
  };
}

export function langMiddleware(req: Request, res: Response, next: NextFunction): void {
  res.locals.lang = langFromReq(req) as Lang;
  next();
}
