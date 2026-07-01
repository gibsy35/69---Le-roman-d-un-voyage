import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Star, ArrowRight, Check, ShoppingBag, Search, Truck, Loader2 } from 'lucide-react';
import { BookOrder, BookConfig } from './types';
import miyajimaCoverImg from './miyajima_cover_1781530821053.jpg';

interface BookDetailProps {
  onSuccessOrder: (order: BookOrder) => void;
}

const OCEAN  = '#2A6B8A';
const TERRA  = '#C4622D';
const JUNGLE = '#3A6B44';
const BG_O   = '#EDF4F7';
const BG_T   = '#FBF1E6';
const BG_J   = '#EEF3ED';
const TEXT_D = '#1A3A4A';
const TEXT_T = '#2D1A0E';
const TEXT_J = '#1A2E1E';
const IVORY  = '#FDFCFA';

const PREVIEW_CHAPTERS = [
  { num: 'Vol. 13', title: 'Le décollage du Fortuner dans le Bush', text: '« Le trou est si profond que la voiture décolle de la piste pour retomber 3 mètres plus loin en faisant à Mam la frayeur de sa vie... C\'est alors qu\'elle cherche à m\'embrouiller en balançant ses bras dans le pare-brise. Je la regarde calmement et je lui crie : STOP, LAISSE-MOI CONDUIRE ! »' },
  { num: 'Vol. 21', title: 'Le classeur magique de 15h15', text: '« Mam sort son grand classeur magique où est noté notre vol retour de Kaohsiung à 15h15. Je vérifie sur mon écran à 9h30 : le vol est à 10h15 ! Les bagages ne sont pas faits, la chambre ressemble à Beyrouth. Mam en tombe en larmes... »' },
  { num: 'Vol. 6',  title: 'Stephen, Ruth et nous', text: '« Stephen nous invite à boire un café. Ruth nous prépare un fameux gâteau à la banane qui réconcilie Mam avec ce fruit. On assiste à la traite de 1000 vaches. Deux darons bretons au milieu du lait de Nouvelle-Zélande : c\'est possible à tout âge ! »' },
];

type Tab = 'presentation' | 'commander' | 'suivi' | 'auteurs' | 'extraits' | 'livreor';

const TABS: { id: Tab; label: string; color: string }[] = [
  { id: 'presentation', label: 'Présentation', color: OCEAN  },
  { id: 'commander',    label: 'Commander',    color: TERRA  },
  { id: 'suivi',        label: 'Suivi colis',  color: OCEAN  },
  { id: 'auteurs',      label: 'Patrice & Mam',color: JUNGLE },
  { id: 'extraits',     label: 'Extraits',     color: TERRA  },
  { id: 'livreor',      label: "Livre d'Or",   color: JUNGLE },
];

const DEFAULT_COVER_COLOR = '#C4622D'; // rouge — couleur par défaut de l'admin

