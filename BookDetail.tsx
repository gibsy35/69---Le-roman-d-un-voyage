import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Star, HelpCircle, ArrowRight, ShieldCheck, Mail, ChevronRight, Award, Plus, Sparkles, Check, DollarSign, ShoppingBag, Search, Truck, Loader2 } from 'lucide-react';
import { BookOrder, BookConfig } from './types';
import DiscoveryAggregator from './DiscoveryAggregator';
// @ts-ignore
import miyajimaCoverImg from './miyajima_cover_1781530821053.jpg';

interface BookDetailProps {
  onSuccessOrder: (order: BookOrder) => void;
  onOpenAuthModal?: () => void;
}

const PREVIEW_CHAPTERS = [
  {
    num: "p. 163",
    title: "Le décollage du Fortuner sur la Piste Aborigène",
    text: "« lorsque nous passons un gue dans lequel je pense qu’il n’y a que peu d’eau, le trou est si profond que la voiture decolle pour retombée 3 metres plus loin en faisant a Mam la frayeur de sa vie. C’est alors qu’elle cherche a m’embrouiller en disant n’importe quoi que je lui dit « STOP LAISSE MOI CONDUIRE ». »"
  },
  {
    num: "p. 55",
    title: "Wellington la Venteuse & Le Musée Te Papa",
    text: "« A noter que Wellington est la capitale de la NZ depuis 1875. Elle compte un peu plus de 200000 habitants et se situe au point le plus meridional de l’ile du Nord dans le detroit du capitaine james Cook qui a decouvert l’ile en 1769 . Sa position geographique en fait une ville tres venteuse qui lui donne dailleurs son surnom de «Windy Wellington» traduit en francais par «Wellington la venteuse». »"
  },
  {
    num: "p. 41",
    title: "Stephen, Ruth et la Traite à Reporoa",
    text: "« Nous arrivons donc chez eux en 25 mn et nous sommes merveilleusement accueillis dans leur belle petite maison avec une tasse de café et un gateau a la banane. Il est a noter car «tout ce qui est rare est a noter» (ah!ah!ah!), que meme Mam qui ne mange jamais de banane trouvera ce gateau excellent et en prendra 2x... Au moment de partir ils nous proposent d’assister à la traite d’un 1 er groupe de 170 betes. »"
  }
];

