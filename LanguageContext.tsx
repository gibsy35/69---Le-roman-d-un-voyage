import React, { createContext, useContext, useState } from 'react';

type Lang = 'fr' | 'en';
interface LangCtx { lang: Lang; setLang: (l: Lang) => void; t: (fr: string, en: string) => string; }

const LanguageContext = createContext<LangCtx>({ lang: 'fr', setLang: () => {}, t: (fr) => fr });

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    return (localStorage.getItem('lang69') as Lang) || 'fr';
  });

  const changeLang = (l: Lang) => {
    setLang(l);
    localStorage.setItem('lang69', l);
  };

  const t = (fr: string, en: string) => lang === 'fr' ? fr : en;

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);
