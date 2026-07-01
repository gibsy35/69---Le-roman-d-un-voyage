import React from 'react';
import { BookOpen, Compass, ShieldCheck, Mail, Map, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';

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
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#4A3225] tracking-tight">
                69 <span className="text-sm font-sans font-medium text-[#8E5A3C] uppercase tracking-widest block sm:inline sm:ml-1">C'est Possible !</span>
              </h1>
              <p className="text-[10px] sm:text-xs text-[#8A7968] font-mono">Le Périple de Patrice & Mam</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-2">
            <button
              onClick={() => setView('store')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
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
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                currentView === 'timeline'
                  ? 'bg-[#8E5A3C] text-white shadow-xs'
                  : 'text-[#5C4D3C] hover:bg-[#EBDCCB]/30 hover:text-[#8E5A3C]'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Le Récit Interactif</span>
            </button>
            <button
              onClick={() => setView('intranet')}
              className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-lg text-sm font-mono font-medium border border-[#D1C2A5] transition-all duration-200 ${
                currentView === 'intranet'
                  ? 'bg-[#2E4A3F] text-white border-transparent shadow-xs'
                  : 'text-[#2E4A3F] bg-[#E1EFEB]/30 hover:bg-[#2E4A3F]/10'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-[#C19358]" />
              <span>🎒 Espace Papa (Intranet)</span>
              {ordersCount > 0 && (
                <span className="ml-1 bg-red-600 text-white font-sans text-xs px-1.5 py-0.5 rounded-full font-bold">
                  {ordersCount}
                </span>
              )}
            </button>
          </nav>

          {/* Mobile Fast Navigation */}
          <div className="flex md:hidden items-center space-x-1">
            <button
              onClick={() => setView('store')}
              className={`p-2 rounded-lg ${currentView === 'store' ? 'text-[#8E5A3C] bg-[#EBDCCB]/30' : 'text-[#5C4D3C]'}`}
              title="Le Livre"
            >
              <BookOpen className="w-5 h-5" />
            </button>
            <button
              onClick={() => setView('timeline')}
              className={`p-2 rounded-lg ${currentView === 'timeline' ? 'text-[#8E5A3C] bg-[#EBDCCB]/30' : 'text-[#5C4D3C]'}`}
              title="Le Récit"
            >
              <Compass className="w-5 h-5" />
            </button>
            <button
              onClick={() => setView('intranet')}
              className={`p-2 rounded-lg relative ${currentView === 'intranet' ? 'text-[#2E4A3F] bg-[#E1EFEB]' : 'text-[#2E4A3F]'}`}
              title="Intranet"
            >
              <ShieldCheck className="w-5 h-5" />
              {ordersCount > 0 && (
                <div className="absolute -top-0.5 -right-0.5 bg-red-600 text-white w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold">
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
