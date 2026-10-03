import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import type { Config } from './config.js';

export type DB = Database.Database;

export function openDb(config: Config): DB {
  fs.mkdirSync(config.dataDir, { recursive: true });
  fs.mkdirSync(config.uploadsDir, { recursive: true });
  const db = new Database(config.dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  return db;
}

export function migrate(db: DB, migrationsDir?: string): void {
  const dir = migrationsDir || path.resolve(process.cwd(), 'server/migrations');
  fs.mkdirSync(dir, { recursive: true });
  db.exec('CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT (datetime(\'now\')))');
  const applied = new Set<string>(db.prepare('SELECT name FROM schema_migrations').all().map((r: any) => r.name));
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = fs.readFileSync(path.join(dir, file), 'utf8');
    const run = db.transaction(() => {
      db.exec(sql);
      db.prepare('INSERT INTO schema_migrations (name) VALUES (?)').run(file);
    });
    run();
  }
}

export function seedIfEmpty(db: DB, seedFn: (db: DB) => void, emptyCheck: (db: DB) => boolean): void {
  if (emptyCheck(db)) seedFn(db);
}
