import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Star, ArrowRight, ShieldCheck, Check, Sparkles, ShoppingBag, Search, Truck, Loader2 } from 'lucide-react';
import { BookOrder, BookConfig } from './types';
import miyajimaCoverImg from './miyajima_cover_1781530821053.jpg';

interface BookDetailProps {
  onSuccessOrder: (order: BookOrder) => void;
}

const PREVIEW_CHAPTERS = [
  {
    num: "Vol. 13",
    title: "Le décollage du Fortuner dans le Bush",
    text: "« Le trou est si profond que la voiture décolle de la piste pour retomber 3 mètres plus loin en faisant à Mam la frayeur de sa vie... C'est alors qu'elle cherche à m'embrouiller en balançant ses bras dans le pare-brise. Je la regarde calmement sous la chaleur de 36°C étouffante et je lui crie de toutes mes forces : STOP, LAISSE-MOI CONDUIRE ! »"
  },
  {
    num: "Vol. 21",
    title: "Le classeur magique de 15h15",
    text: "« Mam is une vraie cocotte-minute d'inquiétude. Elle sort son grand classeur magique où est noté notre vol retour de Kaohsiung à 15h15. Je vérifie par acquis de conscience sur mon écran d'ordinateur à 9h30 sous la douche : le vol est à 10h15 ! Les bagages ne sont pas faits, la chambre ressemble à Beyrouth après la guerre des 20 kg. Mam en tombe en larmes... »"
  },
  {
    num: "Vol. 6",
    title: "Stephen, Ruth et nous",
    text: "« Stephen m'invite à boire un café en me donnant ses coordonnées. Ruth nous prépare un fameux gâteau à la banane qui réconcilie Mam avec ce fruit qu'elle déteste d'habitude. On assiste à la traite rotative spectaculaire de 1000 vaches. Deux grands darons bretons au milieu du lait de Nouvelle-Zélande : c'est possible à tout âge, même à 69 ans ! »"
  }
];

type Tab = 'presentation' | 'commander' | 'suivi' | 'auteurs' | 'extraits' | 'livreor';

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: 'presentation', label: 'Présentation', emoji: '📖' },
  { id: 'commander', label: 'Commander', emoji: '🛒' },
  { id: 'suivi', label: 'Suivi Colis', emoji: '📦' },
  { id: 'auteurs', label: 'Patrice & Mam', emoji: '👫' },
  { id: 'extraits', label: 'Extraits', emoji: '✍️' },
  { id: 'livreor', label: "Livre d'Or", emoji: '💬' },
];

