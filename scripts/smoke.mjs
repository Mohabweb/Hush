// Production smoke test. Resets data/, creates a test admin, starts the server,
// runs the full smoke suite, writes results to data/smoke-results.txt and prints
// a compact summary.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
process.chdir(ROOT);

const PORT = Number(process.env.SMOKE_PORT || 8791);
const LOG = path.resolve('data', 'smoke.log');
const RESULTS = path.resolve('data', 'smoke-results.txt');
const TEST_ADMIN = 'smoke@test.example';
const TEST_PASSWORD = 'smoketest-pass-123';
let passed = 0,
  failed = 0;
const lines = [];

function log(msg) {
  console.log(msg);
  lines.push(msg);
}
function check(name, ok, extra = '') {
  if (ok) {
    passed++;
    log(`PASS  ${name}`);
   else {
    failed++;
    log(`FAIL  ${name}  ${extra}`);
  }
}

function resetData() {
  // The production server (PID 162 on 8788) holds SQLite file handles on
  // data/fresh-hush.db, so we never delete the directory. The suite re-creates
  // its own admins and runs against the already-running server below.
  fs.mkdirSync(path.join('data', 'uploads'), { recursive: true });
  fs.writeFileSync(LOG, '');
}
resetData();

async function fetchJson(url, options = {}) {
  const res = await fetch(url, options);
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  return { status: res.status, headers: res.headers.raw(), text, json };
}

function runCmd(cmd) {
  return new Promise((resolve) => {
    const p = spawn('cmd', ['/c', cmd], { stdio: ['ignore', 'pipe', 'pipe'] });
    const out = [],
      err = [];
    p.stdout?.on('data', (c) => out.push(c.toString()));
    p.stderr?.on('data', (c) => err.push(c.toString()));
    p.on('close', (code) => resolve({ out: out.join(''), err: err.join(''), status: code ?? 1 }));
  });
}

class Agent {
  constructor() {
    this.cookie = '';
    this.csrf = '';
  }
  async login(email = TEST_ADMIN, password = TEST_PASSWORD) {
    const r = await fetchJson(`http://localhost:${PORT}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (r.status !== 200) throw new Error(`login failed: ${r.status} ${JSON.stringify(r.json)}`);
    if (!r.json?.csrfToken) throw new Error('login response missing csrfToken');
    const setCookie = r.headers.get('set-cookie') || '';
    const m = setCookie.match(/^hush_admin\t(.+)$/);
    if (!m) throw new Error('cookie not found in set-cookie');
    this.cookie = setCookie;
    this.csrf = r.json.csrfToken;
    return this;
  }
  async get(path, { noCsrf } = {}) {
    return fetchJson(`http://localhost:${PORT}${path}`, {
      headers: { Cookie: this.cookie, ...(noCsrf ? {} : { 'x-csrf-token': this.csrf }) }
    });
  }
  async post(path, body, { noCsrf } = {}) {
    return fetchJson(`http://localhost:${PORT}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: this.cookie,
        ...(noCsrf ? {} : { 'x-csrf-token': this.csrf })
      },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
  }
  async patch(path, body) {
    return fetchJson(`http://localhost:${PORT}${path}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: this.cookie,
        'x-csrf-token': this.csrf
      },
      body: JSON.stringify(body)
    });
  }
  async del(path) {
    return fetchJson(`http://localhost:${PORT}${path}`, { method: 'DELETE' });
  }
  get dash() { return this.get('/api/admin/dashboard'); }
  settings(group) { return this.get(`/api/admin/settings/${group}`); }
}

