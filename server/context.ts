import type { Config } from './config.js';
import type { DB } from './db.js';
import type { Lang } from '../shared/constants.js';

/** App-level state attached by createApp. */
export interface AppState {
  db: DB;
  config: Config;
}

export interface Locals {
  state: AppState;
  lang: Lang;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Locals {
      state?: AppState;
      lang?: Lang;
    }
    interface Request {
      userId?: number;
      userEmail?: string;
      userRole?: string;
      sessionCsrf?: string;
    }
  }
}

export function getState(res: { app: { get(key: string): unknown } }): AppState {
  const state = res.app.get('state');
  if (!state) throw new Error('app state not initialised');
  return state as AppState;
}

export function db(res: { app: { get(key: string): unknown } }): DB {
  return getState(res).db;
}

export function config(res: { app: { get(key: string): unknown } }): Config {
  return getState(res).config;
}
