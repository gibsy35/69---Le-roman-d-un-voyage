import React from 'react';
import { BookOpen, Compass, Lock } from 'lucide-react';

interface HeaderProps {
  currentView: 'store' | 'timeline' | 'intranet';
  setView: (view: 'store' | 'timeline' | 'intranet') => void;
  ordersCount: number;
}

export default function Header({ currentView, setView, ordersCount }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-[#FCFAF6] border-b border-[#E6DFD3] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo & Vibe */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setView('store')}>
            <div className="p-2.5 bg-[#8E5A3C] text-white rounded-lg flex items-center justify-center shadow-xs">
              <span className="font-serif font-black text-xl tracking-wider">69</span>
            </div>
            <div>
              <h1 className="font-serif text-lg sm:text-xl font-bold text-[#4A3225] tracking-tight">
                Le Roman d'un Voyage
              </h1>
              <p className="text-[10px] sm:text-xs text-[#8A7968] font-mono">Le Périple de Patrice & Mam</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => setView('store')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                currentView === 'store'
                  ? 'bg-[#8E5A3C] text-white shadow-xs'
                  : 'text-[#5C4D3C] hover:bg-[#EBDCCB]/30 hover:text-[#8E5A3C]'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Le Livre</span>
            </button>
            <button
              onClick={() => setView('timeline')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                currentView === 'timeline'
                  ? 'bg-[#8E5A3C] text-white shadow-xs'
                  : 'text-[#5C4D3C] hover:bg-[#EBDCCB]/30 hover:text-[#8E5A3C]'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Le Récit Interactif</span>
            </button>

            {/* Subtle discreet lock icon button for Patrice's private intranet */}
            <button
              onClick={() => setView('intranet')}
              title="Accès Administrateur / Auteur"
              className={`p-2 sm:px-3 sm:py-2 rounded-lg text-xs font-mono font-medium border border-[#D1C2A5]/70 transition-all duration-200 flex items-center space-x-1 cursor-pointer ${
                currentView === 'intranet'
                  ? 'bg-[#2E4A3F] text-white border-transparent shadow-xs'
                  : 'text-[#8A7968] hover:text-[#2E4A3F] hover:bg-[#E1EFEB]/40'
              }`}
            >
              <Lock className="w-4 h-4 text-[#8E5A3C]" />
              <span className="hidden sm:inline text-[11px] font-mono opacity-80">Espace Privé</span>
              {ordersCount > 0 && (
                <span className="bg-red-600 text-white font-sans text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1">
                  {ordersCount}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
