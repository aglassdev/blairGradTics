import { useState, useEffect } from 'react';
import { databases, DB_ID, COL_ID, ID } from './appwrite';
import { Query } from 'appwrite';
import './App.css';

function AddModal({ onClose, onAdded }) {
  const [form, setForm] = useState({
    sellerName: '',
    instagram: '',
    phone: '',
    email: '',
    ticketsAvailable: '',
    pricePerTicket: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.sellerName || !form.ticketsAvailable || !form.pricePerTicket) {
      setError('Name, ticket count, and price are required.');
      return;
    }
    if (!form.instagram && !form.phone && !form.email) {
      setError('Add at least one contact method.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const doc = await databases.createDocument(DB_ID, COL_ID, ID.unique(), {
        sellerName: form.sellerName.trim(),
        instagram: form.instagram.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        ticketsAvailable: parseInt(form.ticketsAvailable, 10),
        pricePerTicket: parseFloat(form.pricePerTicket),
      });
      onAdded(doc);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to post listing. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">Post a Listing</span>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <form className="modal-body" onSubmit={handleSubmit}>
          <div className="field">
            <label>Your Name *</label>
            <input
              type="text"
              placeholder="First Last"
              value={form.sellerName}
              onChange={e => set('sellerName', e.target.value)}
              maxLength={128}
            />
          </div>

          <div className="field-group">
            <div className="field">
              <label>Tickets *</label>
              <input
                type="number"
                placeholder="2"
                min="1"
                max="20"
                value={form.ticketsAvailable}
                onChange={e => set('ticketsAvailable', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Price / Ticket *</label>
              <input
                type="number"
                placeholder="5"
                min="0"
                step="0.01"
                value={form.pricePerTicket}
                onChange={e => set('pricePerTicket', e.target.value)}
              />
            </div>
          </div>

          <span className="section-label">Contact (at least one)</span>

          <div className="field">
            <label>Instagram</label>
            <input
              type="text"
              placeholder="@handle"
              value={form.instagram}
              onChange={e => set('instagram', e.target.value)}
              maxLength={128}
            />
          </div>

          <div className="field-group">
            <div className="field">
              <label>Phone</label>
              <input
                type="tel"
                placeholder="(555) 000-0000"
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                maxLength={32}
              />
            </div>
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                placeholder="you@email.com"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                maxLength={256}
              />
            </div>
          </div>

          {error && <p className="error-msg">{error}</p>}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Posting...' : 'Post Listing'}
          </button>
        </form>
      </div>
    </div>
  );
}

function ListingCard({ listing }) {
  const { sellerName, instagram, phone, email, ticketsAvailable, pricePerTicket, $createdAt } = listing;
  const posted = new Date($createdAt).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
  const contacts = [
    instagram && {
      icon: (
        <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
          <circle cx="12" cy="12" r="4"/>
          <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
        </svg>
      ),
      label: instagram.startsWith('@') ? instagram : `@${instagram}`,
      href: `https://instagram.com/${instagram.replace('@', '')}`,
    },
    phone && {
      icon: (
        <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .99h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
        </svg>
      ),
      label: phone,
      href: `tel:${phone}`,
    },
    email && {
      icon: (
        <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
      ),
      label: email,
      href: `mailto:${email}`,
    },
  ].filter(Boolean);

  return (
    <div className="card">
      <div className="card-header">
        <span className="seller-name">{sellerName}</span>
        <span className="posted-time">{posted}</span>
      </div>
      <p className="tickets-count">
        <strong>{ticketsAvailable}</strong> ticket{ticketsAvailable !== 1 ? 's' : ''} available &middot; <strong>${pricePerTicket % 1 === 0 ? pricePerTicket : pricePerTicket.toFixed(2)}</strong> per ticket
      </p>
      <div className="divider" />
      <div className="contact-list">
        {contacts.map((c, i) => (
          <div key={i} className="contact-item">
            {c.icon}
            <a href={c.href} target="_blank" rel="noopener noreferrer">{c.label}</a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [dark, setDark] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    databases.listDocuments(DB_ID, COL_ID, [Query.orderDesc('$createdAt')])
      .then(res => setListings(res.documents))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleAdded = (doc) => setListings(prev => [doc, ...prev]);

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo-area">
            <img src="/O9pNI9t7_400x400-removebg-preview.png" alt="Blair GradTics logo" className="logo-img" />
            <span className="logo-text">Blair Grad<span>Tics</span></span>
          </div>
          <div className="header-actions">
            <button className="add-btn" onClick={() => setShowModal(true)}>
              <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Sell Tickets
            </button>
            <button className="theme-btn" onClick={() => setDark(d => !d)} aria-label="Toggle theme">
              {dark ? (
                <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="main">
        <p className="page-title">
          {loading ? 'Loading listings...' : `${listings.length} listing${listings.length !== 1 ? 's' : ''}`}
        </p>

        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : listings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎓</div>
            <h3>No listings yet</h3>
            <p>Be the first to post your grad tickets for sale.</p>
          </div>
        ) : (
          <div className="listings-grid">
            {listings.map(l => <ListingCard key={l.$id} listing={l} />)}
          </div>
        )}
      </main>

      <footer className="footer">aglassdev production</footer>

      {showModal && <AddModal onClose={() => setShowModal(false)} onAdded={handleAdded} />}
    </div>
  );
}
