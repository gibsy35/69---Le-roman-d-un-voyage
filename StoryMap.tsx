import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Plane, Compass, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { TRIPS_DATA, DAD_QUOTES } from './data';
import { Chapter } from './types';
import { useLang } from './LanguageContext';

export default function StoryMap() {
  const { t } = useLang();
  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const [filterCountry, setFilterCountry] = useState<string>('all');

  const countries = ['all', ...Array.from(new Set(TRIPS_DATA.map((c: Chapter) => c.country)))];
  const filteredChapters = filterCountry === 'all' ? TRIPS_DATA : TRIPS_DATA.filter((c: Chapter) => c.country === filterCountry);
  const currentChapter = filteredChapters[selectedIdx] || filteredChapters[0] || TRIPS_DATA[0];

  const handleNext = () => setSelectedIdx((p) => (p + 1) % filteredChapters.length);
  const handlePrev = () => setSelectedIdx((p) => (p - 1 + filteredChapters.length) % filteredChapters.length);

  const getCountryEmoji = (cty: string) => {
    switch (cty.toLowerCase()) {
      case 'france': return '🇫🇷';
      case 'hong kong': return '🪷';
      case 'chine': return '🇨🇳';
      case 'nouvelle-zélande': return '🇳🇿';
      case 'australie': return '🇦🇺';
      case 'indonésie': return '🇮🇩';
      case 'malaisie': return '🇲🇾';
      case 'japon': return '🇯🇵';
      case 'taïwan': return '🇹🇼';
      default: return '📍';
    }
  };

  return (
    <div className="py-8 sm:py-12 bg-[#FCFAF6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-mono text-[#C4622D] font-bold uppercase tracking-widest">
            🧭 {t('Le Journal de Bord Interactif', 'The Interactive Travel Log')}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#2D1A0E] mt-2">
            {t('Explorez notre demi-tour du monde', 'Explore Our Half-World Tour')}
          </h2>
          <p className="text-sm text-[#8A7968] font-mono mt-1">
            {t(
              'Chaque escale raconte une petite victoire, un fou rire ou une angoisse mémorable',
              'Every stop tells a small victory, a burst of laughter or a memorable fright'
            )}
          </p>
        </div>

        {/* Filtres pays */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {countries.map((cty) => (
            <button key={cty} onClick={() => { setFilterCountry(cty); setSelectedIdx(0); }}
              className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                filterCountry === cty
                  ? 'text-white shadow-xs'
                  : 'bg-white text-[#5C4D3C] border border-[#E6DFD3]'
              }`}
              style={filterCountry === cty ? { background: '#C4622D' } : {}}
            >
              {cty === 'all' ? `🌍 ${t('Tout voir', 'All')}` : `${getCountryEmoji(cty)} ${cty}`}
            </button>
          ))}
        </div>

        {/* Colonnes */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Liste étapes */}
          <div className="lg:col-span-4 bg-white border border-[#E6DFD3] rounded-2xl p-4 max-h-[550px] overflow-y-auto">
            <h3 className="font-serif font-bold text-lg text-[#2D1A0E] border-b border-[#E6DFD3] pb-3 mb-4 flex items-center justify-between">
              <span>{t('Les Étapes', 'The Stops')}</span>
              <span className="text-xs font-mono text-[#8A7968] font-normal">
                {filteredChapters.length} {t('escales', 'stops')}
              </span>
            </h3>
            <div className="space-y-2">
              {filteredChapters.map((chap: Chapter, idx: number) => {
                const isSelected = currentChapter.id === chap.id;
                return (
                  <button key={chap.id} onClick={() => setSelectedIdx(idx)}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-center space-x-3 cursor-pointer border-l-4 ${
                      isSelected ? 'bg-[#FBF1E6]' : 'bg-transparent hover:bg-[#FAF6F0] border-transparent'
                    }`}
                    style={isSelected ? { borderLeftColor: '#C4622D' } : {}}
                  >
                    <span className="text-xl">{getCountryEmoji(chap.country)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <span className="block font-serif text-sm font-bold truncate" style={{ color: isSelected ? '#C4622D' : '#2D1A0E' }}>
                          {chap.title}
                        </span>
                        <span className="text-[10px] font-mono text-[#8A7968] ml-2 shrink-0">{chap.date}</span>
                      </div>
                      <span className="block text-xs font-mono text-[#8A7968] truncate">{chap.location}, {chap.country}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Carte détail */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div key={currentChapter.id}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
                className="bg-white border-2 border-[#E6DFD3] rounded-3xl p-6 sm:p-8 shadow-xs"
              >
                {/* En-tête carte */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#E6DFD3] pb-4 mb-6">
                  <div>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider block" style={{ color: '#C4622D' }}>
                      {currentChapter.date}
                    </span>
                    <h3 className="font-serif text-2xl font-black text-[#2D1A0E] mt-1 flex items-center">
                      <MapPin className="w-5 h-5 mr-2" style={{ color: '#C4622D' }} />
                      {currentChapter.location}
                    </h3>
                  </div>
                  <div className="mt-3 sm:mt-0 px-4 py-1.5 border-2 border-dashed rounded-full text-xs font-mono tracking-widest font-black uppercase rotate-2"
                    style={{ borderColor: 'rgba(196,98,45,.4)', color: '#C4622D' }}>
                    PASSED • {currentChapter.country}
                  </div>
                </div>

                {/* Anecdote */}
                <div className="prose mb-6">
                  <h4 className="font-serif font-extrabold text-lg text-[#5C4D3C] mb-3">{currentChapter.title}</h4>
                  <p className="text-base text-[#6B5A49] leading-relaxed italic border-l-2 border-[#E6DFD3] pl-4 font-serif">
                    « {currentChapter.anecdote} »
                  </p>
                </div>

                {/* Métriques */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FBF1E6] p-4 rounded-xl border border-[#EDD9C0] mb-8 font-mono text-sm text-[#5C4D3C]">
                  <div className="flex items-center space-x-2">
                    <Plane className="w-4 h-4" style={{ color: '#C4622D' }} />
                    <span>{t('Lieu emblématique', 'Iconic place')} : <strong>{currentChapter.stats.iconicPlace}</strong></span>
                  </div>
                  {currentChapter.stats.distance && (
                    <div className="flex items-center space-x-2">
                      <Compass className="w-4 h-4" style={{ color: '#C4622D' }} />
                      <span>{t('Trajet', 'Distance')} : <strong>+{currentChapter.stats.distance} km</strong></span>
                    </div>
                  )}
                </div>

                {/* Citation daron */}
                <div className="bg-[#FAF6F0]/50 border-t border-[#E6DFD3] pt-5">
                  <h5 className="text-[11px] font-mono text-[#8A7968] font-bold uppercase tracking-widest flex items-center mb-2">
                    <Quote className="w-3.5 h-3.5 mr-1.5" style={{ color: '#C4622D' }} />
                    {t('Parole de Daron', 'Dad\'s Word')}
                  </h5>
                  <p className="text-xs text-[#5C4D3C] font-serif leading-relaxed italic">
                    {DAD_QUOTES[selectedIdx % DAD_QUOTES.length] || DAD_QUOTES[0]}
                  </p>
                </div>

                {/* Navigation précédent / suivant */}
                <div className="flex justify-between items-center mt-8 pt-4 border-t border-[#E6DFD3]/60">
                  <button onClick={handlePrev}
                    className="flex items-center space-x-1 text-xs font-mono font-bold hover:underline bg-transparent border-none cursor-pointer"
                    style={{ color: '#C4622D' }}>
                    <ChevronLeft className="w-4 h-4" />
                    <span>{t('Précédent', 'Previous')}</span>
                  </button>
                  <button onClick={handleNext}
                    className="flex items-center space-x-1 text-xs font-mono font-bold hover:underline bg-transparent border-none cursor-pointer"
                    style={{ color: '#C4622D' }}>
                    <span>{t('Suivant', 'Next')}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}
