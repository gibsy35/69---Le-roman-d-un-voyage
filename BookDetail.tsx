import React, { useState, useEffect, useRef } from 'react';
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

const SECTIONS = [
  { id: 'presentation', label: 'Présentation', color: OCEAN },
  { id: 'commander',    label: 'Commander',    color: TERRA  },
  { id: 'suivi',        label: 'Suivi colis',  color: OCEAN  },
  { id: 'auteurs',      label: 'Patrice & Mam',color: JUNGLE },
  { id: 'extraits',     label: 'Extraits',     color: TERRA  },
  { id: 'livreor',      label: "Livre d'Or",   color: JUNGLE },
];

export default function BookDetail({ onSuccessOrder }: BookDetailProps) {
  const [activeSection, setActiveSection] = useState('presentation');
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
    coverImageUrl: 'preset-miyajima', coverBorderColor: TERRA,
    authorName: 'PATRICE LEQUIME', bookTitle: '69', bookSubtitle: "C'EST POSSIBLE",
    topBadge: '69 ANS • 69 000 KM • 69 HEURES DE VOL',
    bottomLine: '69 LIEUX ÉTONNANTS • 69 RAISONS D\'Y CROIRE...',
    backQuote: '« Poursuivez vos rêves. À 69 ans, tout est possible. »',
    backAboutTitle: 'À PROPOS DE CE LIVRE',
    backAboutSubtitle: 'Le livre à offrir à vos parents ou vos grands-parents',
    backAboutContent: 'Ce bouquin est sans prétentions.\nNi un livre de photos, ni un guide touristique,\nni un roman d\'aventures.\n\nJuste un récit dont l\'ambition est de vous donner envie de toujours poursuivre vos rêves.',
  });

  const sectionRefs = useRef<Record<string, HTMLDivElement|null>>({});
  const anchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/book-config').then(r=>r.json()).then(d=>{if(d&&!d.error)setBookConfig(d);}).catch(()=>{});
    fetch('/api/guestbook').then(r=>r.json()).then(d=>{if(Array.isArray(d))setGuestbook(d);}).catch(()=>{});
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); });
    }, { rootMargin: '-40% 0px -55% 0px' });
    Object.values(sectionRefs.current).forEach(el => { if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = sectionRefs.current[id];
    if (!el) return;
    const anchorH = anchorRef.current?.offsetHeight || 44;
    const headerH = 66;
    const y = el.getBoundingClientRect().top + window.scrollY - headerH - anchorH - 12;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

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
        const r = await fetch('/api/create-checkout-session', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ customerName: buyerName, customerEmail: buyerEmail, bookFormat: selectedFormat, dedicationRequest: buyerDedication||undefined }) });
        const d = await r.json();
        if (d.error === 'stripe_not_configured') { pw?.close(); setStripeError('stripe_not_configured'); setIsOrdering(false); return; }
        if (d.url) { setStripeUrl(d.url); setIsOrdering(false); if(pw) pw.location.href=d.url; return; }
        if (d.error) { pw?.close(); setStripeError(d.error); setIsOrdering(false); return; }
      } catch(err:any) { pw?.close(); setStripeError(err.message); setIsOrdering(false); return; }
    }
    try {
      const r = await fetch('/api/orders', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ customerName: buyerName, customerEmail: buyerEmail, bookFormat: selectedFormat, price: getPrice(), dedicationRequest: buyerDedication||undefined }) });
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
      const r = await fetch('/api/guestbook', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ name: gbName.trim(), location: gbLocation.trim(), message: gbMessage.trim() }) });
      if (r.ok) { const m = await r.json(); setGuestbook(p=>[m,...p]); setGbName(''); setGbLocation(''); setGbMessage(''); setGbSuccess(true); setTimeout(()=>setGbSuccess(false),5000); }
      else setGbError("Impossible d'ajouter votre message.");
    } catch { setGbError('Erreur de connexion.'); }
    finally { setIsSubmittingGb(false); }
  };

  const sec = (id: string) => (el: HTMLDivElement|null) => { sectionRefs.current[id] = el; };

  return (
    <div style={{ background: IVORY, minHeight: '100vh' }}>

      {/* ── HERO ── */}
      <div style={{ background: BG_T, borderBottom: `0.5px solid #EDD9C0` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col lg:flex-row items-center gap-10">

          {/* Couverture 3D */}
          <div className="flex flex-col items-center gap-4 shrink-0">
            <div className="relative" style={{ width: 200, height: 300, perspective: 1000 }}>
              <motion.div className="w-full h-full relative" style={{ transformStyle: 'preserve-3d' }} animate={{ rotateY: isFlipped ? 180 : 0 }} transition={{ duration: 0.7, ease: 'easeInOut' }}>
                {/* RECTO */}
                <div className="absolute inset-0 rounded-xl overflow-hidden shadow-2xl" style={{ backfaceVisibility:'hidden', WebkitBackfaceVisibility:'hidden', border: `10px solid ${bookConfig.coverBorderColor}` }}>
                  <div className="absolute inset-0" style={{ background: '#1a1a1a' }}>
                    <img src={getCoverImageSrc(bookConfig.coverImageUrl)} alt="Couverture" className="w-full h-full object-cover opacity-90" />
                  </div>
                  <div className="absolute inset-0 flex flex-col justify-between p-3 text-white text-center select-none">
                    <p className="text-[9px] font-mono tracking-widest opacity-90">{bookConfig.authorName}</p>
                    <div>
                      <h2 className="font-serif font-black text-[64px] leading-none drop-shadow-lg">{bookConfig.bookTitle}</h2>
                      <p className="font-sans font-black text-[11px] tracking-[.3em] mt-1 drop-shadow">{bookConfig.bookSubtitle}</p>
                    </div>
                    <p className="text-[8px] font-mono tracking-wider opacity-80">{bookConfig.bottomLine}</p>
                  </div>
                </div>
                {/* VERSO */}
                <div className="absolute inset-0 rounded-xl overflow-hidden shadow-2xl p-4 flex flex-col justify-between" style={{ backfaceVisibility:'hidden', WebkitBackfaceVisibility:'hidden', transform:'rotateY(180deg)', border:`10px solid ${bookConfig.coverBorderColor}`, background:'#fff' }}>
                  <div className="text-center"><p className="font-sans font-black text-[10px] tracking-wide" style={{color:bookConfig.coverBorderColor}}>{bookConfig.backAboutSubtitle}</p><h3 className="font-serif font-black text-sm mt-1" style={{color:bookConfig.coverBorderColor}}>{bookConfig.backAboutTitle}</h3></div>
                  <p className="text-[9px] font-serif italic text-gray-700 leading-relaxed whitespace-pre-line">{bookConfig.backAboutContent}</p>
                  <div className="border-l-4 pl-2 py-1" style={{borderColor:bookConfig.coverBorderColor}}><p className="font-serif italic text-[9px] text-gray-800">{bookConfig.backQuote}</p></div>
                  <p className="font-sans font-black text-[9px] tracking-widest text-center" style={{color:bookConfig.coverBorderColor}}>{bookConfig.authorName}</p>
                </div>
              </motion.div>
            </div>
            <button onClick={()=>setIsFlipped(!isFlipped)} className="px-4 py-2 rounded-lg text-xs font-mono font-bold cursor-pointer transition-colors text-white" style={{background: TERRA}}>
              🔄 {isFlipped ? 'Voir la couverture' : 'Voir le verso'}
            </button>
          </div>

          {/* Texte hero */}
          <div className="text-center lg:text-left max-w-lg">
            <span className="inline-block text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4" style={{background:'rgba(42,107,138,.12)', color: OCEAN}}>🌍 Le Périple de Patrice & Mam</span>
            <h2 className="font-serif font-extrabold text-3xl sm:text-4xl leading-tight mb-4" style={{color: TEXT_T}}>La consécration d'un périple de 90 jours</h2>
            <p className="text-sm leading-relaxed mb-6" style={{color:'#7A4A2A'}}>Pas un guide touristique, pas un album photos. Le récit brut et authentique de deux Bretons de 69 ans qui ont osé partir au bout du monde — avec gaffes, fou rires et émerveillement.</p>

            {/* Stats tricolores */}
            <div className="flex justify-center lg:justify-start gap-0 mb-6 rounded-xl overflow-hidden border" style={{borderColor:'#EDD9C0', display:'inline-flex'}}>
              {[{v:'69 000', u:'km · océan', c:OCEAN}, {v:'69h', u:'vol · ciel', c:TERRA}, {v:'69', u:'sites · jungle', c:JUNGLE}].map((s,i)=>(
                <div key={i} className="px-5 py-3 text-center" style={{borderRight: i<2 ? `0.5px solid #EDD9C0` : 'none', background:'rgba(255,255,255,.4)'}}>
                  <span className="block font-serif font-black text-xl" style={{color:s.c}}>{s.v}</span>
                  <span className="text-[9px] font-mono uppercase tracking-wide" style={{color:'#9A7060'}}>{s.u}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              <button onClick={()=>scrollTo('commander')} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer transition-colors flex items-center gap-2" style={{background:TERRA}}>
                <ShoppingBag className="w-4 h-4" /> Commander
              </button>
              <button onClick={()=>scrollTo('extraits')} className="px-6 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-colors flex items-center gap-2" style={{background:'rgba(42,107,138,.1)', color:OCEAN}}>
                <BookOpen className="w-4 h-4" /> Feuilleter
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── ANCRES STICKY ── */}
      <div ref={anchorRef} className="sticky z-40" style={{top:64, background: IVORY, borderBottom:`0.5px solid #DDE8EC`, boxShadow:'0 1px 8px rgba(42,107,138,.06)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto gap-0" style={{scrollbarWidth:'none'}}>
            {SECTIONS.map(s => (
              <button key={s.id} onClick={()=>scrollTo(s.id)}
                className="flex items-center gap-1.5 px-4 py-3 text-xs font-mono font-bold whitespace-nowrap cursor-pointer transition-all border-b-2 shrink-0"
                style={activeSection===s.id
                  ? {color:s.color, borderBottomColor:s.color, background:'transparent'}
                  : {color:'#8A9AA0', borderBottomColor:'transparent', background:'transparent'}}
              >
                <span className="w-1.5 h-1.5 rounded-full transition-all" style={{background: activeSection===s.id ? s.color : '#C8D8E0'}}/>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── SECTIONS ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* PRÉSENTATION */}
        <div id="presentation" ref={sec('presentation')} className="py-16 border-b" style={{borderColor:'#DDE8EC'}}>
          <div className="text-center mb-2"><span className="w-2 h-2 rounded-full inline-block mr-2" style={{background:OCEAN}}/>
            <span className="text-xs font-mono font-bold uppercase tracking-widest" style={{color:OCEAN}}>Présentation</span>
          </div>
          <h3 className="font-serif font-extrabold text-2xl sm:text-3xl text-center mb-10" style={{color:TEXT_D}}>L'aventure en trois univers</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[
              {bg:BG_O, color:OCEAN, tcolor:TEXT_D, emoji:'🌊', title:'Océan & Traversées', desc:'Hong Kong, Nouvelle-Zélande, Australie, Taïwan… Les grandes traversées maritimes et les ciels infinis de l\'hémisphère Sud.'},
              {bg:BG_T, color:TERRA, tcolor:TEXT_T, emoji:'☀️', title:'Soleil & Épopée', desc:'Le Bush australien, les pistes impossibles, le Toyota Fortuner qui décolle de 3 mètres. L\'aventure pure et dure.'},
              {bg:BG_J, color:JUNGLE, tcolor:TEXT_J, emoji:'🌿', title:'Jungle & Rencontres', desc:'Sumatra, Bali, Kyoto, le volcan Bromo… Les forêts de bambous, les singes chapardeurs et les amitiés improbables.'},
            ].map((c,i)=>(
              <div key={i} className="rounded-2xl p-6 border" style={{background:c.bg, borderColor:'rgba(0,0,0,.05)'}}>
                <span className="text-3xl">{c.emoji}</span>
                <h4 className="font-serif font-bold text-lg mt-3 mb-2" style={{color:c.tcolor}}>{c.title}</h4>
                <p className="text-sm leading-relaxed" style={{color:c.tcolor, opacity:.75}}>{c.desc}</p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl p-8 text-center" style={{background:BG_T, border:`0.5px solid #EDD9C0`}}>
            <p className="font-serif text-xl italic mb-3" style={{color:TEXT_T}}>« Ce récit dont l'ambition est de vous prouver que C'EST POSSIBLE à n'importe quel âge. »</p>
            <p className="text-sm font-mono" style={{color:TERRA}}>— Patrice Lequime</p>
          </div>
        </div>

        {/* COMMANDER */}
        <div id="commander" ref={sec('commander')} className="py-16 border-b" style={{borderColor:'#DDE8EC'}}>
          <div className="text-center mb-2"><span className="w-2 h-2 rounded-full inline-block mr-2" style={{background:TERRA}}/>
            <span className="text-xs font-mono font-bold uppercase tracking-widest" style={{color:TERRA}}>Commander</span>
          </div>
          <h3 className="font-serif font-extrabold text-2xl sm:text-3xl text-center mb-10" style={{color:TEXT_T}}>Choisissez votre édition</h3>
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Formats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {id:'printed' as const, title:'Édition Brochée', sub:'Couverture souple illustrée', note:'⌛ Pré-commande', price:'22,00 €', badge:'Pré-commande', badgeBg:'#FBF1E6', badgeColor:TERRA},
                {id:'hardcover' as const, title:'Luxe Illustré', sub:'Grand format relié rigide', note:'👑 Édition limitée', price:'39,00 €', badge:'Éd. Limitée', badgeBg:TERRA, badgeColor:'#fff'},
                {id:'pdf' as const, title:'Numérique', sub:'Lecture immédiate', note:'⚡ Disponible maintenant', price:'9,90 €', badge:'Disponible', badgeBg:BG_J, badgeColor:JUNGLE},
              ].map(f=>(
                <button key={f.id} type="button" onClick={()=>setSelectedFormat(f.id)}
                  className="p-4 rounded-xl text-left cursor-pointer flex flex-col gap-1 transition-all"
                  style={selectedFormat===f.id ? {border:`2px solid ${TERRA}`, background:'#fff', boxShadow:'0 2px 12px rgba(196,98,45,.12)'} : {border:`0.5px solid #DDE8EC`, background:'transparent'}}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-serif font-black text-sm" style={{color:TEXT_T}}>{f.title}</span>
                    <span className="text-[8px] px-1.5 py-0.5 rounded font-mono font-bold" style={{background:f.badgeBg, color:f.badgeColor}}>{f.badge}</span>
                  </div>
                  <span className="text-xs font-mono" style={{color:'#9A7060'}}>{f.sub}</span>
                  <span className="text-[10px] font-mono mt-1" style={{color:TERRA}}>{f.note}</span>
                  <span className="text-lg font-bold mt-2" style={{color:TERRA}}>{f.price}</span>
                </button>
              ))}
            </div>

            {/* Formulaire */}
            <div className="rounded-2xl p-6 space-y-4" style={{background:'#fff', border:`0.5px solid #DDE8EC`}}>
              <div className="grid grid-cols-2 gap-2 p-1.5 rounded-lg" style={{background:BG_T, border:`0.5px solid #EDD9C0`}}>
                {([['real','💳 CB / Stripe'], ['simulated','🧪 Simulateur']] as const).map(([m,l])=>(
                  <button key={m} type="button" onClick={()=>{setCheckoutMode(m as any); setStripeError(null);}}
                    className="py-2 px-3 rounded-md font-mono text-xs font-bold transition-all cursor-pointer"
                    style={checkoutMode===m ? {background:TERRA, color:'#fff'} : {background:'transparent', color:'#9A7060'}}
                  >{l}</button>
                ))}
              </div>

              {stripeError==='stripe_not_configured' && (
                <div className="p-3 rounded-xl text-xs space-y-2" style={{background:'#FBF1E6', border:`0.5px solid #EDD9C0`, color:TEXT_T}}>
                  <p className="font-bold">🔑 Stripe non configuré</p>
                  <p>Ajoutez <code className="px-1 rounded font-bold" style={{background:'#EDD9C0'}}>STRIPE_SECRET_KEY</code> dans vos variables Vercel.</p>
                  <button onClick={()=>{setCheckoutMode('simulated');setStripeError(null);}} className="text-xs font-bold py-1 px-2.5 rounded cursor-pointer text-white" style={{background:TERRA}}>Passer en simulation</button>
                </div>
              )}

              {stripeUrl ? (
                <div className="p-4 rounded-xl space-y-3" style={{background:BG_J, border:`0.5px solid #C8D9C4`}}>
                  <h5 className="font-serif font-black" style={{color:TEXT_J}}>✨ Lien de paiement prêt !</h5>
                  <a href={stripeUrl} target="_top" className="block w-full py-3 text-center rounded-xl text-sm font-bold text-white transition-colors" style={{background:TERRA}}>💳 Ouvrir le paiement Stripe ({getPrice().toFixed(2)} €) →</a>
                  <button onClick={()=>setStripeUrl(null)} className="text-xs font-mono cursor-pointer" style={{color:TERRA}}>✕ Annuler</button>
                </div>
              ) : orderPlaced ? (
                <div className="p-5 rounded-xl text-center" style={{background:BG_J, border:`0.5px solid #C8D9C4`}}>
                  <Check className="w-8 h-8 mx-auto mb-2" style={{color:JUNGLE}} />
                  <h5 className="font-bold text-sm" style={{color:TEXT_J}}>Merci {orderPlaced.customerName} !</h5>
                  <p className="text-xs mt-1" style={{color:'#4A6A4E'}}>Commande enregistrée pour <strong>{orderPlaced.customerEmail}</strong>.</p>
                  <button onClick={()=>setOrderPlaced(null)} className="mt-3 text-xs font-mono cursor-pointer hover:underline" style={{color:JUNGLE}}>Commander un autre exemplaire</button>
                </div>
              ) : (
                <form onSubmit={handleCheckout} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input type="text" required placeholder="Votre Prénom et Nom" value={buyerName} onChange={e=>setBuyerName(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none" style={{background:'#FDFCFA', border:`0.5px solid #DDE8EC`, color:TEXT_D}} />
                    <input type="email" required placeholder="Votre Email" value={buyerEmail} onChange={e=>setBuyerEmail(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none" style={{background:'#FDFCFA', border:`0.5px solid #DDE8EC`, color:TEXT_D}} />
                  </div>
                  {selectedFormat!=='pdf' && (
                    <input type="text" placeholder="✍️ Dédicace personnalisée (optionnel, gratuit)" value={buyerDedication} onChange={e=>setBuyerDedication(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none" style={{background:'#FDFCFA', border:`0.5px solid #DDE8EC`, color:TEXT_D}} />
                  )}
                  <button type="submit" disabled={isOrdering} className="w-full py-3 text-white rounded-xl text-sm font-bold cursor-pointer transition-opacity disabled:opacity-50 flex items-center justify-center gap-2" style={{background:TERRA}}>
                    {isOrdering ? 'Connexion en cours...' : `💳 ${checkoutMode==='real' ? `Payer — ${getPrice().toFixed(2)} €` : `Simuler — ${getPrice().toFixed(2)} €`}`}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* SUIVI */}
        <div id="suivi" ref={sec('suivi')} className="py-16 border-b" style={{borderColor:'#DDE8EC'}}>
          <div className="text-center mb-2"><span className="w-2 h-2 rounded-full inline-block mr-2" style={{background:OCEAN}}/>
            <span className="text-xs font-mono font-bold uppercase tracking-widest" style={{color:OCEAN}}>Suivi colis</span>
          </div>
          <h3 className="font-serif font-extrabold text-2xl sm:text-3xl text-center mb-8" style={{color:TEXT_D}}>Où en est votre exemplaire ?</h3>
          <div className="max-w-lg mx-auto space-y-4">
            <form onSubmit={handleLookup} className="flex gap-3">
              <input type="text" required placeholder="votre.email@gmail.com ou ord-..." value={trackingSearch} onChange={e=>setTrackingSearch(e.target.value)} className="flex-1 px-4 py-2.5 rounded-xl text-sm focus:outline-none" style={{background:'#fff', border:`1.5px solid #C8DDE8`, color:TEXT_D}} />
              <button type="submit" disabled={searchLoading} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white flex items-center gap-2 cursor-pointer disabled:opacity-50" style={{background:OCEAN}}>
                {searchLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Search className="w-4 h-4"/>}
              </button>
            </form>
            {searchError && <p className="text-center text-xs font-mono font-bold" style={{color:TERRA}}>{searchError}</p>}
            {searchedOrders?.map(ord=>(
              <div key={ord.id} className="rounded-2xl p-5 space-y-2" style={{background:'#fff', border:`0.5px solid #C8DDE8`}}>
                <div className="flex justify-between text-xs font-mono">
                  <span style={{color:'#6A8A9A'}}>N° <strong style={{color:TEXT_D}}>{ord.id}</strong></span>
                  <span className="px-2 py-0.5 rounded font-bold text-white" style={{background: ord.status==='shipped' ? JUNGLE : TERRA}}>{ord.status==='shipped' ? 'Expédié ✔️' : 'En préparation 📦'}</span>
                </div>
                {ord.trackingNumber && <p className="text-xs font-mono">Suivi : <code className="px-1 rounded font-bold" style={{background:BG_O, color:OCEAN}}>{ord.trackingNumber}</code></p>}
                {ord.dedicationRequest && <p className="text-xs italic border-l-2 pl-3" style={{color:TERRA, borderColor:'#EDD9C0'}}>« {ord.dedicationRequest} »</p>}
              </div>
            ))}
          </div>
        </div>

        {/* AUTEURS */}
        <div id="auteurs" ref={sec('auteurs')} className="py-16 border-b" style={{borderColor:'#DDE8EC'}}>
          <div className="text-center mb-2"><span className="w-2 h-2 rounded-full inline-block mr-2" style={{background:JUNGLE}}/>
            <span className="text-xs font-mono font-bold uppercase tracking-widest" style={{color:JUNGLE}}>Patrice & Mam</span>
          </div>
          <h3 className="font-serif font-extrabold text-2xl sm:text-3xl text-center mb-10" style={{color:TEXT_J}}>Qui sont-ils ?</h3>
          <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {initial:'P', name:'Patrice', role:'Le Chef de Bord', bg:BG_O, avatarBg:OCEAN, color:TEXT_D, accentColor:OCEAN, sub:'Retraité Bio, 69 ans, Photographe', text:"« Un autodidacte qui vous emmène dans son rêve. J'ai insisté pour prendre les pistes aborigènes impossibles et tester mon Toyota Fortuner dans le Bush, même si le 4x4 a décollé de 3 mètres ! Mon rituel ? Un verre de blanc de Villa Maria à 18h. »"},
              {initial:'M', name:'Monique (MAM)', role:'Momo Nationale', bg:BG_J, avatarBg:JUNGLE, color:TEXT_J, accentColor:JUNGLE, sub:'Ancienne Assistante Sociale, Experte Climatiseur', text:"« Patrice m'appelle sa préférée mais m'attribue tous les maux de valises ! J'ai eu des palpitations à 150 BPM sous les fumées du volcan Bromo, mais j'ai marché 14 km par jour à Kyoto. Ce voyage, c'est la concrétisation de notre amour. »"},
            ].map((p,i)=>(
              <div key={i} className="rounded-2xl p-6 border" style={{background:p.bg, borderColor:'rgba(0,0,0,.05)'}}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-serif font-black text-xl text-white" style={{background:p.avatarBg}}>{p.initial}</div>
                  <div>
                    <h4 className="font-serif font-extrabold text-lg" style={{color:p.color}}>{p.name}</h4>
                    <p className="text-xs font-mono" style={{color:p.accentColor}}>{p.role} · {p.sub}</p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed italic font-serif" style={{color:p.color, opacity:.8}}>{p.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* EXTRAITS */}
        <div id="extraits" ref={sec('extraits')} className="py-16 border-b" style={{borderColor:'#DDE8EC'}}>
          <div className="text-center mb-2"><span className="w-2 h-2 rounded-full inline-block mr-2" style={{background:TERRA}}/>
            <span className="text-xs font-mono font-bold uppercase tracking-widest" style={{color:TERRA}}>Extraits</span>
          </div>
          <h3 className="font-serif font-extrabold text-2xl sm:text-3xl text-center mb-8" style={{color:TEXT_T}}>Feuilleter quelques pages</h3>
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-2 justify-center flex-wrap mb-6">
              {PREVIEW_CHAPTERS.map((c,i)=>(
                <button key={i} onClick={()=>setShowPreviewIdx(i)} className="px-4 py-2 rounded-lg text-xs font-mono font-bold cursor-pointer transition-colors" style={showPreviewIdx===i ? {background:TERRA, color:'#fff'} : {background:'#fff', border:`0.5px solid #EDD9C0`, color:TEXT_T}}>
                  {c.num}
                </button>
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={showPreviewIdx} initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} transition={{duration:.25}} className="rounded-2xl p-8 relative" style={{background:BG_T, border:`0.5px solid #EDD9C0`}}>
                <span className="font-serif text-5xl absolute -top-2 left-4 opacity-20 select-none" style={{color:TERRA}}>"</span>
                <h4 className="font-serif font-black text-lg mb-4" style={{color:TEXT_T}}>{PREVIEW_CHAPTERS[showPreviewIdx].title}</h4>
                <p className="text-base leading-relaxed italic font-serif" style={{color:'#6A4A2A'}}>{PREVIEW_CHAPTERS[showPreviewIdx].text}</p>
                <span className="font-serif text-5xl absolute -bottom-8 right-6 opacity-20 select-none" style={{color:TERRA}}>"</span>
              </motion.div>
            </AnimatePresence>
            <div className="text-center mt-8">
              <button onClick={()=>scrollTo('commander')} className="px-6 py-3 rounded-xl text-sm font-bold text-white cursor-pointer transition-colors inline-flex items-center gap-2" style={{background:TERRA}}>
                <ArrowRight className="w-4 h-4"/> Commander mon exemplaire
              </button>
            </div>
          </div>
        </div>

        {/* LIVRE D'OR */}
        <div id="livreor" ref={sec('livreor')} className="py-16">
          <div className="text-center mb-2"><span className="w-2 h-2 rounded-full inline-block mr-2" style={{background:JUNGLE}}/>
            <span className="text-xs font-mono font-bold uppercase tracking-widest" style={{color:JUNGLE}}>Livre d'Or</span>
          </div>
          <h3 className="font-serif font-extrabold text-2xl sm:text-3xl text-center mb-10" style={{color:TEXT_J}}>👪 Dédicaces & Mots Doux</h3>
          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 rounded-2xl p-6" style={{background:'#fff', border:`0.5px solid #C8D9C4`}}>
              <h4 className="font-serif text-lg font-bold mb-4 flex items-center gap-2" style={{color:TEXT_J}}>✍️ Signer le Livre d'Or</h4>
              <form onSubmit={handlePostGuestbook} className="space-y-3">
                <input type="text" required value={gbName} onChange={e=>setGbName(e.target.value)} placeholder="Votre prénom *" className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none" style={{background:'#FAFCFA', border:`0.5px solid #C8D9C4`, color:TEXT_J}}/>
                <input type="text" value={gbLocation} onChange={e=>setGbLocation(e.target.value)} placeholder="D'où écrivez-vous ?" className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none" style={{background:'#FAFCFA', border:`0.5px solid #C8D9C4`, color:TEXT_J}}/>
                <textarea required rows={4} value={gbMessage} onChange={e=>setGbMessage(e.target.value)} placeholder="Votre message *" className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none resize-none" style={{background:'#FAFCFA', border:`0.5px solid #C8D9C4`, color:TEXT_J}}/>
                {gbSuccess && <div className="p-3 rounded-lg text-xs font-mono" style={{background:BG_J, color:TEXT_J}}>🎉 Votre message a été ajouté !</div>}
                {gbError && <div className="p-3 rounded-lg text-xs font-mono" style={{background:'#FBF1E6', color:TERRA}}>⚠️ {gbError}</div>}
                <button type="submit" disabled={isSubmittingGb} className="w-full py-2.5 text-white font-mono text-xs font-bold rounded-lg cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 transition-opacity" style={{background:JUNGLE}}>
                  {isSubmittingGb ? <><Loader2 className="w-4 h-4 animate-spin"/><span>Envoi...</span></> : <><span>Signer le Livre d'Or</span><span>✨</span></>}
                </button>
              </form>
            </div>
            <div className="lg:col-span-7 space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {guestbook.length===0 ? (
                <div className="text-center py-12 rounded-2xl border" style={{background:'#fff', borderColor:'#C8D9C4', color:'#7A9A7E'}}>
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" style={{color:JUNGLE}}/>
                  <p className="text-xs font-mono">Chargement des dédicaces...</p>
                </div>
              ) : guestbook.map(m=>(
                <div key={m.id} className="p-5 rounded-2xl border hover:border-opacity-60 transition-colors" style={{background:'#fff', borderColor:'#C8D9C4'}}>
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
        </div>

      </div>
    </div>
  );
}
