import { useEffect, useState } from 'react';
import { useLang } from '../i18n.jsx';
import { api, type ApiBranch } from '../api.js';

export default function Contact() {
  const { lang, t } = useLang();
  const [branches, setBranches] = useState<ApiBranch[]>([]);

  useEffect(() => {
    api.branches().then((r) => setBranches(r.branches)).catch(() => {});
  }, []);

  return (
    <div className="container contact-page">
      <h1>{t.contact.title}</h1>
      <div className="contact-grid">
        <ContactForm />
        <ReservationForm branches={branches} />
      </div>
      <p className="muted small">{t.contact.reserveNote}</p>
    </div>
  );
}

function ContactForm() {
  const { t } = useLang();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.contact({ name, email, phone, message, website: '' });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.error);
    }
  }

  if (sent) return <div className="form-panel"><p className="success">{t.contact.sent}</p></div>;

  return (
    <form className="form-panel" onSubmit={submit}>
      <h2>{t.contact.title}</h2>
      <label>{t.checkout.name}<input value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} /></label>
      <label>{t.checkout.email}<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
      <label>{t.checkout.phone}<input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} /></label>
      <label>{t.contact.message}<textarea value={message} onChange={(e) => setMessage(e.target.value)} required rows={4} minLength={5} maxLength={2000} /></label>
      {/* honeypot */}
      <input type="text" name="website" value="" onChange={() => {}} style={{ display: 'none' }} tabIndex={-1} autoComplete="off" aria-hidden="true" />
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <button className="btn btn-olive" type="submit">{t.contact.send}</button>
    </form>
  );
}

function ReservationForm({ branches }: { branches: ApiBranch[] }) {
  const { lang, t } = useLang();
  const [branchSlug, setBranchSlug] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [note, setNote] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.reserve({ branchSlug, name, phone, date, time: time || undefined, partySize, note: note || undefined, website: '' });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.error);
    }
  }

  const today = new Date(Date.now() + 2 * 3600 * 1000).toISOString().slice(0, 10);
  const maxDate = new Date(Date.now() + 2 * 3600 * 1000 + 90 * 24 * 3600 * 1000).toISOString().slice(0, 10);

  if (sent) return <div className="form-panel"><p className="success">{t.contact.reserveSent}</p></div>;

  return (
    <form className="form-panel" onSubmit={submit}>
      <h2>{t.contact.reserve}</h2>
      <label>{t.checkout.branch}
        <select value={branchSlug} onChange={(e) => setBranchSlug(e.target.value)} required>
          <option value="" disabled>—</option>
          {branches.map((b) => <option key={b.slug} value={b.slug}>{lang === 'ar' ? b.address : b.name}</option>)}
        </select>
      </label>
      <label>{t.checkout.name}<input value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} /></label>
      <label>{t.checkout.phone}<input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required /></label>
      <label>{t.contact.date}<input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={today} max={maxDate} required /></label>
      <label>{t.contact.time}<input type="time" value={time} onChange={(e) => setTime(e.target.value)} /></label>
      <label>{t.contact.party}<input type="number" min={1} max={40} value={partySize} onChange={(e) => setPartySize(Number(e.target.value))} required /></label>
      <label>{t.checkout.note}<textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} maxLength={500} /></label>
      {/* honeypot */}
      <input type="text" name="website" value="" onChange={() => {}} style={{ display: 'none' }} tabIndex={-1} autoComplete="off" aria-hidden="true" />
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <button className="btn btn-rust" type="submit">{t.contact.reserveSend}</button>
      <p className="muted small">{t.contact.reserveNote}</p>
    </form>
  );
}
