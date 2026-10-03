import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface Config {
  env: 'development' | 'test' | 'production';
  isProd: boolean;
  isTest: boolean;
  port: number;
  /** Project root (contains dist/, data/, client/). */
  root: string;
  dataDir: string;
  dbPath: string;
  uploadsDir: string;
  clientDistDir: string;
  /** Canonical site origin. SEO output only enabled when set. */
  siteUrl: string | null;
  /** Allowed CORS origins; defaults to same-origin behaviour. */
  allowedOrigins: string[];
  googlePlacesApiKey: string | null;
  whatsappNumber: string | null;
  maxUploadMb: number;
  sessionTtlMs: number;
}

function envBool(v: string | undefined): boolean {
  return v === '1' || v === 'true' || v === 'yes';
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const nodeEnv = (env.NODE_ENV || 'development') as Config['env'];
  const isProd = nodeEnv === 'production';
  const isTest = nodeEnv === 'test';

  // This file lives in <root>/server or <root>/dist/server; root is two levels up.
  const root = path.resolve(__dirname, '..', '..');
  const siteUrl = env.SITE_URL && env.SITE_URL.trim() ? env.SITE_URL.trim().replace(/\/+$/, '') : null;

  return {
    env: nodeEnv,
    isProd,
    isTest,
    port: Number(env.PORT || 8787),
    root,
    dataDir: env.DATA_DIR || path.join(root, 'data'),
    dbPath: env.DATA_DIR ? path.join(env.DATA_DIR, 'hush.db') : path.join(root, 'data', 'hush.db'),
    uploadsDir: env.DATA_DIR ? path.join(env.DATA_DIR, 'uploads') : path.join(root, 'data', 'uploads'),
    clientDistDir: path.join(root, 'dist', 'client'),
    siteUrl,
    allowedOrigins: (env.SITE_URL ? env.SITE_URL.split(',').map((s) => s.trim().replace(/\/+$/, '')).filter(Boolean) : []),
    googlePlacesApiKey: env.GOOGLE_PLACES_API_KEY && env.GOOGLE_PLACES_API_KEY.trim() ? env.GOOGLE_PLACES_API_KEY.trim() : null,
    whatsappNumber: env.WHATSAPP_NUMBER && env.WHATSAPP_NUMBER.trim() ? env.WHATSAPP_NUMBER.trim() : null,
    maxUploadMb: Number(env.MAX_UPLOAD_MB || 5),
    sessionTtlMs: envBool(env.SESSION_TTL_HOURS) ? 0 : (Number(env.SESSION_TTL_HOURS || 24 * 7) || 24 * 7) * 3600 * 1000
  };
}

export function dataDirs(config: Config): { dataDir: string; uploadsDir: string } {
  return { dataDir: config.dataDir, uploadsDir: config.uploadsDir };
}

