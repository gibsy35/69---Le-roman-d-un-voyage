import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Star, HelpCircle, ArrowRight, ShieldCheck, Mail, ChevronRight, Award, Plus, Sparkles, Check, DollarSign, ShoppingBag, Search, Truck, Loader2 } from 'lucide-react';
import { BookOrder, BookConfig } from './types';

const miyajimaCoverImg = 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&q=80&w=600';

interface BookDetailProps {
  onSuccessOrder: (order: BookOrder) => void;
}

const PREVIEW_CHAPTERS = [
  {
    num: "Vol. 13",
    title: "Le décollage du Fortuner dans le Bush",
    text: "« Le trou est si profond que la voiture décolle de la piste pour retomber 3 mètres plus loin en faisant à Mam la frayeur de sa vie... C’est alors qu’elle cherche à m’embrouiller en balançant ses bras dans le pare-brise. Je la regarde calmement sous la chaleur de 36°C étouffante et je lui crie de toutes mes forces : STOP, LAISSE-MOI CONDUIRE ! »"
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

export default function BookDetail({ onSuccessOrder }: BookDetailProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'printed' | 'hardcover' | 'pdf'>('printed');
  const [showPreviewIdx, setShowPreviewIdx] = useState<number>(0);
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerDedication, setBuyerDedication] = useState('');
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState<BookOrder | null>(null);
  const [stripeUrl, setStripeUrl] = useState<string | null>(null);
  
  // Book custom cover config state
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

  const getCoverImageSrc = (url: string) => {
    if (url === "preset-miyajima") return miyajimaCoverImg;
    if (url === "preset-fuji") return "https://images.unsplash.com/photo-1578637387939-43c525550085?auto=format&fit=crop&q=80&w=600";
    if (url === "preset-tokyo") return "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=600";
    if (url === "preset-kyoto") return "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=600";
    return url || miyajimaCoverImg;
  };

  React.useEffect(() => {
    fetch("/api/book-config")
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setBookConfig(data);
        }
      })
      .catch(err => console.error("Error fetching book config:", err));
  }, []);

  // Guestbook integration states
  const [guestbook, setGuestbook] = useState<any[]>([]);
  const [gbName, setGbName] = useState('');
  const [gbLocation, setGbLocation] = useState('');
  const [gbMessage, setGbMessage] = useState('');
  const [isSubmittingGb, setIsSubmittingGb] = useState(false);
  const [gbSuccess, setGbSuccess] = useState(false);
  const [gbError, setGbError] = useState('');

  React.useEffect(() => {
    fetch("/api/guestbook")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setGuestbook(data);
        }
      })
      .catch(err => console.error("Error fetching guestbook:", err));
  }, []);

  const handlePostGuestbook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gbName.trim() || !gbMessage.trim()) return;

    setIsSubmittingGb(true);
    setGbError('');
    setGbSuccess(false);
    try {
      const response = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: gbName.trim(),
          location: gbLocation.trim(),
          message: gbMessage.trim()
        })
      });
      if (response.ok) {
        const newMsg = await response.json();
        setGuestbook(prev => [newMsg, ...prev]);
        setGbName('');
        setGbLocation('');
        setGbMessage('');
        setGbSuccess(true);
        setTimeout(() => setGbSuccess(false), 5000);
      } else {
        setGbError("Impossible d'ajouter votre mot doux. Réessayez plus tard.");
      }
    } catch (err) {
      setGbError("Erreur de connexion avec le serveur.");
    } finally {
      setIsSubmittingGb(false);
    }
  };
  
  // Tracking search states
  const [trackingSearch, setTrackingSearch] = useState('');
  const [searchedOrders, setSearchedOrders] = useState<BookOrder[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Stripe integration states
  const [checkoutMode, setCheckoutMode] = useState<'real' | 'simulated'>('real');
  const [stripeError, setStripeError] = useState<string | null>(null);

  const getPrice = () => {
    if (selectedFormat === 'printed') return 22;
    if (selectedFormat === 'hardcover') return 39;
    return 9.90;
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingSearch.trim()) return;
    setSearchLoading(true);
    setSearchError('');
    setSearchedOrders(null);
    try {
      const res = await fetch(`/api/orders/lookup?search=${encodeURIComponent(trackingSearch.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setSearchedOrders(data);
        if (data.length === 0) {
          setSearchError("Aucune commande n'a été trouvée pour cet email ou numéro de commande.");
        }
      } else {
        setSearchError("Impossible de récupérer les informations de livraison.");
      }
    } catch (err) {
      setSearchError("Erreur de connexion avec le serveur.");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName || !buyerEmail) return;

    setIsOrdering(true);
    setStripeError(null);
    setStripeUrl(null);

    // If Stripe Real/Live Payment is selected
    if (checkoutMode === "real") {
      // Pre-open a blank secure window/tab immediately on user click to bypass popup blockers
      let paymentWindow: Window | null = null;
      try {
        paymentWindow = window.open("", "_blank");
        if (paymentWindow) {
          paymentWindow.document.write(`
            <html>
              <head>
                <title>Redirection Stripe...</title>
                <style>
                  body {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    margin: 0;
                    background-color: #FCFAF6;
                    color: #4A3225;
                    text-align: center;
                  }
                  .loader {
                    border: 4px solid #E6DFD3;
                    border-top: 4px solid #8E5A3C;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    animation: spin 1s linear infinite;
                    margin-bottom: 20px;
                  }
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                  h1 { font-size: 1.25rem; font-weight: bold; margin-bottom: 8px; }
                  p { font-size: 0.875rem; color: #8A7968; max-width: 300px; margin: 0; }
                </style>
              </head>
              <body>
                <div class="loader"></div>
                <h1>Connexion à Stripe...</h1>
                <p>Veuillez patienter pendant la génération de votre session de paiement sécurisé.</p>
              </body>
            </html>
          `);
        }
      } catch (err) {
        console.warn("L'ouverture d'un nouvel onglet de paiement a été bloquée par le navigateur:", err);
      }

      try {
        const response = await fetch("/api/create-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerName: buyerName,
            customerEmail: buyerEmail,
            bookFormat: selectedFormat,
            dedicationRequest: buyerDedication || undefined
          })
        });
        const data = await response.json();
        
        if (data.error === "stripe_not_configured") {
          if (paymentWindow) paymentWindow.close();
          // Stripe Secret Key is missing in .env
          setStripeError("stripe_not_configured");
          setIsOrdering(false);
          return;
        } else if (data.url) {
          // Set URL in state to allow direct user click in case automatic tab navigations fail
          setStripeUrl(data.url);
          setIsOrdering(false);
          
          if (paymentWindow) {
            paymentWindow.location.href = data.url;
          } else {
            // Fallback attempt to open a new tab/window
            try {
              window.open(data.url, '_blank');
            } catch (err) {
              console.warn("Redirect blocked after asynchronous fetch response. Displaying secure manual link.");
            }
          }
          return;
        } else if (data.error) {
          if (paymentWindow) paymentWindow.close();
          setStripeError(data.error);
          setIsOrdering(false);
          return;
        }
      } catch (err: any) {
        if (paymentWindow) paymentWindow.close();
        console.error("Stripe Checkout failed in browser", err);
        setStripeError(err.message || "Impossible de joindre le service de paiement Stripe.");
        setIsOrdering(false);
        return;
      }
    }

    // Interactive simulator purchase fallback (always succeeds as interactive simulation)
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: buyerName,
          customerEmail: buyerEmail,
          bookFormat: selectedFormat,
          price: getPrice(),
          dedicationRequest: buyerDedication || undefined
        })
      });
      const data = await response.json();
      setOrderPlaced(data);
      onSuccessOrder(data);
      setBuyerName('');
      setBuyerEmail('');
      setBuyerDedication('');
    } catch (err) {
      console.error("Order failed", err);
      setStripeError("Une erreur est survenue lors de l'enregistrement de la simulation.");
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <div className="py-8 sm:py-12 bg-[#FCFAF6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Intro Hero Section */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center mb-20">
          
          {/* Left Column: Interactive 3D Flippable Book Cover */}
          <div className="lg:col-span-5 mb-10 lg:mb-0 flex flex-col items-center">
            
            {/* 3D Container Wrapper */}
            <div className="relative w-80 sm:w-[340px] h-[510px] sm:h-[540px] perspective-1000 group">
              <motion.div
                className="w-full h-full relative"
                style={{ transformStyle: 'preserve-3d' }}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.7, ease: "easeInOut" }}
              >
                
                {/* 1ère DE COUVERTURE (FRONT) */}
                <div 
                  className="absolute inset-0 w-full h-full rounded-2xl shadow-2xl border-[12px] bg-white flex flex-col justify-between overflow-hidden"
                  style={{ 
                    backfaceVisibility: 'hidden', 
                    WebkitBackfaceVisibility: 'hidden',
                    borderColor: bookConfig.coverBorderColor 
                  }}
                >
                  {/* Majestic Torii gate real background photo */}
                  <div className="absolute inset-0 z-0 select-none bg-slate-900">
                    <img 
                      src={getCoverImageSrc(bookConfig.coverImageUrl)} 
                      alt="Couverture réelle du Livre" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover opacity-90 brightness-[0.85] saturate-[1.1]" 
                    />
                  </div>

                  {/* Top Text Overlay */}
                  <div className="relative z-10 p-4 pt-6 text-center text-white font-mono select-none pointer-events-none">
                    <p className="text-[10px] tracking-[0.25em] font-medium text-white/90 drop-shadow-sm">
                      {bookConfig.authorName}
                    </p>
                    <p className="text-[9px] tracking-[0.05em] font-bold text-white uppercase mt-2 drop-shadow-sm bg-black/30 py-1 px-1.5 rounded inline-block">
                      {bookConfig.topBadge}
                    </p>
                  </div>

                  {/* Center Title overlay */}
                  <div className="relative z-10 text-center my-auto transform group-hover:scale-105 transition-transform duration-300 select-none pointer-events-none">
                    <h1 className="font-serif text-[100px] font-black tracking-tighter text-white drop-shadow-[0_8px_8px_rgba(0,0,0,0.5)] leading-none my-1">
                      {bookConfig.bookTitle}
                    </h1>
                    <h2 className="font-sans font-black text-2xl tracking-[0.3em] text-white my-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
                      {bookConfig.bookSubtitle}
                    </h2>
                  </div>

                  {/* Bottom overlay with text */}
                  <div className="relative z-10 p-4 pb-6 text-center text-white font-mono select-none pointer-events-none">
                    <p className="text-[9px] tracking-widest text-[#FFF] font-bold uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] bg-black/10 py-1 rounded">
                      {bookConfig.bottomLine}
                    </p>
                  </div>
                </div>

                {/* 4ème DE COUVERTURE (BACK) */}
                <div 
                  className="absolute inset-0 w-full h-full rounded-2xl shadow-2xl border-[12px] bg-white p-6 flex flex-col justify-between overflow-hidden"
                  style={{ 
                    backfaceVisibility: 'hidden', 
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    borderColor: bookConfig.coverBorderColor
                  }}
                >
                  
                  {/* Big circle graphic intersecting right side */}
                  <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-gray-100 flex items-center justify-start pl-4 border border-gray-200 select-none pointer-events-none">
                    <span className="font-sans font-black text-6xl opacity-15" style={{ color: bookConfig.coverBorderColor }}>
                      {bookConfig.bookTitle}
                    </span>
                  </div>

                  {/* Subtitle text */}
                  <div className="text-center z-10">
                    <p className="font-sans font-bold text-xs uppercase tracking-wide" style={{ color: bookConfig.coverBorderColor }}>
                      {bookConfig.backAboutSubtitle}
                    </p>
                    <h3 className="font-sans font-black text-2xl tracking-wide mt-2 border-b-2 pb-2" style={{ color: bookConfig.coverBorderColor, borderColor: `${bookConfig.coverBorderColor}40` }}>
                      {bookConfig.backAboutTitle}
                    </h3>
                  </div>

                  {/* Content paragraph */}
                  <div className="my-auto z-10 text-left space-y-2.5 max-w-[270px]">
                    <div className="text-xs font-serif italic text-gray-800 leading-relaxed whitespace-pre-line max-h-[190px] overflow-y-auto pr-1">
                      {bookConfig.backAboutContent}
                    </div>
                  </div>

                  {/* Quote block design */}
                  <div className="z-10 bg-amber-50/55 border-l-4 p-2.5 my-1 text-center select-none" style={{ borderLeftColor: bookConfig.coverBorderColor }}>
                    <p className="font-serif italic text-[11px] text-gray-900 leading-tight">
                      {bookConfig.backQuote}
                    </p>
                  </div>

                  {/* Footer Author Stamp */}
                  <div className="z-10 border-t border-gray-200 pt-3 text-center">
                    <p className="font-sans font-black text-xs tracking-widest" style={{ color: bookConfig.coverBorderColor }}>
                      {bookConfig.authorName}
                    </p>
                    <p className="font-mono text-[9px] text-gray-500 tracking-wider mt-0.5">
                      {bookConfig.topBadge}
                    </p>
                  </div>

                </div>

              </motion.div>
            </div>

            {/* Interactive controls */}
            <div className="mt-4 flex flex-col items-center space-y-1.5">
              <button
                onClick={() => setIsFlipped(!isFlipped)}
                className="px-4 py-2 bg-[#FD3D63] hover:bg-[#E2254B] text-white font-mono text-xs font-bold rounded-lg shadow-sm hover:shadow-md transition-all flex items-center space-x-1.5 cursor-pointer leading-none"
              >
                <span>🔄</span>
                <span>{isFlipped ? "Voir la 1ère de Couverture" : "Voir la 4ème de Couverture"}</span>
              </button>
              <p className="text-[10px] text-gray-400 font-mono">
                Cliquez sur le livre ou sur le bouton pour le retourner
              </p>
            </div>
            
            <p className="mt-4 text-xs font-mono text-[#8A7968] flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C19358]" />
              <span>Conçu à partir des carnets et récits originaux de Patrice</span>
            </p>
          </div>

          {/* Right Column: Book presentation & features */}
          <div className="lg:col-span-7">
            <span className="inline-block bg-[#EBDCCB]/50 text-[#8E5A3C] px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider mb-3">
              🌍 Le Best-Seller des Darons Baroudeurs
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#4A3225] leading-tight mb-4">
              La consécration de 3 mois de périple sauvage
            </h2>
            <p className="text-base sm:text-lg text-[#6B5A49] leading-relaxed mb-6">
              Ce bouquin est sans prétentions. Il n’est ni un livre de photos, ni un guide touristique, ni un roman d’aventures, c’est juste un récit dont l’ambition est de vous prouver que <strong>« C’EST POSSIBLE »</strong> à n’importe quel âge. Malgré une épaule opérée et une grippe foudroyante juste avant le départ, Patrice et Mam se sont envolés. Découvrez une aventure humaine extraordinaire pleine de gaffes mémorables.
            </p>

            {/* Quick Key metrics */}
            <div className="grid grid-cols-3 gap-4 border-y border-[#E6DFD3] py-4 mb-8 font-mono text-center">
              <div>
                <span className="block text-2xl font-serif font-black text-[#8E5A3C]">69 000</span>
                <span className="text-[10px] sm:text-xs text-[#8A7968] uppercase">Kilomètres</span>
              </div>
              <div className="border-x border-[#E6DFD3]">
                <span className="block text-2xl font-serif font-black text-[#8E5A3C]">69h</span>
                <span className="text-[10px] sm:text-xs text-[#8A7968] uppercase">Heures de Vol</span>
              </div>
              <div>
                <span className="block text-2xl font-serif font-black text-[#8E5A3C]">69</span>
                <span className="text-[10px] sm:text-xs text-[#8A7968] uppercase">Régions et Sites</span>
              </div>
            </div>

            {/* Formats Selector */}
            <div className="mb-8">
              <h3 className="text-xs uppercase font-mono font-bold tracking-widest text-[#8A7968] mb-3">
                Sélectionnez le format du livre :
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* Print format */}
                <button
                  type="button"
                  onClick={() => setSelectedFormat('printed')}
                  className={`p-4 rounded-xl text-left border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between h-full ${
                    selectedFormat === 'printed'
                      ? 'border-[#8E5A3C] bg-white shadow-md'
                      : 'border-[#E6DFD3] bg-transparent hover:border-[#8E5A3C]/50'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <span className="block font-serif font-black text-sm text-[#4A3225]">Édition Brochée</span>
                      <span className="bg-amber-100 text-amber-800 text-[8px] px-1.5 py-0.5 rounded font-mono uppercase font-extrabold tracking-wider shrink-0">
                        Pré-commande
                      </span>
                    </div>
                    <span className="block text-xs font-mono text-[#8A7968]">Couverture souple illustrée</span>
                    <span className="block text-[10px] text-amber-700 font-mono mt-2 font-bold leading-tight bg-amber-50/60 p-1 rounded-sm border border-amber-100/50">
                      ⌛ Uniquement en pré-commande
                    </span>
                  </div>
                  <span className="block text-lg font-bold text-[#8E5A3C] mt-4">22,00 €</span>
                </button>

                {/* Hardcover format */}
                <button
                  type="button"
                  onClick={() => setSelectedFormat('hardcover')}
                  className={`p-4 rounded-xl text-left border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between h-full ${
                    selectedFormat === 'hardcover'
                      ? 'border-[#8E5A3C] bg-white shadow-md'
                      : 'border-[#E6DFD3] bg-transparent hover:border-[#8E5A3C]/50'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-1 gap-1">
                      <span className="block font-serif font-black text-sm text-[#4A3225]">Luxe Illustré</span>
                      <span className="bg-[#C19358] text-white text-[8px] px-1.5 py-0.5 rounded font-mono uppercase font-extrabold tracking-wider shrink-0">
                        Éd. Limitée
                      </span>
                    </div>
                    <span className="block text-xs font-mono text-[#8A7968]">Grand format relié rigide</span>
                    <span className="block text-[10px] text-amber-700 font-mono mt-2 font-bold leading-tight bg-amber-50/60 p-1 rounded-sm border border-amber-100/50">
                      👑 Uniquement en pré-commande
                    </span>
                  </div>
                  <span className="block text-lg font-bold text-[#8E5A3C] mt-4">39,00 €</span>
                </button>

                {/* PDF format */}
                <button
                  type="button"
                  onClick={() => setSelectedFormat('pdf')}
                  className={`p-4 rounded-xl text-left border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between h-full ${
                    selectedFormat === 'pdf'
                      ? 'border-[#8E5A3C] bg-white shadow-md'
                      : 'border-[#E6DFD3] bg-transparent hover:border-[#8E5A3C]/50'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <span className="block font-serif font-black text-sm text-[#4A3225]">Édition Numérique</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[8px] px-1.5 py-0.5 rounded font-mono uppercase font-extrabold tracking-wider shrink-0 animate-pulse">
                        Disponible
                      </span>
                    </div>
                    <span className="block text-xs font-mono text-[#8A7968]">Lecture numérique immédiate</span>
                    <span className="block text-[10px] text-emerald-700 font-mono mt-2 font-bold leading-tight bg-emerald-50/60 p-1 rounded-sm border border-emerald-100/50">
                      ⚡ Disponible maintenant
                    </span>
                  </div>
                  <span className="block text-lg font-bold text-[#8E5A3C] mt-4">9,90 €</span>
                </button>
              </div>
            </div>

            {/* Quick checkout CTA card with Stripe & Simulation controls */}
            <div className="bg-[#FAF6F0] border border-[#E6DFD3] p-5 rounded-2xl">
              <h4 className="font-serif font-black text-lg text-[#4A3225] flex items-center mb-1">
                <ShoppingBag className="w-5 h-5 text-[#8E5A3C] mr-2" />
                Commander un exemplaire
              </h4>
              <p className="text-xs text-[#8A7968] mb-4">
                Saisissez vos coordonnées pour commander la version {selectedFormat === 'printed' ? 'Édition Brochée (Pré-commande)' : selectedFormat === 'hardcover' ? 'Luxe Illustrée (Pré-commande)' : 'Édition Numérique Directe (Disponible immédiatement)'}.
              </p>

              {orderPlaced ? (
                <div className="bg-[#E4ECE9] border border-[#A7C5B8] p-4 rounded-xl text-center">
                  <Check className="w-8 h-8 text-[#2E4A3F] mx-auto mb-2" />
                  <h5 className="font-bold text-[#2E4A3F] text-sm">Merci pour votre commande, {orderPlaced.customerName} !</h5>
                  <p className="text-xs text-[#426154] mt-1">
                    Un email a été envoyé à <strong>{orderPlaced.customerEmail}</strong>. Prix réglé : {orderPlaced.price} €. Retrouvez votre commande en direct dans le panneau Intranet Papa !
                  </p>
                  <button 
                    onClick={() => setOrderPlaced(null)}
                    className="mt-3 text-xs text-[#8E5A3C] hover:underline font-mono border-none cursor-pointer"
                  >
                    Passer une autre commande
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Selector for Payment Method */}
                  <div className="grid grid-cols-2 gap-2 bg-[#EBDCCB]/30 p-1.5 rounded-lg border border-[#E1DBCE]">
                    <button
                      type="button"
                      onClick={() => {
                        setCheckoutMode('real');
                        setStripeError(null);
                      }}
                      className={`py-1.5 px-2 rounded-md font-mono text-xs font-bold transition-all ${
                        checkoutMode === 'real'
                          ? 'bg-[#8E5A3C] text-white shadow-xs'
                          : 'text-[#8A7968] hover:text-[#4A3225]'
                      }`}
                    >
                      💳 CB / Stripe (Réel)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCheckoutMode('simulated');
                        setStripeError(null);
                      }}
                      className={`py-1.5 px-2 rounded-md font-mono text-xs font-bold transition-all ${
                        checkoutMode === 'simulated'
                          ? 'bg-[#2E4A3F] text-white shadow-xs'
                          : 'text-[#8A7968] hover:text-[#4A3225]'
                      }`}
                    >
                      🧪 Simulateur (Test)
                    </button>
                  </div>

                  {stripeError === "stripe_not_configured" && (
                    <div className="bg-amber-50 border border-amber-300 p-3.5 rounded-xl text-xs text-amber-900 space-y-2">
                      <p className="font-bold">🔑 Configuration Stripe Requise</p>
                      <p className="leading-relaxed">
                        Pour activer les paiements bancaires réels sur votre site, configurez votre clé secrète Stripe dans le menu **Paramètres** d'AI Studio sous la variable <code className="bg-amber-100 px-1 py-0.5 rounded font-bold text-amber-950">STRIPE_SECRET_KEY</code>.
                      </p>
                      <div className="pt-1 flex items-center justify-between">
                        <span className="text-[10px] text-amber-700 italic">Vous pouvez toujours utiliser la simulation !</span>
                        <button
                          type="button"
                          onClick={() => {
                            setCheckoutMode('simulated');
                            setStripeError(null);
                          }}
                          className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold py-1 px-2.5 rounded shadow-2xs transition-colors cursor-pointer"
                        >
                          👉 Passer en Simulation
                        </button>
                      </div>
                    </div>
                  )}

                  {stripeError && stripeError !== "stripe_not_configured" && (
                    <div className="bg-red-50 border border-red-200 p-3 rounded-xl text-xs text-red-900 font-mono font-bold">
                      <p className="font-bold">❌ Erreur de paiement :</p>
                      <p className="mt-1">{stripeError}</p>
                    </div>
                  )}

                  {stripeUrl ? (
                    <div className="bg-[#EAF5F0] border-2 border-[#A2D2BD] p-4 rounded-xl space-y-3 shadow-xs">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">✨</span>
                        <h5 className="font-serif font-black text-[#1C3A27] text-md">Lien de paiement sécurisé prêt !</h5>
                      </div>
                      <p className="text-xs text-[#2A4B35] leading-relaxed">
                        Pour des raisons de sécurité liées à l'environnement de développement, le navigateur bloque l'affichage direct de Stripe dans un cadre. Veuillez cliquer ci-dessous pour ouvrir votre session de paiement sécurisé Stripe :
                      </p>
                      <a
                        href={stripeUrl}
                        target="_top"
                        referrerPolicy="no-referrer"
                        className="block w-full py-3 px-4 bg-[#8E5A3C] hover:bg-[#724831] text-white text-center rounded-xl text-sm font-bold shadow-md transition-all font-sans"
                      >
                        💳 Ouvrir le paiement Stripe ({getPrice().toFixed(2)} €) →
                      </a>
                      <div className="pt-2 flex justify-between items-center border-t border-[#A2D2BD]/40 text-[10px] text-[#2A4B35] italic">
                        <span>Paiement 100% sécurisé géré par Stripe.</span>
                        <button 
                          type="button" 
                          onClick={() => setStripeUrl(null)} 
                          className="text-[#8E5A3C] hover:underline cursor-pointer font-bold font-mono"
                        >
                          ✕ Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleCheckout} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          required
                          placeholder="Votre Prénom et Nom"
                          value={buyerName}
                          onChange={(e) => setBuyerName(e.target.value)}
                          className="w-full bg-white border border-[#D1C2A5] px-3 py-2 rounded-lg text-sm text-[#4A3225] placeholder-[#8A7968]/70 focus:outline-none focus:ring-1 focus:ring-[#8E5A3C]"
                        />
                        <input
                          type="email"
                          required
                          placeholder="Votre Email"
                          value={buyerEmail}
                          onChange={(e) => setBuyerEmail(e.target.value)}
                          className="w-full bg-white border border-[#D1C2A5] px-3 py-2 rounded-lg text-sm text-[#4A3225] placeholder-[#8A7968]/70 focus:outline-none focus:ring-1 focus:ring-[#8E5A3C]"
                        />
                      </div>

                      {selectedFormat !== 'pdf' && (
                        <div className="bg-[#FAF6F0] p-3 rounded-lg border border-[#D1C2A5] space-y-1">
                          <label className="block text-[11px] font-mono font-bold text-[#8E5A3C] uppercase tracking-wide">
                            ✍️ Souhaitez-vous une dédicace signée par Patrice ? (Gratuit)
                          </label>
                          <input
                            type="text"
                            placeholder="Ex: 'Pour la famille Moreau', 'Joyeux Noël à Thomas'..."
                            value={buyerDedication}
                            onChange={(e) => setBuyerDedication(e.target.value)}
                            className="w-full bg-white border border-[#D1C2A5]/70 px-3 py-1.5 rounded-md text-xs text-[#4A3225] placeholder-[#8A7968]/50 focus:outline-none focus:ring-1 focus:ring-[#8E5A3C]"
                          />
                        </div>
                      )}
                      
                      <button
                        type="submit"
                        disabled={isOrdering}
                        className={`w-full py-2.5 text-white rounded-lg text-sm font-bold shadow-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer ${
                          checkoutMode === 'real' 
                            ? 'bg-[#8E5A3C] hover:bg-[#724831]' 
                            : 'bg-[#2E4A3F] hover:bg-[#20342c]'
                        }`}
                      >
                        {isOrdering ? (
                          <span>Connexion sécurisée en cours...</span>
                        ) : (
                          <>
                            <span>💳</span>
                            <span>
                              {checkoutMode === 'real' 
                                ? `Payer par Carte Bancaire — ${getPrice().toFixed(2)} €` 
                                : `Simuler la Commande Gratuite — ${getPrice().toFixed(2)} €`}
                            </span>
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* SECTION: ORDER TRACKING LOOKUP (SUIVI DE COLIS INTERACTIF) */}
        <div className="mb-20 bg-white border border-[#E6DFD3] rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xs">
          {/* Decorative background stamp */}
          <div className="absolute -bottom-6 -right-6 text-[#FAF6F0] text-9xl font-black rotate-12 select-none pointer-events-none">
            69 POST
          </div>
          
          <div className="max-w-3xl mx-auto space-y-6 relative z-10">
            <div className="text-center">
              <span className="text-[11px] font-mono text-[#8E5A3C] font-black uppercase tracking-widest flex items-center justify-center gap-1.5">
                <Truck className="w-4 h-4 text-[#8E5A3C]" />
                Terminal Public de Suivi de Colis
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-black text-[#4A3225] mt-2">
                Où en est votre exemplaire ?
              </h3>
              <p className="text-xs text-[#8A7968] font-mono mt-1 max-w-lg mx-auto">
                Saisissez votre adresse email ou votre numéro de commande pour consulter l'état de préparation et d'expédition géré en temps réel par Patrice !
              </p>
            </div>

            <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="text"
                required
                placeholder="votre.email@gmail.com ou ord-..."
                value={trackingSearch}
                onChange={(e) => setTrackingSearch(e.target.value)}
                className="flex-1 bg-[#FCFAF6] border-2 border-[#D1C2A5]/70 px-4 py-2.5 rounded-xl text-sm text-[#4A3225] placeholder-[#8A7968]/50 focus:outline-none focus:ring-2 focus:ring-[#8E5A3C]"
              />
              <button
                type="submit"
                disabled={searchLoading}
                className="px-6 py-2.5 bg-[#2D493E] hover:bg-[#1E332B] text-white rounded-xl text-sm font-bold flex items-center justify-center space-x-2 cursor-pointer transition-colors shrink-0 disabled:opacity-50 font-mono"
              >
                {searchLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span>Suivre mon colis</span>
              </button>
            </form>

            {searchError && (
              <p className="text-center text-xs text-red-600 font-mono font-bold">{searchError}</p>
            )}

            <AnimatePresence mode="wait">
              {searchedOrders && searchedOrders.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6 pt-4 border-t border-[#E6DFD3]/60"
                >
                  {searchedOrders.map((ord) => {
                    const isShipped = ord.status === 'shipped';
                    return (
                      <div key={ord.id} className="bg-[#FAF6F0]/60 border border-[#E6DFD3] rounded-2xl p-5 sm:p-6 space-y-6">
                        
                        {/* Order Header / Ticket details */}
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pb-4 border-b border-[#E6DFD3] text-xs font-mono">
                          <div>
                            <span className="text-[#8A7968]">N° Commande :</span>
                            <span className="text-[#4A3225] font-bold ml-1.5">{ord.id}</span>
                          </div>
                          <div>
                            <span className="text-[#8A7968]">Format :</span>
                            <span className="text-[#8E5A3C] font-bold ml-1.5 uppercase text-[10px]">
                              {ord.bookFormat === 'printed' ? 'Brochée 📘' : ord.bookFormat === 'hardcover' ? 'Luxe Rigide 👑' : 'Édition Numérique 📱'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[#8A7968]">Destination :</span>
                            <span className="text-[#4A3225] font-bold ml-1.5">{ord.destinationCountry || 'France'}</span>
                          </div>
                        </div>

                        {/* Digital Edition instant delivery */}
                        {ord.bookFormat === 'pdf' ? (
                          <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-xl text-emerald-950 space-y-2">
                            <h5 className="font-bold text-sm text-emerald-900 flex items-center gap-1.5">
                              ⚡ Téléchargement Disponible Immédiatement !
                            </h5>
                            <p className="text-xs text-emerald-800 leading-relaxed">
                              Les formats numériques (PDF) ne nécessitent pas de transport physique. Vous pouvez télécharger le livre complet "69" immédiatement en cliquant sur le bouton ci-dessous !
                            </p>
                            <a
                              href="https://images.unsplash.com/photo-1543002588-bfa74002ed7e"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block px-4 py-2 bg-[#2D493E] hover:bg-[#1E332B] text-white text-xs font-bold rounded-lg transition-colors font-mono"
                            >
                              📥 Télécharger mon PDF (Livre Complet)
                            </a>
                          </div>
                        ) : (
                          /* Physical Delivery Progress Timeline Steps */
                          <div className="space-y-6">
                            
                            {/* Visual Progress Line */}
                            <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono uppercase text-[#8A7968] tracking-wider relative pt-4">
                              
                              {/* Connector line background */}
                              <div className="absolute top-7 left-[12.5%] right-[12.5%] h-1 bg-[#E6DFD3] -z-0" />
                              <div 
                                className="absolute top-7 left-[12.5%] h-1 bg-emerald-600 transition-all duration-500 -z-0"
                                style={{ width: isShipped ? "75%" : "25%" }}
                              />

                              {/* Step 1: Paid */}
                              <div className="space-y-2 flex flex-col items-center relative z-10">
                                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                                  ✓
                                </div>
                                <span className="font-bold text-emerald-800">Achat validé</span>
                              </div>

                              {/* Step 2: Preparing */}
                              <div className="space-y-2 flex flex-col items-center relative z-10">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-xs ${
                                  !isShipped 
                                    ? 'bg-amber-500 text-white animate-pulse' 
                                    : 'bg-emerald-600 text-white'
                                }`}>
                                  {isShipped ? '✓' : '2'}
                                </div>
                                <span className={!isShipped ? 'font-bold text-amber-700 animate-pulse' : 'font-bold text-emerald-800'}>
                                  Préparation
                                </span>
                              </div>

                              {/* Step 3: Shipped */}
                              <div className="space-y-2 flex flex-col items-center relative z-10">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-xs ${
                                  isShipped 
                                    ? 'bg-emerald-600 text-white' 
                                    : 'bg-[#E6DFD3] text-gray-400'
                                }`}>
                                  {isShipped ? '✓' : '3'}
                                </div>
                                <span className={isShipped ? 'font-bold text-emerald-800' : 'text-gray-400'}>
                                  Remis Colis
                                </span>
                              </div>

                              {/* Step 4: Out for Delivery */}
                              <div className="space-y-2 flex flex-col items-center relative z-10">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-xs ${
                                  isShipped 
                                    ? 'bg-emerald-500 text-white animate-pulse' 
                                    : 'bg-[#E6DFD3] text-gray-400'
                                }`}>
                                  {isShipped ? '🚚' : '4'}
                                </div>
                                <span className={isShipped ? 'font-bold text-emerald-700 animate-pulse' : 'text-gray-400'}>
                                  Acheminement
                                </span>
                              </div>

                            </div>

                            {/* Detailed status banner description */}
                            <div className="bg-white p-4 rounded-xl border border-[#E6DFD3] space-y-3 font-serif text-sm text-[#4A3225]">
                              {isShipped ? (
                                <div className="space-y-2">
                                  <p className="font-bold text-[#2D493E] flex items-center gap-1.5 text-xs sm:text-sm">
                                    <span>🚚</span> Votre colis a été officiellement remis à {ord.carrier || 'La Poste'} par Patrice !
                                  </p>
                                  <ul className="text-xs font-mono text-[#5C4D3C] space-y-1 bg-[#FCFAF6] p-2.5 rounded border border-[#E6DFD3] leading-relaxed">
                                    <li>📦 <strong>Emballage :</strong> {ord.packaging || 'Standard'}</li>
                                    <li>⚖️ <strong>Poids du colis :</strong> {ord.weightGrams ? `${ord.weightGrams} g` : '450 g'}</li>
                                    <li>📍 <strong>Numéro de Suivi :</strong> <code className="bg-amber-100/60 px-1 py-0.5 rounded font-black text-[#8E5A3C]">{ord.trackingNumber}</code></li>
                                    <li>🔗 <strong>Lien Transporteur :</strong> <a href="https://www.laposte.fr/outils/suivre-un-envoi" target="_blank" rel="noopener noreferrer" className="text-[#8E5A3C] hover:underline font-bold">Suivre sur le site de La Poste →</a></li>
                                  </ul>
                                </div>
                              ) : (
                                <div className="space-y-1 text-[#4A3225]">
                                  <p className="font-bold flex items-center gap-1.5 text-xs sm:text-sm">
                                    <span>✍️</span> Préparation en cours chez Patrice & Monique !
                                  </p>
                                  <p className="text-xs text-[#8A7968] font-mono leading-relaxed pl-5">
                                    Patrice emballe actuellement votre exemplaire avec le soin légendaire breton (il utilise ses meilleures enveloppes bulle ou cartons renforcés). Monique vérifie que le poids ne dépasse pas ses limites et s'assure de ne pas mélanger les adresses. Dès que Patrice le remet au facteur lors de sa tournée, son terminal générera votre numéro de suivi en temps réel !
                                  </p>
                                </div>
                              )}

                              {ord.dedicationRequest && (
                                <div className="border-t border-[#E6DFD3]/60 pt-3 text-xs">
                                  <span className="font-mono text-[#8A7968] block font-semibold text-[10px] uppercase">✍️ Dédicace personnalisée demandée :</span>
                                  <p className="italic text-[#8E5A3C] font-semibold mt-1 bg-amber-50/40 p-2 rounded border border-dashed border-[#D1C2A5]/50">
                                    « {ord.dedicationRequest} »
                                  </p>
                                </div>
                              )}
                            </div>

                          </div>
                        )}
                        
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* The Authors segment: Patrice & Mam cards */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#4A3225]">
              Qui sont Patrice & Mam ?
            </h3>
            <p className="text-sm text-[#8A7968] font-mono mt-2">
              Rencontre avec les deux darons bretons les plus têtus de l'archipel
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Patrice Card */}
            <div className="bg-white border border-[#E6DFD3] rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xs hover:shadow-md transition-shadow">
              <div className="absolute top-0 right-0 bg-[#8E5A3C]/10 text-[#8E5A3C] px-4 py-2 font-mono text-xs rounded-bl-xl font-bold">
                Le Chef de Bord
              </div>
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-14 h-14 bg-[#EBDCCB] rounded-full flex items-center justify-center font-serif text-2xl font-black text-[#5C4D3C]">
                  P
                </div>
                <div>
                  <h4 className="font-serif font-extrabold text-xl text-[#4A3225]">Patrice</h4>
                  <p className="text-xs text-[#8A7968] font-mono">Retraité Bio, 69 ans, Photographe et Spécialiste Tetris</p>
                </div>
              </div>
              <p className="text-sm text-[#6B5A49] leading-relaxed italic">
                « Un autodidacte qui vous emmène dans son rêve. J'ai insisté pour prendre les pistes aborigènes impossibles et tester mon Toyota Fortuner dans le Bush, même si le 4x4 a décollé de 3 mètres ! Mon rituel ? Un verre de blanc de Villa Maria de 18 heures pour détendre l'atmosphère. Je n'écoute pas les râlements de ma préférée, car au fond, Mam a un cœur en or et on s'adore depuis 50 ans. »
              </p>
            </div>

            {/* Mam Card */}
            <div className="bg-white border border-[#E6DFD3] rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xs hover:shadow-md transition-shadow">
              <div className="absolute top-0 right-0 bg-[#2E4A3F]/10 text-[#2E4A3F] px-4 py-2 font-mono text-xs rounded-bl-xl font-bold">
                Momo Nationale
              </div>
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-14 h-14 bg-[#E1EFEB] rounded-full flex items-center justify-center font-serif text-2xl font-black text-[#2E4A3F]">
                  M
                </div>
                <div>
                  <h4 className="font-serif font-extrabold text-xl text-[#4A3225]">Monique (MAM)</h4>
                  <p className="text-xs text-[#8A7968] font-mono">Ancienne Assistante Sociale, Experte du Climatiseur</p>
                </div>
              </div>
              <p className="text-sm text-[#6B5A49] leading-relaxed italic">
                « Patrice m'appelle sa préférée mais m'attribue tous les maux de valises ! C'est vrai, je stresse quand nous approchons des balances d'immigration avec 31 kg au lieu de 20. J'ai eu des palpitations à 150 BPM sous les fumées de soufre du volcan Bromo, j'ai détesté le jet-lag, mais j'ai marché 14 km par jour à Kyoto et contemplé des forêts de bambous géants. Ce voyage, c'est la concrédisation de notre amour. »
              </p>
            </div>

          </div>
        </div>

        {/* Interactive preview chapters tabs */}
        <div className="mb-12 bg-white border border-[#E6DFD3] p-6 sm:p-8 rounded-2xl shadow-xs">
          <div className="md:flex md:items-center md:justify-between mb-6">
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#4A3225] flex items-center">
                <BookOpen className="w-5.5 h-5.5 mr-2 text-[#8E5A3C]" />
                Feuilleter quelques pages...
              </h3>
              <p className="text-xs text-[#8A7968] font-mono mt-1">Extraits bruts choisis pour leur authenticité</p>
            </div>
            
            {/* Chapters indicators */}
            <div className="flex space-x-2 mt-4 md:mt-0 overflow-x-auto pb-2 md:pb-0">
              {PREVIEW_CHAPTERS.map((chap, idx) => (
                <button
                  key={idx}
                  onClick={() => setShowPreviewIdx(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                    showPreviewIdx === idx
                      ? 'bg-[#8E5A3C] text-white'
                      : 'bg-[#FCFAF6] text-[#6B5A49] hover:bg-[#EBDCCB]/30'
                  }`}
                >
                  {chap.num}
                </button>
              ))}
            </div>
          </div>

          {/* Chapter preview viewport */}
          <div className="bg-[#FCFAF6] border border-[#E1DBCE] p-6 rounded-xl relative min-h-[140px] flex flex-col justify-center">
            <span className="font-serif text-[#C19358] text-4xl absolute -top-1 left-2 opacity-30 select-none">“</span>
            <div className="relative z-10">
              <h4 className="font-serif font-black text-[#5C4D3C] text-md sm:text-lg mb-2">
                {PREVIEW_CHAPTERS[showPreviewIdx].title}
              </h4>
              <p className="text-sm sm:text-base text-[#6B5A49] leading-relaxed italic font-serif">
                {PREVIEW_CHAPTERS[showPreviewIdx].text}
              </p>
            </div>
            <span className="font-serif text-[#C19358] text-4xl absolute -bottom-8 right-4 opacity-30 select-none">”</span>
          </div>
        </div>

        {/* Le livre d'or de la famille et des lecteurs */}
        <div className="bg-[#FAF7F2] border border-[#E6DFD3] rounded-3xl p-6 sm:p-10 shadow-xs">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-mono text-[#8E5A3C] font-bold uppercase tracking-widest block">👪 Le Livre d'Or de l'Aventure</span>
            <h3 className="font-serif text-3xl font-extrabold text-[#4A3225] mt-2">Dédicaces & Mots Doux</h3>
            <p className="text-xs sm:text-sm text-[#8A7968] font-mono mt-2 leading-relaxed">
              Laissez un message de soutien à Patrice & Mam, partagez vos impressions ou félicitez-les pour cet incroyable périple !
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left side: Add dynamic entry form */}
            <div className="lg:col-span-5 bg-white border border-[#E6DFD3] p-6 rounded-2xl shadow-xs">
              <h4 className="font-serif text-lg font-bold text-[#4A3225] mb-4 border-b border-[#FAF6F0] pb-2 flex items-center gap-1.5">
                <span>✍️</span>
                <span>Écrire sur le Livre d'Or</span>
              </h4>

              <form onSubmit={handlePostGuestbook} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-[#5C4D3C] uppercase tracking-wider mb-1">
                    Votre Nom ou Prénom *
                  </label>
                  <input
                    type="text"
                    required
                    value={gbName}
                    onChange={(e) => setGbName(e.target.value)}
                    placeholder="Ex: Alix, Laurence, Jean-Louis..."
                    className="w-full px-3 py-2 text-sm bg-[#FCFAF6] border border-[#E6DFD3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8E5A3C] focus:border-[#8E5A3C] text-[#4A3225]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[#5C4D3C] uppercase tracking-wider mb-1">
                    D'où écrivez-vous ? (Ville, Pays)
                  </label>
                  <input
                    type="text"
                    value={gbLocation}
                    onChange={(e) => setGbLocation(e.target.value)}
                    placeholder="Ex: Rennes, France ou Wellington, NZ"
                    className="w-full px-3 py-2 text-sm bg-[#FCFAF6] border border-[#E6DFD3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8E5A3C] focus:border-[#8E5A3C] text-[#4A3225]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[#5C4D3C] uppercase tracking-wider mb-1">
                    Votre Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={gbMessage}
                    onChange={(e) => setGbMessage(e.target.value)}
                    placeholder="Félicitez nos darons bretons ou racontez votre anecdote préférée du livre !"
                    className="w-full px-3 py-2 text-sm bg-[#FCFAF6] border border-[#E6DFD3] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8E5A3C] focus:border-[#8E5A3C] text-[#4A3225] resize-none"
                  />
                </div>

                {gbSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-mono"
                  >
                    🎉 Votre message a été ajouté avec succès au livre d'or ! Merci de tout cœur.
                  </motion.div>
                )}

                {gbError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs font-mono">
                    ⚠️ {gbError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmittingGb}
                  className="w-full py-2.5 px-4 bg-[#8E5A3C] hover:bg-[#73482F] text-white font-mono text-xs font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2 border-none"
                >
                  {isSubmittingGb ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Ajout en cours...</span>
                    </>
                  ) : (
                    <>
                      <span>Signer le Livre d'Or</span>
                      <span>✨</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right side: Dynamic, scrollable entries list */}
            <div className="lg:col-span-7 space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {guestbook.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-[#E6DFD3] text-[#8A7968]">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#8E5A3C] mb-3" />
                  <p className="font-mono text-xs">Chargement des dédicaces...</p>
                </div>
              ) : (
                guestbook.map((msg) => (
                  <motion.div
                    key={msg.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-5 rounded-2xl border border-[#E6DFD3] relative hover:border-[#8E5A3C]/40 transition-colors shadow-xs text-left"
                  >
                    {/* Retro seal or tag */}
                    <div className="absolute top-4 right-4 flex items-center space-x-1.5 font-mono text-[10px] text-[#8A7968]">
                      <span>📍</span>
                      <span className="font-bold">{msg.location || "France"}</span>
                    </div>

                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-6 h-6 bg-[#EBDCCB]/60 text-[#8E5A3C] rounded-full flex items-center justify-center text-xs font-black font-serif">
                        {msg.name ? msg.name.charAt(0).toUpperCase() : 'G'}
                      </div>
                      <span className="font-serif text-sm font-black text-[#4A3225]">{msg.name}</span>
                      <span className="text-[10px] font-mono text-gray-400">• {msg.date}</span>
                    </div>

                    <p className="text-xs sm:text-sm text-[#6B5A49] leading-relaxed italic font-serif border-l-2 border-[#EBDCCB] pl-3.5 my-2">
                      « {msg.message} »
                    </p>
                    
                    <div className="flex items-center space-x-1 mt-3">
                      <div className="flex text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      </div>
                      <span className="text-[9px] font-mono text-gray-400 ml-1">Coup de cœur</span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

          </div>
        </div>


      </div>
    </div>
  );
}
