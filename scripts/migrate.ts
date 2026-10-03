// Runs SQL migrations (server/migrations/*.sql).
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { openDb, migrate } from '../server/db.js';
import { loadConfig } from '../server/config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const config = loadConfig();
const db = openDb(config);
migrate(db, path.resolve(__dirname, '../server/migrations'));
console.log('[hush] migrations applied.');
db.close();
