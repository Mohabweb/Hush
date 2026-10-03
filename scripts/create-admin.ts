// Creates the first admin account. No default credentials exist.
// Usage: HUSH_ADMIN_PASSWORD=... npm run admin:create -- --email you@example.com [--name "Admin"]
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { openDb, migrate } from '../server/db.js';
import { loadConfig } from '../server/config.js';
import { hashPassword } from '../server/services/auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
function argValue(flag: string): string | undefined {
  const idx = args.indexOf(flag);
  return idx >= 0 ? args[idx + 1] : undefined;
}

const email = argValue('--email') || process.env.HUSH_ADMIN_EMAIL;
const name = argValue('--name') || 'Administrator';
const password = process.env.HUSH_ADMIN_PASSWORD;

if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
  console.error('Usage: HUSH_ADMIN_PASSWORD=... npm run admin:create -- --email you@example.com');
  process.exit(1);
}
if (!password || password.length < 10) {
  console.error('Usage: HUSH_ADMIN_PASSWORD=... npm run admin:create -- --email you@example.com');
  process.exit(1);
}
if (!password || password.length < 10) {
  console.error('HUSH_ADMIN_PASSWORD must be set (minimum 10 characters).');
  process.exit(1);
}

const normalizedEmail = email!.trim().toLowerCase();

const config = loadConfig();
const db = openDb(config);
migrate(db, path.resolve(__dirname, '../server/migrations'));

const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
if (existing) {
  console.error(`A user with email ${normalizedEmail} already exists.`);
  process.exit(1);
}

const hash = await hashPassword(password!);
db.prepare('INSERT INTO users (email, name, password_hash, role) VALUES (?, ?, ?, ?)').run(normalizedEmail, name, hash, 'admin');
console.log(`Admin created: ${normalizedEmail} (role: admin)`);
console.log('Sign in at /admin with this email and the password you provided.');
db.close();
