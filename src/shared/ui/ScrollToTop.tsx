import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { Language, translations } from '../i18n';

export const ScrollToTop: React.FC<{ language?: Language }> = ({ language = 'ru' }) => {
  const [visible, setVisible] = useState(false);
  const t = translations[language];

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-30 p-3 rounded-2xl bg-white/95 text-slate-800 shadow-xl border border-slate-200/80 hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all cursor-pointer backdrop-blur-md animate-in fade-in zoom-in-90 duration-200"
      title={t.scrollToTop}
      aria-label={t.scrollToTop}
    >
      <ArrowUp className="w-4 h-4 text-sky-600" />
    </button>
  );
};
