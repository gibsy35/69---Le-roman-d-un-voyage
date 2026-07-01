import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, Share2, Award, CirclePercent, DollarSign, 
  Layers, Package, Check, RefreshCw, Send, AlertTriangle, 
  Trash2, Play, Pause, Plus, Sparkles, Scale, Heart, Smile,
  Warehouse, Printer, Settings, Image, Palette, FileText
} from 'lucide-react';

import miyajimaCoverImg from './miyajima_cover_1781530821053.jpg';
import { BookOrder, SocialPost, AdCampaign, LuggageItem, BookConfig } from './types';
import { TRIPS_DATA } from './data';

export default function IntranetDashboard() {
  const [activeTab, setActiveTab] = useState<'sales' | 'social' | 'ads' | 'packing' | 'logistics' | 'book'>('sales');
  
  // States loaded from Server API
  const [orders, setOrders] = useState<BookOrder[]>([]);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [ads, setAds] = useState<AdCampaign[]>([]);
  const [inventory, setInventory] = useState<{format: 'printed' | 'hardcover' | 'pdf', name: string, stock: number, threshold: number, weightGrams: number, shelfLocation: string}[]>([]);
  
  // Book cover/details custom config
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
  const [isSavingConfig, setIsSavingConfig] = useState<boolean>(false);
  const [configSaveSuccess, setConfigSaveSuccess] = useState<boolean>(false);
  const [isPreviewFlipped, setIsPreviewFlipped] = useState<boolean>(false);
  
  // Shipping terminal wizard states for Papa Patrice
  const [shSelectedOrderId, setShSelectedOrderId] = useState<string>('');
  const [shPackaging, setShPackaging] = useState<'bubble' | 'carton' | 'tube'>('bubble');
  const [shCarrier, setShCarrier] = useState<'laposte' | 'colissimo' | 'monde'>('laposte');
  const [shCustomTracking, setShCustomTracking] = useState<string>('');
  const [shStatusBanner, setShStatusBanner] = useState<string>('');
  const [shIsLabelGenerated, setShIsLabelGenerated] = useState<boolean>(false);
  const [shLabelPrintedOnce, setShLabelPrintedOnce] = useState<boolean>(false);

  // Custom loader and triggers
  const [loadStatus, setLoadStatus] = useState<string>('');
  
  // AI Generator state
  const [selectedTheme, setSelectedTheme] = useState<string>('Le vol plané du 4x4 Fortuner dans le Bush');
  const [aiKeywords, setKeywords] = useState<string>('Volant à droite, trous profonds, frayeur absolue');
  const [aiTone, setAiTone] = useState<string>('humoristique');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<string>('');
  const [isAiFallback, setIsAiFallback] = useState<boolean>(false);

  // New Post manually
  const [newPostPlatform, setNewPostPlatform] = useState<'facebook' | 'instagram' | 'linkedin'>('facebook');
  const [newPostContent, setNewPostContent] = useState<string>('');

  // New Ad manually
  const [newAdTitle, setNewAdTitle] = useState<string>('');
  const [newAdAudience, setNewAdAudience] = useState<string>('');
  const [newAdBudget, setNewAdBudget] = useState<number>(5);
  const [newAdText, setNewAdText] = useState<string>('');

  // Packing game state
  const [luggage, setLuggage] = useState<LuggageItem[]>([
    { id: "lug-1", name: "👟 Baskets neuves de Mam (Sumatra)", weight: 1.8, category: "cabine" },
    { id: "lug-2", name: "🍾 Bouteille de Chablis de secours", weight: 1.5, category: "soute" },
    { id: "lug-3", name: "💊 15 boîtes de Doliprane (Mal de dos)", weight: 0.8, category: "cabine" },
    { id: "lug-4", name: "🤠 Chapeau Crocodile Dundee original", weight: 0.6, category: "cabine" },
    { id: "lug-5", name: "🎨 Toiles arborigènes d'Alice Springs (Cadeaux)", weight: 4.5, category: "soute" },
    { id: "lug-6", name: "👕 10 kg de linge humide (le drame de Wellington)", weight: 10.2, category: "soute" },
    { id: "lug-7", name: "📱 Grosse tablette de Mam (Spécialiste du climatiseur)", weight: 1.2, category: "cabine" },
    { id: "lug-8", name: "📘 Exemplaires d'auteur du livre '69'", weight: 12.5, category: "soute" }
  ]);

  // Load Data on Mount
  useEffect(() => {
    fetchBackendData();
  }, []);

  const fetchBackendData = async () => {
    setLoadStatus('loading');
    try {
      const safeFetch = async (url: string) => {
        try {
          const res = await fetch(url);
          if (res.ok) {
            const contentType = res.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              return await res.json();
            } else {
              console.warn(`Endpoint ${url} responded but content-type was matching:`, contentType);
            }
          }
        } catch (e) {
          console.warn(`Soft fetch exception for ${url}:`, e);
        }
        return null;
      };

      const [resOrders, resPosts, resAds, resInv, resConfig] = await Promise.all([
        safeFetch('/api/orders'),
        safeFetch('/api/posts'),
        safeFetch('/api/ads'),
        safeFetch('/api/inventory'),
        safeFetch('/api/book-config')
      ]);

      if (resOrders) setOrders(resOrders);
      if (resPosts) setPosts(resPosts);
      if (resAds) setAds(resAds);
      if (resInv) setInventory(resInv);
      // Priorité localStorage pour la config (persistance client-side)
      const savedConfig = localStorage.getItem('lyaBookConfig_69');
      if (savedConfig) {
        try { setBookConfig(JSON.parse(savedConfig)); } catch(_) {
          if (resConfig) setBookConfig(resConfig);
        }
      } else if (resConfig) {
        setBookConfig(resConfig);
      }
    } catch (err) {
      console.warn("Soft-failed to gather server metrics:", err);
    } finally {
      setLoadStatus('');
    }
  };

  // Adjust Stock Levels (Database Synced)
  const handleAdjustStock = async (format: 'printed' | 'hardcover' | 'pdf', delta: number) => {
    const item = inventory.find(i => i.format === format);
    if (!item) return;
    const nextStock = Math.max(0, item.stock + delta);
    try {
      const response = await fetch("/api/inventory/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format, stock: nextStock })
      });
      if (response.ok) {
        setInventory(prev => prev.map(i => i.format === format ? { ...i, stock: nextStock } : i));
      }
    } catch (err) {
      console.error("Failed to adjust stock level:", err);
    }
  };

  // Update Stock Alert Thresholds
  const handleUpdateThreshold = async (format: 'printed' | 'hardcover' | 'pdf', value: number) => {
    try {
      const response = await fetch("/api/inventory/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format, threshold: Math.max(0, value) })
      });
      if (response.ok) {
        setInventory(prev => prev.map(i => i.format === format ? { ...i, threshold: Math.max(0, value) } : i));
      }
    } catch (err) {
      console.error("Failed to update threshold values:", err);
    }
  };

  // Save Book Cover custom parameters
  const handleSaveBookConfig = () => {
    try {
      setIsSavingConfig(true);
      setConfigSaveSuccess(false);
      localStorage.setItem('lyaBookConfig_69', JSON.stringify(bookConfig));
      setConfigSaveSuccess(true);
      setTimeout(() => setConfigSaveSuccess(false), 4000);
      fetch("/api/book-config", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(bookConfig) }).catch(()=>{});
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Shipping terminal wizard runner
  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shSelectedOrderId) return;
    
    const targetOrder = orders.find(o => o.id === shSelectedOrderId);
    if (!targetOrder) return;
    
    // Logistics algorithms
    const bookWeight = targetOrder.bookFormat === 'printed' ? 420 : targetOrder.bookFormat === 'hardcover' ? 980 : 0;
    const packagingWeight = shPackaging === 'bubble' ? 30 : shPackaging === 'carton' ? 140 : 180;
    const totalWeight = bookWeight + packagingWeight;
    
    const shippingCost = shCarrier === 'laposte' ? 4.80 : shCarrier === 'colissimo' ? 6.95 : 18.90;
    const carrierName = shCarrier === 'laposte' ? "La Poste - Lettre Suivie" : shCarrier === 'colissimo' ? "Colissimo France R1" : "Colissimo International Suivi";
    const finalTracking = shCustomTracking || `69FR${Math.floor(Math.random() * 90000000) + 10000000}`;

    try {
      const response = await fetch(`/api/orders/${shSelectedOrderId}/ship`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carrier: carrierName,
          trackingNumber: finalTracking,
          weightGrams: totalWeight,
          packaging: shPackaging === 'bubble' ? 'Enveloppe Bulle' : shPackaging === 'carton' ? 'Carton Standard' : 'Tube Cartonné',
          shippingCost: shippingCost
        })
      });

      if (response.ok) {
        // Soft refresh values
        await fetchBackendData();
        setShStatusBanner(`📦 Expédition validée avec succès ! Commande de ${targetOrder.customerName} mise à jour. Suivi Coli : ${finalTracking}.`);
        setShSelectedOrderId('');
        setShIsLabelGenerated(false);
        setShLabelPrintedOnce(false);
        setShCustomTracking('');
      } else {
        setShStatusBanner("❌ Erreur de requêtage logistique. Veuillez réessayer.");
      }
    } catch (err) {
      console.error("Shipping operation failed:", err);
      setShStatusBanner("❌ Échec de la connexion d'expédition.");
    }
  };

  // Toggle order shipping status (fallback button helper)
  const handleMarkShipped = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/ship`, {
        method: "POST"
      });
      if (response.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'shipped' } : o));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle Ad Campaign
  const handleToggleAd = async (adId: string) => {
    try {
      const response = await fetch(`/api/ads/${adId}/toggle`, {
        method: "POST"
      });
      if (response.ok) {
        setAds(prev => prev.map(a => a.id === adId ? { ...a, status: a.status === 'active' ? 'paused' : 'active' } : a));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete planned social post
  const handleDeletePost = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE"
      });
      if (response.ok) {
        setPosts(prev => prev.filter(p => p.id !== postId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle manual/generated Post publication
  const handleCreatePost = async (e: React.FormEvent, customizedContent?: string) => {
    if (e) e.preventDefault();
    const payloadContent = customizedContent || newPostContent;
    if (!payloadContent) return;

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: newPostPlatform,
          content: payloadContent,
          status: 'scheduled'
        })
      });
      if (response.ok) {
        const data = await response.json();
        setPosts(prev => [data, ...prev]);
        setNewPostContent('');
        if (customizedContent) {
          setAiResult('');
        }
      }
    } catch (err) {
      console.error("Failed to create post", err);
    }
  };

  // Create Campaign
  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdTitle || !newAdText) return;

    try {
      const response = await fetch("/api/ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newAdTitle,
          audience: newAdAudience,
          budget: newAdBudget,
          adText: newAdText,
          status: 'draft'
        })
      });
      if (response.ok) {
        const data = await response.json();
        setAds(prev => [...prev, data]);
        setNewAdTitle('');
        setNewAdAudience('');
        setNewAdText('');
      }
    } catch (err) {
      console.error("Failed to create ad campaign", err);
    }
  };

  // AI generator execution (Gemini integration called on server!)
  const handleTriggerAIGen = async () => {
    setAiLoading(true);
    setAiResult('');
    try {
      const response = await fetch("/api/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: selectedTheme,
          keywords: aiKeywords,
          tone: aiTone
        })
      });
      const data = await response.json();
      setAiResult(data.content);
      setIsAiFallback(data.isFallback);
    } catch (err) {
      console.error("AI Generation failed", err);
    } finally {
      setAiLoading(false);
    }
  };

  // Packing weight calculators
  const souteWeight = luggage.filter(l => l.category === 'soute').reduce((acc, curr) => acc + curr.weight, 0);
  const cabineWeight = luggage.filter(l => l.category === 'cabine').reduce((acc, curr) => acc + curr.weight, 0);

  const toggleLuggageCategory = (id: string) => {
    setLuggage(prev => prev.map(l => {
      if (l.id === id) {
        const nextCat = l.category === 'soute' ? 'cabine' : l.category === 'cabine' ? 'perso' : 'soute';
        return { ...l, category: nextCat };
      }
      return l;
    }));
  };

  // Custom charts mock metadata
  const totalEarnings = orders.reduce((sum, ord) => sum + ord.price, 0);
  const formatsReport = orders.reduce((report: any, o) => {
    report[o.bookFormat] = (report[o.bookFormat] || 0) + 1;
    return report;
  }, { printed: 0, hardcover: 0, pdf: 0 });

  const getCoverImageSrc = (url: string) => {
    if (url === "preset-miyajima") return miyajimaCoverImg;
    if (url === "preset-fuji") return "https://images.unsplash.com/photo-1578637387939-43c525550085?auto=format&fit=crop&q=80&w=600";
    if (url === "preset-tokyo") return "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=600";
    if (url === "preset-kyoto") return "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=600";
    return url || miyajimaCoverImg;
  };

  return (
    <div className="py-8 bg-[#FAF6F0] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Upper Dashboard header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#E6DFD3] pb-6 mb-8">
          <div>
            <span className="text-xs font-mono font-bold text-[#2E4A3F] uppercase tracking-wider block">Intranet Privée de la Team 69</span>
            <h2 className="font-serif text-3xl font-black text-[#4A3225] mt-1 flex items-center">
              🎒 Le Bureau de Patrice
            </h2>
            <p className="text-xs text-[#8A7968] font-mono mt-1">Gérez vos expéditions, vos pubs, et programmez vos souvenirs avec l'IA</p>
          </div>
          
          <button 
            onClick={fetchBackendData}
            title="Rafraîchir les données"
            className="mt-4 sm:mt-0 px-4 py-2 border border-[#C19358]/40 hover:bg-[#8E5A3C]/10 text-[#8E5A3C] font-mono text-xs font-bold rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadStatus ? 'animate-spin' : ''}`} />
            <span>Actualiser le Bureau</span>
          </button>
        </div>

        {/* Intranet Tab Switchers */}
        <div className="flex space-x-1 sm:space-x-2 border-b border-[#E6DFD3] pb-px overflow-x-auto mb-8">
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-4 py-3 text-xs sm:text-sm font-mono font-bold tracking-tight rounded-t-xl shrink-0 transition-all border-b-2 cursor-pointer ${
              activeTab === 'sales'
                ? 'border-[#8E5A3C] text-[#8E5A3C] bg-white'
                : 'border-transparent text-[#8A7968] hover:text-[#5C4D3C] bg-[#FAF6F0]'
            }`}
          >
            📦 Suivi des Ventes ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('social')}
            className={`px-4 py-3 text-xs sm:text-sm font-mono font-bold tracking-tight rounded-t-xl shrink-0 transition-all border-b-2 cursor-pointer ${
              activeTab === 'social'
                ? 'border-[#8E5A3C] text-[#8E5A3C] bg-white'
                : 'border-transparent text-[#8A7968] hover:text-[#5C4D3C] bg-[#FAF6F0]'
            }`}
          >
            ✍️ Planificateur Réseaux & IA
          </button>
          <button
            onClick={() => setActiveTab('ads')}
            className={`px-4 py-3 text-xs sm:text-sm font-mono font-bold tracking-tight rounded-t-xl shrink-0 transition-all border-b-2 cursor-pointer ${
              activeTab === 'ads'
                ? 'border-[#8E5A3C] text-[#8E5A3C] bg-white'
                : 'border-transparent text-[#8A7968] hover:text-[#5C4D3C] bg-[#FAF6F0]'
            }`}
          >
            📊 Gestion d'Annonces
          </button>
          <button
            onClick={() => setActiveTab('packing')}
            className={`px-4 py-3 text-xs sm:text-sm font-mono font-bold tracking-tight rounded-t-xl shrink-0 transition-all border-b-2 cursor-pointer ${
              activeTab === 'packing'
                ? 'border-[#8E5A3C] text-[#8E5A3C] bg-white'
                : 'border-transparent text-[#8A7968] hover:text-[#5C4D3C] bg-[#FAF6F0]'
            }`}
          >
            ⚖️ Calculateur de Valise
          </button>
          <button
            onClick={() => {
              setActiveTab('logistics');
              setShStatusBanner('');
            }}
            className={`px-4 py-3 text-xs sm:text-sm font-mono font-bold tracking-tight rounded-t-xl shrink-0 transition-all border-b-2 cursor-pointer ${
              activeTab === 'logistics'
                ? 'border-[#8E5A3C] text-[#8E5A3C] bg-white'
                : 'border-transparent text-[#8A7968] hover:text-[#5C4D3C] bg-[#FAF6F0]'
            }`}
          >
            🚚 Stock & Terminal d'Envoi ({inventory.filter(i => i.format !== 'pdf').reduce((acc, c) => acc + c.stock, 0)} exp.)
          </button>
          <button
            onClick={() => setActiveTab('book')}
            className={`px-4 py-3 text-xs sm:text-sm font-mono font-bold tracking-tight rounded-t-xl shrink-0 transition-all border-b-2 cursor-pointer ${
              activeTab === 'book'
                ? 'border-[#8E5A3C] text-[#8E5A3C] bg-white'
                : 'border-transparent text-[#8A7968] hover:text-[#5C4D3C] bg-[#FAF6F0]'
            }`}
          >
            📖 Personnaliser Couverture
          </button>
        </div>

        {/* Tab Viewport */}
        <div>
          
          {/* TAB 1: SALES & ORDERS */}
          {activeTab === 'sales' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              
              {/* Scorecards Row */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white border border-[#E6DFD3] p-5 rounded-2xl">
                  <span className="text-[10px] font-mono text-[#8A7968] block uppercase font-bold tracking-widest">Revenus Globaux</span>
                  <p className="text-2xl font-serif font-black text-[#8E5A3C] mt-1">{totalEarnings.toFixed(2)} €</p>
                  <span className="text-[10px] text-[#2E4A3F] font-mono bg-[#E1EFEB] px-1.5 py-0.5 rounded-sm inline-block mt-2">✨ 100% de notre poche</span>
                </div>
                <div className="bg-white border border-[#E6DFD3] p-5 rounded-2xl">
                  <span className="text-[10px] font-mono text-[#8A7968] block uppercase font-bold tracking-widest">Brochée (Pré-commande)</span>
                  <p className="text-2xl font-serif font-black text-[#5C4D3C] mt-1">{formatsReport.printed} vendu(s)</p>
                  <span className="text-[10px] text-[#C19358] font-mono block mt-2">Mise en page de qualité (22,00 €)</span>
                </div>
                <div className="bg-white border border-[#E6DFD3] p-5 rounded-2xl">
                  <span className="text-[10px] font-mono text-[#8A7968] block uppercase font-bold tracking-widest">Luxe Illustré (Pré-commande)</span>
                  <p className="text-2xl font-serif font-black text-[#5C4D3C] mt-1">{formatsReport.hardcover} vendu(s)</p>
                  <span className="text-[10px] text-[#C19358] font-mono block mt-2">Édition Limitée Premium (39,00 €)</span>
                </div>
                <div className="bg-white border border-[#E6DFD3] p-5 rounded-2xl">
                  <span className="text-[10px] font-mono text-[#8A7968] block uppercase font-bold tracking-widest">Édition Numérique Directe</span>
                  <p className="text-2xl font-serif font-black text-[#5C4D3C] mt-1">{formatsReport.pdf} vendu(s)</p>
                  <span className="text-[10px] text-emerald-600 font-mono block mt-2">Disponible maintenant (9,90 €)</span>
                </div>
              </div>

              {/* Bespoke Interactive Sales Chart */}
              <div className="bg-white border border-[#E6DFD3] rounded-3xl p-6 shadow-xs">
                <h3 className="font-serif font-bold text-lg text-[#4A3225] border-b border-[#E6DFD3]/60 pb-3 mb-4">
                  Visualisation Hebdomadaire des Commandes
                </h3>
                
                {/* SVG Render for responsive premium look without package issues */}
                <div className="h-64 flex items-end justify-between px-4 sm:px-6 pt-6 border-b border-[#E6DFD3] relative">
                  
                  {/* Grid Lines */}
                  <div className="absolute inset-x-0 bottom-16 border-b border-dashed border-[#E6DFD3]/60 pointer-events-none" />
                  <div className="absolute inset-x-0 bottom-32 border-b border-dashed border-[#E6DFD3]/60 pointer-events-none" />
                  <div className="absolute inset-x-0 bottom-48 border-b border-dashed border-[#E6DFD3]/60 pointer-events-none" />
                  
                  {/* Render Sales Bar Nodes */}
                  <div className="flex-1 flex flex-col items-center">
                    <div className="w-10 sm:w-16 bg-[#C19358] rounded-t-sm" style={{ height: "45%" }} />
                    <span className="text-[10px] font-mono mt-2 text-[#8A7968]">Semaine 1</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <div className="w-10 sm:w-16 bg-[#8E5A3C] rounded-t-sm animate-pulse" style={{ height: "65%" }} />
                    <span className="text-[10px] font-mono mt-2 text-[#8A7968]">Semaine 2</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <div className="w-10 sm:w-16 bg-[#5C4D3C] rounded-t-sm" style={{ height: "30%" }} />
                    <span className="text-[10px] font-mono mt-2 text-[#8A7968]">Semaine 3</span>
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <div className="w-10 sm:w-16 bg-[#2D493E] rounded-t-sm" style={{ height: "80%" }} />
                    <span className="text-[10px] font-mono mt-2 text-[#8A7968]">Semaine Courante</span>
                  </div>
                </div>
                <div className="text-center mt-2 text-xs font-mono text-[#8A7968]">
                  Evolution positive suite à notre plan de communication sur les plateformes.
                </div>
              </div>

              {/* Order Shipping List Table */}
              <div className="bg-white border border-[#E6DFD3] rounded-3xl overflow-hidden shadow-xs">
                <div className="px-6 py-4 border-b border-[#E6DFD3]">
                  <h3 className="font-serif font-bold text-lg text-[#4A3225]">Bordereau d'Expéditions</h3>
                  <p className="text-xs text-[#8A7968] font-mono">Suivez et marquez comme envoyé vos ventes de livres réelles</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left font-sans text-sm">
                    <thead className="bg-[#FAF6F0] text-xs font-mono text-[#8A7968] uppercase border-b border-[#E6DFD3]">
                      <tr>
                        <th className="px-6 py-3">Acheteur</th>
                        <th className="px-6 py-3">Format</th>
                        <th className="px-6 py-3">Montant</th>
                        <th className="px-6 py-3">Date d'achat</th>
                        <th className="px-6 py-3">Statut</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E6DFD3]">
                      {orders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-[#FAF6F0]/20">
                          <td className="px-6 py-4 font-medium text-[#4A3225]">
                            <div>{ord.customerName}</div>
                            <div className="text-[10px] font-mono text-[#8A7968]">{ord.customerEmail}</div>
                            {ord.dedicationRequest && (
                              <div className="mt-1 block max-w-xs text-[10px] font-mono bg-amber-50 text-amber-800 border border-amber-200/65 p-1 rounded leading-tight">
                                ✍️ <strong>Dédicace:</strong> « {ord.dedicationRequest} »
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 font-mono text-[11px] rounded-sm border border-[#D1C2A5]/60 bg-[#FCFAF6] text-[#8E5A3C] font-bold">
                              {ord.bookFormat === 'printed' 
                                ? 'Brochée (Pré-co)' 
                                : ord.bookFormat === 'hardcover' 
                                ? 'Luxe Illustré (Pré-co)' 
                                : 'Édition Numérique'}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono font-bold text-[#4A3225]">{ord.price.toFixed(2)} €</td>
                          <td className="px-6 py-4 font-mono text-xs text-[#8A7968]">{ord.date}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-mono font-bold ${
                              ord.status === 'shipped' 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-amber-100 text-amber-800 animate-pulse'
                            }`}>
                              {ord.status === 'shipped' ? 'Envoyé ✔️' : 'À Envoyer 📦'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {ord.status === 'pending' && (
                              <button
                                onClick={() => handleMarkShipped(ord.id)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-bold transition-all shadow-xs cursor-pointer"
                              >
                                Expédier
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </motion.div>
          )}

          {/* TAB 2: SOCIAL PLANNER & AI GENERATOR */}
          {activeTab === 'social' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Social Posts Generation Workspace */}
                <div className="lg:col-span-8 bg-white border border-[#E6DFD3] p-6 rounded-3xl space-y-6">
                  <div className="flex items-center space-x-2 border-b border-[#E6DFD3]/60 pb-3">
                    <Sparkles className="w-5 h-5 text-[#8E5A3C]" />
                    <h3 className="font-serif font-black text-xl text-[#4A3225]">Générateur d'Anecdotes IA</h3>
                  </div>

                  <p className="text-xs text-[#8A7968] font-mono leading-relaxed">
                    Sélectionnez l'une de vos aventures mémorables du PDF ou un thème, écrivez quelques mots-clés, choisissez un ton de daron breton, et laissez l'IA Google Gemini imaginer une accroche publicitaire parfaite pour Facebook ou Instagram !
                  </p>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      
                      {/* Theme selector */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs uppercase font-mono tracking-widest text-[#8A7968] mb-1.5 font-bold">Thème du récit :</label>
                        <select
                          className="w-full bg-[#FCFAF6] border border-[#D1C2A5] px-3 py-2 rounded-lg text-sm text-[#4A3225] focus:outline-none focus:ring-1 focus:ring-[#8E5A3C] cursor-pointer"
                          value={selectedTheme}
                          onChange={(e) => setSelectedTheme(e.target.value)}
                        >
                          <option value="Le drame des valises Beyrouth à l'hôtel Vibes">Saga du Tetris des Valises de 20kg (Vibes)</option>
                          <option value="Le vol plané du 4x4 Fortuner dans le Bush">Le 4x4 Fortuner s'envole de 3m dans le Bush</option>
                          <option value="L'explosion de la Momo nationale et le court-circuit à Altona">L'explosion mémorable d'Altona d'une coupure électrique</option>
                          <option value="Daniel Lebrun, le fou de champagne de Blenheim">Visite chez le fou de champagne Daniel Lebrun (Marlborough)</option>
                          <option value="Le classeur magique de 15h15 à Kaohsiung">L'angoisse des billets à Kaohsiung et la course en Tesla</option>
                          <option value="Les singes chapardeurs du resto de Bukit Lawang à Sumatra">Les singes chapardeurs au buffet de Sumatra</option>
                          <option value="Les Yakuzas à Asakusa à Tokyo">Procession de Sanja Matsuri et Yakuzas tatoués à Tokyo</option>
                        </select>
                      </div>

                      {/* Tone selector */}
                      <div>
                        <label className="block text-xs uppercase font-mono tracking-widest text-[#8A7968] mb-1.5 font-bold">Ton désiré :</label>
                        <select
                          className="w-full bg-[#FCFAF6] border border-[#D1C2A5] px-3 py-2 rounded-lg text-sm text-[#4A3225] focus:outline-none focus:ring-1 focus:ring-[#8E5A3C] cursor-pointer"
                          value={aiTone}
                          onChange={(e) => setAiTone(e.target.value)}
                        >
                          <option value="humoristique">Humoristique et drôle</option>
                          <option value="touchant & tendre">Touchant et affectueux</option>
                          <option value="authentique">Baroudeur et rustique</option>
                        </select>
                      </div>

                    </div>

                    {/* Keywords Input */}
                    <div>
                      <label className="block text-xs uppercase font-mono tracking-widest text-[#8A7968] mb-1.5 font-bold">Informations ou Mots-clés de Patrice :</label>
                      <input
                        type="text"
                        placeholder="Ex: Volant à droite, trous profonds, stress mémorable de Mam..."
                        value={aiKeywords}
                        onChange={(e) => setKeywords(e.target.value)}
                        className="w-full bg-[#FCFAF6] border border-[#D1C2A5] px-3 py-2 rounded-lg text-sm text-[#4A3225] placeholder-[#8A7968]/50 focus:outline-none focus:ring-1 focus:ring-[#8E5A3C]"
                      />
                    </div>

                    <button
                      onClick={handleTriggerAIGen}
                      disabled={aiLoading}
                      className="px-4 py-2.5 bg-[#8E5A3C] hover:bg-[#724831] text-white rounded-lg text-xs sm:text-sm font-bold flex items-center space-x-1.5 transition-colors shadow-xs hover:shadow-md cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>{aiLoading ? "Interrogations de Gemini..." : "Faire bosser l'IA pour Patrice"}</span>
                    </button>

                  </div>

                  {/* AI Output Result Box */}
                  {aiResult && (
                    <div className="bg-[#FAF6F0] border-2 border-[#E6DFD3] rounded-2xl p-5 space-y-4">
                      <div className="flex justify-between items-center border-b border-[#E6DFD3] pb-2">
                        <span className="text-[10px] font-mono tracking-widest font-black text-[#8E5A3C] uppercase flex items-center">
                          <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                          Accroche Réseau Générée par Gemini
                        </span>
                        {isAiFallback && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-mono font-bold">MODE LOCAL</span>
                        )}
                      </div>

                      <div className="whitespace-pre-wrap font-serif text-sm text-[#4A3225] leading-relaxed italic bg-white p-4 rounded-xl border border-[#FAF6F0] selection:bg-[#EBDCCB]">
                        {aiResult}
                      </div>

                      {/* Fast Schedule/Save social post */}
                      <div className="flex justify-end space-x-2 pt-2">
                        <button
                          onClick={() => setAiResult('')}
                          className="px-3 py-1.5 border border-[#D1C2A5] text-xs font-mono font-bold text-[#8A7968] rounded-md transition-colors hover:bg-red-50 hover:text-red-700 cursor-pointer"
                        >
                          Effacer
                        </button>
                        <button
                          onClick={(e) => handleCreatePost(e, aiResult)}
                          className="px-4 py-1.5 bg-[#2E4A3F] hover:bg-[#1E3128] text-white text-xs font-mono font-bold rounded-md transition-colors shadow-xs flex items-center space-x-1 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Programmer cette publication</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Queue of Planned posts list */}
                <div className="lg:col-span-4 bg-white border border-[#E6DFD3] p-4 sm:p-5 rounded-3xl space-y-4">
                  <h3 className="font-serif font-bold text-lg text-[#4A3225] border-b border-[#E6DFD3]/60 pb-3 flex items-center justify-between">
                    <span>Publications Prévues</span>
                    <span className="text-xs font-mono text-[#8A7968] font-normal">{posts.length} posts</span>
                  </h3>

                  <div className="space-y-4 max-h-[500px] overflow-y-auto">
                    {posts.map((post) => (
                      <div key={post.id} className="bg-[#FCFAF6] border border-[#E6DFD3] rounded-xl p-4 space-y-3 shadow-2xs relative">
                        <div className="flex justify-between items-center text-xs">
                          <span className={`px-2 py-0.5 font-mono text-[9px] font-bold rounded-sm uppercase tracking-wider ${
                            post.platform === 'facebook' ? 'bg-blue-100 text-blue-800' : post.platform === 'instagram' ? 'bg-[#FAECE8] text-[#D0543C]' : 'bg-[#EAF0F6] text-[#28608F]'
                          }`}>
                            {post.platform}
                          </span>
                          <span className="text-[10px] text-[#8A7968] font-mono">{post.scheduledDate}</span>
                        </div>

                        <p className="text-xs text-[#6B5A49] leading-relaxed whitespace-pre-wrap">
                          {post.content.length > 200 ? `${post.content.slice(0, 200)}...` : post.content}
                        </p>

                        <div className="flex justify-between items-center pt-2 border-t border-[#E6DFD3]/60 text-[10px] font-mono">
                          <span className={`font-bold uppercase ${post.status === 'published' ? 'text-emerald-700' : 'text-amber-700 animate-pulse'}`}>
                            {post.status === 'published' ? 'En ligne ✔️' : 'Planifié 🕒'}
                          </span>
                          
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            title="Supprimer ce post"
                            className="bg-transparent border-none text-red-600 hover:text-red-800 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 3: ADS MANAGER */}
          {activeTab === 'ads' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              
              {/* Score summaries */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white border border-[#E6DFD3] p-5 rounded-2xl">
                  <span className="text-[10px] font-mono text-[#8A7968] block uppercase font-bold tracking-widest">Budget Total Quotidien</span>
                  <p className="text-2xl font-serif font-black text-[#8E5A3C] mt-1">
                    {ads.reduce((sum, a) => sum + (a.status === 'active' ? a.budget : 0), 0)} € / jour
                  </p>
                </div>
                <div className="bg-white border border-[#E6DFD3] p-5 rounded-2xl">
                  <span className="text-[10px] font-mono text-[#8A7968] block uppercase font-bold tracking-widest">Impressions</span>
                  <p className="text-2xl font-serif font-black text-[#5C4D3C] mt-1">{ads.reduce((sum, a) => sum + a.impressions, 0)}</p>
                </div>
                <div className="bg-white border border-[#E6DFD3] p-5 rounded-2xl">
                  <span className="text-[10px] font-mono text-[#8A7968] block uppercase font-bold tracking-widest">Clics Générés</span>
                  <p className="text-2xl font-serif font-black text-[#5C4D3C] mt-1">{ads.reduce((sum, a) => sum + a.clicks, 0)}</p>
                </div>
                <div className="bg-white border border-[#E6DFD3] p-5 rounded-2xl">
                  <span className="text-[10px] font-mono text-[#8A7968] block uppercase font-bold tracking-widest">Conversions Directes</span>
                  <p className="text-2xl font-serif font-black text-[#2D493E] mt-1">{ads.reduce((sum, a) => sum + a.conversions, 0)}</p>
                </div>
              </div>

              {/* Add Ad Campaign Form and List */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Form to create ads */}
                <div className="lg:col-span-5 bg-white border border-[#E6DFD3] p-6 rounded-3xl space-y-4">
                  <h3 className="font-serif font-bold text-lg text-[#4A3225] border-b border-[#E6DFD3]/60 pb-3 flex items-center">
                    <Plus className="w-5 h-5 text-[#8E5A3C] mr-1.5" />
                    Créer une Campagne Pub
                  </h3>

                  <form onSubmit={handleCreateAd} className="space-y-4 text-xs font-mono">
                    <div>
                      <label className="block text-[#8A7968] font-bold uppercase mb-1">Titre de la Campagne :</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Seniors dynamiques bretons"
                        value={newAdTitle}
                        onChange={(e) => setNewAdTitle(e.target.value)}
                        className="w-full bg-[#FCFAF6] border border-[#D1C2A5] px-3 py-2 rounded-lg text-sm text-[#4A3225]"
                      />
                    </div>

                    <div>
                      <label className="block text-[#8A7968] font-bold uppercase mb-1">Ciblage d'Audience :</label>
                      <input
                        type="text"
                        placeholder="Ex: Retraités, Voyage, nature, 55-75 ans..."
                        value={newAdAudience}
                        onChange={(e) => setNewAdAudience(e.target.value)}
                        className="w-full bg-[#FCFAF6] border border-[#D1C2A5] px-3 py-2 rounded-lg text-sm text-[#4A3225]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-[#8A7968] font-bold uppercase">Budget Quotidien (€/jour) :</label>
                        <span className="text-bold text-[#8E5A3C]">{newAdBudget} €</span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={30}
                        step={0.5}
                        value={newAdBudget}
                        onChange={(e) => setNewAdBudget(Number(e.target.value))}
                        className="w-full accent-[#8E5A3C]"
                      />
                    </div>

                    <div>
                      <label className="block text-[#8A7968] font-bold uppercase mb-1">Corps de l'Annonce :</label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Qu'est-ce qu'on affiche aux lecteurs ?"
                        value={newAdText}
                        onChange={(e) => setNewAdText(e.target.value)}
                        className="w-full bg-[#FCFAF6] border border-[#D1C2A5] p-3 rounded-lg text-sm text-[#4A3225] font-sans"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-[#8E5A3C] hover:bg-[#724831] text-white text-xs font-bold rounded-lg uppercase shadow-xs transition-colors"
                    >
                      Lancer en Brouillon
                    </button>
                  </form>
                </div>

                {/* Ads list with toggle stats */}
                <div className="lg:col-span-7 space-y-4">
                  <h3 className="font-serif font-black text-xl text-[#4A3225] px-2 flex items-center">
                    <Layers className="w-5 h-5 text-[#C19358] mr-2" />
                    Vos Annonces Facebook & Instagram
                  </h3>

                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {ads.map((ad) => (
                      <div key={ad.id} className="bg-white border border-[#E6DFD3] p-5 rounded-2xl relative space-y-3">
                        
                        {/* Title & Status badge */}
                        <div className="flex justify-between items-center">
                          <h4 className="font-serif font-bold text-[#4A3225] text-md truncate pr-4">
                            {ad.title}
                          </h4>
                          
                          <button
                            onClick={() => handleToggleAd(ad.id)}
                            className={`px-3 py-1 rounded-sm text-[10px] font-mono font-black uppercase tracking-wider flex items-center space-x-1 cursor-pointer transition-all ${
                              ad.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ad.status === 'paused'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-[#FAF6F0] text-[#8A7968] border border-[#D1C2A5]/50'
                            }`}
                          >
                            {ad.status === 'active' ? (
                              <>
                                <Play className="w-3 h-3 fill-emerald-800 mr-1" />
                                <span>Actif</span>
                              </>
                            ) : (
                              <>
                                <Pause className="w-3 h-3 fill-amber-800 mr-1" />
                                <span>En Pause</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Audience and Budget */}
                        <div className="grid grid-cols-2 gap-4 text-xs font-mono text-[#8A7968]">
                          <div>Ciblage : <strong className="text-[#5C4D3C]">{ad.audience}</strong></div>
                          <div>Budget : <strong className="text-[#8E5A3C]">{ad.budget} € / jour</strong></div>
                        </div>

                        {/* Ad Body Text preview */}
                        <div className="bg-[#FCFAF6] border border-[#E6DFD3] p-3 rounded-lg text-xs leading-relaxed text-[#6B5A49]">
                          {ad.adText}
                        </div>

                        {/* Stats Dashboard */}
                        <div className="grid grid-cols-4 gap-2 text-center font-mono py-2 bg-[#FAF6F0]/50 rounded-xl">
                          <div>
                            <span className="text-[10px] text-[#8A7968] uppercase font-bold block">Clics</span>
                            <strong className="text-xs text-[#4A3225] block mt-0.5">{ad.clicks}</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#8A7968] uppercase font-bold block">Vues</span>
                            <strong className="text-xs text-[#5C4D3C] block mt-0.5">{ad.impressions}</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#8A7968] uppercase font-bold block">CTR</span>
                            <strong className="text-xs text-[#5C4D3C] block mt-0.5">
                              {ad.impressions > 0 ? `${((ad.clicks / ad.impressions) * 100).toFixed(1)}%` : "0.0%"}
                            </strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#8A7968] uppercase font-bold block">Achat</span>
                            <strong className="text-xs text-[#2D493E] block mt-0.5">{ad.conversions}</strong>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 4: PACKING LUGGAGE SELECTOR */}
          {activeTab === 'packing' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div className="bg-white border border-[#E6DFD3] p-6 rounded-3xl space-y-4">
                <div className="flex items-center space-x-2 border-b border-[#E6DFD3]/60 pb-3">
                  <Scale className="w-5 h-5 text-[#8E5A3C]" />
                  <h3 className="font-serif font-black text-xl text-[#4A3225]">
                    Simulateur de Valises "MAM" (Anti-Surtaxe-Panique!)
                  </h3>
                </div>

                <p className="text-xs text-[#8A7968] font-mono leading-relaxed">
                  Dans le livre de Patrice, les valises sont une source permanente d'angoisses. Il faut absolument rester sous la sainte limite imposée de <strong>20 kg en soute</strong> et <strong>7 kg en cabine</strong> ! Cliquez sur un bagage pour déplacer son affectation (Soute → Cabine → Laisser à la maison/Perso), et assurez-vous d'éviter de contrarier Momo nationale !
                </p>

                {/* Soute limits and meters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  
                  {/* Soute container with limits */}
                  <div className="bg-[#FAF6F0] p-5 rounded-2xl border border-[#E6DFD3]">
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="font-serif font-bold text-[#4A3225] text-md">📦 Valise de Soute (Smax: 20kg)</span>
                      <span className={`font-mono text-sm font-bold ${souteWeight > 20 ? 'text-red-600' : 'text-[#8E5A3C]'}`}>
                        {souteWeight.toFixed(1)} kg / 20.0 kg
                      </span>
                    </div>

                    {/* Weight progress bar */}
                    <div className="w-full bg-[#E6DFD3] h-3.5 rounded-full overflow-hidden mb-4">
                      <div 
                        className={`h-full transition-all duration-300 ${souteWeight > 20 ? 'bg-red-600' : 'bg-[#8E5A3C]'}`}
                        style={{ width: `${Math.min((souteWeight / 20) * 100, 100)}%` }}
                      />
                    </div>

                    {/* list of soute luggage */}
                    <div className="space-y-2">
                      {luggage.filter(l => l.category === 'soute').map((item) => (
                        <div 
                          key={item.id} 
                          onClick={() => toggleLuggageCategory(item.id)}
                          className="bg-white p-3 rounded-lg border border-[#E6DFD3]/60 hover:border-[#8E5A3C] cursor-pointer flex justify-between items-center text-xs font-mono"
                        >
                          <span className="font-bold text-[#4A3225]">{item.name}</span>
                          <span className="font-bold text-[#8E5A3C] shrink-0 font-sans ml-2">{item.weight} kg ↩️</span>
                        </div>
                      ))}
                      {luggage.filter(l => l.category === 'soute').length === 0 && (
                        <p className="text-center font-mono text-[11px] text-[#8A7968] py-4">Valise de soute vide... (Idéal pour les souvenirs !)</p>
                      )}
                    </div>
                  </div>

                  {/* Cabine container with limits */}
                  <div className="bg-[#FAF6F0] p-5 rounded-2xl border border-[#E6DFD3]">
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="font-serif font-bold text-[#4A3225] text-md">🎒 Bagage Cabine (Smax: 7kg)</span>
                      <span className={`font-mono text-sm font-bold ${cabineWeight > 7 ? 'text-red-700 font-extrabold animate-bounce' : 'text-[#2D493E]'}`}>
                        {cabineWeight.toFixed(1)} kg / 7.0 kg
                      </span>
                    </div>

                    {/* Weight progress bar */}
                    <div className="w-full bg-[#E6DFD3] h-3.5 rounded-full overflow-hidden mb-4">
                      <div 
                        className={`h-full transition-all duration-300 ${cabineWeight > 7 ? 'bg-red-600' : 'bg-[#2D493E]'}`}
                        style={{ width: `${Math.min((cabineWeight / 7) * 100, 100)}%` }}
                      />
                    </div>

                    {/* list of cabine luggage */}
                    <div className="space-y-2">
                      {luggage.filter(l => l.category === 'cabine').map((item) => (
                        <div 
                          key={item.id} 
                          onClick={() => toggleLuggageCategory(item.id)}
                          className="bg-white p-3 rounded-lg border border-[#E6DFD3]/60 hover:border-[#2D493E] cursor-pointer flex justify-between items-center text-xs font-mono"
                        >
                          <span className="font-bold text-[#4A3225]">{item.name}</span>
                          <span className="font-bold text-[#2D493E] shrink-0 font-sans ml-2">{item.weight} kg ↩️</span>
                        </div>
                      ))}
                      {luggage.filter(l => l.category === 'cabine').length === 0 && (
                        <p className="text-center font-mono text-[11px] text-[#8A7968] py-4">Sac cabine vide. Patrice a tout planqué dans ses poches !</p>
                      )}
                    </div>
                  </div>

                </div>

                {/* Left over category / Left at home details */}
                <div className="pt-4 border-t border-[#E6DFD3] space-y-3">
                  <h4 className="font-serif font-bold text-sm text-[#4A3225]">❌ Laissé à l'hôtel ou dans les poches de la banane :</h4>
                  <div className="flex flex-wrap gap-2 text-xs font-mono">
                    {luggage.filter(l => l.category === 'perso').map((item) => (
                      <button
                        key={item.id}
                        onClick={() => toggleLuggageCategory(item.id)}
                        className="bg-[#FCFAF6] border border-[#D1C2A5] px-3 py-1.5 rounded-full hover:border-[#8E5A3C] text-[#5C4D3C] cursor-pointer"
                      >
                        {item.name} ({item.weight} kg) ➕
                      </button>
                    ))}
                    {luggage.filter(l => l.category === 'perso').length === 0 && (
                      <span className="text-[11px] text-[#8A7968] italic font-mono pr-2">Tout est chargé ! Patrice n'a rien oublié dans les placards...</span>
                    )}
                  </div>
                </div>

                {/* Mama Alert Warnings widget depending on weight limits */}
                <div className="pt-6">
                  {souteWeight > 20 || cabineWeight > 7 ? (
                    <div className="bg-red-100 border border-red-300 p-4 rounded-xl flex items-start space-x-3 text-red-900">
                      <AlertTriangle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-sm">⚠️ MAMM EST FURAX - LA COCOTTE-MINUTE EXPLOSE !</strong>
                        <p className="text-xs mt-1 text-red-800">
                          {souteWeight > 20 && `Votre valise de soute fait ${souteWeight.toFixed(1)} kg (${(souteWeight - 20).toFixed(1)} kg de trop !). `}
                          {cabineWeight > 7 && `Votre sac cabine fait ${cabineWeight.toFixed(1)} kg (${(cabineWeight - 7).toFixed(1)} kg de trop !). `}
                          Daniel Lebrun, stephen, ou l'hôtesse Stela ne pourront rien faire à la douane : vous allez payer une surtaxe colossale de 7000 Yens par kilo en trop à l'aéroport ou devoir tout déballer sur le sol du hall face aux passagers amusés ! Faites du tri !
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-emerald-100 border border-emerald-300 p-4 rounded-xl flex items-start space-x-3 text-emerald-900">
                      <Smile className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-sm">💬 LA MOMO NATIONALE EST SEREINE & SOURIANTE !</strong>
                        <p className="text-xs mt-1 text-emerald-800">
                          Pari gagné ! Tous vos bagages respectent à la lettre les limites réglementaires de 20 kg (soute) et 7 kg (cabine). Vous pouvez partir sereinement pour votre prochain vol vers Singapour ou Paris avec votre Crocodile Dundee hat vissé sur la tête. Bonne envolée !
                        </p>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 5: LOGISTICS & REAL STOCK MANAGEMENT */}
          {activeTab === 'logistics' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              
              {shStatusBanner && (
                <div className="bg-emerald-50 border-2 border-emerald-500 p-4 rounded-2xl flex items-center justify-between text-emerald-900 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">📦</span>
                    <p className="text-xs sm:text-sm font-medium leading-relaxed">{shStatusBanner}</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setShStatusBanner('')}
                    className="text-xs text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1.5 rounded-md font-mono font-bold cursor-pointer"
                  >
                    Fermer
                  </button>
                </div>
              )}

              {/* TWO COLUMN GRID WORKSPACE */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* COLUMN 1: Dynamic Physical Stock Manager (cols-5) */}
                <div className="lg:col-span-5 bg-white border border-[#E6DFD3] p-6 rounded-3xl space-y-6">
                  <div className="flex items-center space-x-2 border-b border-[#E6DFD3]/60 pb-3">
                    <Warehouse className="w-5 h-5 text-[#8E5A3C]" />
                    <h3 className="font-serif font-black text-xl text-[#4A3225]">Logiciel de Stock "Breizh"</h3>
                  </div>

                  <p className="text-xs text-[#8A7968] font-mono leading-relaxed">
                    Supervisez les stocks physiques réels du livre de Patrice. Lorsqu'une commande est payée en ligne ou simulée, les stocks diminuent d'un exemplaire au moment de l'envoi colis.
                  </p>

                  <div className="space-y-4">
                    {inventory.map((item) => {
                      const isLowStock = item.format !== 'pdf' && item.stock <= item.threshold;
                      return (
                        <div 
                          key={item.format} 
                          className={`p-4 rounded-2xl border transition-all ${
                            isLowStock 
                              ? 'bg-red-50/50 border-red-300 shadow-sm animate-pulse' 
                              : 'bg-[#FAF6F0]/60 border-[#E6DFD3] hover:border-[#8E5A3C]/40'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-xs font-bold text-[#8E5A3C] font-mono">
                                {item.format === 'printed' ? '📖 LIVRE PHYSIQUE BROCHÉ' : item.format === 'hardcover' ? '✨ ÉDITION LIMITÉE LUXE' : '💻 DISTRIB DIRECTE PDF'}
                              </span>
                              <h4 className="font-serif font-black text-[#4A3225] text-md mt-0.5">{item.name}</h4>
                            </div>
                            {isLowStock && (
                              <span className="bg-red-600 text-white text-[9px] font-mono font-black tracking-widest px-2 py-0.5 rounded-sm uppercase">
                                Alerte Réappro
                              </span>
                            )}
                          </div>

                          {/* Detail fields */}
                          <div className="grid grid-cols-2 gap-2 mt-3 text-[11px] font-mono text-[#8A7968]">
                            <div>📍 Emplacement : <strong className="text-[#4A3225]">{item.shelfLocation}</strong></div>
                            <div>⚖️ Poids unitaire : <strong className="text-[#4A3225]">{item.weightGrams > 0 ? `${item.weightGrams}g` : 'N/A'}</strong></div>
                          </div>

                          {/* Main Stock status block */}
                          <div className="flex items-baseline space-x-1.5 mt-4">
                            <span className="text-3xl font-serif font-black text-[#4A3225]">
                              {item.format === 'pdf' ? '∞' : item.stock}
                            </span>
                            <span className="text-xs text-[#8A7968] font-mono">exemplaires en rayon</span>
                          </div>

                          {/* Quick Adjust Buttons */}
                          {item.format !== 'pdf' && (
                            <div className="flex items-center space-x-1 mt-4">
                              <button
                                type="button"
                                onClick={() => handleAdjustStock(item.format, -10)}
                                className="bg-white border border-[#E6DFD3] hover:bg-[#8E5A3C]/5 text-[10px] text-[#8E5A3C] font-mono font-bold px-2 py-1 rounded-sm cursor-pointer"
                                title="Réduire le stock de 10"
                              >
                                -10
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAdjustStock(item.format, -1)}
                                className="bg-white border border-[#E6DFD3] hover:bg-[#8E5A3C]/5 text-[10px] text-[#8E5A3C] font-mono font-bold px-2 py-1 rounded-sm cursor-pointer"
                                title="Réduire le stock de 1"
                              >
                                -1
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAdjustStock(item.format, 1)}
                                className="bg-[#8E5A3C] hover:bg-[#724831] text-white text-[10px] font-mono font-bold px-2 py-1 rounded-sm cursor-pointer"
                                title="Ajouter 1 au stock"
                              >
                                +1
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAdjustStock(item.format, 10)}
                                className="bg-[#2E4A3F] hover:bg-[#1E3129] text-white text-[10px] font-mono font-bold px-2 py-1 rounded-sm cursor-pointer"
                                title="Ajouter 10 au stock"
                              >
                                +10
                              </button>
                              <div className="flex-1" />
                              <div className="flex items-center space-x-1 shrink-0">
                                <span className="text-[10px] text-[#8A7968] font-mono font-medium">Seuil :</span>
                                <input
                                  type="number"
                                  value={item.threshold}
                                  onChange={(e) => handleUpdateThreshold(item.format, Number(e.target.value))}
                                  className="w-10 bg-white border border-[#E6DFD3] px-1 py-0.5 text-center text-xs text-[#4A3225] font-mono rounded-lg focus:outline-none"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* COLUMN 2: Automated Shipping Terminal (cols-7) */}
                <div className="lg:col-span-7 bg-white border border-[#E6DFD3] p-6 rounded-3xl space-y-6">
                  <div className="flex items-center space-x-2 border-b border-[#E6DFD3]/60 pb-3">
                    <Printer className="w-5 h-5 text-[#8E5A3C]" />
                    <h3 className="font-serif font-black text-xl text-[#4A3225]">Terminal d'Expédition Intelligent</h3>
                  </div>

                  <p className="text-xs text-[#8A7968] font-mono leading-relaxed">
                    Sélectionnez une commande payée en attente ci-dessous. Le terminal se configure tout seul pour choisir l'enveloppe ou le carton idéal, évaluer le poids total, et générer la détaxe ou le bordereau postal officiel Colissimo.
                  </p>

                  {/* Dropdown to select orders in pending status */}
                  <div className="bg-[#FAF6F0] p-4 rounded-2xl border border-[#E6DFD3] space-y-3">
                    <label className="block text-xs font-mono font-bold text-[#8E5A3C] uppercase">
                      1. Commande en attente d'expédition
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={shSelectedOrderId}
                        onChange={(e) => {
                          setShSelectedOrderId(e.target.value);
                          setShIsLabelGenerated(false);
                          setShLabelPrintedOnce(false);
                        }}
                        className="flex-1 bg-white border border-[#D1C2A5] p-2.5 rounded-xl text-xs text-[#4A3225] focus:outline-none focus:ring-1 focus:ring-[#8E5A3C]"
                      >
                        <option value="">-- Choisir une commande à expédier --</option>
                        {orders.filter(o => o.status === 'pending').map(o => (
                          <option key={o.id} value={o.id}>
                            📦 [{o.id}] {o.customerName} - {o.bookFormat === 'printed' ? 'Broché' : o.bookFormat === 'hardcover' ? 'Luxe' : 'PDF Digital'} ({o.destinationCountry || 'FR'})
                          </option>
                        ))}
                      </select>
                      
                      {/* Simulation order creator for testing when empty */}
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const mockNames = ["Daniel Lebrun", "Stephen Hughes [Stephen Hughes NZ]", "Alice Springs Fan", "Yannick de Brest"];
                            const mockEmails = ["daron@blenheim.cn", "stephen@nz-adventure.nz", "alice@springs.tw", "yannick@breizh.bzh"];
                            const mockFormats = ["hardcover", "printed", "printed", "hardcover"];
                            const mockCountries = ["Nouvelle-Zélande", "Taïwan", "Australie", "France"];
                            const randomIndex = Math.floor(Math.random() * 4);
                            
                            const res = await fetch("/api/orders", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                customerName: mockNames[randomIndex],
                                customerEmail: mockEmails[randomIndex],
                                bookFormat: mockFormats[randomIndex],
                                price: mockFormats[randomIndex] === 'hardcover' ? 39 : 22,
                                destinationCountry: mockCountries[randomIndex]
                              })
                            });
                            if (res.ok) {
                              await fetchBackendData();
                              setShStatusBanner("➕ Nouvelle commande de simulation ajoutée à la liste des expéditions en attente !");
                            }
                          } catch (err) {
                            console.warn(err);
                          }
                        }}
                        className="px-3 py-1 bg-[#2E4A3F] hover:bg-[#1C322A] text-white text-[11px] font-mono font-bold rounded-xl transition-colors shrink-0 cursor-pointer"
                        title="Créer une commande de démo"
                      >
                        ➕ Demo
                      </button>
                    </div>
                  </div>

                  {shSelectedOrderId ? (() => {
                    const currentOrder = orders.find(o => o.id === shSelectedOrderId);
                    if (!currentOrder) return null;
                    
                    const isDigital = currentOrder.bookFormat === 'pdf';
                    const bookWeight = currentOrder.bookFormat === 'printed' ? 420 : currentOrder.bookFormat === 'hardcover' ? 980 : 0;
                    const packagingWeight = shPackaging === 'bubble' ? 30 : shPackaging === 'carton' ? 140 : 180;
                    const totalWeight = bookWeight + packagingWeight;
                    
                    const shippingCost = shCarrier === 'laposte' ? 4.80 : shCarrier === 'colissimo' ? 6.95 : 18.90;
                    const trackingMock = shCustomTracking || `69FR${Math.floor(Math.random() * 90000000) + 10000000}`;
                    
                    return (
                      <div className="space-y-6">
                        
                        {isDigital ? (
                          <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl space-y-2">
                            <strong className="text-xs font-mono text-amber-800 uppercase block">💡 COMMANDE NUMÉRIQUE (ELECTRONIQUE)</strong>
                            <p className="text-xs text-amber-900 leading-relaxed">
                              Cette commande concerne le format PDF. Monique et Patrice n'ont absolument rien à emballer ! Le serveur a déjà automatiquement expédié le courriel contenant le lien de téléchargement crypté sécurisé pour <strong>{currentOrder.customerEmail}</strong>.
                            </p>
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  const response = await fetch(`/api/orders/${currentOrder.id}/ship`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      carrier: "Système Digital",
                                      trackingNumber: "DISTRIB_IMMEDIATE_PDF",
                                      weightGrams: 0,
                                      packaging: "Livre Électronique",
                                      shippingCost: 0
                                    })
                                  });
                                  if (response.ok) {
                                    await fetchBackendData();
                                    setShStatusBanner("💻 Commande PDF archivée et validée !");
                                    setShSelectedOrderId('');
                                  }
                                } catch (e) {
                                  console.error(e);
                                }
                              }}
                              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-mono font-bold cursor-pointer"
                            >
                              Archi-valider l'envoi système ✔️
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {/* STEP 2: PACKAGING SELECTION */}
                            <div className="space-y-3">
                              <span className="block text-xs font-mono font-bold text-[#8E5A3C] uppercase">
                                2. Configuration d'Emballage (Calculateur de Poids)
                              </span>
                              
                              <div className="grid grid-cols-3 gap-3">
                                <button
                                  type="button"
                                  onClick={() => setShPackaging('bubble')}
                                  className={`p-3 border rounded-xl text-left transition-all cursor-pointer ${
                                    shPackaging === 'bubble' 
                                      ? 'border-[#8E5A3C] bg-[#8E5A3C]/5 shadow-sm font-bold' 
                                      : 'border-[#E6DFD3] hover:border-[#8E5A3C]/40 bg-white'
                                  }`}
                                >
                                  <strong className="text-xs font-sans block text-[#4A3225]">Enveloppe Bulle</strong>
                                  <span className="text-[10px] font-mono text-[#8A7968] block mt-1">+30g | Propre</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setShPackaging('carton')}
                                  className={`p-3 border rounded-xl text-left transition-all cursor-pointer ${
                                    shPackaging === 'carton' 
                                      ? 'border-[#8E5A3C] bg-[#8E5A3C]/5 shadow-sm font-bold' 
                                      : 'border-[#E6DFD3] hover:border-[#8E5A3C]/40 bg-white'
                                  }`}
                                >
                                  <strong className="text-xs font-sans block text-[#4A3225]">Carton Rigide</strong>
                                  <span className="text-[10px] font-mono text-[#8A7968] block mt-1">+140g | Sécurisé</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setShPackaging('tube')}
                                  className={`p-3 border rounded-xl text-left transition-all cursor-pointer ${
                                    shPackaging === 'tube' 
                                      ? 'border-[#8E5A3C] bg-[#8E5A3C]/5 shadow-sm font-bold' 
                                      : 'border-[#E6DFD3] hover:border-[#8E5A3C]/40 bg-white'
                                  }`}
                                >
                                  <strong className="text-xs font-sans block text-[#4A3225]">Tube Cartonal</strong>
                                  <span className="text-[10px] font-mono text-[#8A7968] block mt-1">+180g | Premium</span>
                                </button>
                              </div>

                              <div className="bg-[#FAF6F0] p-3.5 rounded-xl text-[11px] font-mono text-[#8A7968] flex justify-between">
                                <span>Livre ({bookWeight}g) + Emballage ({packagingWeight}g)</span>
                                <span>Poids Global : <strong className="text-[#4A3225] text-xs shrink-0">{totalWeight}g</strong></span>
                              </div>
                            </div>

                            {/* STEP 3: CARRIER RECOMMENDATION */}
                            <div className="space-y-3">
                              <span className="block text-xs font-mono font-bold text-[#8E5A3C] uppercase">
                                3. Choix du Mode d'Envoi
                              </span>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <button
                                  type="button"
                                  onClick={() => setShCarrier('laposte')}
                                  className={`p-3 border rounded-xl text-left transition-all cursor-pointer ${
                                    shCarrier === 'laposte' 
                                      ? 'border-[#2D493E] bg-[#2D493E]/5 shadow-sm font-bold' 
                                      : 'border-[#E6DFD3] hover:border-[#8E5A3C]/40 bg-white'
                                  }`}
                                >
                                  <strong className="text-xs block text-[#2E4A3F]">La Poste Suivie</strong>
                                  <span className="text-[10px] font-mono text-[#8A7968] block mt-1 font-bold">4.80 € | 48h</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setShCarrier('colissimo')}
                                  className={`p-3 border rounded-xl text-left transition-all cursor-pointer ${
                                    shCarrier === 'colissimo' 
                                      ? 'border-[#2D493E] bg-[#2D493E]/5 shadow-sm font-bold' 
                                      : 'border-[#E6DFD3] hover:border-[#8E5A3C]/40 bg-white'
                                  }`}
                                >
                                  <strong className="text-xs block text-[#2E4A3F]">Colissimo France</strong>
                                  <span className="text-[10px] font-mono text-[#8A7968] block mt-1 font-bold">6.95 € | Rapide</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setShCarrier('monde')}
                                  className={`p-3 border rounded-xl text-left transition-all cursor-pointer ${
                                    shCarrier === 'monde' 
                                      ? 'border-[#2D493E] bg-[#2D493E]/5 shadow-sm font-bold' 
                                      : 'border-[#E6DFD3] hover:border-[#8E5A3C]/40 bg-white'
                                  }`}
                                >
                                  <strong className="text-xs block text-[#2E4A3F]">Coli International</strong>
                                  <span className="text-[10px] font-mono text-[#8A7968] block mt-1 font-bold">18.90 € | Douane</span>
                                </button>
                              </div>

                              {currentOrder.destinationCountry && currentOrder.destinationCountry !== "France" && (
                                <div className="bg-amber-100/60 p-3.5 rounded-xl text-xs space-y-1">
                                  <div className="flex items-center space-x-1.5 text-amber-900 font-bold font-mono text-[10px]">
                                    <span>🛂</span>
                                    <span>DESTINATION INTERNATIONALE ({currentOrder.destinationCountry})</span>
                                  </div>
                                  <p className="text-[11px] text-amber-950 font-serif leading-relaxed">
                                    Attention Patrice : pour envoyer vers <strong>{currentOrder.destinationCountry}</strong>, le terminal a automatiquement préparé la <strong>déclaration douanière standard CN23</strong>. Collez-la au dos du carton pour {currentOrder.customerName} !
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* STEP 4: POSTAL LABEL PREVIEW AND PRINT BLOCK */}
                            <div className="space-y-3">
                              <div className="flex justify-between items-baseline">
                                <span className="block text-xs font-mono font-bold text-[#8E5A3C] uppercase">
                                  4. Bordereau d'Envoi Haute Résolution
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setShIsLabelGenerated(true)}
                                  className="text-[11px] font-mono text-[#8E5A3C] hover:underline cursor-pointer font-bold"
                                >
                                  Générer l'Étiquette 🖨️
                                </button>
                              </div>

                              {shIsLabelGenerated ? (
                                <div className="bg-white border-2 border-dashed border-[#4A3225] p-5 rounded-2xl relative space-y-4 shadow-sm font-sans mx-auto max-w-sm">
                                  
                                  {/* Postal Header */}
                                  <div className="flex justify-between items-start border-b-2 border-black pb-2">
                                    <div className="font-extrabold uppercase text-xs sm:text-sm tracking-tighter">
                                      {shCarrier === 'laposte' ? 'LA POSTE - LETTRE' : 'COLISSIMO'}
                                    </div>
                                    <div className="border border-black px-2 py-0.5 text-[9px] font-mono text-right font-bold">
                                      {shCarrier === 'monde' ? 'FR - INT / CN23' : 'FR - METROPOLE'}
                                    </div>
                                  </div>

                                  {/* Sender and Recipient */}
                                  <div className="grid grid-cols-2 gap-4 text-[10px]">
                                    <div className="space-y-1">
                                      <span className="font-bold text-[#8A7968] block">EXPÉDITEUR :</span>
                                      <div className="leading-tight font-extrabold text-[#4A3225]">
                                        <div>Patrice Lequime</div>
                                        <div>La Bretagne Libérée</div>
                                        <div>29000 Brest, FR</div>
                                      </div>
                                    </div>
                                    <div className="space-y-1 text-right">
                                      <span className="font-bold text-[#8A7968] block text-right">DESTINATAIRE :</span>
                                      <div className="leading-tight font-black text-black text-xs">
                                        <div>{currentOrder.customerName}</div>
                                        <div>{currentOrder.customerEmail}</div>
                                        <div className="uppercase mt-0.5 tracking-wide text-[10px] bg-black text-white px-1 py-0.2 rounded-xs inline-block">
                                          {currentOrder.destinationCountry || 'FRANCE'}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Weight, Price details */}
                                  <div className="bg-[#FAF6F0] p-2 text-[9px] font-mono flex justify-between uppercase">
                                    <span>Poids : <strong>{totalWeight} g</strong></span>
                                    <span>Poste : <strong>{shippingCost.toFixed(2)} €</strong></span>
                                  </div>

                                  {/* Dynamic CSS representation of Barcode scan patterns */}
                                  <div className="space-y-1 pt-1">
                                    <div className="h-10 bg-black flex space-x-[2px] items-stretch justify-center px-1">
                                      <div className="w-[3px] bg-white h-full" />
                                      <div className="w-[1px] bg-white h-full" />
                                      <div className="w-[4px] bg-white h-full" />
                                      <div className="w-[2px] bg-white h-full" />
                                      <div className="w-[5px] bg-white h-full" />
                                      <div className="w-[1px] bg-white h-full" />
                                      <div className="w-[2px] bg-white h-full" />
                                      <div className="w-[3px] bg-white h-full" />
                                      <div className="w-[1px] bg-white h-full" />
                                      <div className="w-[4px] bg-white h-full" />
                                      <div className="w-[2px] bg-white h-full" />
                                      <div className="w-[5px] bg-white h-full" />
                                      <div className="w-[1px] bg-white h-full" />
                                      <div className="w-[2px] bg-white h-full" />
                                    </div>
                                    <div className="text-center font-mono text-[9px] tracking-widest text-[#4A3225]">
                                      ({trackingMock})
                                    </div>
                                  </div>

                                  {/* Print simulator button */}
                                  <div className="pt-2 border-t border-dashed border-[#E6DFD3] flex justify-between items-center">
                                    <span className="text-[10px] text-emerald-700 italic font-mono">
                                      {shLabelPrintedOnce ? 'Étiquette imprimée ✔' : 'Prêt pour l\'imprimeur'}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setShLabelPrintedOnce(true);
                                        setShCustomTracking(trackingMock);
                                        // Trigger a visual sound alert
                                        alert(`🖨️ Terminal d'Impression : Envoi du bordereau postal (${trackingMock}) vers l'imprimante thermique en cours !`);
                                      }}
                                      className="px-2.5 py-1.5 bg-[#8E5A3C] hover:bg-[#724831] text-white text-[10px] font-mono font-bold rounded shadow-xs cursor-pointer"
                                    >
                                      🖨️ Simuler l'Impression
                                    </button>
                                  </div>

                                </div>
                              ) : (
                                <div className="border border-dashed border-[#E6DFD3] py-8 text-center bg-[#FAF6F0]/40 rounded-2xl">
                                  <p className="text-xs text-[#8A7968] font-mono">
                                    Veuillez cliquer sur <strong className="text-[#8E5A3C]">Générer l'Étiquette</strong> ci-dessus pour prévisualiser le colis.
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* STEP 5: FINAL EXPEDITION CONFIRMATION */}
                            <button
                              type="button"
                              onClick={handleShippingSubmit}
                              disabled={shIsLabelGenerated && !shLabelPrintedOnce}
                              className={`w-full py-3.5 rounded-xl font-sans font-extrabold text-[#FAF6F0] shadow-sm tracking-wide text-xs sm:text-sm transition-all focus:outline-none cursor-pointer ${
                                shIsLabelGenerated && !shLabelPrintedOnce 
                                  ? 'bg-amber-600 cursor-not-allowed opacity-80' 
                                  : 'bg-[#2E4A3F] hover:bg-[#1E3129]'
                              }`}
                            >
                              {shIsLabelGenerated && !shLabelPrintedOnce 
                                ? '⚠️ IMPRIMEZ D\'ABORD L\'ÉTIQUETTE CI-DESSUS POUR COLLER AU CARTON' 
                                : `✅ FINALISER L'EXPÉDITION & DEBITER LE STOCK (${shippingCost.toFixed(2)} € enregistré)`
                              }
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })() : (
                    <div className="bg-[#FAF6F0]/50 border border-dashed border-[#D1C2A5]/60 p-6 rounded-2xl text-center">
                      <p className="text-xs text-[#8A7968] font-mono leading-relaxed">
                        Aucune commande en cours d'emballage. Sélectionnez une commande dans la boîte de choix au-dessus pour activer le terminal d'impression postale ou cliquez sur <strong className="text-[#2E4A3F]">➕ Demo</strong> pour en simuler une !
                      </p>
                    </div>
                  )}

                </div>

              </div>

            </motion.div>
          )}

          {/* TAB 6: CUSTOMIZE BOOK DESIGN */}
          {activeTab === 'book' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="bg-white border border-[#E6DFD3] rounded-3xl p-6 shadow-xs">
                <div className="flex items-center space-x-3 border-b border-[#FAF6F0] pb-4 mb-6">
                  <div className="p-2.5 bg-[#8E5A3C]/10 rounded-xl text-[#8E5A3C]">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#4A3225]">
                      Atelier d'Art & Design du Livre "69"
                    </h3>
                    <p className="text-xs text-[#8A7968] font-mono">
                      Personnalisez l'illustration de couverture, la couleur thématique et les textes officiels du livre présentés aux acheteurs.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left: Interactive Live 3D Miniature Preview */}
                  <div className="lg:col-span-5 flex flex-col items-center p-4 bg-[#FAF6F0]/40 rounded-2xl border border-[#E6DFD3] space-y-4">
                    <span className="text-[10px] font-mono text-[#8E5A3C] font-extrabold uppercase tracking-widest bg-amber-100/60 px-2.5 py-1 rounded">
                      Aperçu en Direct ({isPreviewFlipped ? "Verso / 4e" : "Recto / 1er"})
                    </span>

                    {/* Miniature 3D Book wrapper */}
                    <div className="relative w-64 h-[384px] perspective-1000 group">
                      <motion.div
                        className="w-full h-full relative"
                        style={{ transformStyle: 'preserve-3d' }}
                        animate={{ rotateY: isPreviewFlipped ? 180 : 0 }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                      >
                        
                        {/* 1ère de COUVERTURE (FRONT PREVIEW) */}
                        <div 
                          className="absolute inset-0 w-full h-full rounded-xl shadow-lg border-[8px] bg-white flex flex-col justify-between overflow-hidden"
                          style={{ 
                            backfaceVisibility: 'hidden', 
                            WebkitBackfaceVisibility: 'hidden',
                            borderColor: bookConfig.coverBorderColor 
                          }}
                        >
                          {/* Background image */}
                          <div className="absolute inset-0 z-0 select-none bg-slate-900">
                            <img 
                              src={getCoverImageSrc(bookConfig.coverImageUrl)} 
                              alt="Aperçu Couverture" 
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover opacity-85 brightness-90" 
                            />
                          </div>

                          {/* Author overlay */}
                          <div className="relative z-10 p-3 pt-4 text-center text-white font-mono select-none pointer-events-none">
                            <p className="text-[8px] tracking-[0.2em] font-medium text-white/95 truncate">
                              {bookConfig.authorName || "PATRICE LEQUIME"}
                            </p>
                            <p className="text-[6.5px] tracking-normal font-bold text-white uppercase mt-1 drop-shadow-sm bg-black/40 py-0.5 px-1 rounded inline-block max-w-full truncate">
                              {bookConfig.topBadge || "69 ANS • 69 000 KM • 69 HEURES DE VOL"}
                            </p>
                          </div>

                          {/* Center Title overlay */}
                          <div className="relative z-10 text-center my-auto select-none pointer-events-none">
                            <h1 className="font-serif text-[64px] font-black tracking-tighter text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] leading-none">
                              {bookConfig.bookTitle || "69"}
                            </h1>
                            <h2 className="font-sans font-black text-[14px] tracking-[0.25em] text-white mt-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
                              {bookConfig.bookSubtitle || "C'EST POSSIBLE"}
                            </h2>
                          </div>

                          {/* Bottom line */}
                          <div className="relative z-10 p-3 pb-4 text-center text-white font-mono select-none pointer-events-none">
                            <p className="text-[6.5px] tracking-wide text-[#FFF] font-bold uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] bg-black/20 py-0.5 px-1 rounded truncate">
                              {bookConfig.bottomLine || "69 LIEUX ÉTONNANTS..."}
                            </p>
                          </div>
                        </div>

                        {/* 4ème de COUVERTURE (BACK PREVIEW) */}
                        <div 
                          className="absolute inset-0 w-full h-full rounded-xl shadow-lg border-[8px] bg-white p-4 flex flex-col justify-between overflow-hidden"
                          style={{ 
                            backfaceVisibility: 'hidden', 
                            WebkitBackfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)',
                            borderColor: bookConfig.coverBorderColor
                          }}
                        >
                          {/* Big overlay text */}
                          <div className="absolute -right-12 top-1/2 -translate-y-1/2 w-28 h-28 rounded-full bg-gray-100 flex items-center justify-start pl-2 border border-gray-200 select-none pointer-events-none">
                            <span className="font-sans font-black text-3xl opacity-10" style={{ color: bookConfig.coverBorderColor }}>
                              {bookConfig.bookTitle || "69"}
                            </span>
                          </div>

                          {/* Header */}
                          <div className="text-center z-10">
                            <p className="font-sans font-bold text-[8px] uppercase tracking-wide truncate" style={{ color: bookConfig.coverBorderColor }}>
                              {bookConfig.backAboutSubtitle}
                            </p>
                            <h3 className="font-sans font-black text-[13px] tracking-wide mt-1 border-b pb-1" style={{ color: bookConfig.coverBorderColor, borderColor: `${bookConfig.coverBorderColor}30` }}>
                              {bookConfig.backAboutTitle}
                            </h3>
                          </div>

                          {/* Description */}
                          <div className="my-auto z-10 text-left">
                            <div className="text-[7.5px] font-serif italic text-gray-800 leading-normal line-clamp-6 whitespace-pre-line">
                              {bookConfig.backAboutContent}
                            </div>
                          </div>

                          {/* Quote */}
                          <div className="z-10 bg-amber-50/50 border-l-2 p-1.5 text-center select-none" style={{ borderLeftColor: bookConfig.coverBorderColor }}>
                            <p className="font-serif italic text-[7px] text-gray-900 leading-tight line-clamp-2">
                              {bookConfig.backQuote}
                            </p>
                          </div>

                          {/* Footer */}
                          <div className="z-10 border-t border-gray-100 pt-1.5 text-center">
                            <p className="font-sans font-black text-[8px] tracking-widest truncate" style={{ color: bookConfig.coverBorderColor }}>
                              {bookConfig.authorName}
                            </p>
                            <p className="font-mono text-[6px] text-gray-500 tracking-wider mt-0.5 truncate">
                              {bookConfig.topBadge}
                            </p>
                          </div>

                        </div>

                      </motion.div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsPreviewFlipped(!isPreviewFlipped)}
                      className="px-4 py-1.5 bg-[#8E5A3C] hover:bg-[#724831] text-white text-xs font-mono font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      🔄 Retourner le Livre
                    </button>
                  </div>

                  {/* Right: Form inputs */}
                  <form onSubmit={handleSaveBookConfig} className="lg:col-span-7 space-y-6">
                    {/* Visual feedback banner */}
                    {configSaveSuccess && (
                      <div className="bg-emerald-50 border border-emerald-300 p-3.5 rounded-xl text-emerald-900 flex items-center space-x-2 text-xs font-mono">
                        <Check className="w-4 h-4 text-emerald-600 animate-bounce shrink-0" />
                        <span>Félicitations Patrice ! Les modifications ont été enregistrées avec succès et sont visibles en vitrine ! ✓</span>
                      </div>
                    )}

                    {/* Section 1: Illustration & Couleur */}
                    <div className="p-4 bg-[#FCFAF6] rounded-2xl border border-[#E6DFD3]/60 space-y-4">
                      <h4 className="text-xs font-mono font-extrabold text-[#8E5A3C] uppercase tracking-wider flex items-center gap-1.5">
                        <Image className="w-3.5 h-3.5" />
                        1. Visuel de couverture & Thème de couleur
                      </h4>

                      {/* Cover Image Choice */}
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-[#4A3225]">
                          Image de fond de la couverture :
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: "preset-miyajima", label: "Temple de Miyajima", sub: "⭐ Votre photo originale", src: miyajimaCoverImg },
                            { id: "preset-fuji",     label: "Mont Fuji Sacré",    sub: "Illustration Neige",     src: "https://images.unsplash.com/photo-1578637387939-43c525550085?auto=format&fit=crop&q=80&w=300" },
                            { id: "preset-tokyo",    label: "Tokyo de Nuit",       sub: "Néon & Gratte-ciel",    src: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=300" },
                            { id: "preset-kyoto",    label: "Arashiyama",          sub: "Bambouseraie de Kyoto", src: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=300" },
                          ].map(preset => (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => setBookConfig({ ...bookConfig, coverImageUrl: preset.id })}
                              className={`relative rounded-xl border-2 overflow-hidden cursor-pointer transition-all h-24 ${
                                bookConfig.coverImageUrl === preset.id
                                  ? 'border-[#8E5A3C] shadow-md'
                                  : 'border-[#E6DFD3] hover:border-[#8E5A3C]/50'
                              }`}
                            >
                              <img src={preset.src} alt={preset.label} className="w-full h-full object-cover brightness-75" />
                              <div className="absolute inset-0 flex flex-col justify-end p-2 bg-gradient-to-t from-black/70 to-transparent">
                                <span className="text-white text-[10px] font-bold font-mono leading-tight">{preset.label}</span>
                                <span className="text-white/70 text-[9px] font-mono">{preset.sub}</span>
                              </div>
                              {bookConfig.coverImageUrl === preset.id && (
                                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#8E5A3C] flex items-center justify-center">
                                  <span className="text-white text-[10px] font-bold">✓</span>
                                </div>
                              )}
                            </button>
                          ))}
                        </div>

                        {/* Custom URL Option */}
                        <div className="pt-2">
                          <label className="block text-[11px] font-mono font-semibold text-[#8A7968] mb-1">
                            Ou saisissez n'importe quelle adresse URL d'image personnalisée :
                          </label>
                          <input
                            type="text"
                            placeholder="https://images.unsplash.com/photo-..."
                            value={bookConfig.coverImageUrl.startsWith("preset-") ? "" : bookConfig.coverImageUrl}
                            onChange={(e) => {
                              const val = e.target.value.trim();
                              setBookConfig({ ...bookConfig, coverImageUrl: val || "preset-miyajima" });
                            }}
                            className="w-full bg-white border border-[#D1C2A5] px-3 py-2 rounded-lg text-xs font-mono text-[#4A3225] focus:outline-none focus:ring-1 focus:ring-[#8E5A3C]"
                          />
                        </div>
                      </div>

                      {/* Border & Accent Theme Color Picker */}
                      <div className="space-y-2 pt-2">
                        <label className="block text-xs font-semibold text-[#4A3225] flex items-center gap-1">
                          <Palette className="w-3.5 h-3.5" /> Couleur thématique du cadre :
                        </label>
                        <div className="flex flex-wrap gap-2 items-center">
                          {[
                            { name: "Rouge Breton", hex: "#FD3D63" },
                            { name: "Indigo Royal", hex: "#4F46E5" },
                            { name: "Vert Pinène", hex: "#2D493E" },
                            { name: "Anthracite", hex: "#1E293B" },
                            { name: "Orange Impérial", hex: "#D97706" }
                          ].map(c => (
                            <button
                              key={c.hex}
                              type="button"
                              onClick={() => setBookConfig({ ...bookConfig, coverBorderColor: c.hex })}
                              className="px-2.5 py-1.5 rounded-lg text-[10px] font-mono border flex items-center space-x-1.5 bg-white hover:bg-gray-50 cursor-pointer"
                              style={{ borderColor: bookConfig.coverBorderColor === c.hex ? c.hex : '#E6DFD3' }}
                            >
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.hex }} />
                              <span className={bookConfig.coverBorderColor === c.hex ? "font-bold text-gray-900" : "text-gray-500"}>
                                {c.name}
                              </span>
                            </button>
                          ))}
                          
                          {/* Custom Hex Color code */}
                          <input
                            type="text"
                            placeholder="#HEX"
                            value={bookConfig.coverBorderColor}
                            onChange={(e) => setBookConfig({ ...bookConfig, coverBorderColor: e.target.value })}
                            className="w-20 bg-white border border-[#D1C2A5] px-2 py-1 rounded text-xs font-mono text-[#4A3225] text-center focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Textes de la 1ère de Couverture */}
                    <div className="p-4 bg-[#FCFAF6] rounded-2xl border border-[#E6DFD3]/60 space-y-4">
                      <h4 className="text-xs font-mono font-extrabold text-[#8E5A3C] uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        2. Textes imprimés de la 1ère de Couverture (Recto)
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-[11px] font-mono font-bold text-[#8A7968] uppercase">Nom d'Auteur :</label>
                          <input
                            type="text"
                            required
                            value={bookConfig.authorName}
                            onChange={(e) => setBookConfig({ ...bookConfig, authorName: e.target.value })}
                            className="w-full bg-white border border-[#D1C2A5] px-3 py-1.5 rounded-lg text-xs text-[#4A3225] focus:outline-none font-sans"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[11px] font-mono font-bold text-[#8A7968] uppercase">Titre du livre (Gros) :</label>
                          <input
                            type="text"
                            required
                            value={bookConfig.bookTitle}
                            onChange={(e) => setBookConfig({ ...bookConfig, bookTitle: e.target.value })}
                            className="w-full bg-white border border-[#D1C2A5] px-3 py-1.5 rounded-lg text-xs font-bold text-[#4A3225] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-mono font-bold text-[#8A7968] uppercase">Sous-titre (Dessous) :</label>
                        <input
                          type="text"
                          required
                          value={bookConfig.bookSubtitle}
                          onChange={(e) => setBookConfig({ ...bookConfig, bookSubtitle: e.target.value })}
                          className="w-full bg-white border border-[#D1C2A5] px-3 py-1.5 rounded-lg text-xs text-[#4A3225] focus:outline-none font-sans"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-[11px] font-mono font-bold text-[#8A7968] uppercase">Bandeau Supérieur (Stats) :</label>
                          <input
                            type="text"
                            required
                            value={bookConfig.topBadge}
                            onChange={(e) => setBookConfig({ ...bookConfig, topBadge: e.target.value })}
                            className="w-full bg-white border border-[#D1C2A5] px-3 py-1.5 rounded-lg text-xs text-[#4A3225] focus:outline-none font-sans"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[11px] font-mono font-bold text-[#8A7968] uppercase">Bandeau Inférieur (Slogan) :</label>
                          <input
                            type="text"
                            required
                            value={bookConfig.bottomLine}
                            onChange={(e) => setBookConfig({ ...bookConfig, bottomLine: e.target.value })}
                            className="w-full bg-white border border-[#D1C2A5] px-3 py-1.5 rounded-lg text-xs text-[#4A3225] focus:outline-none font-sans"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Textes de la 4ème de Couverture */}
                    <div className="p-4 bg-[#FCFAF6] rounded-2xl border border-[#E6DFD3]/60 space-y-4">
                      <h4 className="text-xs font-mono font-extrabold text-[#8E5A3C] uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        3. Textes imprimés de la 4ème de Couverture (Verso)
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-[11px] font-mono font-bold text-[#8A7968] uppercase">Accroche de Présentation :</label>
                          <input
                            type="text"
                            required
                            value={bookConfig.backAboutSubtitle}
                            onChange={(e) => setBookConfig({ ...bookConfig, backAboutSubtitle: e.target.value })}
                            className="w-full bg-white border border-[#D1C2A5] px-3 py-1.5 rounded-lg text-xs text-[#4A3225] focus:outline-none font-sans"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[11px] font-mono font-bold text-[#8A7968] uppercase">Titre de Présentation :</label>
                          <input
                            type="text"
                            required
                            value={bookConfig.backAboutTitle}
                            onChange={(e) => setBookConfig({ ...bookConfig, backAboutTitle: e.target.value })}
                            className="w-full bg-white border border-[#D1C2A5] px-3 py-1.5 rounded-lg text-xs text-[#4A3225] focus:outline-none font-sans"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-mono font-bold text-[#8A7968] uppercase">Résumé Littéraire (Corps de texte) :</label>
                        <textarea
                          rows={6}
                          required
                          value={bookConfig.backAboutContent}
                          onChange={(e) => setBookConfig({ ...bookConfig, backAboutContent: e.target.value })}
                          className="w-full bg-white border border-[#D1C2A5] px-3 py-2 rounded-lg text-xs text-[#4A3225] focus:outline-none font-sans leading-relaxed whitespace-pre-wrap"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-mono font-bold text-[#8A7968] uppercase">Citation de conclusion (Bandeau bas) :</label>
                        <input
                          type="text"
                          required
                          value={bookConfig.backQuote}
                          onChange={(e) => setBookConfig({ ...bookConfig, backQuote: e.target.value })}
                          className="w-full bg-white border border-[#D1C2A5] px-3 py-1.5 rounded-lg text-xs italic text-[#4A3225] focus:outline-none font-sans"
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="button"
                      onClick={handleSaveBookConfig as any}
                      disabled={isSavingConfig}
                      className="w-full py-4 bg-[#2D493E] hover:bg-[#1E332B] disabled:opacity-50 text-white font-sans font-bold text-sm rounded-xl tracking-wider uppercase shadow-xs transition-colors cursor-pointer"
                    >
                      {isSavingConfig ? 'Enregistrement...' : '💾 Sauvegarder les modifications du Livre'}
                    </button>

                  </form>

                </div>

              </div>
            </motion.div>
          )}

        </div>

      </div>
    </div>
  );
}
