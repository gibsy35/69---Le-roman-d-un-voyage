import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Shuffle, 
  Image as ImageIcon, 
  BookOpen, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  X, 
  Lock, 
  MapPin, 
  Calendar, 
  Compass, 
  Quote, 
  Eye, 
  Camera,
  Layers,
  Award,
  Database,
  Upload,
  CheckCircle2,
  AlertCircle,
  Pencil,
  Check,
  RotateCcw,
  Edit3,
  Trash2,
  Undo2
} from 'lucide-react';
// @ts-ignore
import miyajimaCoverImg from './miyajima_cover_1781530821053.jpg';
import { ARCHIVE_SITUATIONS, ArchiveSituation } from './situations69';

export type { ArchiveSituation };
export { ARCHIVE_SITUATIONS };

// Helper to resolve preset and local photo assets
export const resolvePhotoUrl = (url?: string) => {
  if (!url) return '';
  if (url === 'preset-miyajima' || url.includes('miyajima_cover')) return miyajimaCoverImg;
  return url;
};

export interface DiscoveryAggregatorProps {
  forceEditMode?: boolean;
  onOpenAuthModal?: () => void;
}

export default function DiscoveryAggregator({ forceEditMode = false, onOpenAuthModal }: DiscoveryAggregatorProps) {
  const [situations, setSituations] = useState<ArchiveSituation[]>(ARCHIVE_SITUATIONS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [lightboxSituation, setLightboxSituation] = useState<ArchiveSituation | null>(null);
  const [isShuffling, setIsShuffling] = useState<boolean>(false);

  // Authentication check for Patrice
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('patrice_auth') === 'true' || sessionStorage.getItem('patrice_auth') === 'true';
  });

  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(localStorage.getItem('patrice_auth') === 'true' || sessionStorage.getItem('patrice_auth') === 'true');
    };
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const canEdit = forceEditMode || isAuthenticated;
  const [customPhotos, setCustomPhotos] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('manuscript_custom_photos');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // State for papa's custom titles
  const [customTitles, setCustomTitles] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('manuscript_custom_titles');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [tempTitleInput, setTempTitleInput] = useState<string>('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // State for deleted/retired steps & confirmation modal
  const [deletedIds, setDeletedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('manuscript_deleted_situations');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showTrashModal, setShowTrashModal] = useState<boolean>(false);
  const [confirmDeleteSit, setConfirmDeleteSit] = useState<ArchiveSituation | null>(null);

  const requestDeleteSituation = (sit: ArchiveSituation) => {
    setConfirmDeleteSit(sit);
  };

  const executeDeleteSituation = (sit: ArchiveSituation) => {
    const nextDeleted = [...deletedIds, sit.id];
    setDeletedIds(nextDeleted);
    try {
      localStorage.setItem('manuscript_deleted_situations', JSON.stringify(nextDeleted));
    } catch (err) {
      console.error("Error saving deleted situations:", err);
    }

    // Attempt backend delete
    fetch(`/api/situations/${sit.id}`, { method: 'DELETE' }).catch(() => {});

    setConfirmDeleteSit(null);
    setSaveSuccessMsg(`Étape retirée du voyage (Page ${sit.pageNum} : ${sit.location})`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  const handleRestoreSituation = (sitId: string) => {
    const nextDeleted = deletedIds.filter(id => id !== sitId);
    setDeletedIds(nextDeleted);
    try {
      localStorage.setItem('manuscript_deleted_situations', JSON.stringify(nextDeleted));
    } catch (err) {
      console.error(err);
    }
    const sit = ARCHIVE_SITUATIONS.find(s => s.id === sitId);
    setSaveSuccessMsg(`Étape restaurée : "${sit ? getSituationTitle(sit) : sitId}"`);
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  const handleRestoreAllSituations = () => {
    setDeletedIds([]);
    try {
      localStorage.setItem('manuscript_deleted_situations', JSON.stringify([]));
    } catch (err) {
      console.error(err);
    }
    setShowTrashModal(false);
    setSaveSuccessMsg(`Toutes les étapes du voyage ont été restaurées !`);
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  const getSituationTitle = (sit?: ArchiveSituation | null) => {
    if (!sit) return '';
    return customTitles[sit.id] || sit.chapterTitle;
  };

  const handleStartEditingTitle = (sit: ArchiveSituation) => {
    setEditingTitleId(sit.id);
    setTempTitleInput(getSituationTitle(sit));
  };

  const handleSaveTitle = async (sitId: string) => {
    const trimmed = tempTitleInput.trim();
    if (!trimmed) return;

    const nextTitles = { ...customTitles, [sitId]: trimmed };
    setCustomTitles(nextTitles);
    try {
      localStorage.setItem('manuscript_custom_titles', JSON.stringify(nextTitles));
    } catch (err) {
      console.error("Error saving title to localStorage:", err);
    }

    setSituations(prev => prev.map(s => s.id === sitId ? { ...s, chapterTitle: trimmed } : s));

    try {
      await fetch(`/api/situations/${sitId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterTitle: trimmed })
      });
    } catch (err) {
      console.error("API error updating situation title:", err);
    }

    setEditingTitleId(null);
    setSaveSuccessMsg(`Titre mis à jour : "${trimmed}"`);
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  const handleResetTitle = async (sit: ArchiveSituation) => {
    const nextTitles = { ...customTitles };
    delete nextTitles[sit.id];
    setCustomTitles(nextTitles);
    try {
      localStorage.setItem('manuscript_custom_titles', JSON.stringify(nextTitles));
    } catch (err) {
      console.error(err);
    }

    const orig = ARCHIVE_SITUATIONS.find(a => a.id === sit.id);
    const origTitle = orig?.chapterTitle || sit.chapterTitle;

    setSituations(prev => prev.map(s => s.id === sit.id ? { ...s, chapterTitle: origTitle } : s));

    try {
      await fetch(`/api/situations/${sit.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterTitle: origTitle })
      });
    } catch (err) {
      console.error(err);
    }

    setEditingTitleId(null);
    setSaveSuccessMsg(`Titre réinitialisé à l'intitulé original.`);
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  const handlePhotoUpload = (situationId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        setCustomPhotos(prev => {
          const next = { ...prev, [situationId]: dataUrl };
          try {
            localStorage.setItem('manuscript_custom_photos', JSON.stringify(next));
          } catch (err) {
            console.error("Storage error:", err);
          }
          return next;
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const getPhotoSrc = (sit?: ArchiveSituation) => {
    if (!sit) return '';
    if (customPhotos[sit.id]) return customPhotos[sit.id];
    if (sit.photoUrl) return resolvePhotoUrl(sit.photoUrl);
    return '';
  };

  // Fetch all 23 situations from backend API database on mount
  useEffect(() => {
    fetch('/api/situations')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setSituations(data);
        }
      })
      .catch((err) => console.error('Error loading situations from backend API:', err));
  }, []);

  // Filtered dataset based on selection (excluding deleted steps)
  const filteredSituations = useMemo(() => {
    return situations.filter((sit) => {
      if (deletedIds.includes(sit.id)) return false;
      const matchCat = selectedCategory === 'all' || sit.category === selectedCategory;
      const matchCountry = selectedCountry === 'all' || sit.country === selectedCountry;
      return matchCat && matchCountry;
    });
  }, [situations, deletedIds, selectedCategory, selectedCountry]);

  // Handle pagination index safely
  const activeSituation = useMemo(() => {
    if (filteredSituations.length === 0) return situations[0] || ARCHIVE_SITUATIONS[0];
    const safeIdx = Math.min(currentIndex, filteredSituations.length - 1);
    return filteredSituations[safeIdx] || filteredSituations[0];
  }, [situations, filteredSituations, currentIndex]);

  const handleNext = () => {
    if (filteredSituations.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % filteredSituations.length);
  };

  const handlePrev = () => {
    if (filteredSituations.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + filteredSituations.length) % filteredSituations.length);
  };

  const handleRandomShuffle = () => {
    setIsShuffling(true);
    let count = 0;
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * filteredSituations.length);
      setCurrentIndex(randomIdx);
      count++;
      if (count >= 6) {
        clearInterval(interval);
        setIsShuffling(false);
      }
    }, 80);
  };

  return (
    <div className="bg-[#FAF7F2] border border-[#E6DFD3] rounded-3xl p-6 sm:p-10 shadow-xs text-left">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#E6DFD3] pb-6 mb-8 gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-[#8E5A3C]/10 text-[#8E5A3C] px-3 py-1 rounded-full text-xs font-mono font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Agrégateur de Découverte & Archives</span>
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#4A3225] tracking-tight">
            Feuilleter le Roman par Situations & Photos
          </h3>
          <p className="text-xs sm:text-sm text-[#8A7968] font-mono mt-1 max-w-2xl leading-relaxed">
            <strong>100% Contenu d'Origine :</strong> Tous les textes, citations et anecdotes affichés ci-dessous sont extraits mot à mot du manuscrit original de Patrice (598 pages) avec l'indication exacte de la page source. Aucun texte n'est inventé par IA.
          </p>
        </div>

        {/* Protection Warning Badge */}
        <div className="bg-amber-50/90 border border-amber-200/80 p-3 rounded-xl flex items-start space-x-2.5 max-w-sm shrink-0">
          <Lock className="w-4 h-4 text-[#8E5A3C] mt-0.5 shrink-0" />
          <p className="text-[11px] text-[#6B5A49] font-sans leading-tight">
            <strong>Accès Protégé :</strong> Seuls des extraits et moments choisis sont consultation libre. Le roman complet est préservé pour les détenteurs de l'édition intégrale.
          </p>
        </div>
      </div>

      {/* Control Bar: Filters & Random Generator */}
      <div className="bg-white border border-[#E6DFD3] rounded-2xl p-4 mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs">
        {/* Category & Country Selectors */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center space-x-1.5 text-xs font-mono text-[#8A7968] font-bold mr-1">
            <Filter className="w-3.5 h-3.5 text-[#8E5A3C]" />
            <span>Filtrer :</span>
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentIndex(0);
            }}
            className="bg-[#FCFAF6] border border-[#E1DBCE] text-[#4A3225] text-xs font-mono font-bold py-2 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8E5A3C]/50 cursor-pointer"
          >
            <option value="all">🌈 Toutes les Thématiques</option>
            <option value="4x4">🤠 Péripéties & 4x4</option>
            <option value="rencontres">🤝 Rencontres & Hospitalité</option>
            <option value="volcans">🌋 Volcans & Panoramas</option>
            <option value="transports">✈️ Transports & Coups de Stress</option>
            <option value="rituels">🍷 Rituels de Daron & Humour</option>
            <option value="nature">🦘 Faune & Nature Sauvage</option>
          </select>

          <select
            value={selectedCountry}
            onChange={(e) => {
              setSelectedCountry(e.target.value);
              setCurrentIndex(0);
            }}
            className="bg-[#FCFAF6] border border-[#E1DBCE] text-[#4A3225] text-xs font-mono font-bold py-2 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8E5A3C]/50 cursor-pointer"
          >
            <option value="all">🌍 Tous les Pays</option>
            <option value="France">🇫🇷 France</option>
            <option value="Hong Kong">🇭🇰 Hong Kong</option>
            <option value="Chine">🇨🇳 Chine</option>
            <option value="Nouvelle-Zélande">🇳🇿 Nouvelle-Zélande</option>
            <option value="Australie">🇦🇺 Australie</option>
            <option value="Indonésie">🇮🇩 Indonésie</option>
            <option value="Japon">🇯🇵 Japon</option>
            <option value="Taïwan">🇹🇼 Taïwan</option>
          </select>
        </div>

        {/* Randomizer & Trash Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {canEdit && deletedIds.length > 0 && (
            <button
              onClick={() => setShowTrashModal(true)}
              className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3.5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center space-x-1.5 shadow-2xs cursor-pointer"
              title="Voir et restaurer les étapes retirées du voyage"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
              <span>Corbeille ({deletedIds.length})</span>
            </button>
          )}

          <span className="text-xs font-mono text-[#8A7968] hidden sm:inline">
            {filteredSituations.length} étape{filteredSituations.length > 1 ? 's' : ''} disponible{filteredSituations.length > 1 ? 's' : ''}
          </span>
          <button
            onClick={handleRandomShuffle}
            disabled={isShuffling || filteredSituations.length <= 1}
            className="w-full sm:w-auto bg-[#8E5A3C] hover:bg-[#72462E] text-white px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center space-x-2 shadow-sm hover:shadow cursor-pointer disabled:opacity-50"
          >
            <Shuffle className={`w-4 h-4 ${isShuffling ? 'animate-spin' : ''}`} />
            <span>Générer une Situation Aléatoire</span>
          </button>
        </div>
      </div>

      {/* Main Aggregator Display Card */}
      {activeSituation && (
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSituation.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="bg-white border border-[#E6DFD3] rounded-3xl p-6 sm:p-8 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center overflow-hidden"
            >
              {/* Left Column: Linked Polaroid Photo Archive */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <div 
                  onClick={() => setLightboxSituation(activeSituation)}
                  className="group relative bg-[#FCFAF6] border-8 border-white p-3 pb-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform -rotate-1 hover:rotate-0 cursor-pointer w-full max-w-sm"
                >
                  {/* Washi tape accent on top */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-[#EBDCCB]/70 border border-[#D1BFA9]/50 transform rotate-1 rounded-xs z-20 pointer-events-none shadow-2xs" />

                  {/* Photo container */}
                  {getPhotoSrc(activeSituation) ? (
                    <div className="relative aspect-4/3 rounded-lg overflow-hidden bg-gray-100 group">
                      <img 
                        src={getPhotoSrc(activeSituation)} 
                        alt={activeSituation.photoCaption}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      {/* Hover Overlay Zoom Indicator */}
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white space-x-2 font-mono text-xs font-bold">
                        <Maximize2 className="w-5 h-5" />
                        <span>Agrandir la Photo</span>
                      </div>

                      {/* Category Tag overlay */}
                      <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-mono px-2.5 py-1 rounded-full backdrop-blur-xs font-bold">
                        {activeSituation.categoryLabel}
                      </div>

                      {/* Replace photo button */}
                      <label 
                        className="absolute bottom-2 right-2 bg-white/90 hover:bg-white text-[#4A3225] text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg shadow cursor-pointer transition-all flex items-center gap-1 z-20"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Upload className="w-3 h-3 text-[#8E5A3C]" />
                        <span>Changer photo p. {activeSituation.pageNum}</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handlePhotoUpload(activeSituation.id, file);
                          }} 
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="relative aspect-4/3 rounded-lg border-2 border-dashed border-[#C5B49D] bg-[#FAF6F0] p-4 flex flex-col items-center justify-center text-center group hover:bg-[#F5EFE6] transition-colors">
                      <div className="w-12 h-12 rounded-full bg-[#EBDCCB] text-[#8E5A3C] flex items-center justify-center mb-2 shadow-xs">
                        <Camera className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-serif font-bold text-[#4A3225]">
                        Photo du Livre (Page {activeSituation.pageNum})
                      </p>
                      <p className="text-[10px] font-mono text-[#8A7968] mt-0.5">
                        {activeSituation.location} • {activeSituation.date}
                      </p>
                      <label 
                        className="mt-3 bg-[#8E5A3C] hover:bg-[#72462E] text-white text-[11px] font-mono font-bold px-3 py-1.5 rounded-xl shadow transition-all flex items-center gap-1.5 cursor-pointer z-20"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Importer la vraie photo p. {activeSituation.pageNum}</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handlePhotoUpload(activeSituation.id, file);
                          }} 
                        />
                      </label>
                    </div>
                  )}

                  {/* Polaroid caption & Metadata */}
                  <div className="mt-3 text-center">
                    <p className="font-serif italic text-xs text-[#5C4D3C] line-clamp-2 px-1">
                      {activeSituation.photoCaption}
                    </p>
                    <div className="mt-2 flex items-center justify-center space-x-1.5 text-[9px] font-mono text-gray-400 border-t border-gray-100 pt-2">
                      <Camera className="w-3 h-3 text-[#8E5A3C]" />
                      <span>{activeSituation.cameraInfo}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Linked Text Excerpt & Context */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-6 text-left">
                {/* Meta details */}
                <div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-mono text-[#8A7968] mb-2">
                    <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-md font-bold flex items-center gap-1">
                      <Database className="w-3.5 h-3.5 text-emerald-700" />
                      Extrait Conforme Page {activeSituation.pageNum} du Manuscrit
                    </span>
                    <span className="flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-[#8E5A3C]" />
                      {activeSituation.location}, {activeSituation.country}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1 text-[#8E5A3C]" />
                      {activeSituation.date}
                    </span>
                  </div>

                  {saveSuccessMsg && (
                    <div className="my-2 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-mono px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-2xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{saveSuccessMsg}</span>
                    </div>
                  )}

                  {/* Title + Interactive Edit Controls for Papa */}
                  {editingTitleId === activeSituation.id ? (
                    <div className="my-3 bg-[#FAF6F0] p-4 rounded-2xl border-2 border-[#8E5A3C] shadow-xs space-y-2.5 text-left">
                      <div className="flex items-center justify-between text-xs font-mono font-bold text-[#8E5A3C]">
                        <span className="flex items-center gap-1.5">
                          <Pencil className="w-4 h-4 text-[#8E5A3C]" />
                          <span>Changer le titre de ce chapitre (Page {activeSituation.pageNum})</span>
                        </span>
                        {customTitles[activeSituation.id] && (
                          <button
                            type="button"
                            onClick={() => handleResetTitle(activeSituation)}
                            className="text-[11px] font-mono text-gray-500 hover:text-red-700 underline flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Rétablir le titre d'origine</span>
                          </button>
                        )}
                      </div>
                      
                      <input
                        type="text"
                        value={tempTitleInput}
                        onChange={(e) => setTempTitleInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveTitle(activeSituation.id);
                          if (e.key === 'Escape') setEditingTitleId(null);
                        }}
                        className="w-full bg-white border border-[#D5C7B5] px-3.5 py-2.5 rounded-xl text-sm sm:text-base font-serif font-bold text-[#4A3225] focus:outline-none focus:ring-2 focus:ring-[#8E5A3C]"
                        placeholder="Ex: Le Grand Départ à la Gare de Rennes (Jour J)"
                        autoFocus
                      />

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-[11px] font-mono text-[#8A7968]">
                        <span>Appuyez sur <strong>Entrée</strong> pour valider</span>
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => setEditingTitleId(null)}
                            className="px-3 py-1.5 font-bold text-[#6B5A49] hover:bg-gray-200/60 rounded-lg cursor-pointer transition-colors"
                          >
                            Annuler
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveTitle(activeSituation.id)}
                            className="px-4 py-1.5 bg-[#8E5A3C] hover:bg-[#72462E] text-white font-bold rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Enregistrer le Titre</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="my-2 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1">
                        <h4 className="font-serif font-black text-2xl sm:text-3xl text-[#4A3225] leading-tight">
                          {getSituationTitle(activeSituation)}
                        </h4>
                        {customTitles[activeSituation.id] && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full mt-1.5">
                            ✏️ Titre sur-mesure défini par Papa
                          </span>
                        )}
                      </div>

                      {canEdit && (
                        <div className="shrink-0 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleStartEditingTitle(activeSituation)}
                            className="inline-flex items-center gap-1.5 bg-[#FAF6F0] hover:bg-[#8E5A3C] hover:text-white text-[#8E5A3C] border border-[#D5C7B5] text-xs font-mono font-bold px-3 py-1.5 rounded-xl transition-all shadow-2xs cursor-pointer"
                            title="Changer le titre de ce chapitre"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Changer le titre</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => requestDeleteSituation(activeSituation)}
                            className="inline-flex items-center gap-1.5 bg-red-50 hover:bg-red-600 hover:text-white text-red-700 border border-red-200 text-xs font-mono font-bold px-3 py-1.5 rounded-xl transition-all shadow-2xs cursor-pointer"
                            title="Retirer cette étape du voyage (Poubelle)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Retirer l'étape</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <p className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 inline-block mb-3">
                    Provenance certifiée : Roman d'origine « 69 C'est possible » (Patrice & Mam)
                  </p>
                </div>

                {/* Main Excerpt text block */}
                <div className="bg-[#FCFAF6] border-l-4 border-[#8E5A3C] p-5 rounded-r-2xl relative">
                  <Quote className="w-8 h-8 text-[#8E5A3C]/15 absolute top-2 right-3 pointer-events-none" />
                  <p className="text-sm sm:text-base text-[#4A3225] font-serif leading-relaxed italic relative z-10">
                    {activeSituation.excerpt}
                  </p>
                </div>

                {/* Highlight Quote */}
                <div className="bg-[#EBDCCB]/20 border border-[#E6DFD3] p-3.5 rounded-xl flex items-center space-x-3">
                  <span className="text-xl">💡</span>
                  <p className="text-xs font-serif font-bold text-[#6B5A49] italic">
                    {activeSituation.quote}
                  </p>
                </div>

                {/* Footer Stats & Navigation Controls */}
                <div className="pt-4 border-t border-[#E6DFD3] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-4 text-xs font-mono text-[#8A7968]">
                    <div>
                      <span className="text-gray-400 block text-[10px]">DISTANCE ÉTAPE</span>
                      <strong className="text-[#8E5A3C]">{activeSituation.stats.distanceKm} km</strong>
                    </div>
                    <div className="border-l border-gray-300 pl-4">
                      <span className="text-gray-400 block text-[10px]">SITE CLÉ</span>
                      <strong className="text-[#4A3225]">{activeSituation.stats.iconicSite}</strong>
                    </div>
                  </div>

                  {/* Leafing / Carousel Controls */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={handlePrev}
                      className="p-2.5 bg-[#FCFAF6] hover:bg-[#EBDCCB]/50 text-[#4A3225] rounded-xl border border-[#E6DFD3] transition-colors cursor-pointer"
                      title="Situation précédente"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <span className="text-xs font-mono font-bold text-[#8A7968] px-2">
                      {currentIndex + 1} / {filteredSituations.length}
                    </span>

                    <button
                      onClick={handleNext}
                      className="p-2.5 bg-[#FCFAF6] hover:bg-[#EBDCCB]/50 text-[#4A3225] rounded-xl border border-[#E6DFD3] transition-colors cursor-pointer"
                      title="Situation suivante"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Grid Quick Index / Thumbnails for Exploration (Author/Admin only) */}
      {canEdit && (
        <div className="mt-10 pt-8 border-t border-[#E6DFD3]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 bg-[#FAF6F0] p-4 rounded-2xl border border-[#D5C7B5]">
            <div>
              <h5 className="font-serif font-bold text-lg text-[#4A3225] flex items-center space-x-2">
                <Layers className="w-5 h-5 text-[#8E5A3C]" />
                <span>
                  Photos des Chapitres du Roman ({filteredSituations.length} Passages)
                </span>
              </h5>
              <p className="text-xs text-[#6B5A49] font-serif mt-0.5">
                Glissez-déposez ou sélectionnez vos vraies photos d'archives personnelles pour documenter directement les pages correspondantes du roman.
              </p>
            </div>

            <label className="shrink-0 bg-[#8E5A3C] hover:bg-[#72462E] text-white text-xs font-mono font-bold px-4 py-2.5 rounded-xl shadow-xs cursor-pointer transition-all flex items-center gap-2">
              <Upload className="w-4 h-4" />
              <span>Importer plusieurs photos d'un coup</span>
              <input 
                type="file" 
                accept="image/*" 
                multiple 
                className="hidden" 
                onChange={(e) => {
                  const files = e.target.files;
                  if (!files || files.length === 0) return;
                  Array.from(files).forEach((file: File, idx: number) => {
                    const targetSit = filteredSituations[idx] || filteredSituations[0];
                    if (targetSit) {
                      handlePhotoUpload(targetSit.id, file);
                    }
                  });
                }} 
              />
            </label>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filteredSituations.map((sit, idx) => {
              const photoSrc = getPhotoSrc(sit);
              return (
                <div
                  key={sit.id}
                  className={`group text-left bg-white border p-2 rounded-xl transition-all duration-200 overflow-hidden relative ${
                    currentIndex === idx
                      ? 'border-[#8E5A3C] ring-2 ring-[#8E5A3C]/30 bg-amber-50/40 shadow-sm'
                      : 'border-[#E6DFD3] hover:border-[#8E5A3C]/50 hover:bg-[#FCFAF6]'
                  }`}
                >
                  <div 
                    onClick={() => setCurrentIndex(idx)}
                    className="aspect-4/3 rounded-lg overflow-hidden mb-1.5 bg-[#FAF6F0] relative border border-[#E6DFD3] flex items-center justify-center cursor-pointer"
                  >
                    {photoSrc ? (
                      <img 
                        src={photoSrc} 
                        alt={sit.location}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                    ) : (
                      <div className="w-full h-full bg-[#FAF6F0] flex flex-col items-center justify-center text-[#8E5A3C] p-2 text-center group-hover:bg-[#F5EFE6] transition-colors">
                        <Camera className="w-5 h-5 opacity-70 mb-1" />
                        <span className="text-[9px] font-mono font-bold text-[#8E5A3C]">Ajouter photo</span>
                        <span className="text-[8px] font-mono text-[#8A7968]">Page {sit.pageNum}</span>
                      </div>
                    )}

                    <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] font-mono px-1.5 py-0.5 rounded font-bold z-20">
                      p.{sit.pageNum}
                    </span>

                    {/* Direct Trash button on thumbnail */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        requestDeleteSituation(sit);
                      }}
                      className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-lg z-40 shadow-sm cursor-pointer opacity-80 group-hover:opacity-100 transition-opacity"
                      title="Retirer cette étape du voyage"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Direct upload overlay button on hover or on empty thumbnail */}
                    <label 
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-mono font-bold cursor-pointer p-1 text-center z-30"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Upload className="w-4 h-4 mb-1 text-amber-300" />
                      <span>{photoSrc ? 'Remplacer' : '+ Photo p.' + sit.pageNum}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handlePhotoUpload(sit.id, file);
                        }} 
                      />
                    </label>
                  </div>

                  <div onClick={() => setCurrentIndex(idx)} className="cursor-pointer">
                    <p className="font-serif text-xs font-bold text-[#4A3225] truncate">
                      {sit.location}
                    </p>
                    <p className="font-mono text-[9px] text-[#8A7968] truncate">
                      {sit.date}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lightbox Modal for Photo Inspection */}
      <AnimatePresence>
        {lightboxSituation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
            onClick={() => setLightboxSituation(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#FCFAF6] border border-[#E6DFD3] rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl relative text-left"
            >
              {/* Close Button */}
              <button
                onClick={() => setLightboxSituation(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/60 hover:bg-black text-white rounded-full flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-2 sm:p-4 bg-black flex flex-col items-center justify-center min-h-[250px]">
                {getPhotoSrc(lightboxSituation) ? (
                  <img 
                    src={getPhotoSrc(lightboxSituation)} 
                    alt={lightboxSituation.photoCaption}
                    className="max-h-[60vh] w-auto object-contain rounded-xl"
                  />
                ) : (
                  <div className="p-8 text-center text-white space-y-3">
                    <Camera className="w-12 h-12 text-[#8E5A3C] mx-auto" />
                    <p className="font-serif font-bold text-lg">Aucune photo d'archive actuellement jointe</p>
                    <p className="font-mono text-xs text-gray-400">Page {lightboxSituation.pageNum} • {lightboxSituation.location}</p>
                    <label className="inline-flex items-center gap-2 bg-[#8E5A3C] hover:bg-[#72462E] text-white text-xs font-mono font-bold px-4 py-2 rounded-xl cursor-pointer transition-colors mt-2">
                      <Upload className="w-4 h-4" />
                      <span>Importer la vraie photo du livre (p. {lightboxSituation.pageNum})</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handlePhotoUpload(lightboxSituation.id, file);
                        }} 
                      />
                    </label>
                  </div>
                )}
              </div>

              <div className="p-6 sm:p-8 space-y-4">
                <div className="flex items-center space-x-2 text-xs font-mono text-[#8E5A3C] font-bold">
                  <Camera className="w-4 h-4" />
                  <span>Cliché d'Archive Original — {lightboxSituation.location}</span>
                </div>

                <div className="flex items-center justify-between">
                  <h4 className="font-serif font-extrabold text-xl sm:text-2xl text-[#4A3225]">
                    {getSituationTitle(lightboxSituation)}
                  </h4>
                  {customTitles[lightboxSituation.id] && (
                    <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full">
                      Titre sur-mesure
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-[#6B5A49] font-serif italic border-l-2 border-[#8E5A3C] pl-3">
                  « {lightboxSituation.photoCaption} »
                </p>

                <div className="bg-[#FAF6F0] p-3 rounded-xl flex items-center justify-between text-xs font-mono text-[#8A7968]">
                  <span>Matériel : <strong>{lightboxSituation.cameraInfo}</strong></span>
                  <span>Date : <strong>{lightboxSituation.date}</strong></span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Confirmation Modal for Deleting an Step */}
      <AnimatePresence>
        {confirmDeleteSit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4"
            onClick={() => setConfirmDeleteSit(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#E6DFD3] text-left relative"
            >
              <button
                onClick={() => setConfirmDeleteSit(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6" />
              </div>

              <h4 className="font-serif font-black text-xl text-[#4A3225] mb-2">
                Retirer cette étape du voyage ?
              </h4>

              <div className="text-sm text-[#6B5A49] font-serif mb-6 leading-relaxed bg-[#FAF6F0] p-4 rounded-2xl border border-[#E6DFD3]">
                <strong className="text-[#4A3225] block mb-1">
                  Page {confirmDeleteSit.pageNum} : {getSituationTitle(confirmDeleteSit)}
                </strong>
                {confirmDeleteSit.location} ({confirmDeleteSit.country}) • {confirmDeleteSit.date}
                <span className="text-xs text-[#8A7968] font-mono mt-2 block">
                  L'étape sera masquée du voyage et déplacée dans la Corbeille. Vous pourrez la restaurer à tout moment.
                </span>
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setConfirmDeleteSit(null)}
                  className="px-4 py-2.5 rounded-xl font-mono text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => executeDeleteSituation(confirmDeleteSit)}
                  className="px-5 py-2.5 rounded-xl font-mono text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Oui, retirer l'étape</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Corbeille / Trash Modal for Restoring Deleted Steps */}
      <AnimatePresence>
        {showTrashModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4"
            onClick={() => setShowTrashModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-[#E6DFD3] text-left relative"
            >
              <button
                onClick={() => setShowTrashModal(false)}
                className="absolute top-5 right-5 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
                title="Fermer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif font-black text-xl text-[#4A3225]">
                    Corbeille des Étapes Retirées du Voyage ({deletedIds.length})
                  </h4>
                  <p className="text-xs text-[#8A7968] font-mono mt-0.5">
                    Vous pouvez restaurer à tout moment une étape pour qu'elle réapparaisse dans les 69 passages.
                  </p>
                </div>
              </div>

              {deletedIds.length === 0 ? (
                <div className="py-12 text-center text-[#8A7968] font-mono text-xs bg-[#FAF6F0] rounded-2xl border border-dashed border-[#D5C7B5]">
                  <p className="font-bold">La corbeille est vide.</p>
                  <p className="mt-1">Toutes les étapes du voyage sont actuellement visibles !</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-[#E6DFD3]">
                    <span className="text-xs font-mono font-bold text-[#8E5A3C]">
                      {deletedIds.length} étape{deletedIds.length > 1 ? 's' : ''} masquée{deletedIds.length > 1 ? 's' : ''}
                    </span>
                    <button
                      onClick={handleRestoreAllSituations}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-mono font-bold px-3 py-1.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Tout restaurer</span>
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                    {deletedIds.map((id) => {
                      const sit = ARCHIVE_SITUATIONS.find((s) => s.id === id);
                      if (!sit) return null;
                      return (
                        <div
                          key={id}
                          className="flex items-center justify-between p-3.5 bg-[#FCFAF6] border border-[#E6DFD3] rounded-2xl hover:border-[#8E5A3C]/40 transition-colors"
                        >
                          <div className="flex items-center space-x-3 overflow-hidden">
                            <span className="shrink-0 bg-[#8E5A3C]/10 text-[#8E5A3C] font-mono text-xs font-bold px-2 py-1 rounded-md">
                              p. {sit.pageNum}
                            </span>
                            <div className="truncate">
                              <p className="font-serif font-bold text-xs text-[#4A3225] truncate">
                                {getSituationTitle(sit)}
                              </p>
                              <p className="font-mono text-[10px] text-[#8A7968]">
                                {sit.location} ({sit.country}) • {sit.date}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleRestoreSituation(id)}
                            className="shrink-0 ml-3 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-800 border border-emerald-200 text-xs font-mono font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                            title="Restaurer cette étape dans le voyage"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Restaurer</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