export default function BookDetail({ onSuccessOrder }: BookDetailProps) {
  const [activeTab, setActiveTab] = useState<Tab>('presentation');
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'printed'|'hardcover'|'pdf'>('printed');
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerDedication, setBuyerDedication] = useState('');
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState<BookOrder|null>(null);
  const [stripeUrl, setStripeUrl] = useState<string|null>(null);
  const [stripeError, setStripeError] = useState<string|null>(null);
  const [checkoutMode, setCheckoutMode] = useState<'real'|'simulated'>('real');
  const [trackingSearch, setTrackingSearch] = useState('');
  const [searchedOrders, setSearchedOrders] = useState<BookOrder[]|null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [showPreviewIdx, setShowPreviewIdx] = useState(0);
  const [guestbook, setGuestbook] = useState<any[]>([]);
  const [gbName, setGbName] = useState('');
  const [gbLocation, setGbLocation] = useState('');
  const [gbMessage, setGbMessage] = useState('');
  const [isSubmittingGb, setIsSubmittingGb] = useState(false);
  const [gbSuccess, setGbSuccess] = useState(false);
  const [gbError, setGbError] = useState('');
  const [bookConfig, setBookConfig] = useState<BookConfig>({
    coverImageUrl: 'preset-miyajima',
    coverBorderColor: DEFAULT_COVER_COLOR,
    authorName: 'PATRICE LEQUIME',
    bookTitle: '69',
    bookSubtitle: "C'EST POSSIBLE",
    topBadge: '69 ANS • 69 000 KM • 69 HEURES DE VOL',
    bottomLine: '69 LIEUX ÉTONNANTS • 69 RAISONS D\'Y CROIRE...',
    backQuote: '« Poursuivez vos rêves. À 69 ans, tout est possible. »',
    backAboutTitle: 'À PROPOS DE CE LIVRE',
    backAboutSubtitle: 'Le livre à offrir à vos parents ou vos grands-parents',
    backAboutContent: 'Ce bouquin est sans prétentions.\nNi un livre de photos, ni un guide touristique,\nni un roman d\'aventures.\n\nJuste un récit dont l\'ambition est de vous donner envie de toujours poursuivre vos rêves.',
  });

  React.useEffect(() => {
    // Lire la config depuis localStorage (sauvegardée par l'admin)
    const saved = localStorage.getItem('lyaBookConfig_69');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Conserver la couleur choisie dans l'admin
        setBookConfig(parsed);
      } catch(_) {
        // Fallback API si localStorage corrompu
        fetch('/api/book-config').then(r=>r.json()).then(d=>{
          if (d && !d.error) setBookConfig(d);
        }).catch(()=>{});
      }
    } else {
      fetch('/api/book-config').then(r=>r.json()).then(d=>{
        if (d && !d.error) setBookConfig(d);
      }).catch(()=>{});
    }
    fetch('/api/guestbook').then(r=>r.json()).then(d=>{if(Array.isArray(d))setGuestbook(d);}).catch(()=>{});
  }, []);

  const getCoverImageSrc = (url: string) => {
    if (url === 'preset-miyajima') return miyajimaCoverImg;
    if (url === 'preset-fuji')    return 'https://images.unsplash.com/photo-1578637387939-43c525550085?auto=format&fit=crop&q=80&w=600';
    if (url === 'preset-tokyo')   return 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=600';
    if (url === 'preset-kyoto')   return 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=600';
    return url || miyajimaCoverImg;
  };

  const getPrice = () => selectedFormat === 'printed' ? 22 : selectedFormat === 'hardcover' ? 39 : 9.90;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName || !buyerEmail) return;
    setIsOrdering(true); setStripeError(null); setStripeUrl(null);
    if (checkoutMode === 'real') {
      let pw: Window|null = null;
      try { pw = window.open('', '_blank'); } catch(_) {}
      try {
        const r = await fetch('/api/create-checkout-session', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ customerName:buyerName, customerEmail:buyerEmail, bookFormat:selectedFormat, dedicationRequest:buyerDedication||undefined }) });
        const d = await r.json();
        if (d.error === 'stripe_not_configured') { pw?.close(); setStripeError('stripe_not_configured'); setIsOrdering(false); return; }
        if (d.url) { setStripeUrl(d.url); setIsOrdering(false); if(pw) pw.location.href=d.url; return; }
        if (d.error) { pw?.close(); setStripeError(d.error); setIsOrdering(false); return; }
      } catch(err:any) { pw?.close(); setStripeError(err.message); setIsOrdering(false); return; }
    }
    try {
      const r = await fetch('/api/orders', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ customerName:buyerName, customerEmail:buyerEmail, bookFormat:selectedFormat, price:getPrice(), dedicationRequest:buyerDedication||undefined }) });
      const d = await r.json();
      setOrderPlaced(d); onSuccessOrder(d);
      setBuyerName(''); setBuyerEmail(''); setBuyerDedication('');
    } catch { setStripeError('Une erreur est survenue.'); }
    finally { setIsOrdering(false); }
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingSearch.trim()) return;
    setSearchLoading(true); setSearchError(''); setSearchedOrders(null);
    try {
      const r = await fetch(`/api/orders/lookup?search=${encodeURIComponent(trackingSearch.trim())}`);
      if (r.ok) { const d = await r.json(); setSearchedOrders(d); if(!d.length) setSearchError('Aucune commande trouvée.'); }
      else setSearchError('Impossible de récupérer vos informations.');
    } catch { setSearchError('Erreur de connexion.'); }
    finally { setSearchLoading(false); }
  };

  const handlePostGuestbook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gbName.trim() || !gbMessage.trim()) return;
    setIsSubmittingGb(true); setGbError(''); setGbSuccess(false);
    try {
      const r = await fetch('/api/guestbook', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name:gbName.trim(), location:gbLocation.trim(), message:gbMessage.trim() }) });
      if (r.ok) { const m = await r.json(); setGuestbook(p=>[m,...p]); setGbName(''); setGbLocation(''); setGbMessage(''); setGbSuccess(true); setTimeout(()=>setGbSuccess(false),5000); }
      else setGbError("Impossible d'ajouter votre message.");
    } catch { setGbError('Erreur de connexion.'); }
    finally { setIsSubmittingGb(false); }
  };

  const activeColor = TABS.find(t => t.id === activeTab)?.color ?? OCEAN;

  // ── Couverture flip recto / verso ──
  const BookCover = () => (
    <div className="flex flex-col items-center gap-4">
      <div style={{ width: 280, height: 420, perspective: 1200 }}>
        <motion.div
          className="w-full h-full relative"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.75, ease: 'easeInOut' }}
        >
          {/* RECTO */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between"
            style={{
              backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
              border: `12px solid ${bookConfig.coverBorderColor}`
            }}
          >
            <div className="absolute inset-0 bg-slate-900">
              <img src={getCoverImageSrc(bookConfig.coverImageUrl)} alt="Couverture" className="w-full h-full object-cover opacity-90 brightness-[.85]" />
            </div>
            <div className="relative z-10 p-4 pt-6 text-center text-white font-mono select-none pointer-events-none">
              <p className="text-[10px] tracking-[.25em] font-medium opacity-90">{bookConfig.authorName}</p>
              <p className="text-[9px] font-bold uppercase mt-1.5 bg-black/30 py-0.5 px-2 rounded inline-block">{bookConfig.topBadge}</p>
            </div>
            <div className="relative z-10 text-center select-none pointer-events-none my-auto">
              <h1 className="font-serif font-black text-[110px] leading-none text-white drop-shadow-[0_8px_8px_rgba(0,0,0,.5)]">{bookConfig.bookTitle}</h1>
              <h2 className="font-sans font-black text-2xl tracking-[.3em] text-white mt-2 drop-shadow-[0_2px_4px_rgba(0,0,0,.4)]">{bookConfig.bookSubtitle}</h2>
            </div>
            <div className="relative z-10 p-4 pb-6 text-center text-white font-mono select-none pointer-events-none">
              <p className="text-[9px] tracking-widest font-bold uppercase bg-black/10 py-1 rounded">{bookConfig.bottomLine}</p>
            </div>
          </div>
          {/* VERSO — 4ème de couverture */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl p-6 flex flex-col justify-between bg-white"
            style={{
              backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              border: `12px solid ${bookConfig.coverBorderColor}`
            }}
          >
            <div className="text-center">
              <p className="font-sans font-bold text-xs uppercase tracking-wide" style={{ color: bookConfig.coverBorderColor }}>{bookConfig.backAboutSubtitle}</p>
              <h3 className="font-sans font-black text-xl tracking-wide mt-1.5 pb-2 border-b-2" style={{ color: bookConfig.coverBorderColor, borderColor: `${bookConfig.coverBorderColor}40` }}>{bookConfig.backAboutTitle}</h3>
            </div>
            <div className="my-auto text-xs font-serif italic text-gray-800 leading-relaxed whitespace-pre-line">{bookConfig.backAboutContent}</div>
            <div className="border-l-4 pl-3 py-1.5 bg-amber-50/50" style={{ borderColor: bookConfig.coverBorderColor }}>
              <p className="font-serif italic text-xs text-gray-900 leading-tight">{bookConfig.backQuote}</p>
            </div>
            <p className="font-sans font-black text-xs tracking-widest text-center" style={{ color: bookConfig.coverBorderColor }}>{bookConfig.authorName}</p>
          </div>
        </motion.div>
      </div>
      <button
        onClick={() => setIsFlipped(!isFlipped)}
        className="px-5 py-2 rounded-xl text-xs font-mono font-bold cursor-pointer transition-colors text-white"
        style={{ background: bookConfig.coverBorderColor }}
      >
        🔄 {isFlipped ? 'Voir la couverture' : 'Voir le verso'}
      </button>
    </div>
  );

  return (
    <div style={{ background: IVORY, minHeight:'100vh' }}>

      {/* ── HERO compact avec grande couverture ── */}
      <div style={{ background: BG_T, borderBottom:`0.5px solid #EDD9C0` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row items-center gap-12">
          <BookCover />
          <div className="text-center lg:text-left flex-1">
            <span className="inline-block text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4" style={{background:'rgba(42,107,138,.12)', color:OCEAN}}>
              🌍 Récit de voyage · Bretagne · Monde
            </span>
            <h2 className="font-serif font-extrabold text-3xl sm:text-4xl leading-tight mb-4" style={{color:TEXT_T}}>
              La consécration d'un périple de 90 jours
            </h2>
            <p className="text-sm leading-relaxed mb-6" style={{color:'#7A4A2A'}}>
              Pas un guide, pas un album photos. Le récit brut et authentique de deux Bretons de 69 ans qui ont osé partir au bout du monde — avec gaffes, fou rires et émerveillement.
            </p>

            {/* Stats tricolores */}
            <div className="inline-flex rounded-xl overflow-hidden border mb-6" style={{borderColor:'#EDD9C0'}}>
              {[{v:'69 000',u:'km',c:OCEAN},{v:'69h',u:'vol',c:TERRA},{v:'69',u:'sites',c:JUNGLE}].map((s,i)=>(
                <div key={i} className="px-5 py-3 text-center" style={{borderRight:i<2?`0.5px solid #EDD9C0`:'none', background:'rgba(255,255,255,.5)'}}>
                  <span className="block font-serif font-black text-xl" style={{color:s.c}}>{s.v}</span>
                  <span className="text-[9px] font-mono uppercase tracking-wide" style={{color:'#9A7060'}}>{s.u}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-8">
              <button onClick={()=>setActiveTab('commander')} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer flex items-center gap-2" style={{background:TERRA}}>
                <ShoppingBag className="w-4 h-4"/> Commander
              </button>
              <button onClick={()=>setActiveTab('extraits')} className="px-6 py-2.5 rounded-xl text-sm font-medium cursor-pointer flex items-center gap-2" style={{background:'rgba(42,107,138,.1)', color:OCEAN}}>
                <BookOpen className="w-4 h-4"/> Feuilleter
              </button>
            </div>

            {/* Citation + mini points forts */}
            <div className="space-y-3 text-left">
              <div className="rounded-2xl p-5 relative overflow-hidden" style={{background:'rgba(255,255,255,.6)', border:`0.5px solid #EDD9C0`}}>
                <span className="font-serif text-5xl leading-none absolute -top-1 left-3 opacity-15 select-none" style={{color:TERRA}}>"</span>
                <p className="font-serif italic text-sm leading-relaxed pl-4" style={{color:TEXT_T}}>
                  Le trou est si profond que la voiture décolle de la piste pour retomber 3 mètres plus loin... Mam en tombe en larmes. Moi, je lui souris sous 36°C.
                </p>
                <p className="text-xs font-mono mt-2 pl-4" style={{color:TERRA}}>— Patrice, Vol. 13 · Bush australien</p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  {emoji:'🗾', label:'12 pays', sub:'Asie & Océanie'},
                  {emoji:'✈️', label:'69 vols', sub:'& escales'},
                  {emoji:'📖', label:'1 livre', sub:'À offrir'},
                ].map((item, i) => (
                  <div key={i} className="rounded-xl p-3 text-center" style={{background:'rgba(255,255,255,.5)', border:`0.5px solid #EDD9C0`}}>
                    <span className="text-xl">{item.emoji}</span>
                    <p className="font-serif font-black text-sm mt-1" style={{color:TEXT_T}}>{item.label}</p>
                    <p className="text-[9px] font-mono" style={{color:'#9A7060'}}>{item.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── ONGLETS STICKY ── */}
      <div className="sticky z-40" style={{top:64, background:IVORY, borderBottom:`0.5px solid #DDE8EC`, boxShadow:'0 2px 8px rgba(0,0,0,.04)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto" style={{scrollbarWidth:'none'}}>
            {TABS.map(tab => (
              <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
                className="flex items-center gap-1.5 px-4 sm:px-5 py-3.5 text-xs sm:text-sm font-mono font-bold whitespace-nowrap cursor-pointer transition-all border-b-2 shrink-0"
                style={activeTab===tab.id
                  ? {color:tab.color, borderBottomColor:tab.color, background:'transparent'}
                  : {color:'#8A9AA0', borderBottomColor:'transparent', background:'transparent'}}
              >
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{background:activeTab===tab.id ? tab.color : '#C8D8E0'}}/>
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENU ONGLETS (switch, pas de scroll) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <AnimatePresence mode="wait">

          {/* PRÉSENTATION */}
          {activeTab === 'presentation' && (
            <motion.div key="presentation" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:.2}}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                {[
                  {bg:BG_O, color:OCEAN, tc:TEXT_D, emoji:'🌊', title:'Océan & Traversées', desc:'Hong Kong, Nouvelle-Zélande, Australie, Taïwan… Les grandes traversées et les ciels infinis de l\'hémisphère Sud.'},
                  {bg:BG_T, color:TERRA, tc:TEXT_T, emoji:'☀️', title:'Soleil & Épopée',    desc:'Le Bush australien, les pistes impossibles, le Toyota Fortuner qui décolle de 3 mètres. L\'aventure pure et dure.'},
                  {bg:BG_J, color:JUNGLE,tc:TEXT_J, emoji:'🌿', title:'Jungle & Rencontres',desc:'Sumatra, Bali, Kyoto, le volcan Bromo… Les forêts de bambous, les singes chapardeurs et les amitiés improbables.'},
                ].map((c,i)=>(
                  <div key={i} className="rounded-2xl p-6 border" style={{background:c.bg, borderColor:'rgba(0,0,0,.05)'}}>
                    <span className="text-3xl">{c.emoji}</span>
                    <h4 className="font-serif font-bold text-lg mt-3 mb-2" style={{color:c.tc}}>{c.title}</h4>
                    <p className="text-sm leading-relaxed" style={{color:c.tc, opacity:.75}}>{c.desc}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl p-8 text-center mb-6" style={{background:BG_T, border:`0.5px solid #EDD9C0`}}>
                <p className="font-serif text-xl italic mb-3" style={{color:TEXT_T}}>« Ce récit dont l'ambition est de vous prouver que C'EST POSSIBLE à n'importe quel âge. »</p>
                <p className="text-sm font-mono mb-6" style={{color:TERRA}}>— Patrice Lequime</p>
                <button onClick={()=>setActiveTab('commander')} className="px-8 py-3 rounded-xl text-sm font-bold text-white cursor-pointer inline-flex items-center gap-2" style={{background:TERRA}}>
                  <ShoppingBag className="w-4 h-4"/> Obtenir mon exemplaire
                </button>
              </div>
            </motion.div>
          )}

          {/* COMMANDER */}
          {activeTab === 'commander' && (
            <motion.div key="commander" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:.2}}>
              <div className="max-w-2xl mx-auto space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {id:'printed'  as const, title:'Édition Brochée',  sub:'Couverture souple illustrée',  note:'⌛ Pré-commande uniquement', price:'22,00 €', badge:'Pré-commande', badgeBg:'#FBF1E6', badgeC:TERRA},
                    {id:'hardcover'as const, title:'Luxe Illustré',     sub:'Grand format relié rigide',     note:'👑 Édition limitée',          price:'39,00 €', badge:'Éd. Limitée',  badgeBg:TERRA,    badgeC:'#fff'},
                    {id:'pdf'      as const, title:'Numérique',         sub:'Lecture immédiate PDF',         note:'⚡ Disponible maintenant',    price:'9,90 €',  badge:'Disponible',  badgeBg:BG_J,     badgeC:JUNGLE},
                  ].map(f=>(
                    <button key={f.id} type="button" onClick={()=>setSelectedFormat(f.id)}
                      className="p-4 rounded-xl text-left cursor-pointer flex flex-col gap-1 transition-all"
                      style={selectedFormat===f.id ? {border:`2px solid ${TERRA}`, background:'#fff', boxShadow:`0 2px 14px rgba(196,98,45,.14)`} : {border:`0.5px solid #DDE8EC`, background:'transparent'}}>
                      <div className="flex justify-between items-start">
                        <span className="font-serif font-black text-sm" style={{color:TEXT_T}}>{f.title}</span>
                        <span className="text-[8px] px-1.5 py-0.5 rounded font-mono font-bold" style={{background:f.badgeBg, color:f.badgeC}}>{f.badge}</span>
                      </div>
                      <span className="text-xs font-mono" style={{color:'#9A7060'}}>{f.sub}</span>
                      <span className="text-[10px] font-mono mt-1" style={{color:TERRA}}>{f.note}</span>
                      <span className="text-lg font-bold mt-2" style={{color:TERRA}}>{f.price}</span>
                    </button>
                  ))}
                </div>
                <div className="rounded-2xl p-6 space-y-4" style={{background:'#fff', border:`0.5px solid #DDE8EC`}}>
                  <div className="grid grid-cols-2 gap-2 p-1.5 rounded-xl" style={{background:BG_T, border:`0.5px solid #EDD9C0`}}>
                    {(['real','simulated'] as const).map(m=>(
                      <button key={m} type="button" onClick={()=>{setCheckoutMode(m); setStripeError(null);}}
                        className="py-2 px-3 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer"
                        style={checkoutMode===m ? {background:TERRA, color:'#fff'} : {background:'transparent', color:'#9A7060'}}>
                        {m==='real' ? '💳 CB / Stripe (Réel)' : '🧪 Simulateur (Test)'}
                      </button>
                    ))}
                  </div>
                  {stripeError==='stripe_not_configured' && (
                    <div className="p-3 rounded-xl text-xs space-y-2" style={{background:BG_T, border:`0.5px solid #EDD9C0`, color:TEXT_T}}>
                      <p className="font-bold">🔑 Stripe non configuré</p>
                      <p>Ajoutez <code className="px-1 rounded font-bold" style={{background:'#EDD9C0'}}>STRIPE_SECRET_KEY</code> dans vos variables Vercel.</p>
                      <button onClick={()=>{setCheckoutMode('simulated');setStripeError(null);}} className="text-xs font-bold py-1 px-3 rounded cursor-pointer text-white" style={{background:TERRA}}>Passer en simulation</button>
                    </div>
                  )}
                  {stripeUrl ? (
                    <div className="p-4 rounded-xl space-y-3" style={{background:BG_J, border:`0.5px solid #C8D9C4`}}>
                      <h5 className="font-serif font-black" style={{color:TEXT_J}}>✨ Lien de paiement prêt !</h5>
                      <a href={stripeUrl} target="_top" className="block w-full py-3 text-center rounded-xl text-sm font-bold text-white" style={{background:TERRA}}>💳 Ouvrir le paiement Stripe ({getPrice().toFixed(2)} €) →</a>
                      <button onClick={()=>setStripeUrl(null)} className="text-xs font-mono cursor-pointer" style={{color:TERRA}}>✕ Annuler</button>
                    </div>
                  ) : orderPlaced ? (
                    <div className="p-5 rounded-xl text-center" style={{background:BG_J, border:`0.5px solid #C8D9C4`}}>
                      <Check className="w-8 h-8 mx-auto mb-2" style={{color:JUNGLE}}/>
                      <h5 className="font-bold text-sm mb-1" style={{color:TEXT_J}}>Merci {orderPlaced.customerName} !</h5>
                      <p className="text-xs" style={{color:'#4A6A4E'}}>Commande enregistrée pour <strong>{orderPlaced.customerEmail}</strong>.</p>
                      <button onClick={()=>setOrderPlaced(null)} className="mt-3 text-xs font-mono cursor-pointer hover:underline" style={{color:JUNGLE}}>Commander un autre exemplaire</button>
                    </div>
                  ) : (
                    <form onSubmit={handleCheckout} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input type="text" required placeholder="Votre Prénom et Nom" value={buyerName} onChange={e=>setBuyerName(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none" style={{background:'#FDFCFA', border:`0.5px solid #DDE8EC`, color:TEXT_D}}/>
                        <input type="email" required placeholder="Votre Email" value={buyerEmail} onChange={e=>setBuyerEmail(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none" style={{background:'#FDFCFA', border:`0.5px solid #DDE8EC`, color:TEXT_D}}/>
                      </div>
                      {selectedFormat!=='pdf' && (
                        <input type="text" placeholder="✍️ Dédicace personnalisée (optionnel, gratuit)" value={buyerDedication} onChange={e=>setBuyerDedication(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none" style={{background:'#FDFCFA', border:`0.5px solid #DDE8EC`, color:TEXT_D}}/>
                      )}
                      <button type="submit" disabled={isOrdering} className="w-full py-3 text-white rounded-xl text-sm font-bold cursor-pointer transition-opacity disabled:opacity-50 flex items-center justify-center gap-2" style={{background:TERRA}}>
                        {isOrdering ? 'Connexion en cours...' : `💳 ${checkoutMode==='real' ? `Payer — ${getPrice().toFixed(2)} €` : `Simuler — ${getPrice().toFixed(2)} €`}`}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* SUIVI */}
          {activeTab === 'suivi' && (
            <motion.div key="suivi" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:.2}}>
              <div className="max-w-lg mx-auto space-y-5">
                <div className="text-center">
                  <Truck className="w-10 h-10 mx-auto mb-2" style={{color:OCEAN}}/>
                  <h3 className="font-serif text-2xl font-black mb-1" style={{color:TEXT_D}}>Où en est votre exemplaire ?</h3>
                  <p className="text-xs font-mono" style={{color:'#6A8A9A'}}>Saisissez votre email ou numéro de commande</p>
                </div>
                <form onSubmit={handleLookup} className="flex gap-3">
                  <input type="text" required placeholder="votre.email@gmail.com ou ord-..." value={trackingSearch} onChange={e=>setTrackingSearch(e.target.value)} className="flex-1 px-4 py-2.5 rounded-xl text-sm focus:outline-none" style={{background:'#fff', border:`1.5px solid #C8DDE8`, color:TEXT_D}}/>
                  <button type="submit" disabled={searchLoading} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white flex items-center gap-2 cursor-pointer disabled:opacity-50" style={{background:OCEAN}}>
                    {searchLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Search className="w-4 h-4"/>}
                  </button>
                </form>
                {searchError && <p className="text-center text-xs font-mono font-bold" style={{color:TERRA}}>{searchError}</p>}
                {searchedOrders?.map(ord=>(
                  <div key={ord.id} className="rounded-2xl p-5 space-y-2" style={{background:'#fff', border:`0.5px solid #C8DDE8`}}>
                    <div className="flex justify-between text-xs font-mono">
                      <span style={{color:'#6A8A9A'}}>N° <strong style={{color:TEXT_D}}>{ord.id}</strong></span>
                      <span className="px-2 py-0.5 rounded font-bold text-white text-[10px]" style={{background:ord.status==='shipped'?JUNGLE:TERRA}}>{ord.status==='shipped'?'Expédié ✔️':'En préparation 📦'}</span>
                    </div>
                    {ord.trackingNumber && <p className="text-xs font-mono">Suivi : <code className="px-1 rounded font-bold" style={{background:BG_O, color:OCEAN}}>{ord.trackingNumber}</code></p>}
                    {ord.dedicationRequest && <p className="text-xs italic border-l-2 pl-3" style={{color:TERRA, borderColor:'#EDD9C0'}}>« {ord.dedicationRequest} »</p>}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* AUTEURS */}
          {activeTab === 'auteurs' && (
            <motion.div key="auteurs" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:.2}}>
              <div className="max-w-3xl mx-auto space-y-5">
                {[
                  {initial:'P', name:'Patrice', role:'Le Chef de Bord', bg:BG_O, avatarBg:OCEAN, tc:TEXT_D, ac:OCEAN, sub:'Retraité Bio, 69 ans, Photographe et Spécialiste Tetris', text:"« Un autodidacte qui vous emmène dans son rêve. J'ai insisté pour prendre les pistes aborigènes impossibles et tester mon Toyota Fortuner dans le Bush, même si le 4x4 a décollé de 3 mètres ! Mon rituel ? Un verre de blanc de Villa Maria à 18h pour détendre l'atmosphère. »"},
                  {initial:'M', name:'Monique (MAM)', role:'Momo Nationale', bg:BG_J, avatarBg:JUNGLE, tc:TEXT_J, ac:JUNGLE, sub:'Ancienne Assistante Sociale, Experte du Climatiseur', text:"« Patrice m'appelle sa préférée mais m'attribue tous les maux de valises ! J'ai eu des palpitations à 150 BPM sous les fumées du volcan Bromo, mais j'ai marché 14 km par jour à Kyoto et contemplé des forêts de bambous géants. Ce voyage, c'est la concrétisation de notre amour. »"},
                ].map((p,i)=>(
                  <div key={i} className="rounded-2xl p-6 sm:p-8 border relative overflow-hidden" style={{background:p.bg, borderColor:'rgba(0,0,0,.05)'}}>
                    <div className="absolute top-0 right-0 px-4 py-2 font-mono text-xs rounded-bl-xl font-bold" style={{background:'rgba(255,255,255,.6)', color:p.ac}}>{p.role}</div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center font-serif text-2xl font-black text-white" style={{background:p.avatarBg}}>{p.initial}</div>
                      <div>
                        <h4 className="font-serif font-extrabold text-xl" style={{color:p.tc}}>{p.name}</h4>
                        <p className="text-xs font-mono" style={{color:p.ac}}>{p.sub}</p>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed italic font-serif" style={{color:p.tc, opacity:.8}}>{p.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* EXTRAITS */}
          {activeTab === 'extraits' && (
            <motion.div key="extraits" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:.2}}>
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex gap-2 justify-center flex-wrap">
                  {PREVIEW_CHAPTERS.map((c,i)=>(
                    <button key={i} onClick={()=>setShowPreviewIdx(i)}
                      className="px-4 py-2 rounded-lg text-xs font-mono font-bold cursor-pointer transition-colors"
                      style={showPreviewIdx===i ? {background:TERRA, color:'#fff'} : {background:'#fff', border:`0.5px solid #EDD9C0`, color:TEXT_T}}>
                      {c.num}
                    </button>
                  ))}
                </div>
                <AnimatePresence mode="wait">
                  <motion.div key={showPreviewIdx} initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} transition={{duration:.2}} className="rounded-2xl p-8 relative" style={{background:BG_T, border:`0.5px solid #EDD9C0`}}>
                    <span className="font-serif text-5xl absolute -top-2 left-4 opacity-20 select-none" style={{color:TERRA}}>"</span>
                    <h4 className="font-serif font-black text-xl mb-4" style={{color:TEXT_T}}>{PREVIEW_CHAPTERS[showPreviewIdx].title}</h4>
                    <p className="text-base leading-relaxed italic font-serif" style={{color:'#6A4A2A'}}>{PREVIEW_CHAPTERS[showPreviewIdx].text}</p>
                    <span className="font-serif text-5xl absolute -bottom-8 right-6 opacity-20 select-none" style={{color:TERRA}}>"</span>
                  </motion.div>
                </AnimatePresence>
                <div className="text-center pt-2">
                  <button onClick={()=>setActiveTab('commander')} className="px-6 py-3 rounded-xl text-sm font-bold text-white cursor-pointer inline-flex items-center gap-2" style={{background:TERRA}}>
                    <ArrowRight className="w-4 h-4"/> Commander mon exemplaire
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* LIVRE D'OR */}
          {activeTab === 'livreor' && (
            <motion.div key="livreor" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:.2}}>
              <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-5 rounded-2xl p-6" style={{background:'#fff', border:`0.5px solid #C8D9C4`}}>
                  <h4 className="font-serif text-lg font-bold mb-5 flex items-center gap-2" style={{color:TEXT_J}}>✍️ Signer le Livre d'Or</h4>
                  <form onSubmit={handlePostGuestbook} className="space-y-3">
                    <input type="text" required value={gbName} onChange={e=>setGbName(e.target.value)} placeholder="Votre prénom *" className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none" style={{background:'#FAFCFA', border:`0.5px solid #C8D9C4`, color:TEXT_J}}/>
                    <input type="text" value={gbLocation} onChange={e=>setGbLocation(e.target.value)} placeholder="D'où écrivez-vous ?" className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none" style={{background:'#FAFCFA', border:`0.5px solid #C8D9C4`, color:TEXT_J}}/>
                    <textarea required rows={4} value={gbMessage} onChange={e=>setGbMessage(e.target.value)} placeholder="Votre message *" className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none resize-none" style={{background:'#FAFCFA', border:`0.5px solid #C8D9C4`, color:TEXT_J}}/>
                    {gbSuccess && <div className="p-3 rounded-lg text-xs font-mono" style={{background:BG_J, color:TEXT_J}}>🎉 Votre message a été ajouté !</div>}
                    {gbError && <div className="p-3 rounded-lg text-xs font-mono" style={{background:'#FBF1E6', color:TERRA}}>⚠️ {gbError}</div>}
                    <button type="submit" disabled={isSubmittingGb} className="w-full py-2.5 text-white font-mono text-xs font-bold rounded-lg cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2" style={{background:JUNGLE}}>
                      {isSubmittingGb ? <><Loader2 className="w-4 h-4 animate-spin"/><span>Envoi...</span></> : <><span>Signer le Livre d'Or</span><span>✨</span></>}
                    </button>
                  </form>
                </div>
                <div className="lg:col-span-7 space-y-3 max-h-[520px] overflow-y-auto pr-1">
                  {guestbook.length===0 ? (
                    <div className="text-center py-12 rounded-2xl border" style={{background:'#fff', borderColor:'#C8D9C4'}}>
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" style={{color:JUNGLE}}/>
                      <p className="text-xs font-mono" style={{color:'#7A9A7E'}}>Chargement des dédicaces...</p>
                    </div>
                  ) : guestbook.map(m=>(
                    <div key={m.id} className="p-5 rounded-2xl border transition-colors" style={{background:'#fff', borderColor:'#C8D9C4'}}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black font-serif text-white" style={{background:JUNGLE}}>{m.name?.charAt(0).toUpperCase()}</div>
                          <span className="font-serif text-sm font-black" style={{color:TEXT_J}}>{m.name}</span>
                          <span className="text-[10px] font-mono" style={{color:'#7A9A7E'}}>· {m.date}</span>
                        </div>
                        {m.location && <span className="text-[10px] font-mono" style={{color:'#7A9A7E'}}>📍 {m.location}</span>}
                      </div>
                      <p className="text-sm leading-relaxed italic font-serif border-l-2 pl-3" style={{color:'#3A5A3E', borderColor:'#C8D9C4'}}>« {m.message} »</p>
                      <div className="flex mt-2">{[...Array(5)].map((_,i)=><Star key={i} className="w-3 h-3" style={{color:'#E8A44A', fill:'#E8A44A'}}/>)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
