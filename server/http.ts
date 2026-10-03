import type { NextFunction, Request, Response } from 'express';
import type { Lang } from '../shared/constants.js';
import { LANGS } from '../shared/constants.js';

export class HttpError extends Error {
  status: number;
  code: string;
  details?: unknown;
  constructor(status: number, code: string, message?: string, details?: unknown) {
    super(message || code);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function badRequest(message: string, details?: unknown): HttpError {
  return new HttpError(400, 'bad_request', message, details);
}

export function notFound(message = 'Not found'): HttpError {
  return new HttpError(404, 'not_found', message);
}

export function unauthorized(message = 'Unauthorized'): HttpError {
  return new HttpError(401, 'unauthorized', message);
}

export function forbidden(message = 'Forbidden'): HttpError {
  return new HttpError(403, 'forbidden', message);
}

export function tooMany(message = 'Too many requests'): HttpError {
  return new HttpError(429, 'rate_limited', message);
}

export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

/** Resolve UI language from the x-lang header, ?lang=, or cookie; default en. */
export function langFromReq(req: Request): Lang {
  const header = (req.headers['x-lang'] || req.query.lang || req.headers['accept-language'] || 'en') as string;
  const first = String(header).split(',')[0]!.trim().toLowerCase();
  const code = first.slice(0, 2);
  return (LANGS as readonly string[]).includes(code) ? (code as Lang) : 'en';
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.code, message: err.message, ...(err.details ? { details: err.details } : {}) });
    return;
  }
  // Zod errors from .parse()
  const anyErr = err as { name?: string; issues?: unknown };
  if (anyErr && anyErr.name === 'ZodError') {
    res.status(400).json({ error: 'validation_error', message: 'Invalid input', details: anyErr.issues });
    return;
  }
  // Body-parser size limit etc.
  const type = (err as { type?: string }).type;
  if (type === 'entity.too.large') {
    res.status(413).json({ error: 'payload_too_large', message: 'Request body too large' });
    return;
  }
  console.error('[hush] unhandled error:', err);
  res.status(500).json({ error: 'internal_error', message: 'Internal server error' });
}
