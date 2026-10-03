import argon2 from 'argon2';
import type { DB } from '../db.js';
import { HttpError, unauthorized, tooMany } from '../http.js';
import { createSession } from '../middleware/auth.js';
import type { Role } from '../../shared/constants.js';

const ARGON_OPTS: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 19456, // 19 MiB
  timeCost: 2,
  parallelism: 1
};

const MAX_FAILED = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, ARGON_OPTS);
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

export interface LoginResult {
  userId: number;
  email: string;
  name: string;
  role: Role;
  session: { raw: string; csrf: string; expiresAt: number };
}

export async function login(
  db: DB,
  email: string,
  password: string,
  opts: { ttlMs: number; ip?: string; userAgent?: string }
): Promise<LoginResult> {
  const now = Date.now();
  const user = db
    .prepare('SELECT id, email, name, password_hash, role, disabled, failed_attempts, locked_until FROM users WHERE email = ?')
    .get(email.toLowerCase()) as
    | { id: number; email: string; name: string; password_hash: string; role: Role; disabled: number; failed_attempts: number; locked_until: number | null }
    | undefined;

  // Uniform error whether the account exists or not (no user enumeration).
  if (!user || user.disabled) throw unauthorized('Invalid email or password');

  if (user.locked_until && user.locked_until * 1000 > now) {
    const mins = Math.ceil((user.locked_until * 1000 - now) / 60000);
    throw tooMany(`Account temporarily locked. Try again in ${mins} minutes.`);
  }

  const ok = await verifyPassword(user.password_hash, password);
  if (!ok) {
    const attempts = user.failed_attempts + 1;
    if (attempts >= MAX_FAILED) {
      db.prepare('UPDATE users SET failed_attempts = 0, locked_until = ? WHERE id = ?').run(Math.floor((now + LOCKOUT_MS) / 1000), user.id);
      throw tooMany('Too many failed attempts. Account locked for 15 minutes.');
    }
    db.prepare('UPDATE users SET failed_attempts = ?, locked_until = NULL WHERE id = ?').run(attempts, user.id);
    throw unauthorized('Invalid email or password');
  }

  db.prepare('UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = ?').run(user.id);
  const session = createSession(db, user.id, opts.ttlMs, { ip: opts.ip, userAgent: opts.userAgent });
  return { userId: user.id, email: user.email, name: user.name, role: user.role, session };
}

export function getUserById(db: DB, id: number) {
  return db.prepare('SELECT id, email, name, role, disabled FROM users WHERE id = ?').get(id);
}

export function countAdmins(db: DB): number {
  const row = db.prepare("SELECT COUNT(*) AS n FROM users WHERE role = 'admin' AND disabled = 0").get() as { n: number };
  return row.n;
}

export { HttpError };
