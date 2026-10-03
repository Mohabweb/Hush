import { useEffect, useState } from 'react';
import { adminApi, getAdminSession, setAdminSession, type AdminSession } from '../api.js';
import { useLang } from '../i18n.jsx';
import Overview from './admin/Overview.jsx';
import OrdersAdmin from './admin/OrdersAdmin.jsx';
import Inbox from './admin/Inbox.jsx';
import MenuAdmin from './admin/MenuAdmin.jsx';
import BranchesAdmin from './admin/BranchesAdmin.jsx';
import ReviewsAdmin from './admin/ReviewsAdmin.jsx';
import ContentAdmin from './admin/ContentAdmin.jsx';
import SettingsAdmin from './admin/SettingsAdmin.jsx';
import StaffAdmin from './admin/StaffAdmin.jsx';

type Tab = 'overview' | 'orders' | 'inbox' | 'menu' | 'branches' | 'reviews' | 'content' | 'settings' | 'staff';

const TABS: { id: Tab; label: string; roles: string[] }[] = [
  { id: 'overview', label: 'Overview', roles: ['admin', 'manager', 'staff'] },
  { id: 'orders', label: 'Orders', roles: ['admin', 'manager', 'staff'] },
  { id: 'inbox', label: 'Inbox', roles: ['admin', 'manager', 'staff'] },
  { id: 'menu', label: 'Menu', roles: ['admin', 'manager'] },
  { id: 'branches', label: 'Branches', roles: ['admin', 'manager'] },
  { id: 'reviews', label: 'Reviews', roles: ['admin', 'manager'] },
  { id: 'content', label: 'Content', roles: ['admin', 'manager'] },
  { id: 'settings', label: 'Settings', roles: ['admin'] },
  { id: 'staff', label: 'Staff', roles: ['admin'] }
];

export default function Admin() {
  const { t } = useLang();
  const [session, setSession] = useState<AdminSession | null>(() => getAdminSession());

  useEffect(() => {
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = 'en';
  }, []);

  if (!session) return <Login onLogin={setSession} />;

  const role = session.user?.role || 'staff';
  const allowed = TABS.filter((tab) => tab.roles.includes(role));

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <span className="brand-word gold">HUSH · {t.admin.title}</span>
        <div className="admin-header-right">
          <span className="muted">{session.user?.email} ({role})</span>
          <button className="btn btn-ghost-light small-btn" onClick={async () => { await adminApi.logout().catch(() => {}); setAdminSession(null); setSession(null); }}>
            {t.admin.signOut}
          </button>
        </div>
      </header>
      <AdminTabs session={session} tabs={allowed} />
    </div>
  );
}

function AdminTabs({ session, tabs }: { session: AdminSession; tabs: typeof TABS }) {
  const [tab, setTab] = useState<Tab>('overview');
  return (
    <div className="admin-body">
      <nav className="admin-nav" aria-label="Admin sections">
        {tabs.map((tab_def) => (
          <button key={tab_def.id} className={tab === tab_def.id ? 'active' : ''} onClick={() => setTab(tab_def.id)}>
            {tab_def.label}
          </button>
        ))}
      </nav>
      <main className="admin-main">
        {tab === 'overview' && <Overview />}
        {tab === 'orders' && <OrdersAdmin />}
        {tab === 'inbox' && <Inbox />}
        {tab === 'menu' && <MenuAdmin />}
        {tab === 'branches' && <BranchesAdmin />}
        {tab === 'reviews' && <ReviewsAdmin />}
        {tab === 'content' && <ContentAdmin />}
        {tab === 'settings' && <SettingsAdmin />}
        {tab === 'staff' && <StaffAdmin session={session} />}
      </main>
    </div>
  );
}

function Login({ onLogin }: { onLogin: (s: AdminSession) => void }) {
  const { t } = useLang();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const s = await adminApi.login(email, password);
      onLogin(s);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-login">
      <form onSubmit={submit} className="form-panel">
        <h1>HUSH · {t.admin.title}</h1>
        <label>{t.admin.email}<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" /></label>
        <label>{t.admin.password}<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" /></label>
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        <button className="btn btn-olive" type="submit" disabled={busy}>{t.admin.signIn}</button>
      </form>
    </div>
  );
}
