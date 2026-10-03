// Seeds the database if it is empty (never overwrites existing data).
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { openDb, migrate } from '../server/db.js';
import { loadConfig } from '../server/config.js';
import { isDbEmpty, runSeed } from '../server/seed/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const config = loadConfig();
const db = openDb(config);
migrate(db, path.resolve(__dirname, '../server/migrations'));

if (!isDbEmpty(db)) {
  console.log('[hush] database is not empty — seeding skipped (existing data preserved).');
} else {
  runSeed(db);
  console.log('[hush] database seeded.');
}
db.close();
