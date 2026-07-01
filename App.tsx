import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart } from 'lucide-react';
import Header from './Header';
import BookDetail from './BookDetail';
import StoryMap from './StoryMap';
import IntranetDashboard from './IntranetDashboard';
import { BookOrder } from './types';

export default function App() {
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
        body: JSON.stringify({
          customerName: name,
          customerEmail: email,
          bookFormat: format,
          price: computedPrice,
          dedicationRequest: dedication || undefined
        })
      }).then(res => {
        if (res.ok) fetchOrdersList();
      });

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
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          setOrders(data);
        }
      }
    } catch (err) {
      console.warn("Gracefully deferred order sync on network exception:", err);
    }
  };

  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="bg-[#FCFAF6] min-h-screen text-[#4A3225] flex flex-col font-sans selection:bg-[#EBDCCB]">
      
      <div className="bg-[#2E4A3F] text-emerald-100 text-center py-2 px-4 text-xs font-mono tracking-wide relative overflow-hidden flex justify-center items-center gap-2">
        <span className="bg-[#C19358] text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">Livre Officiel</span>
        <span>Aventure authentique de 90 jours : <strong>69,000 km</strong> réalisés par deux darons bretons de 69 ans.</span>
      </div>

      <AnimatePresence>
        {stripeMessage && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 shadow-2xl rounded-2xl border"
          >
            {stripeMessage.type === 'success' ? (
              <div className="bg-emerald-50 border-2 border-emerald-500 text-emerald-950 p-5 rounded-2xl relative">
                <button 
                  onClick={() => setStripeMessage(null)}
                  className="absolute top-2 right-2 text-emerald-700 hover:text-emerald-950 text-base font-bold bg-transparent border-none cursor-pointer"
                >
                  ✕
                </button>
                <div className="flex items-start space-x-3">
                  <span className="text-2xl mt-0.5">🎉</span>
                  <div>
                    <h4 className="font-bold text-sm text-emerald-900">Paiement Réussi !</h4>
                    <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                      Merci pour votre achat, <strong>{stripeMessage.name}</strong> ! Votre commande de la version <span className="underline">{stripeMessage.format === 'printed' ? 'Brochée' : stripeMessage.format === 'hardcover' ? 'Luxe' : 'Numérique'}</span> ({stripeMessage.price} €) a été validée avec succès sur le serveur de paiement Stripe et enregistrée sur l'Intranet !
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border-2 border-amber-500 text-amber-950 p-5 rounded-2xl relative">
                <button 
                  onClick={() => setStripeMessage(null)}
                  className="absolute top-2 right-2 text-amber-700 hover:text-amber-950 text-base font-bold bg-transparent border-none cursor-pointer"
                >
                  ✕
                </button>
                <div className="flex items-start space-x-3">
                  <span className="text-2xl mt-0.5">⚠️</span>
                  <div>
                    <h4 className="font-bold text-sm text-amber-900">Paiement Annulé</h4>
                    <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                      La transaction Stripe a été annulée ou interrompue. Aucun frais n'a été débité de votre carte bancaire.
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
            <motion.div
              key="store"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <BookDetail onSuccessOrder={fetchOrdersList} />
            </motion.div>
          )}

          {currentView === 'timeline' && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
            >
              <StoryMap />
            </motion.div>
          )}

          {currentView === 'intranet' && (
            <motion.div
              key="intranet"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <IntranetDashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="bg-[#4A3225] text-[#FCFAF6] border-t border-[#362116] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#C19358]">Livre "69" — Patrice & Mam</h3>
              <p className="text-xs text-[#EBDCCB]/80 leading-relaxed font-serif">
                « Ce livre est l'histoire de deux âmes sœurs qui ont osé forcer le destin, prouvant à leurs enfants et petits-enfants que C'EST POSSIBLE à n'importe quel âge. »
              </p>
              <p className="text-[10px] text-[#C19358] font-mono uppercase">Créé pour un cher papa baroudeur</p>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <h3 className="text-sm font-serif font-bold text-[#C19358] uppercase tracking-wider">Navigation</h3>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => setView('store')} className="text-[#EBDCCB]/80 hover:text-white transition-colors bg-transparent border-none text-left p-0 cursor-pointer">
                    → Présentation & Boutique du Livre
                  </button>
                </li>
                <li>
                  <button onClick={() => setView('timeline')} className="text-[#EBDCCB]/80 hover:text-white transition-colors bg-transparent border-none text-left p-0 cursor-pointer">
                    → Journal de Bord interactif (22 étapes)
                  </button>
                </li>
                <li>
                  <button onClick={() => setView('intranet')} className="text-[#EBDCCB]/80 hover:text-white transition-colors bg-transparent border-none text-left p-0 cursor-pointer">
                    → Intranet Papa (Suivi & Générateur IA)
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <h3 className="text-sm font-serif font-bold text-[#C19358] uppercase tracking-wider">Les Conseils Clés de Patrice</h3>
              <ul className="space-y-1.5 text-[10px] text-[#EBDCCB]/70 leading-relaxed">
                <li>1. Prenez toujours une assurance voyage et bagages.</li>
                <li>2. Demandez vos permis internationaux 6 mois à l'avance.</li>
                <li>3. Louez des 4x4 robustes pour l'outback de l'Océanie.</li>
                <li>4. Et surtout : gardez un baiser pour Momo nationale !</li>
              </ul>
            </div>

          </div>

          <div className="border-t border-[#5C3F2F]/60 mt-10 pt-6 text-center text-xs font-mono text-[#EBDCCB]/50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p>© {new Date().getFullYear()} Livre "69" de Patrice. Tous droits réservés.</p>
            <p className="text-[10px] flex items-center space-x-1">
              <span>Bâtit par son fils avec</span> <Heart className="w-3 h-3 text-red-500 fill-red-500 mx-1 inline" /> <span>en hommage à une aventure de légende.</span>
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