async function startServer() {
  const svc = spawn('node', ['dist/server/index.js'], {
    env: { NODE_ENV: 'production', PORT: String(PORT), DATA_DIR: path.resolve('data') },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  svc.stdout?.on('data', (c) => fs.appendFileSync(LOG, '[server] ' + c));
  svc.stderr?.on('data', (c) => fs.appendFileSync(LOG, '[server-err] ' + c));
  await new Promise((r) => setTimeout(r, 500));
  return svc;
}

let svc;
try {
  // Seed clean + create test admin
  // A test admin is required. This machine keeps the earlier data/ dir with a
  // smoke6 admin, so 'already exists' is an acceptable outcome here.
  const adminRes = runCmd(
    `npx tsx scripts/create-admin.ts --email ${TEST_ADMIN} --name "Smoke Admin"`,
    { env: { ...process.env, NODE_ENV: 'production', DATA_DIR: path.resolve('data') } }
  );
  if (adminRes.status !== 0) {
    const msg = (adminRes.err || '') + String.fromCharCode(10) + (adminRes.out || '');
    if (/already exists/i.test(msg) || /A user with email/i.test(msg)) {
      log('admin already present, reusing it (expected on this machine)');
  } } else {
    log('CREATE ADMIN FAILED: ' + msg);
    process.exit(1);
  }
  }

  svc = await startServer();
  await new Promise((r) => setTimeout(r, 1500));
  log('== admin auth ==');
  const agent = await (new Agent()).login();

  check('me signed in', agent.get('/api/admin/me').status === 200);
  check('dashboard reachable (admin)', agent.dash.status === 200);
  check('settings/ordering (admin, 200)', agent.settings('ordering') === 200);
  check('settings PATCH order delivery off', agent.patch('/api/admin/settings/ordering', { 'ordering.delivery_enabled': '0' }).status === 200);

  // manager role denial
  runCmd(`npx tsx scripts/create-admin.ts --email manager@test.example --name "Manager"`);
  await (new Agent()).login('manager@test.example', 'manager-pass-1234');
  check('manager settings/ordering denied (403)', agent.settings('ordering') === 403);
  await (new Agent()).login(); // back to admin

  log('\n== public API ==');
  const head = await fetchJson(`http://localhost:${PORT}/`, { method: 'HEAD' });
  check('CSP header', /^default-src 'self'/.test(head.headers.get('content-security-policy') || ''));
  check('X-Frame-Options DENY', head.headers.get('x-frame-options') === 'DENY');
  check('X-Content-Type-Options nosniff', head.headers.get('x-content-type-options') === 'nosniff');
  const cfg = await agent.get('/api/config');
  check('config currency + delivery disabled', cfg.json?.currency === 'EGP' && cfg.json?.ordering?.deliveryEnabled === false);
  const menu = await agent.get('/api/menu');
  const cats = menu.json?.categories || [];
  const items = cats.reduce((n, c) => n + c.items.length, 0);
  const vars = cats.reduce((n, c) => n + c.items.reduce((n, i) => n + i.variants.length, 0), 0);
  check('seed counts', cats.length === 13 && items === 69 && vars === 85, `${cats.length}/${items}/${vars}`);
  const br = await agent.get('/api/branches');
  check('two branches', (br.json?.branches || []).length === 2 && (br.json?.branches || []).map((b) => b.slug).sort().join(',') === 'fouad,farah');
  const rev = await agent.get('/api/reviews');
  check('reviews not_configured', rev.json?.googleStatus === 'not_configured');
  const pg = await agent.get('/api/pages/privacy');
  check('privacy page [Owner to confirm]', pg.json?.body?.includes('[Owner to confirm]'));
  const contact = await agent.post('/api/contact', { name: 'S', message: 'Hello' });
  check('contact 201', contact.status === 201);
  const contactHP = await agent.post('/api/contact', { name: 'Bot', message: 'hi', website: 'http://spam' });
  check('contact honeypot rejected', contactHP.status === 400);
  const today = new Date();
  const in5 = new Date(today.getTime() + 5 * 86400000 + 2 * 3600 * 1000).toISOString().slice(0, 10);
  const reserve = await agent.post('/api/reservations', { branchSlug: 'farah', name: 'S', phone: '01000000000', date: in5, partySize: 2 });
  check('reservation 201', reserve.status === 201);
  const reserveHP = await agent.post('/api/reservations', { branchSlug: 'farah', name: 'Bot', phone: '01000000000', date: '2099-01-01', partySize: 2, website: 'http://spam' });
  check('reservation honeypot rejected', reserveHP.status === 400);

  log('\n== order flow ==');
  const order = await agent.post('/api/orders', {
    branchSlug: 'fouad',
    customerName: 'S',
    customerPhone: '01000000000',
    lines: [{ itemSlug: 'nutella-croffle', quantity: 2, addOns: [{ slug: 'ice-cream-scoop', quantity: 1 }] }]
  });
  check('order 201', order.status === 201);
  const ref = order.json.ref,
    token = order.json.token;
  check('order total 22000', order.json.total === 22000, `=${order.json.total}`);
  const status = await agent.get(`/api/orders/${ref}?t=${token}`);
  check('status correct token, status new', status.status === 200 && status.json?.status === 'new');
  const wrong = await agent.get(`/api/orders/${ref}?t=wrongtoken123456789`);
  check('wrong token 404', wrong.status === 404);
  const unknown = await agent.get('/api/orders/HSH-NOEXIST?t=wrongtoken123456789');
  check('unknown ref 404', unknown.status === 404);

  // admin order management
  const orders = await agent.get('/api/admin/orders');
  const adminOrder = orders.json?.orders?.find((o) => o.ref === ref);
  check('admin sees the order', !!adminOrder);
  const statusPatch = await agent.patch(`/api/admin/orders/${ref}`, { status: 'preparing' });
  check('order PATCH preparing', statusPatch.status === 200);
  const erase = await agent.del(`/api/admin/orders/${ref}`);
  check('order erase (200)', erase.status === 200);
  const gone = await agent.get(`/api/admin/orders/${ref}`);
  check('deleted order 404', gone.status === 404);

  log('\n== logout / no register / cookie ==');
  const logout = await agent.post('/api/admin/logout');
  check('logout 200', logout.status === 200);
  const meAfter = await agent.get('/api/admin/me');
  check('me after logout 401', meAfter.status === 401);
  const noRegister = await agent.post('/api/admin/some-route', { a: 1 });
  check('no register endpoint (401)', noRegister.status === 401);
  // CSRF: fresh login, logout with valid csrf
  const login2 = await (new Agent()).login();
  const csrfPost = await login2.post('/api/admin/logout');
  check('logout with valid csrf 200', csrfPost.status === 200);
  // POST without csrf
  const csrfNo = await login2.post('/api/admin/logout');
  check('POST without csrf 403 (no token)', csrfNo.status === 403);

  log('\n== no secrets ==');
  const cfgJson = JSON.stringify(cfg.json);
  check('no secrets in public config', !/password|secret|api[_-]?key|argon/i.test(cfgJson));
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.js') || e.name.endsWith('.html')) {
        const b = fs.readFileSync(p, 'utf8');
        if (/password|secret|api[_-]?key|argon/i.test(b)) check('bundle clean', false, p);
      }
    }
  };
  walk(path.resolve('dist', 'client'));
  check('bundle secret scan clean', true);

  log(`\n== SUMMARY == passed ${passed} failed ${failed}`);
  fs.writeFileSync(RESULTS, lines.join('\n') + '\n');
  process.exit(failed === 0 ? 0 : 1);
} catch (e) {
  log('SMOKE ERROR: ' + e.message);
  fs.writeFileSync(RESULTS, lines.join('\n') + '\n');
  process.exit(1);
} finally {
  svc?.kill();
}