export default function BookDetail({ onSuccessOrder, onOpenAuthModal }: BookDetailProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'printed' | 'hardcover' | 'pdf'>('pdf');
  const [showPreviewIdx, setShowPreviewIdx] = useState<number>(0);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerDedication, setBuyerDedication] = useState('');
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState<BookOrder | null>(null);
  const [stripeUrl, setStripeUrl] = useState<string | null>(null);
  const [activeTab] = useState<'story'>('story');
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  
  // Book custom cover config state
  const [bookConfig, setBookConfig] = useState<BookConfig>({
    coverImageUrl: "preset-miyajima",
    coverBorderColor: "#FD3D63",
    authorName: "PATRICE LEQUIME",
    bookTitle: "69",
    bookSubtitle: "LE ROMAN D'UN VOYAGE",
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

  // Tracking search states
  const [trackingSearch, setTrackingSearch] = useState('');
  const [searchedOrders, setSearchedOrders] = useState<BookOrder[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Stripe integration states
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [stripeErrorDetail, setStripeErrorDetail] = useState<string | null>(null);

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
    setStripeErrorDetail(null);
    setStripeUrl(null);

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
        setStripeErrorDetail(data.detail || null);
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

    setIsOrdering(false);
  };

  return (
    <div className="py-8 sm:py-12 bg-[#FCFAF6] relative overflow-hidden">
      {/* Ambient decorative background blobs — subtle warmth across the whole page */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-[#C19358]/10 blur-3xl -translate-x-1/3 -translate-y-1/3 pointer-events-none select-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-[#8E5A3C]/10 blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none select-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Intro Hero Section */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-start mb-20">
          
          {/* Left Column: Interactive 3D Flippable Book Cover */}
          <div className="lg:col-span-5 mb-10 lg:mb-0 flex flex-col items-center justify-center w-full">

            {/* Ambient glow + floating badge wrapper */}
            <div className="relative flex items-center justify-center w-full">
              <div
                className="absolute w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full blur-3xl opacity-40 pointer-events-none select-none"
                style={{ background: `radial-gradient(circle, ${bookConfig.coverBorderColor}55 0%, transparent 70%)` }}
              />

              {/* Floating "coup de coeur" badge */}
              <motion.div
                className="absolute -top-3 sm:-top-2 right-4 sm:right-8 md:right-16 z-20 bg-white shadow-lg border border-[#EBDCCB] rounded-full px-3 py-1.5 flex items-center space-x-1.5 pointer-events-none select-none"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <span className="flex text-amber-400 text-xs">★★★★★</span>
                <span className="font-mono text-[10px] font-bold text-[#4A3225] whitespace-nowrap">Coup de cœur lecteurs</span>
              </motion.div>

            {/* 3D Container Wrapper */}
            <div className="relative mx-auto w-80 sm:w-[360px] md:w-[420px] lg:w-[380px] h-[510px] sm:h-[570px] md:h-[660px] lg:h-[570px] perspective-1000 group">
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

            </div>
            {/* end ambient glow wrapper */}

            {/* Interactive controls */}
            <div className="mt-5 flex flex-col items-center space-y-1.5">
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

              {/* Preview trigger — extra desire booster */}
              <button
                type="button"
                onClick={() => { setShowPreviewIdx(0); setIsPreviewOpen(true); }}
                className="mt-2 px-4 py-2 bg-white border-2 border-[#8E5A3C] text-[#8E5A3C] hover:bg-[#8E5A3C] hover:text-white font-mono text-xs font-bold rounded-lg shadow-sm hover:shadow-md transition-all flex items-center space-x-1.5 cursor-pointer leading-none"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Feuilleter un aperçu du roman</span>
              </button>
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
              La consécration de{' '}
              <span className="bg-gradient-to-r from-[#8E5A3C] via-[#C19358] to-[#FD3D63] bg-clip-text text-transparent">
                3 mois de périple
              </span>
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
                <span className="block text-2xl font-serif font-black text-[#8E5A3C]">69</span>
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
                
                {/* Print format — temporarily unavailable */}
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  className="p-4 rounded-xl text-left border-2 border-[#E6DFD3] bg-[#F5F1EA]/60 relative overflow-hidden flex flex-col justify-between h-full opacity-60 cursor-not-allowed grayscale-[30%]"
                >
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <span className="block font-serif font-black text-sm text-[#4A3225] line-through decoration-2">Édition Brochée</span>
                      <span className="bg-gray-200 text-gray-600 text-[8px] px-1.5 py-0.5 rounded font-mono uppercase font-extrabold tracking-wider shrink-0">
                        Indisponible
                      </span>
                    </div>
                    <span className="block text-xs font-mono text-[#8A7968] line-through">Couverture souple illustrée</span>
                    <span className="block text-[10px] text-gray-500 font-mono mt-2 font-bold leading-tight bg-gray-100 p-1 rounded-sm border border-gray-200">
                      🔒 Pas encore disponible
                    </span>
                  </div>
                  <span className="block text-lg font-bold text-[#8A7968] mt-4 line-through decoration-2">22,00 €</span>
                </button>

                {/* Hardcover format — temporarily unavailable */}
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  className="p-4 rounded-xl text-left border-2 border-[#E6DFD3] bg-[#F5F1EA]/60 relative overflow-hidden flex flex-col justify-between h-full opacity-60 cursor-not-allowed grayscale-[30%]"
                >
                  <div>
                    <div className="flex justify-between items-start mb-1 gap-1">
                      <span className="block font-serif font-black text-sm text-[#4A3225] line-through decoration-2">Luxe Illustré</span>
                      <span className="bg-gray-200 text-gray-600 text-[8px] px-1.5 py-0.5 rounded font-mono uppercase font-extrabold tracking-wider shrink-0">
                        Indisponible
                      </span>
                    </div>
                    <span className="block text-xs font-mono text-[#8A7968] line-through">Grand format relié rigide</span>
                    <span className="block text-[10px] text-gray-500 font-mono mt-2 font-bold leading-tight bg-gray-100 p-1 rounded-sm border border-gray-200">
                      🔒 Pas encore disponible
                    </span>
                  </div>
                  <span className="block text-lg font-bold text-[#8A7968] mt-4 line-through decoration-2">39,00 €</span>
                </button>

                {/* PDF format — the only one available right now */}
                <button
                  type="button"
                  onClick={() => setSelectedFormat('pdf')}
                  className={`p-4 rounded-xl text-left border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between h-full ring-2 ring-emerald-200 ${
                    selectedFormat === 'pdf'
                      ? 'border-[#8E5A3C] bg-white shadow-lg scale-[1.02]'
                      : 'border-[#E6DFD3] bg-white hover:border-[#8E5A3C]/50'
                  }`}
                >
                  <span className="absolute -top-1 -right-1 bg-[#FD3D63] text-white text-[8px] font-mono font-black uppercase tracking-wider px-2 py-1 rounded-bl-lg shadow-sm">
                    ✨ Seul format dispo
                  </span>
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
              <p className="text-[11px] text-[#8A7968] font-mono mt-2 italic">
                📘👑 Les éditions Brochée et Luxe Illustré arrivent bientôt — en attendant, plongez dans l'histoire dès aujourd'hui en numérique.
              </p>
            </div>

            {/* Quick checkout CTA card with Stripe & Simulation controls */}
            <div className="bg-[#FAF6F0] border border-[#E6DFD3] p-5 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#8E5A3C] via-[#C19358] to-[#FD3D63]" />
              <h4 className="font-serif font-black text-lg text-[#4A3225] flex items-center mb-1">
                <ShoppingBag className="w-5 h-5 text-[#8E5A3C] mr-2" />
                Commander un exemplaire
              </h4>
              <p className="text-xs text-[#8A7968] mb-4">
                Saisissez vos coordonnées pour recevoir immédiatement l'Édition Numérique (PDF) — 9,90 €.
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
                  {stripeError === "stripe_not_configured" && (
                    <div className="bg-amber-50 border border-amber-300 p-3.5 rounded-xl text-xs text-amber-900 space-y-2">
                      <p className="font-bold">🔑 Configuration Stripe Requise</p>
                      <p className="leading-relaxed">
                        Pour activer les paiements bancaires réels sur votre site, configurez votre clé secrète Stripe dans les variables d'environnement de votre projet (menu **Paramètres** d'AI Studio, ou **Settings → Environment Variables** sur Vercel) sous la variable <code className="bg-amber-100 px-1 py-0.5 rounded font-bold text-amber-950">STRIPE_SECRET_KEY</code>.
                      </p>
                      {stripeErrorDetail && (
                        <p className="text-[10px] font-mono bg-amber-100/70 border border-amber-200 rounded p-2 text-amber-900 break-all">
                          Détail technique : {stripeErrorDetail}
                        </p>
                      )}
                      <div className="pt-1">
                        <span className="text-[10px] text-amber-700 italic">Cette page se met à jour automatiquement dès que la clé est configurée.</span>
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
                        className="w-full py-3 text-white rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer bg-gradient-to-r from-[#8E5A3C] to-[#6B4028] hover:from-[#724831] hover:to-[#54301d] hover:scale-[1.01]"
                      >
                        {isOrdering ? (
                          <span>Connexion sécurisée en cours...</span>
                        ) : (
                          <>
                            <span>💳</span>
                            <span>Payer par Carte Bancaire — {getPrice().toFixed(2)} €</span>
                          </>
                        )}
                      </button>

                      {/* Reassurance / trust row */}
                      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 pt-1 text-[10px] font-mono text-[#8A7968]">
                        <span className="flex items-center gap-1">🔒 Paiement sécurisé Stripe</span>
                        <span className="flex items-center gap-1">⚡ Téléchargement immédiat</span>
                        <span className="flex items-center gap-1">🇫🇷 Édition indépendante bretonne</span>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Subtle, secondary entry point for existing customers — kept away from the purchase card above */}
        <div className="text-center mb-8">
          <button
            type="button"
            onClick={() => setIsTrackingOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-mono text-[#8A7968] hover:text-[#4A3225] underline underline-offset-4 decoration-dotted cursor-pointer transition-colors"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Déjà commandé ? Suivez votre livraison ici</span>
          </button>
        </div>

        {/* --- SECTION: STORY DISCOVERY --- */}
        <div className="mb-8 flex justify-center">
          <span className="flex items-center space-x-2 px-4 sm:px-6 py-3 rounded-xl text-xs sm:text-sm font-mono font-bold bg-[#8E5A3C] text-white shadow-md">
            <span>📖</span>
            <span>Feuilleter le Roman (Situations & Photos)</span>
          </span>
        </div>

        {/* Tab contents with smooth height and fade transitions */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {activeTab === 'story' && (
              <motion.div
                key="story-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-8"
              >
                {/* Discovery Aggregator Component for Leafing through pages */}
                <DiscoveryAggregator onOpenAuthModal={onOpenAuthModal} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* --- SUIVI DE COLIS (Order Tracking Modal) --- */}
      <AnimatePresence>
        {isTrackingOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
            onClick={() => setIsTrackingOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-3xl my-8"
            >
              <button
                onClick={() => setIsTrackingOpen(false)}
                className="absolute -top-3 -right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white hover:bg-gray-50 text-[#4A3225] shadow-md cursor-pointer font-bold border border-[#E6DFD3]"
                aria-label="Fermer le suivi de colis"
              >
                ✕
              </button>

                {/* SECTION: ORDER TRACKING LOOKUP (SUIVI DE COLIS INTERACTIF) */}
                <div className="bg-white border border-[#E6DFD3] rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl text-left">
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
                        className="px-6 py-2.5 bg-[#2D493E] hover:bg-[#1E332B] text-white rounded-xl text-sm font-bold flex items-center justify-center space-x-2 cursor-pointer transition-colors shrink-0 disabled:opacity-50 font-mono border-none"
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
                                      Les formats numériques (PDF) ne nécessitent pas de transport physique. Vous pouvez télécharger le livre complet "69" immédiatement en clicking sur le bouton ci-dessous !
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

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- APERÇU DU ROMAN (Preview Modal) --- */}
      <AnimatePresence>
        {isPreviewOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
            onClick={() => setIsPreviewOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg bg-[#FCFAF6] rounded-2xl shadow-2xl border-4 border-[#8E5A3C] overflow-hidden"
            >
              {/* Close button */}
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 hover:bg-white text-[#4A3225] shadow-md cursor-pointer font-bold"
                aria-label="Fermer l'aperçu"
              >
                ✕
              </button>

              {/* Header */}
              <div className="bg-[#4A3225] text-[#FCFAF6] px-6 py-4 flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-[#C19358]" />
                <div>
                  <h3 className="font-serif font-black text-lg leading-none">Aperçu du roman « 69 »</h3>
                  <p className="text-[10px] font-mono text-[#EBDCCB] mt-1 uppercase tracking-widest">
                    Extrait {showPreviewIdx + 1} / {PREVIEW_CHAPTERS.length}
                  </p>
                </div>
              </div>

              {/* Page content */}
              <div className="p-6 sm:p-8 min-h-[280px] flex flex-col justify-between">
                <div>
                  <span className="inline-block bg-[#EBDCCB]/60 text-[#8E5A3C] px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider mb-3">
                    {PREVIEW_CHAPTERS[showPreviewIdx].num}
                  </span>
                  <h4 className="font-serif text-xl font-black text-[#4A3225] mb-3 leading-tight">
                    {PREVIEW_CHAPTERS[showPreviewIdx].title}
                  </h4>
                  <p className="font-serif italic text-[#4A3225]/90 text-sm leading-relaxed whitespace-pre-line">
                    {PREVIEW_CHAPTERS[showPreviewIdx].text}
                  </p>
                </div>

                {/* Navigation dots + arrows */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#E6DFD3]">
                  <button
                    type="button"
                    onClick={() => setShowPreviewIdx((i) => (i - 1 + PREVIEW_CHAPTERS.length) % PREVIEW_CHAPTERS.length)}
                    className="px-3 py-1.5 rounded-lg bg-[#EBDCCB]/50 hover:bg-[#EBDCCB] text-[#4A3225] text-xs font-mono font-bold cursor-pointer transition-colors"
                  >
                    ← Précédent
                  </button>
                  <div className="flex space-x-1.5">
                    {PREVIEW_CHAPTERS.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setShowPreviewIdx(i)}
                        className={`w-2 h-2 rounded-full transition-all cursor-pointer ${i === showPreviewIdx ? 'bg-[#8E5A3C] w-5' : 'bg-[#D1C2A5]'}`}
                        aria-label={`Aller à l'extrait ${i + 1}`}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPreviewIdx((i) => (i + 1) % PREVIEW_CHAPTERS.length)}
                    className="px-3 py-1.5 rounded-lg bg-[#EBDCCB]/50 hover:bg-[#EBDCCB] text-[#4A3225] text-xs font-mono font-bold cursor-pointer transition-colors"
                  >
                    Suivant →
                  </button>
                </div>
              </div>

              {/* CTA footer */}
              <div className="bg-[#EBDCCB]/40 border-t border-[#E6DFD3] px-6 py-4 text-center">
                <p className="text-xs text-[#6B5A49] mb-2">
                  Envie de découvrir les 69 lieux et péripéties en entier ?
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFormat('pdf');
                    setIsPreviewOpen(false);
                  }}
                  className="w-full py-2.5 bg-[#8E5A3C] hover:bg-[#724831] text-white rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer"
                >
                  📖 Lire le roman complet — Édition Numérique 9,90 €
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
