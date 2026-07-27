import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, ShieldCheck, KeyRound, AlertCircle, User, ArrowRight, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    // Credentials for Patrice Lequime
    const validUsers = ['plequime@yahoo.fr', 'plequime', 'patrice', 'patrice lequime', 'patrice.lequime', 'p.lequime', 'lequime'];
    const validPasswords = ['Baguerra31956!', 'baguerra31956!', '69', 'patrice69', 'breizh69', '1234'];

    if (validUsers.includes(cleanUser) && validPasswords.includes(cleanPass)) {
      sessionStorage.setItem('patrice_auth', 'true');
      localStorage.setItem('patrice_auth', 'true');
      onSuccess();
    } else {
      setError('Identifiant ou mot de passe incorrect. Cet espace est réservé à Patrice Lequime.');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-[#FCFAF6] border border-[#E6DFD3] rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative overflow-hidden text-[#4A3225]"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-[#8A7968] hover:text-[#4A3225] rounded-full hover:bg-[#FAF6F0] transition-colors cursor-pointer"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center space-y-3 mb-6">
            <div className="w-14 h-14 bg-[#2E4A3F] text-white rounded-2xl mx-auto flex items-center justify-center shadow-md">
              <Lock className="w-7 h-7 text-[#C19358]" />
            </div>
            <div>
              <h3 className="font-serif font-black text-2xl text-[#4A3225]">
                Espace Réservé Auteur
              </h3>
              <p className="text-xs text-[#8A7968] font-mono mt-1">
                Accès privé d'administration pour <strong>Patrice Lequime</strong>
              </p>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-900 p-3 rounded-xl text-xs flex items-start space-x-2 mb-4"
            >
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 font-mono">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D3C] mb-1.5">
                Identifiant
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#8A7968] absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Patrice Lequime"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#D1C2A5] rounded-xl text-xs text-[#4A3225] focus:outline-none focus:border-[#8E5A3C] focus:ring-1 focus:ring-[#8E5A3C]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D3C] mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#8A7968] absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#D1C2A5] rounded-xl text-xs text-[#4A3225] focus:outline-none focus:border-[#8E5A3C] focus:ring-1 focus:ring-[#8E5A3C]"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-[#2E4A3F] hover:bg-[#233a31] text-white rounded-xl text-xs font-bold tracking-wider uppercase transition-colors flex items-center justify-center space-x-2 cursor-pointer shadow-md"
              >
                <span>Connexion Intranet</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Discreet auth badge */}
          <div className="mt-6 pt-4 border-t border-[#E6DFD3] text-center text-[10px] text-[#8A7968] font-mono leading-relaxed">
            <p className="flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2E4A3F]" />
              <span>Authentification sécurisée — Intranet Auteur</span>
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
