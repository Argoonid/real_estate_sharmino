import React, { useState, useEffect } from 'react';
import { Building2 } from 'lucide-react';
import { Language, translations } from '../i18n';

export interface LoadingSplashProps {
  onFinished?: () => void;
  language?: Language;
}

export const LoadingSplash: React.FC<LoadingSplashProps> = ({ onFinished, language = 'ru' }) => {
  const t = translations[language];
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const [progress, setProgress] = useState(15);
  const [statusText, setStatusText] = useState(t.splashLoading);

  useEffect(() => {
    // Stage 1: Fast initial burst
    const t1 = setTimeout(() => {
      setProgress(60);
      setStatusText(t.splashSyncing);
    }, 400);

    // Stage 2: Final completion
    const t2 = setTimeout(() => {
      setProgress(100);
      setStatusText(t.splashWelcome);
    }, 950);

    // Stage 3: Begin smooth fade out
    const t3 = setTimeout(() => {
      setFading(true);
    }, 1350);

    // Stage 4: Unmount
    const t4 = setTimeout(() => {
      setVisible(false);
      if (onFinished) onFinished();
    }, 1900);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onFinished, t]);

  const handleSkip = () => {
    setFading(true);
    setTimeout(() => {
      setVisible(false);
      if (onFinished) onFinished();
    }, 300);
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white select-none transition-opacity duration-600 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ willChange: 'opacity' }}
    >
      {/* Ambient background soft glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] bg-amber-500/5 rounded-full blur-[80px]" />
      </div>

      {/* Skip button in top-right */}
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 text-xs text-slate-400 hover:text-white transition px-3 py-1.5 rounded-full border border-slate-800 bg-slate-900/60 backdrop-blur-md cursor-pointer"
      >
        {t.splashSkip}
      </button>

      {/* Center Brand Identity */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        {/* Emblem */}
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/60 shadow-2xl flex items-center justify-center group">
            <Building2 className="w-8 h-8 text-sky-400 transition-transform duration-700 group-hover:scale-110" />
          </div>
          {/* Subtle halo ring */}
          <div className="absolute -inset-1 rounded-2xl border border-sky-500/20 animate-pulse pointer-events-none" />
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-black tracking-[0.25em] uppercase text-white drop-shadow-sm font-sans">
          sharmino
        </h1>

        {/* Subtitle */}
        <p className="mt-2 text-[10px] sm:text-[11px] font-medium tracking-[0.2em] uppercase text-slate-400 max-w-xs">
          Red Sea Real Estate Collection · Sharm El Sheikh
        </p>

        {/* Minimal Progress Bar */}
        <div className="mt-8 w-48 sm:w-60 h-[2px] bg-slate-800/80 rounded-full overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-sky-500 via-cyan-400 to-amber-400 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Status text */}
        <span className="mt-3 text-[11px] text-slate-400 font-medium tracking-wide min-h-[16px]">
          {statusText}
        </span>
      </div>

      {/* Bottom discreet footnote */}
      <div className="absolute bottom-6 text-[10px] text-slate-400 tracking-wider uppercase font-mono">
        {t.splashLocation}
      </div>
    </div>
  );
};
