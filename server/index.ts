import fs from 'node:fs';
import { loadConfig } from './config.js';
import { openDb, migrate, type DB } from './db.js';
import { isDbEmpty, runSeed } from './seed/index.js';
import { createApp } from './app.js';
import { purgeExpiredSessions } from './middleware/auth.js';

const config = loadConfig();
fs.mkdirSync(config.dataDir, { recursive: true });
fs.mkdirSync(config.uploadsDir, { recursive: true });

const db: DB = openDb(config);
migrate(db);

// Seed only when empty so admin edits are never overwritten.
const seededNow = isDbEmpty(db);
if (seededNow) {
  runSeed(db);
  console.log('[hush] database seeded (was empty)');
}

const app = createApp(db, config);

// Hourly session purge
const purgeTimer = setInterval(() => {
  try {
    purgeExpiredSessions(db);
  } catch (err) {
    console.error('[hush] session purge failed', err);
  }
}, 60 * 60 * 1000);
purgeTimer.unref();

app.listen(config.port, () => {
  const adminCount = (db.prepare("SELECT COUNT(*) n FROM users WHERE role = 'admin' AND disabled = 0").get() as { n: number }).n;
  console.log(`[hush] listening on http://localhost:${config.port} (${config.env})`);
  if (adminCount === 0) {
    console.log('[hush] No admin account yet. Create the first admin with:');
    console.log('       HUSH_ADMIN_PASSWORD=... npm run admin:create -- --email you@example.com');
  }
  if (!config.siteUrl) {
    console.log('[hush] SITE_URL not set — SEO meta/canonical/sitemap are disabled.');
  }
  if (!config.googlePlacesApiKey) {
    console.log('[hush] GOOGLE_PLACES_API_KEY not set — Google reviews will show a Maps link instead.');
  }
});
