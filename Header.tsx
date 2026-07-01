import React, { useState, useEffect } from 'react';
import { BookOpen, Compass, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  currentView: 'store' | 'timeline' | 'intranet';
  setView: (view: 'store' | 'timeline' | 'intranet') => void;
  ordersCount: number;
}

export default function Header({ currentView, setView, ordersCount }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 transition-shadow duration-200 ${scrolled ? 'shadow-md' : ''}`} style={{ background: '#EDF4F7', borderBottom: '0.5px solid #C8DDE8' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-18">

          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setView('store')}>
            <div className="flex items-center justify-center w-9 h-9 rounded-lg shadow-sm" style={{ background: '#C4622D' }}>
              <span className="font-serif font-black text-base text-white tracking-wide">69</span>
            </div>
            <div>
              <h1 className="font-serif font-bold text-base sm:text-lg leading-tight" style={{ color: '#1A3A4A' }}>
                Le Roman d'un Voyage
              </h1>
              <p className="text-[10px] font-mono" style={{ color: '#6A8A9A' }}>Patrice & Mam · 69 000 km</p>
            </div>
          </div>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setView('store')}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              style={currentView === 'store'
                ? { background: '#2A6B8A', color: '#fff' }
                : { background: 'transparent', color: '#2A6B8A' }}
            >
              <BookOpen className="w-4 h-4" />
              <span>Le Livre</span>
            </button>

            <button
              onClick={() => setView('timeline')}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              style={currentView === 'timeline'
                ? { background: '#C4622D', color: '#fff' }
                : { background: 'transparent', color: '#C4622D' }}
            >
              <Compass className="w-4 h-4" />
              <span>Le Récit Interactif</span>
            </button>

            <button
              onClick={() => setView('intranet')}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 relative"
              style={currentView === 'intranet'
                ? { background: '#3A6B44', color: '#fff', borderColor: 'transparent' }
                : { background: '#EEF3ED', color: '#3A6B44', borderColor: '#C8D9C4' }}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>🎒 Espace Papa</span>
              {ordersCount > 0 && (
                <span className="ml-1 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: '#C4622D' }}>
                  {ordersCount}
                </span>
              )}
            </button>
          </nav>

          {/* Nav mobile */}
          <div className="flex md:hidden items-center space-x-1">
            <button onClick={() => setView('store')} className="p-2 rounded-lg transition-colors" style={currentView === 'store' ? { background: '#D6E8F0', color: '#2A6B8A' } : { color: '#2A6B8A' }}>
              <BookOpen className="w-5 h-5" />
            </button>
            <button onClick={() => setView('timeline')} className="p-2 rounded-lg transition-colors" style={currentView === 'timeline' ? { background: '#FBF1E6', color: '#C4622D' } : { color: '#C4622D' }}>
              <Compass className="w-5 h-5" />
            </button>
            <button onClick={() => setView('intranet')} className="p-2 rounded-lg relative transition-colors" style={currentView === 'intranet' ? { background: '#EEF3ED', color: '#3A6B44' } : { color: '#3A6B44' }}>
              <ShieldCheck className="w-5 h-5" />
              {ordersCount > 0 && (
                <div className="absolute -top-0.5 -right-0.5 text-white w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold" style={{ background: '#C4622D' }}>
                  {ordersCount}
                </div>
              )}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
