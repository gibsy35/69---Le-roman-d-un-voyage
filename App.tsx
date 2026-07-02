import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart } from 'lucide-react';
import Header from './Header';
import BookDetail from './BookDetail';
import StoryMap from './StoryMap';
import IntranetDashboard from './IntranetDashboard';
import { LanguageProvider, useLang } from './LanguageContext';
import { BookOrder } from './types';

// ── Bannière bilingue ──────────────────────────────────────────
function BannerI18n() {
  const { t } = useLang();
  return (
    <div className="bg-[#2E4A3F] text-emerald-100 text-center py-2 px-4 text-xs font-mono tracking-wide flex justify-center items-center gap-2">
      <span className="bg-[#C19358] text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">
        {t('Livre Officiel', 'Official Book')}
      </span>
      <span>
        {t('Aventure authentique de 90 jours : ', 'Authentic 90-day adventure: ')}
        <strong>69,000 km</strong>
        {t(' réalisés par deux darons bretons de 69 ans.', ' covered by two 69-year-old Breton dads.')}
      </span>
    </div>
  );
}

// ── Gate d'accès Espace Papa ───────────────────────────────────
const ACCESS_CODE = 'PATRICE-69';

function IntranetGate() {
  const [unlocked, setUnlocked] = React.useState(() => {
    return sessionStorage.getItem('espacePapaUnlocked') === 'true';
  });
  const [input, setInput] = React.useState('');
  const [error, setError] = React.useState(false);
  const [shake, setShake] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim().toUpperCase() === ACCESS_CODE) {
      sessionStorage.setItem('espacePapaUnlocked', 'true');
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
      setShake(true);
      setInput('');
      setTimeout(() => setShake(false), 500);
    }
  };

  if (unlocked) return <IntranetDashboard />;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4" style={{ background: '#EEF3ED' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg" style={{ background: '#3A6B44' }}>
            <span className="text-3xl">🎒</span>
          </div>
          <h2 className="font-serif font-black text-2xl mb-2" style={{ color: '#1A2E1E' }}>Espace Papa</h2>
          <p className="text-sm font-mono" style={{ color: '#5A7A5E' }}>Zone privée — accès réservé</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div
            className="bg-white rounded-2xl p-6 shadow-md space-y-4 transition-all"
            style={{
              border: '1px solid #C8D9C4',
              transform: shake ? 'translateX(-5px)' : 'translateX(0)',
              transition: 'transform 0.15s ease',
            }}
          >
            <div>
              <label className="block text-xs font-mono font-bold mb-2 uppercase tracking-widest" style={{ color: '#3A6B44' }}>
                Code d'accès
              </label>
              <input
                type="password"
                value={input}
                onChange={e => { setInput(e.target.value); setError(false); }}
                placeholder="••••••••••"
                autoFocus
                className="w-full px-4 py-3 rounded-xl text-sm font-mono text-center tracking-widest focus:outline-none transition-all"
                style={{
                  background: '#F4F8F3',
                  border: `2px solid ${error ? '#C4622D' : '#C8D9C4'}`,
                  color: '#1A2E1E',
                }}
              />
              {error && (
                <p className="text-center text-xs font-mono mt-2 font-bold" style={{ color: '#C4622D' }}>
                  Code incorrect. Réessayez.
                </p>
              )}
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl text-sm font-bold text-white cursor-pointer transition-colors"
              style={{ background: '#3A6B44' }}
            >
              Accéder à l'Espace Papa →
            </button>
          </div>
        </form>
        <p className="text-center text-xs font-mono mt-4" style={{ color: '#7A9A7E' }}>
          Session sécurisée · Accès unique par onglet
        </p>
      </div>
    </div>
  );
}

