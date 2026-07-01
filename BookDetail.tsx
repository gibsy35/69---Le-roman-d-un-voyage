import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Star, ArrowRight, Check, ShoppingBag, Search, Truck, Loader2 } from 'lucide-react';
import { BookOrder, BookConfig } from './types';
import miyajimaCoverImg from './miyajima_cover_1781530821053.jpg';
import { useLang } from './LanguageContext';

interface BookDetailProps { onSuccessOrder: (order: BookOrder) => void; }

const OCEAN='#2A6B8A', TERRA='#C4622D', JUNGLE='#3A6B44';
const BG_O='#EDF4F7', BG_T='#FBF1E6', BG_J='#EEF3ED';
const TEXT_D='#1A3A4A', TEXT_T='#2D1A0E', TEXT_J='#1A2E1E', IVORY='#FDFCFA';
const DEFAULT_COVER_COLOR='#C4622D';

type Tab='presentation'|'commander'|'suivi'|'auteurs'|'extraits'|'livreor';

export default function BookDetail({ onSuccessOrder }: BookDetailProps) {
  const { t, lang } = useLang();
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
    coverImageUrl:'preset-miyajima', coverBorderColor:DEFAULT_COVER_COLOR,
    authorName:'PATRICE LEQUIME', bookTitle:'69', bookSubtitle:"C'EST POSSIBLE",
    topBadge:'69 ANS • 69 000 KM • 69 HEURES DE VOL',
    bottomLine:'69 LIEUX ÉTONNANTS • 69 RAISONS D\'Y CROIRE...',
    backQuote:'« Poursuivez vos rêves. À 69 ans, tout est possible. »',
    backAboutTitle:'À PROPOS DE CE LIVRE', backAboutSubtitle:'Le livre à offrir à vos parents ou vos grands-parents',
    backAboutContent:'Ce bouquin est sans prétentions.\nNi un livre de photos, ni un guide touristique,\nni un roman d\'aventures.\n\nJuste un récit dont l\'ambition est de vous donner envie de toujours poursuivre vos rêves.',
  });

  const PREVIEW_CHAPTERS = [
    { num: t('Vol. 13','Ch. 13'), title: t('Le décollage du Fortuner dans le Bush','The Fortuner Takes Off in the Bush'), text: t('« Le trou est si profond que la voiture décolle de la piste pour retomber 3 mètres plus loin en faisant à Mam la frayeur de sa vie... Je la regarde calmement sous 36°C et je lui crie : STOP, LAISSE-MOI CONDUIRE ! »','« The hole is so deep the car literally launches off the track and lands 3 metres further, giving Mam the fright of her life... I look at her calmly under 36°C heat and shout: STOP, LET ME DRIVE! »') },
    { num: t('Vol. 21','Ch. 21'), title: t('Le classeur magique de 15h15','The Magic Binder at 3:15 PM'), text: t('« Mam sort son grand classeur magique où est noté notre vol retour à 15h15. Je vérifie à 9h30 : le vol est à 10h15 ! Les bagages ne sont pas faits, la chambre ressemble à Beyrouth. Mam en tombe en larmes... »','« Mam pulls out her magic binder where our return flight is noted as 3:15 PM. I check at 9:30 AM: the flight is at 10:15 AM! Bags aren\'t packed, the room looks like a disaster zone. Mam bursts into tears... »') },
    { num: t('Vol. 6','Ch. 6'), title: t('Stephen, Ruth et nous','Stephen, Ruth and Us'), text: t('« Stephen nous invite à boire un café. Ruth nous prépare un gâteau à la banane. On assiste à la traite de 1000 vaches. Deux darons bretons au milieu du lait de Nouvelle-Zélande : c\'est possible à tout âge ! »','« Stephen invites us for coffee. Ruth bakes us a banana cake. We watch 1,000 cows being milked. Two Breton dads in the middle of New Zealand dairy farming: it\'s possible at any age! »') },
  ];

  const TABS: { id: Tab; label: string; color: string }[] = [
    { id:'presentation', label:t('Présentation','Overview'),   color:OCEAN  },
    { id:'commander',    label:t('Commander','Order'),         color:TERRA  },
    { id:'suivi',        label:t('Suivi colis','Tracking'),    color:OCEAN  },
    { id:'auteurs',      label:t('Patrice & Mam','Patrice & Mam'), color:JUNGLE },
    { id:'extraits',     label:t('Extraits','Excerpts'),       color:TERRA  },
    { id:'livreor',      label:t("Livre d'Or",'Guestbook'),   color:JUNGLE },
  ];

  React.useEffect(() => {
    const saved = localStorage.getItem('lyaBookConfig_69');
    if (saved) {
      try { setBookConfig(JSON.parse(saved)); } catch(_) {}
    } else {
      fetch('/api/book-config').then(r=>r.json()).then(d=>{ if(d&&!d.error) setBookConfig(d); }).catch(()=>{});
    }
    fetch('/api/guestbook').then(r=>r.json()).then(d=>{ if(Array.isArray(d)) setGuestbook(d); }).catch(()=>{});
  }, []);

  const getCoverImageSrc = (url:string) => {
    if(url==='preset-miyajima') return miyajimaCoverImg;
    if(url==='preset-fuji')    return 'https://images.unsplash.com/photo-1578637387939-43c525550085?auto=format&fit=crop&q=80&w=600';
    if(url==='preset-tokyo')   return 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=600';
    if(url==='preset-kyoto')   return 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=600';
    return url||miyajimaCoverImg;
  };

  const getPrice = () => selectedFormat==='printed'?22:selectedFormat==='hardcover'?39:9.90;

  const handleCheckout = async (e:React.FormEvent) => {
    e.preventDefault();
    if(!buyerName||!buyerEmail) return;
    setIsOrdering(true); setStripeError(null); setStripeUrl(null);
    if(checkoutMode==='real') {
      let pw:Window|null=null;
      try { pw=window.open('','_blank'); } catch(_) {}
      try {
        const r=await fetch('/api/create-checkout-session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({customerName:buyerName,customerEmail:buyerEmail,bookFormat:selectedFormat,dedicationRequest:buyerDedication||undefined})});
        const d=await r.json();
        if(d.error==='stripe_not_configured'){pw?.close();setStripeError('stripe_not_configured');setIsOrdering(false);return;}
        if(d.url){setStripeUrl(d.url);setIsOrdering(false);if(pw)pw.location.href=d.url;return;}
        if(d.error){pw?.close();setStripeError(d.error);setIsOrdering(false);return;}
      } catch(err:any){pw?.close();setStripeError(err.message);setIsOrdering(false);return;}
    }
    try {
      const r=await fetch('/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({customerName:buyerName,customerEmail:buyerEmail,bookFormat:selectedFormat,price:getPrice(),dedicationRequest:buyerDedication||undefined})});
      const d=await r.json(); setOrderPlaced(d); onSuccessOrder(d);
      setBuyerName(''); setBuyerEmail(''); setBuyerDedication('');
    } catch { setStripeError(t('Une erreur est survenue.','An error occurred.')); }
    finally { setIsOrdering(false); }
  };

  const handleLookup = async (e:React.FormEvent) => {
    e.preventDefault();
    if(!trackingSearch.trim()) return;
    setSearchLoading(true); setSearchError(''); setSearchedOrders(null);
    try {
      const r=await fetch(`/api/orders/lookup?search=${encodeURIComponent(trackingSearch.trim())}`);
      if(r.ok){const d=await r.json();setSearchedOrders(d);if(!d.length)setSearchError(t('Aucune commande trouvée.','No orders found.'));}
      else setSearchError(t('Impossible de récupérer vos informations.','Unable to retrieve your information.'));
    } catch { setSearchError(t('Erreur de connexion.','Connection error.')); }
    finally { setSearchLoading(false); }
  };

  const handlePostGuestbook = async (e:React.FormEvent) => {
    e.preventDefault();
    if(!gbName.trim()||!gbMessage.trim()) return;
    setIsSubmittingGb(true); setGbError(''); setGbSuccess(false);
    try {
      const r=await fetch('/api/guestbook',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:gbName.trim(),location:gbLocation.trim(),message:gbMessage.trim()})});
      if(r.ok){const m=await r.json();setGuestbook(p=>[m,...p]);setGbName('');setGbLocation('');setGbMessage('');setGbSuccess(true);setTimeout(()=>setGbSuccess(false),5000);}
      else setGbError(t("Impossible d'ajouter votre message.",'Unable to add your message.'));
    } catch { setGbError(t('Erreur de connexion.','Connection error.')); }
    finally { setIsSubmittingGb(false); }
  };

  const BookCover = () => (
    <div className="flex flex-col items-center gap-4">
      <div style={{ width:280, height:420, perspective:1200 }}>
        <motion.div className="w-full h-full relative" style={{ transformStyle:'preserve-3d' }}
          animate={{ rotateY: isFlipped ? 180 : 0 }} transition={{ duration:0.75, ease:'easeInOut' }}>
          <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between"
            style={{ backfaceVisibility:'hidden', WebkitBackfaceVisibility:'hidden', border:`12px solid ${bookConfig.coverBorderColor}` }}>
            <div className="absolute inset-0 bg-slate-900">
              <img src={getCoverImageSrc(bookConfig.coverImageUrl)} alt="Cover" className="w-full h-full object-cover opacity-90 brightness-[.85]"/>
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
          <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl bg-white"
            style={{ backfaceVisibility:'hidden', WebkitBackfaceVisibility:'hidden', transform:'rotateY(180deg)', border:`12px solid ${bookConfig.coverBorderColor}`, padding:'14px' }}>
            <div className="text-center mb-2">
              <p className="font-sans font-bold uppercase tracking-wide" style={{ color:bookConfig.coverBorderColor, fontSize:'9px' }}>{bookConfig.backAboutSubtitle}</p>
              <h3 className="font-sans font-black tracking-wide pb-1.5 border-b-2" style={{ color:bookConfig.coverBorderColor, borderColor:`${bookConfig.coverBorderColor}40`, fontSize:'13px', marginTop:'3px' }}>{bookConfig.backAboutTitle}</h3>
            </div>
            <div className="font-serif italic text-gray-800 whitespace-pre-line mb-2" style={{ fontSize:'9px', lineHeight:'1.5' }}>{bookConfig.backAboutContent}</div>
            <div className="border-l-4 pl-2 py-1 mb-2" style={{ borderColor:bookConfig.coverBorderColor, background:'rgba(255,251,235,.5)' }}>
              <p className="font-serif italic text-gray-900" style={{ fontSize:'9px', lineHeight:'1.4' }}>{bookConfig.backQuote}</p>
            </div>
            <p className="font-sans font-black tracking-widest text-center" style={{ color:bookConfig.coverBorderColor, fontSize:'8px' }}>{bookConfig.authorName}</p>
          </div>
        </motion.div>
      </div>
      <button onClick={()=>setIsFlipped(!isFlipped)}
        className="px-5 py-2 rounded-xl text-xs font-mono font-bold cursor-pointer transition-colors text-white"
        style={{ background:bookConfig.coverBorderColor }}>
        🔄 {isFlipped ? t('Voir la couverture','See front cover') : t('Voir le verso','See back cover')}
      </button>
    </div>
  );

  return (
    <div style={{ background:IVORY, minHeight:'100vh' }}>

      {/* HERO */}
      <div style={{ background:BG_T, borderBottom:`0.5px solid #EDD9C0` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row items-center gap-12">
          <BookCover />
          <div className="text-center lg:text-left flex-1">
            <span className="inline-block text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4" style={{ background:'rgba(42,107,138,.12)', color:OCEAN }}>
              🌍 {t('Récit de voyage · Bretagne · Monde','Travel memoir · Brittany · World')}
            </span>
            <h2 className="font-serif font-extrabold text-3xl sm:text-4xl leading-tight mb-4" style={{ color:TEXT_T }}>
              {t('La consécration d\'un périple de 90 jours','The crowning achievement of a 90-day odyssey')}
            </h2>
            <p className="text-sm leading-relaxed mb-6" style={{ color:'#7A4A2A' }}>
              {t('Pas un guide, pas un album photos. Le récit brut et authentique de deux Bretons de 69 ans qui ont osé partir au bout du monde — avec gaffes, fou rires et émerveillement.',
                 'Not a guidebook, not a photo album. The raw, authentic account of two 69-year-old Bretons who dared to travel to the ends of the earth — with blunders, laughter and wonder.')}
            </p>
            <div className="inline-flex rounded-xl overflow-hidden border mb-6" style={{ borderColor:'#EDD9C0' }}>
              {[{v:'69 000',u:t('km','km'),c:OCEAN},{v:'69h',u:t('vol','flights'),c:TERRA},{v:'69',u:t('sites','sites'),c:JUNGLE}].map((s,i)=>(
                <div key={i} className="px-5 py-3 text-center" style={{ borderRight:i<2?`0.5px solid #EDD9C0`:'none', background:'rgba(255,255,255,.5)' }}>
                  <span className="block font-serif font-black text-xl" style={{ color:s.c }}>{s.v}</span>
                  <span className="text-[9px] font-mono uppercase tracking-wide" style={{ color:'#9A7060' }}>{s.u}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-8">
              <button onClick={()=>setActiveTab('commander')} className="px-6 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer flex items-center gap-2" style={{ background:TERRA }}>
                <ShoppingBag className="w-4 h-4"/> {t('Commander','Order Now')}
              </button>
              <button onClick={()=>setActiveTab('extraits')} className="px-6 py-2.5 rounded-xl text-sm font-medium cursor-pointer flex items-center gap-2" style={{ background:'rgba(42,107,138,.1)', color:OCEAN }}>
                <BookOpen className="w-4 h-4"/> {t('Feuilleter','Browse Excerpts')}
              </button>
            </div>
            <div className="space-y-3 text-left">
              <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background:'rgba(255,255,255,.6)', border:`0.5px solid #EDD9C0` }}>
                <span className="font-serif text-5xl leading-none absolute -top-1 left-3 opacity-15 select-none" style={{ color:TERRA }}>"</span>
                <p className="font-serif italic text-sm leading-relaxed pl-4" style={{ color:TEXT_T }}>
                  {t('Le trou est si profond que la voiture décolle de la piste pour retomber 3 mètres plus loin... Mam en tombe en larmes. Moi, je lui souris sous 36°C.',
                     'The hole is so deep the car literally launches off the track and lands 3 metres further... Mam bursts into tears. I just smile at her under 36°C heat.')}
                </p>
                <p className="text-xs font-mono mt-2 pl-4" style={{ color:TERRA }}>— {t('Patrice, Vol. 13 · Bush australien','Patrice, Ch. 13 · Australian Bush')}</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  {emoji:'🗾', label:t('12 pays','12 countries'), sub:t('Asie & Océanie','Asia & Oceania')},
                  {emoji:'✈️', label:t('69 vols','69 flights'),   sub:t('& escales','& stopovers')},
                  {emoji:'📖', label:t('1 livre','1 book'),        sub:t('À offrir','To give')},
                ].map((item,i)=>(
                  <div key={i} className="rounded-xl p-3 text-center" style={{ background:'rgba(255,255,255,.5)', border:`0.5px solid #EDD9C0` }}>
                    <span className="text-xl">{item.emoji}</span>
                    <p className="font-serif font-black text-sm mt-1" style={{ color:TEXT_T }}>{item.label}</p>
                    <p className="text-[9px] font-mono" style={{ color:'#9A7060' }}>{item.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ONGLETS */}
      <div className="sticky z-40" style={{ top:64, background:IVORY, borderBottom:`0.5px solid #DDE8EC`, boxShadow:'0 2px 8px rgba(0,0,0,.04)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto" style={{ scrollbarWidth:'none' }}>
            {TABS.map(tab=>(
              <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
                className="flex items-center gap-1.5 px-4 sm:px-5 py-3.5 text-xs sm:text-sm font-mono font-bold whitespace-nowrap cursor-pointer transition-all border-b-2 shrink-0"
                style={activeTab===tab.id ? {color:tab.color,borderBottomColor:tab.color,background:'transparent'} : {color:'#8A9AA0',borderBottomColor:'transparent',background:'transparent'}}>
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background:activeTab===tab.id?tab.color:'#C8D8E0' }}/>
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENU ONGLETS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <AnimatePresence mode="wait">

          {/* PRÉSENTATION */}
          {activeTab==='presentation' && (
            <motion.div key="presentation" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:.2}}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                {[
                  {bg:BG_O,color:OCEAN,tc:TEXT_D,emoji:'🌊',title:t('Océan & Traversées','Ocean & Crossings'),     desc:t('Hong Kong, Nouvelle-Zélande, Australie, Taïwan… Les grandes traversées et les ciels infinis de l\'hémisphère Sud.','Hong Kong, New Zealand, Australia, Taiwan… Grand ocean crossings and infinite southern skies.')},
                  {bg:BG_T,color:TERRA,tc:TEXT_T,emoji:'☀️',title:t('Soleil & Épopée','Sun & Epic Adventure'),       desc:t('Le Bush australien, les pistes impossibles, le Toyota Fortuner qui décolle de 3 mètres. L\'aventure pure et dure.','The Australian Bush, impossible tracks, a Toyota Fortuner launching 3 metres. Pure, raw adventure.')},
                  {bg:BG_J,color:JUNGLE,tc:TEXT_J,emoji:'🌿',title:t('Jungle & Rencontres','Jungle & Encounters'), desc:t('Sumatra, Bali, Kyoto, le volcan Bromo… Les forêts de bambous, les singes chapardeurs et les amitiés improbables.','Sumatra, Bali, Kyoto, Mount Bromo… Bamboo forests, thieving monkeys and unlikely friendships.')},
                ].map((c,i)=>(
                  <div key={i} className="rounded-2xl p-6 border" style={{ background:c.bg, borderColor:'rgba(0,0,0,.05)' }}>
                    <span className="text-3xl">{c.emoji}</span>
                    <h4 className="font-serif font-bold text-lg mt-3 mb-2" style={{ color:c.tc }}>{c.title}</h4>
                    <p className="text-sm leading-relaxed" style={{ color:c.tc, opacity:.75 }}>{c.desc}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl p-8 text-center mb-6" style={{ background:BG_T, border:`0.5px solid #EDD9C0` }}>
                <p className="font-serif text-xl italic mb-3" style={{ color:TEXT_T }}>
                  {t('« Ce récit dont l\'ambition est de vous prouver que C\'EST POSSIBLE à n\'importe quel âge. »',
                     '« A story whose ambition is to prove to you that IT\'S POSSIBLE at any age. »')}
                </p>
                <p className="text-sm font-mono mb-6" style={{ color:TERRA }}>— Patrice Lequime</p>
                <button onClick={()=>setActiveTab('commander')} className="px-8 py-3 rounded-xl text-sm font-bold text-white cursor-pointer inline-flex items-center gap-2" style={{ background:TERRA }}>
                  <ShoppingBag className="w-4 h-4"/> {t('Obtenir mon exemplaire','Get My Copy')}
                </button>
              </div>
            </motion.div>
          )}

          {/* COMMANDER */}
          {activeTab==='commander' && (
            <motion.div key="commander" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:.2}}>
              <div className="max-w-2xl mx-auto space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {id:'printed' as const,  title:t('Édition Brochée','Paperback Edition'),  sub:t('Couverture souple illustrée','Illustrated soft cover'),  note:t('⌛ Pré-commande','⌛ Pre-order'), price:'22.00 €', badge:t('Pré-commande','Pre-order'), badgeBg:'#FBF1E6', badgeC:TERRA},
                    {id:'hardcover' as const, title:t('Luxe Illustré','Luxury Hardcover'),     sub:t('Grand format relié rigide','Large format hardcover'),    note:t('👑 Éd. limitée','👑 Limited ed.'), price:'39.00 €', badge:t('Éd. Limitée','Limited'), badgeBg:TERRA, badgeC:'#fff'},
                    {id:'pdf' as const,       title:t('Numérique','Digital Edition'),           sub:t('Lecture immédiate PDF','Instant PDF download'),         note:t('⚡ Disponible','⚡ Available now'), price:'9.90 €', badge:t('Disponible','Available'), badgeBg:BG_J, badgeC:JUNGLE},
                  ].map(f=>(
                    <button key={f.id} type="button" onClick={()=>setSelectedFormat(f.id)}
                      className="p-4 rounded-xl text-left cursor-pointer flex flex-col gap-1 transition-all"
                      style={selectedFormat===f.id ? {border:`2px solid ${TERRA}`,background:'#fff',boxShadow:`0 2px 14px rgba(196,98,45,.14)`} : {border:`0.5px solid #DDE8EC`,background:'transparent'}}>
                      <div className="flex justify-between items-start">
                        <span className="font-serif font-black text-sm" style={{ color:TEXT_T }}>{f.title}</span>
                        <span className="text-[8px] px-1.5 py-0.5 rounded font-mono font-bold" style={{ background:f.badgeBg, color:f.badgeC }}>{f.badge}</span>
                      </div>
                      <span className="text-xs font-mono" style={{ color:'#9A7060' }}>{f.sub}</span>
                      <span className="text-[10px] font-mono mt-1" style={{ color:TERRA }}>{f.note}</span>
                      <span className="text-lg font-bold mt-2" style={{ color:TERRA }}>{f.price}</span>
                    </button>
                  ))}
                </div>
                <div className="rounded-2xl p-6 space-y-4" style={{ background:'#fff', border:`0.5px solid #DDE8EC` }}>
                  <div className="grid grid-cols-2 gap-2 p-1.5 rounded-xl" style={{ background:BG_T, border:`0.5px solid #EDD9C0` }}>
                    {(['real','simulated'] as const).map(m=>(
                      <button key={m} type="button" onClick={()=>{setCheckoutMode(m);setStripeError(null);}}
                        className="py-2 px-3 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer"
                        style={checkoutMode===m ? {background:TERRA,color:'#fff'} : {background:'transparent',color:'#9A7060'}}>
                        {m==='real' ? t('💳 CB / Stripe (Réel)','💳 Card / Stripe (Real)') : t('🧪 Simulateur (Test)','🧪 Simulator (Test)')}
                      </button>
                    ))}
                  </div>
                  {stripeError==='stripe_not_configured' && (
                    <div className="p-3 rounded-xl text-xs space-y-2" style={{ background:BG_T, border:`0.5px solid #EDD9C0`, color:TEXT_T }}>
                      <p className="font-bold">🔑 {t('Stripe non configuré','Stripe not configured')}</p>
                      <button onClick={()=>{setCheckoutMode('simulated');setStripeError(null);}} className="text-xs font-bold py-1 px-3 rounded cursor-pointer text-white" style={{ background:TERRA }}>
                        {t('Passer en simulation','Switch to simulation')}
                      </button>
                    </div>
                  )}
                  {stripeUrl ? (
                    <div className="p-4 rounded-xl space-y-3" style={{ background:BG_J, border:`0.5px solid #C8D9C4` }}>
                      <h5 className="font-serif font-black" style={{ color:TEXT_J }}>✨ {t('Lien de paiement prêt !','Payment link ready!')}</h5>
                      <a href={stripeUrl} target="_top" className="block w-full py-3 text-center rounded-xl text-sm font-bold text-white" style={{ background:TERRA }}>
                        💳 {t(`Payer — ${getPrice().toFixed(2)} €`,`Pay — ${getPrice().toFixed(2)} €`)} →
                      </a>
                      <button onClick={()=>setStripeUrl(null)} className="text-xs font-mono cursor-pointer" style={{ color:TERRA }}>✕ {t('Annuler','Cancel')}</button>
                    </div>
                  ) : orderPlaced ? (
                    <div className="p-5 rounded-xl text-center" style={{ background:BG_J, border:`0.5px solid #C8D9C4` }}>
                      <Check className="w-8 h-8 mx-auto mb-2" style={{ color:JUNGLE }}/>
                      <h5 className="font-bold text-sm mb-1" style={{ color:TEXT_J }}>{t('Merci','Thank you')} {orderPlaced.customerName} !</h5>
                      <p className="text-xs" style={{ color:'#4A6A4E' }}>{t('Commande enregistrée pour','Order registered for')} <strong>{orderPlaced.customerEmail}</strong>.</p>
                      <button onClick={()=>setOrderPlaced(null)} className="mt-3 text-xs font-mono cursor-pointer hover:underline" style={{ color:JUNGLE }}>
                        {t('Commander un autre exemplaire','Order another copy')}
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleCheckout} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input type="text" required placeholder={t('Votre Prénom et Nom','Your Full Name')} value={buyerName} onChange={e=>setBuyerName(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none" style={{ background:'#FDFCFA', border:`0.5px solid #DDE8EC`, color:TEXT_D }}/>
                        <input type="email" required placeholder={t('Votre Email','Your Email')} value={buyerEmail} onChange={e=>setBuyerEmail(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none" style={{ background:'#FDFCFA', border:`0.5px solid #DDE8EC`, color:TEXT_D }}/>
                      </div>
                      {selectedFormat!=='pdf' && (
                        <input type="text" placeholder={t('✍️ Dédicace personnalisée (optionnel, gratuit)','✍️ Personal dedication (optional, free)')} value={buyerDedication} onChange={e=>setBuyerDedication(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none" style={{ background:'#FDFCFA', border:`0.5px solid #DDE8EC`, color:TEXT_D }}/>
                      )}
                      <button type="submit" disabled={isOrdering} className="w-full py-3 text-white rounded-xl text-sm font-bold cursor-pointer transition-opacity disabled:opacity-50 flex items-center justify-center gap-2" style={{ background:TERRA }}>
                        {isOrdering ? t('Connexion...','Connecting...') : `💳 ${checkoutMode==='real' ? t(`Payer — ${getPrice().toFixed(2)} €`,`Pay — ${getPrice().toFixed(2)} €`) : t(`Simuler — ${getPrice().toFixed(2)} €`,`Simulate — ${getPrice().toFixed(2)} €`)}`}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* SUIVI */}
          {activeTab==='suivi' && (
            <motion.div key="suivi" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:.2}}>
              <div className="max-w-lg mx-auto space-y-5">
                <div className="text-center">
                  <Truck className="w-10 h-10 mx-auto mb-2" style={{ color:OCEAN }}/>
                  <h3 className="font-serif text-2xl font-black mb-1" style={{ color:TEXT_D }}>{t('Où en est votre exemplaire ?','Where is your copy?')}</h3>
                  <p className="text-xs font-mono" style={{ color:'#6A8A9A' }}>{t('Saisissez votre email ou numéro de commande','Enter your email or order number')}</p>
                </div>
                <form onSubmit={handleLookup} className="flex gap-3">
                  <input type="text" required placeholder={t('votre.email@gmail.com ou ord-...','your.email@gmail.com or ord-...')} value={trackingSearch} onChange={e=>setTrackingSearch(e.target.value)} className="flex-1 px-4 py-2.5 rounded-xl text-sm focus:outline-none" style={{ background:'#fff', border:`1.5px solid #C8DDE8`, color:TEXT_D }}/>
                  <button type="submit" disabled={searchLoading} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white flex items-center gap-2 cursor-pointer disabled:opacity-50" style={{ background:OCEAN }}>
                    {searchLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Search className="w-4 h-4"/>}
                  </button>
                </form>
                {searchError && <p className="text-center text-xs font-mono font-bold" style={{ color:TERRA }}>{searchError}</p>}
                {searchedOrders?.map(ord=>(
                  <div key={ord.id} className="rounded-2xl p-5 space-y-2" style={{ background:'#fff', border:`0.5px solid #C8DDE8` }}>
                    <div className="flex justify-between text-xs font-mono">
                      <span style={{ color:'#6A8A9A' }}>{t('N°','No.')} <strong style={{ color:TEXT_D }}>{ord.id}</strong></span>
                      <span className="px-2 py-0.5 rounded font-bold text-white text-[10px]" style={{ background:ord.status==='shipped'?JUNGLE:TERRA }}>
                        {ord.status==='shipped' ? t('Expédié ✔️','Shipped ✔️') : t('En préparation 📦','Processing 📦')}
                      </span>
                    </div>
                    {ord.trackingNumber && <p className="text-xs font-mono">{t('Suivi','Tracking')} : <code className="px-1 rounded font-bold" style={{ background:BG_O, color:OCEAN }}>{ord.trackingNumber}</code></p>}
                    {ord.dedicationRequest && <p className="text-xs italic border-l-2 pl-3" style={{ color:TERRA, borderColor:'#EDD9C0' }}>« {ord.dedicationRequest} »</p>}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* AUTEURS */}
          {activeTab==='auteurs' && (
            <motion.div key="auteurs" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:.2}}>
              <div className="max-w-3xl mx-auto space-y-5">
                <h3 className="font-serif font-extrabold text-2xl text-center mb-6" style={{ color:TEXT_J }}>{t('Qui sont-ils ?','Who are they?')}</h3>
                {[
                  {initial:'P',name:'Patrice',role:t('Le Chef de Bord','The Captain'),bg:BG_O,avatarBg:OCEAN,tc:TEXT_D,ac:OCEAN,sub:t('Retraité Bio, 69 ans, Photographe','Retired farmer, 69, Photographer'),text:t("« Un autodidacte qui vous emmène dans son rêve. J'ai insisté pour prendre les pistes aborigènes impossibles et tester mon Toyota Fortuner dans le Bush, même si le 4x4 a décollé de 3 mètres ! Mon rituel ? Un verre de blanc à 18h. »","« A self-taught traveller who takes you into his dream. I insisted on taking impossible Aboriginal tracks and testing my Toyota Fortuner in the Bush, even if the 4x4 launched 3 metres! My ritual? A glass of white wine at 6 PM. »")},
                  {initial:'M',name:t('Monique (MAM)','Monique (MUM)'),role:t('Momo Nationale','The National Darling'),bg:BG_J,avatarBg:JUNGLE,tc:TEXT_J,ac:JUNGLE,sub:t('Ancienne Assistante Sociale, Experte du Climatiseur','Former Social Worker, Air-Con Expert'),text:t("« Patrice m'appelle sa préférée mais m'attribue tous les maux de valises ! J'ai eu des palpitations à 150 BPM sous les fumées du volcan Bromo, mais j'ai marché 14 km par jour à Kyoto. Ce voyage, c'est la concrétisation de notre amour. »","« Patrice calls me his favourite but blames all the luggage disasters on me! I had palpitations at 150 BPM under the smoke of Mount Bromo, but I walked 14 km a day in Kyoto. This journey is the fulfilment of our love. »")},
                ].map((p,i)=>(
                  <div key={i} className="rounded-2xl p-6 sm:p-8 border relative overflow-hidden" style={{ background:p.bg, borderColor:'rgba(0,0,0,.05)' }}>
                    <div className="absolute top-0 right-0 px-4 py-2 font-mono text-xs rounded-bl-xl font-bold" style={{ background:'rgba(255,255,255,.6)', color:p.ac }}>{p.role}</div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center font-serif text-2xl font-black text-white" style={{ background:p.avatarBg }}>{p.initial}</div>
                      <div>
                        <h4 className="font-serif font-extrabold text-xl" style={{ color:p.tc }}>{p.name}</h4>
                        <p className="text-xs font-mono" style={{ color:p.ac }}>{p.sub}</p>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed italic font-serif" style={{ color:p.tc, opacity:.8 }}>{p.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* EXTRAITS */}
          {activeTab==='extraits' && (
            <motion.div key="extraits" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:.2}}>
              <div className="max-w-2xl mx-auto space-y-6">
                <h3 className="font-serif font-extrabold text-2xl text-center" style={{ color:TEXT_T }}>{t('Feuilleter quelques pages','Browse Some Pages')}</h3>
                <div className="flex gap-2 justify-center flex-wrap">
                  {PREVIEW_CHAPTERS.map((c,i)=>(
                    <button key={i} onClick={()=>setShowPreviewIdx(i)}
                      className="px-4 py-2 rounded-lg text-xs font-mono font-bold cursor-pointer transition-colors"
                      style={showPreviewIdx===i ? {background:TERRA,color:'#fff'} : {background:'#fff',border:`0.5px solid #EDD9C0`,color:TEXT_T}}>
                      {c.num}
                    </button>
                  ))}
                </div>
                <AnimatePresence mode="wait">
                  <motion.div key={showPreviewIdx} initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} transition={{duration:.2}} className="rounded-2xl p-8 relative" style={{ background:BG_T, border:`0.5px solid #EDD9C0` }}>
                    <span className="font-serif text-5xl absolute -top-2 left-4 opacity-20 select-none" style={{ color:TERRA }}>"</span>
                    <h4 className="font-serif font-black text-xl mb-4" style={{ color:TEXT_T }}>{PREVIEW_CHAPTERS[showPreviewIdx].title}</h4>
                    <p className="text-base leading-relaxed italic font-serif" style={{ color:'#6A4A2A' }}>{PREVIEW_CHAPTERS[showPreviewIdx].text}</p>
                  </motion.div>
                </AnimatePresence>
                <div className="text-center pt-2">
                  <button onClick={()=>setActiveTab('commander')} className="px-6 py-3 rounded-xl text-sm font-bold text-white cursor-pointer inline-flex items-center gap-2" style={{ background:TERRA }}>
                    <ArrowRight className="w-4 h-4"/> {t('Commander mon exemplaire','Order My Copy')}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* LIVRE D'OR */}
          {activeTab==='livreor' && (
            <motion.div key="livreor" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:.2}}>
              <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-5 rounded-2xl p-6" style={{ background:'#fff', border:`0.5px solid #C8D9C4` }}>
                  <h4 className="font-serif text-lg font-bold mb-5 flex items-center gap-2" style={{ color:TEXT_J }}>✍️ {t('Signer le Livre d\'Or','Sign the Guestbook')}</h4>
                  <form onSubmit={handlePostGuestbook} className="space-y-3">
                    <input type="text" required value={gbName} onChange={e=>setGbName(e.target.value)} placeholder={t('Votre prénom *','Your first name *')} className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none" style={{ background:'#FAFCFA', border:`0.5px solid #C8D9C4`, color:TEXT_J }}/>
                    <input type="text" value={gbLocation} onChange={e=>setGbLocation(e.target.value)} placeholder={t('D\'où écrivez-vous ?','Where are you writing from?')} className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none" style={{ background:'#FAFCFA', border:`0.5px solid #C8D9C4`, color:TEXT_J }}/>
                    <textarea required rows={4} value={gbMessage} onChange={e=>setGbMessage(e.target.value)} placeholder={t('Votre message *','Your message *')} className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none resize-none" style={{ background:'#FAFCFA', border:`0.5px solid #C8D9C4`, color:TEXT_J }}/>
                    {gbSuccess && <div className="p-3 rounded-lg text-xs font-mono" style={{ background:BG_J, color:TEXT_J }}>🎉 {t('Votre message a été ajouté !','Your message has been added!')}</div>}
                    {gbError && <div className="p-3 rounded-lg text-xs font-mono" style={{ background:'#FBF1E6', color:TERRA }}>⚠️ {gbError}</div>}
                    <button type="submit" disabled={isSubmittingGb} className="w-full py-2.5 text-white font-mono text-xs font-bold rounded-lg cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2" style={{ background:JUNGLE }}>
                      {isSubmittingGb ? <><Loader2 className="w-4 h-4 animate-spin"/><span>{t('Envoi...','Sending...')}</span></> : <><span>{t('Signer le Livre d\'Or','Sign the Guestbook')}</span><span>✨</span></>}
                    </button>
                  </form>
                </div>
                <div className="lg:col-span-7 space-y-3 max-h-[520px] overflow-y-auto pr-1">
                  {guestbook.length===0 ? (
                    <div className="text-center py-12 rounded-2xl border" style={{ background:'#fff', borderColor:'#C8D9C4' }}>
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" style={{ color:JUNGLE }}/>
                      <p className="text-xs font-mono" style={{ color:'#7A9A7E' }}>{t('Chargement des dédicaces...','Loading messages...')}</p>
                    </div>
                  ) : guestbook.map(m=>(
                    <div key={m.id} className="p-5 rounded-2xl border transition-colors" style={{ background:'#fff', borderColor:'#C8D9C4' }}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black font-serif text-white" style={{ background:JUNGLE }}>{m.name?.charAt(0).toUpperCase()}</div>
                          <span className="font-serif text-sm font-black" style={{ color:TEXT_J }}>{m.name}</span>
                          <span className="text-[10px] font-mono" style={{ color:'#7A9A7E' }}>· {m.date}</span>
                        </div>
                        {m.location && <span className="text-[10px] font-mono" style={{ color:'#7A9A7E' }}>📍 {m.location}</span>}
                      </div>
                      <p className="text-sm leading-relaxed italic font-serif border-l-2 pl-3" style={{ color:'#3A5A3E', borderColor:'#C8D9C4' }}>« {m.message} »</p>
                      <div className="flex mt-2">{[...Array(5)].map((_,i)=><Star key={i} className="w-3 h-3" style={{ color:'#E8A44A', fill:'#E8A44A' }}/>)}</div>
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