export default function BookDetail({ onSuccessOrder }: BookDetailProps) {
  const [activeTab, setActiveTab] = useState<Tab>('presentation');
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'printed' | 'hardcover' | 'pdf'>('printed');
  const [showPreviewIdx, setShowPreviewIdx] = useState(0);
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerDedication, setBuyerDedication] = useState('');
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState<BookOrder | null>(null);
  const [stripeUrl, setStripeUrl] = useState<string | null>(null);
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [checkoutMode, setCheckoutMode] = useState<'real' | 'simulated'>('real');
  const [trackingSearch, setTrackingSearch] = useState('');
  const [searchedOrders, setSearchedOrders] = useState<BookOrder[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [bookConfig, setBookConfig] = useState<BookConfig>({
    coverImageUrl: "preset-miyajima",
    coverBorderColor: "#FD3D63",
    authorName: "PATRICE LEQUIME",
    bookTitle: "69",
    bookSubtitle: "C'EST POSSIBLE",
    topBadge: "69 ANS • 69 000 KM • 69 HEURES DE VOL",
    bottomLine: "69 LIEUX ÉTONNANTS • 69 RAISONS D'Y CROIRE...",
    backQuote: "« Poursuivez vos rêves. À 69 ans, tout est possible. »",
    backAboutTitle: "À PROPOS DE CE LIVRE",
    backAboutSubtitle: "Le livre à offrir à vos parents ou vos grands-parents",
    backAboutContent: "Ce bouquin est sans prétentions.\nNi un livre de photos, ni un guide touristique,\nni un roman d'aventures.\n\nJuste un récit dont l'ambition est de vous donner envie de toujours poursuivre vos rêves sans rien lâcher, en vous prouvant que « c'est possible » à n'importe quel âge.\n\nSi nous y sommes parvenus, alors vous aussi pouvez y parvenir."
  });
  const [guestbook, setGuestbook] = useState<any[]>([]);
  const [gbName, setGbName] = useState('');
  const [gbLocation, setGbLocation] = useState('');
  const [gbMessage, setGbMessage] = useState('');
  const [isSubmittingGb, setIsSubmittingGb] = useState(false);
  const [gbSuccess, setGbSuccess] = useState(false);
  const [gbError, setGbError] = useState('');

  React.useEffect(() => {
    fetch("/api/book-config").then(r => r.json()).then(d => { if (d && !d.error) setBookConfig(d); }).catch(() => {});
    fetch("/api/guestbook").then(r => r.json()).then(d => { if (Array.isArray(d)) setGuestbook(d); }).catch(() => {});
  }, []);

  const getCoverImageSrc = (url: string) => {
    if (url === "preset-miyajima") return miyajimaCoverImg;
    if (url === "preset-fuji") return "https://images.unsplash.com/photo-1578637387939-43c525550085?auto=format&fit=crop&q=80&w=600";
    if (url === "preset-tokyo") return "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=600";
    if (url === "preset-kyoto") return "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=600";
    return url || miyajimaCoverImg;
  };

  const getPrice = () => selectedFormat === 'printed' ? 22 : selectedFormat === 'hardcover' ? 39 : 9.90;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName || !buyerEmail) return;
    setIsOrdering(true);
    setStripeError(null);
    setStripeUrl(null);
    if (checkoutMode === 'real') {
      let paymentWindow: Window | null = null;
      try { paymentWindow = window.open("", "_blank"); } catch (_) {}
      try {
        const response = await fetch("/api/create-checkout-session", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customerName: buyerName, customerEmail: buyerEmail, bookFormat: selectedFormat, dedicationRequest: buyerDedication || undefined })
        });
        const data = await response.json();
        if (data.error === "stripe_not_configured") { if (paymentWindow) paymentWindow.close(); setStripeError("stripe_not_configured"); setIsOrdering(false); return; }
        if (data.url) { setStripeUrl(data.url); setIsOrdering(false); if (paymentWindow) paymentWindow.location.href = data.url; return; }
        if (data.error) { if (paymentWindow) paymentWindow.close(); setStripeError(data.error); setIsOrdering(false); return; }
      } catch (err: any) { if (paymentWindow) paymentWindow.close(); setStripeError(err.message); setIsOrdering(false); return; }
    }
    try {
      const response = await fetch("/api/orders", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerName: buyerName, customerEmail: buyerEmail, bookFormat: selectedFormat, price: getPrice(), dedicationRequest: buyerDedication || undefined })
      });
      const data = await response.json();
      setOrderPlaced(data);
      onSuccessOrder(data);
      setBuyerName(''); setBuyerEmail(''); setBuyerDedication('');
    } catch (err) { setStripeError("Une erreur est survenue."); }
    finally { setIsOrdering(false); }
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingSearch.trim()) return;
    setSearchLoading(true); setSearchError(''); setSearchedOrders(null);
    try {
      const res = await fetch(`/api/orders/lookup?search=${encodeURIComponent(trackingSearch.trim())}`);
      if (res.ok) { const data = await res.json(); setSearchedOrders(data); if (data.length === 0) setSearchError("Aucune commande trouvée."); }
      else setSearchError("Impossible de récupérer vos informations.");
    } catch { setSearchError("Erreur de connexion."); }
    finally { setSearchLoading(false); }
  };

  const handlePostGuestbook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gbName.trim() || !gbMessage.trim()) return;
    setIsSubmittingGb(true); setGbError(''); setGbSuccess(false);
    try {
      const response = await fetch('/api/guestbook', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: gbName.trim(), location: gbLocation.trim(), message: gbMessage.trim() }) });
      if (response.ok) { const newMsg = await response.json(); setGuestbook(prev => [newMsg, ...prev]); setGbName(''); setGbLocation(''); setGbMessage(''); setGbSuccess(true); setTimeout(() => setGbSuccess(false), 5000); }
      else setGbError("Impossible d'ajouter votre message.");
    } catch { setGbError("Erreur de connexion."); }
    finally { setIsSubmittingGb(false); }
  };

  // Composant couverture 3D réutilisable
  const BookCover3D = ({ size = 'large' }: { size?: 'large' | 'small' }) => {
    const isLarge = size === 'large';
    return (
      <div className={`relative ${isLarge ? 'w-72 sm:w-[300px] h-[450px] sm:h-[480px]' : 'w-48 h-72'} perspective-1000 group`}>
        <motion.div className="w-full h-full relative" style={{ transformStyle: 'preserve-3d' }} animate={{ rotateY: isFlipped ? 180 : 0 }} transition={{ duration: 0.7, ease: "easeInOut" }}>
          {/* RECTO */}
          <div className="absolute inset-0 rounded-2xl shadow-2xl border-[10px] bg-white flex flex-col justify-between overflow-hidden" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', borderColor: bookConfig.coverBorderColor }}>
            <div className="absolute inset-0 z-0 bg-slate-900">
              <img src={getCoverImageSrc(bookConfig.coverImageUrl)} alt="Couverture" className="w-full h-full object-cover opacity-90 brightness-[0.85] saturate-[1.1]" />
            </div>
            <div className="relative z-10 p-3 pt-5 text-center text-white font-mono select-none pointer-events-none">
              <p className="text-[9px] tracking-[0.2em] font-medium text-white/90">{bookConfig.authorName}</p>
              <p className="text-[8px] font-bold text-white uppercase mt-1 bg-black/30 py-0.5 px-1.5 rounded inline-block">{bookConfig.topBadge}</p>
            </div>
            <div className="relative z-10 text-center my-auto select-none pointer-events-none">
              <h1 className={`font-serif font-black tracking-tighter text-white drop-shadow-[0_6px_6px_rgba(0,0,0,0.5)] leading-none ${isLarge ? 'text-[90px]' : 'text-[56px]'}`}>{bookConfig.bookTitle}</h1>
              <h2 className={`font-sans font-black tracking-[0.25em] text-white mt-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] ${isLarge ? 'text-xl' : 'text-sm'}`}>{bookConfig.bookSubtitle}</h2>
            </div>
            <div className="relative z-10 p-3 pb-5 text-center text-white font-mono select-none pointer-events-none">
              <p className="text-[8px] tracking-widest font-bold uppercase bg-black/10 py-0.5 rounded">{bookConfig.bottomLine}</p>
            </div>
          </div>
          {/* VERSO */}
          <div className="absolute inset-0 rounded-2xl shadow-2xl border-[10px] bg-white p-5 flex flex-col justify-between overflow-hidden" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)', borderColor: bookConfig.coverBorderColor }}>
            <div className="text-center z-10">
              <p className="font-sans font-bold text-[10px] uppercase tracking-wide" style={{ color: bookConfig.coverBorderColor }}>{bookConfig.backAboutSubtitle}</p>
              <h3 className="font-sans font-black text-lg tracking-wide mt-1 border-b-2 pb-1" style={{ color: bookConfig.coverBorderColor, borderColor: `${bookConfig.coverBorderColor}40` }}>{bookConfig.backAboutTitle}</h3>
            </div>
            <div className="my-auto z-10 text-xs font-serif italic text-gray-800 leading-relaxed whitespace-pre-line">{bookConfig.backAboutContent}</div>
            <div className="z-10 bg-amber-50/55 border-l-4 p-2 text-center" style={{ borderLeftColor: bookConfig.coverBorderColor }}>
              <p className="font-serif italic text-[11px] text-gray-900 leading-tight">{bookConfig.backQuote}</p>
            </div>
            <div className="z-10 border-t border-gray-200 pt-2 text-center">
              <p className="font-sans font-black text-[10px] tracking-widest" style={{ color: bookConfig.coverBorderColor }}>{bookConfig.authorName}</p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="bg-[#FCFAF6] min-h-screen">

      {/* Hero compact */}
      <div className="bg-[#4A3225] text-white py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-10">
          <div className="flex flex-col items-center gap-4">
            <BookCover3D size="large" />
            <button onClick={() => setIsFlipped(!isFlipped)} className="px-4 py-2 bg-[#FD3D63] hover:bg-[#E2254B] text-white font-mono text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors">
              🔄 {isFlipped ? "Voir la couverture" : "Voir le verso"}
            </button>
          </div>
          <div className="text-center lg:text-left max-w-xl">
            <span className="inline-block bg-[#C19358]/20 text-[#C19358] px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider mb-3">🌍 Le Best-Seller des Darons Baroudeurs</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold leading-tight mb-4">La consécration de 3 mois de périple sauvage</h2>
            <p className="text-[#EBDCCB]/80 text-sm leading-relaxed mb-6">Ce récit prouve que <strong className="text-white">« C'EST POSSIBLE »</strong> à n'importe quel âge. 90 jours, 69 000 km, deux darons bretons de 69 ans au bout du monde.</p>
            <div className="flex justify-center lg:justify-start gap-6 font-mono text-center border-t border-white/10 pt-6">
              <div><span className="block text-2xl font-serif font-black text-[#C19358]">69 000</span><span className="text-[10px] text-[#EBDCCB]/60 uppercase">Kilomètres</span></div>
              <div><span className="block text-2xl font-serif font-black text-[#C19358]">69h</span><span className="text-[10px] text-[#EBDCCB]/60 uppercase">Heures de vol</span></div>
              <div><span className="block text-2xl font-serif font-black text-[#C19358]">69</span><span className="text-[10px] text-[#EBDCCB]/60 uppercase">Sites & Régions</span></div>
            </div>
            <div className="mt-6 flex flex-wrap justify-center lg:justify-start gap-2">
              <button onClick={() => setActiveTab('commander')} className="px-5 py-2.5 bg-[#8E5A3C] hover:bg-[#724831] text-white font-bold text-sm rounded-xl flex items-center gap-2 cursor-pointer transition-colors">
                <ShoppingBag className="w-4 h-4" /> Commander
              </button>
              <button onClick={() => setActiveTab('extraits')} className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium text-sm rounded-xl flex items-center gap-2 cursor-pointer transition-colors">
                <BookOpen className="w-4 h-4" /> Feuilleter
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="sticky top-16 sm:top-20 z-40 bg-[#FCFAF6] border-b border-[#E6DFD3] shadow-xs">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto gap-1 py-1 scrollbar-none">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-mono font-bold rounded-lg whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                  activeTab === tab.id ? 'bg-[#8E5A3C] text-white shadow-xs' : 'text-[#5C4D3C] hover:bg-[#EBDCCB]/40'
                }`}
              >
                <span>{tab.emoji}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenu onglets */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <AnimatePresence mode="wait">

          {/* ONGLET PRÉSENTATION */}
          {activeTab === 'presentation' && (
            <motion.div key="presentation" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { emoji: "🗺️", title: "Un vrai périple de baroudeur", text: "Pas un guide touristique, pas un album photos. L'aventure brute et authentique de deux Bretons de 69 ans qui ont osé partir 90 jours au bout du monde." },
                  { emoji: "😂", title: "Des gaffes mémorables", text: "Valises à 31 kg, voiture qui décolle dans le Bush, vols ratés à 45 minutes près : Patrice & Mam ne vous épargnent rien !" },
                  { emoji: "❤️", title: "Une histoire d'amour", text: "50 ans de complicité, deux caractères opposés, un même rêve. Ce livre est avant tout la célébration d'une vie partagée." }
                ].map((card, i) => (
                  <div key={i} className="bg-white border border-[#E6DFD3] rounded-2xl p-6 hover:shadow-md transition-shadow">
                    <span className="text-3xl">{card.emoji}</span>
                    <h3 className="font-serif font-bold text-lg text-[#4A3225] mt-3 mb-2">{card.title}</h3>
                    <p className="text-sm text-[#6B5A49] leading-relaxed">{card.text}</p>
                  </div>
                ))}
              </div>
              <div className="bg-[#4A3225] text-white rounded-2xl p-8 text-center">
                <p className="font-serif text-xl italic mb-4">« Ce livre dont l'ambition est de vous prouver que C'EST POSSIBLE à n'importe quel âge. »</p>
                <p className="text-[#C19358] font-mono text-sm">— Patrice Lequime</p>
                <button onClick={() => setActiveTab('commander')} className="mt-6 px-8 py-3 bg-[#8E5A3C] hover:bg-[#724831] text-white font-bold rounded-xl cursor-pointer transition-colors inline-flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" /> Obtenir mon exemplaire
                </button>
              </div>
            </motion.div>
          )}

          {/* ONGLET COMMANDER */}
          {activeTab === 'commander' && (
            <motion.div key="commander" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
              <div className="max-w-2xl mx-auto space-y-6">
                {/* Formats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'printed' as const, title: 'Édition Brochée', sub: 'Couverture souple illustrée', badge: 'Pré-commande', badgeColor: 'bg-amber-100 text-amber-800', note: '⌛ Uniquement en pré-commande', price: '22,00 €' },
                    { id: 'hardcover' as const, title: 'Luxe Illustré', sub: 'Grand format relié rigide', badge: 'Éd. Limitée', badgeColor: 'bg-[#C19358] text-white', note: '👑 Uniquement en pré-commande', price: '39,00 €' },
                    { id: 'pdf' as const, title: 'Édition Numérique', sub: 'Lecture immédiate', badge: 'Disponible', badgeColor: 'bg-emerald-100 text-emerald-800', note: '⚡ Disponible maintenant', price: '9,90 €' },
                  ].map(f => (
                    <button key={f.id} type="button" onClick={() => setSelectedFormat(f.id)}
                      className={`p-4 rounded-xl text-left border-2 transition-all cursor-pointer flex flex-col gap-1 ${selectedFormat === f.id ? 'border-[#8E5A3C] bg-white shadow-md' : 'border-[#E6DFD3] bg-transparent hover:border-[#8E5A3C]/50'}`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-serif font-black text-sm text-[#4A3225]">{f.title}</span>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${f.badgeColor}`}>{f.badge}</span>
                      </div>
                      <span className="text-xs font-mono text-[#8A7968]">{f.sub}</span>
                      <span className="text-[10px] font-mono text-amber-700 mt-1">{f.note}</span>
                      <span className="text-lg font-bold text-[#8E5A3C] mt-2">{f.price}</span>
                    </button>
                  ))}
                </div>

                {/* Formulaire */}
                <div className="bg-white border border-[#E6DFD3] rounded-2xl p-6 space-y-4">
                  <h4 className="font-serif font-black text-lg text-[#4A3225] flex items-center gap-2"><ShoppingBag className="w-5 h-5 text-[#8E5A3C]" /> Vos informations</h4>

                  {/* Sélecteur mode paiement */}
                  <div className="grid grid-cols-2 gap-2 bg-[#EBDCCB]/30 p-1.5 rounded-lg border border-[#E1DBCE]">
                    {[{ id: 'real' as const, label: '💳 CB / Stripe (Réel)', color: 'bg-[#8E5A3C]' }, { id: 'simulated' as const, label: '🧪 Simulateur (Test)', color: 'bg-[#2E4A3F]' }].map(m => (
                      <button key={m.id} type="button" onClick={() => { setCheckoutMode(m.id); setStripeError(null); }}
                        className={`py-1.5 px-2 rounded-md font-mono text-xs font-bold transition-all cursor-pointer ${checkoutMode === m.id ? `${m.color} text-white shadow-xs` : 'text-[#8A7968] hover:text-[#4A3225]'}`}
                      >{m.label}</button>
                    ))}
                  </div>

                  {stripeError === "stripe_not_configured" && (
                    <div className="bg-amber-50 border border-amber-300 p-3 rounded-xl text-xs text-amber-900 space-y-2">
                      <p className="font-bold">🔑 Stripe non configuré</p>
                      <p>Ajoutez <code className="bg-amber-100 px-1 rounded font-bold">STRIPE_SECRET_KEY</code> dans vos variables d'environnement Vercel.</p>
                      <button type="button" onClick={() => { setCheckoutMode('simulated'); setStripeError(null); }} className="text-xs bg-amber-600 text-white font-bold py-1 px-2.5 rounded cursor-pointer">👉 Passer en simulation</button>
                    </div>
                  )}

                  {stripeUrl ? (
                    <div className="bg-[#EAF5F0] border-2 border-[#A2D2BD] p-4 rounded-xl space-y-3">
                      <h5 className="font-serif font-black text-[#1C3A27]">✨ Lien de paiement prêt !</h5>
                      <a href={stripeUrl} target="_top" className="block w-full py-3 px-4 bg-[#8E5A3C] text-white text-center rounded-xl text-sm font-bold transition-all">
                        💳 Ouvrir le paiement Stripe ({getPrice().toFixed(2)} €) →
                      </a>
                      <button type="button" onClick={() => setStripeUrl(null)} className="text-xs text-[#8E5A3C] hover:underline cursor-pointer">✕ Annuler</button>
                    </div>
                  ) : orderPlaced ? (
                    <div className="bg-[#E4ECE9] border border-[#A7C5B8] p-4 rounded-xl text-center">
                      <Check className="w-8 h-8 text-[#2E4A3F] mx-auto mb-2" />
                      <h5 className="font-bold text-[#2E4A3F] text-sm">Merci {orderPlaced.customerName} !</h5>
                      <p className="text-xs text-[#426154] mt-1">Commande enregistrée pour <strong>{orderPlaced.customerEmail}</strong>.</p>
                      <button onClick={() => setOrderPlaced(null)} className="mt-3 text-xs text-[#8E5A3C] hover:underline font-mono cursor-pointer">Commander un autre exemplaire</button>
                    </div>
                  ) : (
                    <form onSubmit={handleCheckout} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input type="text" required placeholder="Votre Prénom et Nom" value={buyerName} onChange={e => setBuyerName(e.target.value)} className="w-full bg-[#FCFAF6] border border-[#D1C2A5] px-3 py-2 rounded-lg text-sm text-[#4A3225] focus:outline-none focus:ring-1 focus:ring-[#8E5A3C]" />
                        <input type="email" required placeholder="Votre Email" value={buyerEmail} onChange={e => setBuyerEmail(e.target.value)} className="w-full bg-[#FCFAF6] border border-[#D1C2A5] px-3 py-2 rounded-lg text-sm text-[#4A3225] focus:outline-none focus:ring-1 focus:ring-[#8E5A3C]" />
                      </div>
                      {selectedFormat !== 'pdf' && (
                        <input type="text" placeholder="✍️ Dédicace personnalisée (optionnel, gratuit)" value={buyerDedication} onChange={e => setBuyerDedication(e.target.value)} className="w-full bg-[#FCFAF6] border border-[#D1C2A5] px-3 py-2 rounded-lg text-sm text-[#4A3225] focus:outline-none focus:ring-1 focus:ring-[#8E5A3C]" />
                      )}
                      <button type="submit" disabled={isOrdering} className={`w-full py-2.5 text-white rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer ${checkoutMode === 'real' ? 'bg-[#8E5A3C] hover:bg-[#724831]' : 'bg-[#2E4A3F] hover:bg-[#20342c]'}`}>
                        {isOrdering ? 'Connexion en cours...' : `💳 ${checkoutMode === 'real' ? `Payer — ${getPrice().toFixed(2)} €` : `Simuler — ${getPrice().toFixed(2)} €`}`}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ONGLET SUIVI */}
          {activeTab === 'suivi' && (
            <motion.div key="suivi" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
              <div className="max-w-xl mx-auto space-y-6">
                <div className="text-center">
                  <Truck className="w-10 h-10 text-[#8E5A3C] mx-auto mb-2" />
                  <h3 className="font-serif text-2xl font-black text-[#4A3225]">Où en est votre exemplaire ?</h3>
                  <p className="text-xs text-[#8A7968] font-mono mt-1">Saisissez votre email ou numéro de commande</p>
                </div>
                <form onSubmit={handleLookup} className="flex gap-3">
                  <input type="text" required placeholder="votre.email@gmail.com ou ord-..." value={trackingSearch} onChange={e => setTrackingSearch(e.target.value)} className="flex-1 bg-white border-2 border-[#D1C2A5]/70 px-4 py-2.5 rounded-xl text-sm text-[#4A3225] focus:outline-none focus:ring-2 focus:ring-[#8E5A3C]" />
                  <button type="submit" disabled={searchLoading} className="px-5 py-2.5 bg-[#2D493E] hover:bg-[#1E332B] text-white rounded-xl text-sm font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50">
                    {searchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  </button>
                </form>
                {searchError && <p className="text-center text-xs text-red-600 font-mono font-bold">{searchError}</p>}
                {searchedOrders && searchedOrders.length > 0 && searchedOrders.map(ord => (
                  <div key={ord.id} className="bg-white border border-[#E6DFD3] rounded-2xl p-5 space-y-3">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-[#8A7968]">N° <strong className="text-[#4A3225]">{ord.id}</strong></span>
                      <span className={`px-2 py-0.5 rounded font-bold ${ord.status === 'shipped' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800 animate-pulse'}`}>{ord.status === 'shipped' ? 'Expédié ✔️' : 'En préparation 📦'}</span>
                    </div>
                    {ord.trackingNumber && <p className="text-xs font-mono">Suivi : <code className="bg-amber-100 px-1 rounded font-bold text-[#8E5A3C]">{ord.trackingNumber}</code></p>}
                    {ord.dedicationRequest && <p className="text-xs italic text-[#8E5A3C] border-l-2 border-[#EBDCCB] pl-3">« {ord.dedicationRequest} »</p>}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ONGLET AUTEURS */}
          {activeTab === 'auteurs' && (
            <motion.div key="auteurs" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
              <div className="max-w-3xl mx-auto space-y-6">
                <h3 className="font-serif text-2xl font-bold text-[#4A3225] text-center">Qui sont Patrice & Mam ?</h3>
                {[
                  { initial: 'P', name: 'Patrice', role: 'Le Chef de Bord', roleColor: 'bg-[#8E5A3C]/10 text-[#8E5A3C]', bgColor: 'bg-[#EBDCCB]', textColor: 'text-[#5C4D3C]', sub: 'Retraité Bio, 69 ans, Photographe et Spécialiste Tetris', text: '« Un autodidacte qui vous emmène dans son rêve. J\'ai insisté pour prendre les pistes aborigènes impossibles et tester mon Toyota Fortuner dans le Bush, même si le 4x4 a décollé de 3 mètres ! Mon rituel ? Un verre de blanc de Villa Maria de 18 heures pour détendre l\'atmosphère. »' },
                  { initial: 'M', name: 'Monique (MAM)', role: 'Momo Nationale', roleColor: 'bg-[#2E4A3F]/10 text-[#2E4A3F]', bgColor: 'bg-[#E1EFEB]', textColor: 'text-[#2E4A3F]', sub: 'Ancienne Assistante Sociale, Experte du Climatiseur', text: '« Patrice m\'appelle sa préférée mais m\'attribue tous les maux de valises ! C\'est vrai, je stresse quand nous approchons des balances d\'immigration avec 31 kg au lieu de 20. J\'ai eu des palpitations à 150 BPM sous les fumées du volcan Bromo, mais j\'ai marché 14 km par jour à Kyoto. Ce voyage, c\'est la concrétisation de notre amour. »' },
                ].map((p, i) => (
                  <div key={i} className="bg-white border border-[#E6DFD3] rounded-2xl p-6 sm:p-8 relative overflow-hidden">
                    <div className={`absolute top-0 right-0 px-4 py-2 font-mono text-xs rounded-bl-xl font-bold ${p.roleColor}`}>{p.role}</div>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className={`w-14 h-14 ${p.bgColor} rounded-full flex items-center justify-center font-serif text-2xl font-black ${p.textColor}`}>{p.initial}</div>
                      <div>
                        <h4 className="font-serif font-extrabold text-xl text-[#4A3225]">{p.name}</h4>
                        <p className="text-xs text-[#8A7968] font-mono">{p.sub}</p>
                      </div>
                    </div>
                    <p className="text-sm text-[#6B5A49] leading-relaxed italic">{p.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ONGLET EXTRAITS */}
          {activeTab === 'extraits' && (
            <motion.div key="extraits" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="text-center">
                  <h3 className="font-serif text-2xl font-bold text-[#4A3225]">Feuilleter quelques pages...</h3>
                  <p className="text-xs text-[#8A7968] font-mono mt-1">Extraits bruts choisis pour leur authenticité</p>
                </div>
                <div className="flex gap-2 justify-center flex-wrap">
                  {PREVIEW_CHAPTERS.map((chap, idx) => (
                    <button key={idx} onClick={() => setShowPreviewIdx(idx)}
                      className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${showPreviewIdx === idx ? 'bg-[#8E5A3C] text-white' : 'bg-white border border-[#E6DFD3] text-[#6B5A49] hover:bg-[#EBDCCB]/30'}`}
                    >{chap.num}</button>
                  ))}
                </div>
                <AnimatePresence mode="wait">
                  <motion.div key={showPreviewIdx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white border-2 border-[#E6DFD3] p-8 rounded-2xl relative">
                    <span className="font-serif text-[#C19358] text-5xl absolute -top-2 left-4 opacity-20 select-none">"</span>
                    <h4 className="font-serif font-black text-xl text-[#5C4D3C] mb-4">{PREVIEW_CHAPTERS[showPreviewIdx].title}</h4>
                    <p className="text-base text-[#6B5A49] leading-relaxed italic font-serif">{PREVIEW_CHAPTERS[showPreviewIdx].text}</p>
                    <span className="font-serif text-[#C19358] text-5xl absolute -bottom-8 right-6 opacity-20 select-none">"</span>
                  </motion.div>
                </AnimatePresence>
                <div className="text-center">
                  <button onClick={() => setActiveTab('commander')} className="px-6 py-3 bg-[#8E5A3C] hover:bg-[#724831] text-white font-bold rounded-xl cursor-pointer transition-colors inline-flex items-center gap-2">
                    <ArrowRight className="w-4 h-4" /> Commander mon exemplaire
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ONGLET LIVRE D'OR */}
          {activeTab === 'livreor' && (
            <motion.div key="livreor" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                  <h3 className="font-serif text-2xl font-bold text-[#4A3225]">👪 Livre d'Or de l'Aventure</h3>
                  <p className="text-xs text-[#8A7968] font-mono mt-1">Laissez un mot pour Patrice & Mam</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  <div className="lg:col-span-5 bg-white border border-[#E6DFD3] p-6 rounded-2xl">
                    <h4 className="font-serif text-lg font-bold text-[#4A3225] mb-4 flex items-center gap-1.5">✍️ Écrire sur le Livre d'Or</h4>
                    <form onSubmit={handlePostGuestbook} className="space-y-3">
                      <input type="text" required value={gbName} onChange={e => setGbName(e.target.value)} placeholder="Votre prénom *" className="w-full px-3 py-2 text-sm bg-[#FCFAF6] border border-[#E6DFD3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8E5A3C] text-[#4A3225]" />
                      <input type="text" value={gbLocation} onChange={e => setGbLocation(e.target.value)} placeholder="D'où écrivez-vous ?" className="w-full px-3 py-2 text-sm bg-[#FCFAF6] border border-[#E6DFD3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8E5A3C] text-[#4A3225]" />
                      <textarea required rows={4} value={gbMessage} onChange={e => setGbMessage(e.target.value)} placeholder="Votre message *" className="w-full px-3 py-2 text-sm bg-[#FCFAF6] border border-[#E6DFD3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8E5A3C] text-[#4A3225] resize-none" />
                      {gbSuccess && <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-mono">🎉 Votre message a été ajouté ! Merci.</div>}
                      {gbError && <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs font-mono">⚠️ {gbError}</div>}
                      <button type="submit" disabled={isSubmittingGb} className="w-full py-2.5 px-4 bg-[#8E5A3C] hover:bg-[#73482F] text-white font-mono text-xs font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2">
                        {isSubmittingGb ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Envoi...</span></> : <><span>Signer le Livre d'Or</span><span>✨</span></>}
                      </button>
                    </form>
                  </div>
                  <div className="lg:col-span-7 space-y-3 max-h-[520px] overflow-y-auto pr-2">
                    {guestbook.length === 0 ? (
                      <div className="text-center py-12 bg-white rounded-2xl border border-[#E6DFD3] text-[#8A7968]">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#8E5A3C] mb-3" />
                        <p className="font-mono text-xs">Chargement des dédicaces...</p>
                      </div>
                    ) : guestbook.map(msg => (
                      <div key={msg.id} className="bg-white p-5 rounded-2xl border border-[#E6DFD3] hover:border-[#8E5A3C]/40 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-[#EBDCCB]/60 text-[#8E5A3C] rounded-full flex items-center justify-center text-xs font-black font-serif">{msg.name?.charAt(0).toUpperCase()}</div>
                            <span className="font-serif text-sm font-black text-[#4A3225]">{msg.name}</span>
                            <span className="text-[10px] font-mono text-gray-400">• {msg.date}</span>
                          </div>
                          {msg.location && <span className="text-[10px] font-mono text-[#8A7968]">📍 {msg.location}</span>}
                        </div>
                        <p className="text-sm text-[#6B5A49] leading-relaxed italic font-serif border-l-2 border-[#EBDCCB] pl-3">« {msg.message} »</p>
                        <div className="flex text-amber-500 mt-2">{[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-amber-500 text-amber-500" />)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