// ── App principale ─────────────────────────────────────────────
function AppInner() {
  const { t } = useLang();
  const [currentView, setView] = useState<'store' | 'timeline' | 'intranet'>('store');
  const [orders, setOrders] = useState<BookOrder[]>([]);
  const [stripeMessage, setStripeMessage] = useState<{ type: 'success' | 'cancel'; name?: string; format?: string; price?: number } | null>(null);

  useEffect(() => {
    fetchOrdersList();
    const interval = setInterval(fetchOrdersList, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success_stripe') === 'true') {
      const format = params.get('format') || 'printed';
      const email = params.get('email') || '';
      const name = params.get('name') || '';
      const dedication = params.get('dedication') || '';
      const priceMap: { [key: string]: number } = { printed: 22, hardcover: 39, pdf: 9.9 };
      const computedPrice = priceMap[format] || 22;
      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName: name, customerEmail: email, bookFormat: format, price: computedPrice, dedicationRequest: dedication || undefined })
      }).then(res => { if (res.ok) fetchOrdersList(); });
      setStripeMessage({ type: 'success', name, format, price: computedPrice });
      window.history.replaceState(null, '', window.location.pathname);
    } else if (params.get('cancel_stripe') === 'true') {
      setStripeMessage({ type: 'cancel' });
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  const fetchOrdersList = async () => {
    try {
      const response = await fetch('/api/orders');
      if (response.ok) {
        const ct = response.headers.get('content-type');
        if (ct && ct.includes('application/json')) {
          const data = await response.json();
          setOrders(data);
        }
      }
    } catch (err) {
      console.warn('Order sync deferred:', err);
    }
  };

  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="bg-[#FCFAF6] min-h-screen text-[#4A3225] flex flex-col font-sans selection:bg-[#EBDCCB]">

      <BannerI18n />

      <AnimatePresence>
        {stripeMessage && (
          <motion.div
            initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -40 }}
            className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 shadow-2xl rounded-2xl border"
          >
            {stripeMessage.type === 'success' ? (
              <div className="bg-emerald-50 border-2 border-emerald-500 text-emerald-950 p-5 rounded-2xl relative">
                <button onClick={() => setStripeMessage(null)} className="absolute top-2 right-2 text-emerald-700 hover:text-emerald-950 text-base font-bold bg-transparent border-none cursor-pointer">✕</button>
                <div className="flex items-start space-x-3">
                  <span className="text-2xl mt-0.5">🎉</span>
                  <div>
                    <h4 className="font-bold text-sm text-emerald-900">{t('Paiement Réussi !', 'Payment Successful!')}</h4>
                    <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                      {t('Merci pour votre achat,', 'Thank you for your purchase,')} <strong>{stripeMessage.name}</strong>!
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border-2 border-amber-500 text-amber-950 p-5 rounded-2xl relative">
                <button onClick={() => setStripeMessage(null)} className="absolute top-2 right-2 text-amber-700 hover:text-amber-950 text-base font-bold bg-transparent border-none cursor-pointer">✕</button>
                <div className="flex items-start space-x-3">
                  <span className="text-2xl mt-0.5">⚠️</span>
                  <div>
                    <h4 className="font-bold text-sm text-amber-900">{t('Paiement Annulé', 'Payment Cancelled')}</h4>
                    <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                      {t('La transaction a été annulée. Aucun frais débité.', 'The transaction was cancelled. No charge was made.')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Header currentView={currentView} setView={setView} ordersCount={pendingOrders} />

      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {currentView === 'store' && (
            <motion.div key="store" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}>
              <BookDetail onSuccessOrder={fetchOrdersList} />
            </motion.div>
          )}
          {currentView === 'timeline' && (
            <motion.div key="timeline" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.3 }}>
              <StoryMap />
            </motion.div>
          )}
          {currentView === 'intranet' && (
            <motion.div key="intranet" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}>
              <IntranetGate />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="bg-[#4A3225] text-[#FCFAF6] border-t border-[#362116] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#C19358]">Livre {'\u00ab\u202f'}69{'\u202f\u00bb'} — Patrice & Mam</h3>
              <p className="text-xs text-[#EBDCCB]/80 leading-relaxed font-serif">
                {t(
                  "« Ce livre est l'histoire de deux âmes sœurs qui ont osé forcer le destin, prouvant à leurs enfants que C'EST POSSIBLE à n'importe quel âge. »",
                  "« This book is the story of two kindred spirits who dared to force destiny, proving to their children that IT'S POSSIBLE at any age. »"
                )}
              </p>
              <p className="text-[10px] text-[#C19358] font-mono uppercase">{t('Créé pour un cher papa baroudeur', 'Created for a beloved adventurous dad')}</p>
            </div>
            <div className="space-y-3 text-xs font-mono">
              <h3 className="text-sm font-serif font-bold text-[#C19358] uppercase tracking-wider">{t('Navigation', 'Navigation')}</h3>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => setView('store')} className="text-[#EBDCCB]/80 hover:text-white transition-colors bg-transparent border-none text-left p-0 cursor-pointer">
                    → {t('Présentation & Boutique du Livre', 'Book Presentation & Shop')}
                  </button>
                </li>
                <li>
                  <button onClick={() => setView('timeline')} className="text-[#EBDCCB]/80 hover:text-white transition-colors bg-transparent border-none text-left p-0 cursor-pointer">
                    → {t('Journal de Bord interactif', 'Interactive Travel Log')}
                  </button>
                </li>
                <li>
                  <button onClick={() => setView('intranet')} className="text-[#EBDCCB]/80 hover:text-white transition-colors bg-transparent border-none text-left p-0 cursor-pointer">
                    → {t('Espace Papa', "Dad's Space")}
                  </button>
                </li>
              </ul>
            </div>
            <div className="space-y-3 text-xs font-mono">
              <h3 className="text-sm font-serif font-bold text-[#C19358] uppercase tracking-wider">{t('Les Conseils de Patrice', "Patrice's Tips")}</h3>
              <ul className="space-y-1.5 text-[10px] text-[#EBDCCB]/70 leading-relaxed">
                <li>{t('1. Prenez toujours une assurance voyage et bagages.', '1. Always take out travel and luggage insurance.')}</li>
                <li>{t('2. Demandez vos permis internationaux 6 mois à l\'avance.', '2. Apply for international driving licences 6 months ahead.')}</li>
                <li>{t('3. Louez des 4x4 robustes pour l\'outback de l\'Océanie.', '3. Rent sturdy 4x4s for the Oceanian outback.')}</li>
                <li>{t('4. Et surtout : gardez un baiser pour Momo nationale !', '4. Above all: save a kiss for the national darling!')}</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#5C3F2F]/60 mt-10 pt-6 text-center text-xs font-mono text-[#EBDCCB]/50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p>© {new Date().getFullYear()} {t('Livre 69 de Patrice. Tous droits réservés.', 'Book 69 by Patrice. All rights reserved.')}</p>
            <p className="text-[10px] flex items-center space-x-1">
              <span>{t('Bâtit par son fils avec', 'Built by his son with')}</span>
              <Heart className="w-3 h-3 text-red-500 fill-red-500 mx-1 inline" />
              <span>{t('en hommage à une aventure de légende.', 'in tribute to a legendary adventure.')}</span>
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppInner />
    </LanguageProvider>
  );
}
