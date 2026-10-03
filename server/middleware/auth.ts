import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import { db as getDb, config as getConfig } from '../context.js';
import { HttpError, unauthorized, forbidden } from '../http.js';
import { PERMISSIONS, SESSION_COOKIE, CSRF_HEADER, type Role } from '../../shared/constants.js';

// ---------------------------------------------------------------------------
// Session helpers (token stored hashed; cookie carries the raw token)
// ---------------------------------------------------------------------------

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function newSessionToken(): { raw: string; hash: string; csrf: string } {
  const raw = crypto.randomBytes(32).toString('base64url');
  return { raw, hash: hashToken(raw), csrf: crypto.randomBytes(24).toString('base64url') };
}

export function createSession(
  db: ReturnType<typeof getDb>,
  userId: number,
  ttlMs: number,
  meta: { ip?: string; userAgent?: string }
): { raw: string; csrf: string; expiresAt: number } {
  const t = newSessionToken();
  const expiresAt = Date.now() + ttlMs;
  db.prepare(
    'INSERT INTO sessions (user_id, token_hash, csrf_token, expires_at, ip, user_agent) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(userId, t.hash, t.csrf, Math.floor(expiresAt / 1000), meta.ip || null, (meta.userAgent || '').slice(0, 250));
  return { raw: t.raw, csrf: t.csrf, expiresAt };
}

export function destroySession(db: ReturnType<typeof getDb>, rawToken: string): void {
  db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(hashToken(rawToken));
}

export function destroySessionsForUser(db: ReturnType<typeof getDb>, userId: number, exceptRawToken?: string): void {
  if (exceptRawToken) {
    db.prepare('DELETE FROM sessions WHERE user_id = ? AND token_hash != ?').run(userId, hashToken(exceptRawToken));
  } else {
    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId);
  }
}

export function purgeExpiredSessions(db: ReturnType<typeof getDb>): number {
  const info = db.prepare('DELETE FROM sessions WHERE expires_at <= unixepoch()').run();
  return info.changes;
}

export function readSessionCookie(req: Request): string | null {
  const header = req.headers.cookie;
  if (!header) return null;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const name = part.slice(0, idx).trim();
    if (name === SESSION_COOKIE) return decodeURIComponent(part.slice(idx + 1).trim());
  }
  return null;
}

export function setSessionCookie(res: Response, rawToken: string, maxAgeSeconds: number, secure: boolean): void {
  const flags = [
    `${SESSION_COOKIE}=${encodeURIComponent(rawToken)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${maxAgeSeconds}`
  ];
  if (secure) flags.push('Secure');
  const prev = res.getHeader('Set-Cookie');
  const list = prev ? (Array.isArray(prev) ? prev.map(String) : [String(prev)]) : [];
  list.push(flags.join('; '));
  res.setHeader('Set-Cookie', list);
}

export function clearSessionCookie(res: Response, secure: boolean): void {
  const flags = [`${SESSION_COOKIE}=`, 'Path=/', 'HttpOnly', 'SameSite=Strict', 'Max-Age=0'];
  if (secure) flags.push('Secure');
  const prev = res.getHeader('Set-Cookie');
  const list = prev ? (Array.isArray(prev) ? prev.map(String) : [String(prev)]) : [];
  list.push(flags.join('; '));
  res.setHeader('Set-Cookie', list);
}

// ---------------------------------------------------------------------------
// requireAuth
// ---------------------------------------------------------------------------

export interface AuthedUser {
  id: number;
  email: string;
  name: string;
  role: Role;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const database = getDb(res);
  const cfg = getConfig(res);
  const raw = readSessionCookie(req);
  if (!raw) return next(unauthorized('Not signed in'));
  const row = database
    .prepare(
      `SELECT s.id AS session_id, s.csrf_token, s.expires_at, u.id, u.email, u.name, u.role, u.disabled
       FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = ?`
    )
    .get(hashToken(raw)) as
    | { session_id: number; csrf_token: string; expires_at: number; id: number; email: string; name: string; role: Role; disabled: number }
    | undefined;
  if (!row) return next(unauthorized('Session invalid'));
  if (row.expires_at * 1000 <= Date.now()) {
    database.prepare('DELETE FROM sessions WHERE session_id = ?').run(row.session_id);
    return next(unauthorized('Session expired'));
  }
  if (row.disabled) return next(unauthorized('Account disabled'));
  req.userId = row.id;
  req.userEmail = row.email;
  req.userRole = row.role;
  req.sessionCsrf = row.csrf_token;
  res.locals.sessionMaxAge = cfg.sessionTtlMs / 1000;
  res.locals.sessionSecure = cfg.isProd;
  next();
}

export function requireCsrf(req: Request, _res: Response, next: NextFunction): void {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const token = req.headers[CSRF_HEADER] as string | undefined;
  if (!token || !req.sessionCsrf || token !== req.sessionCsrf) {
    return next(forbidden('CSRF token missing or invalid'));
  }
  next();
}

// ---------------------------------------------------------------------------
// Permissions
// ---------------------------------------------------------------------------

export function hasPermission(role: Role, permission: string): boolean {
  const perms = PERMISSIONS[role];
  if (!perms) return false;
  return perms.includes('*') || perms.includes(permission);
}

export function requirePermission(permission: string) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const role = req.userRole as Role | undefined;
    if (!role) return next(unauthorized('Not signed in'));
    if (!hasPermission(role, permission)) return next(forbidden('Insufficient permissions'));
    next();
  };
}

export function audit(
  db: ReturnType<typeof getDb>,
  req: { userId?: number; userEmail?: string; ip?: string },
  action: string,
  entity?: string,
  entityId?: string | number,
  detail?: unknown
): void {
  db.prepare('INSERT INTO audit_log (user_id, user_email, action, entity, entity_id, detail, ip) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
    req.userId ?? null,
    req.userEmail ?? null,
    action,
    entity ?? null,
    entityId != null ? String(entityId) : null,
    detail ? JSON.stringify(detail).slice(0, 2000) : null,
    req.ip ?? null
  );
}

// Re-export HttpError for route modules
export { HttpError };
