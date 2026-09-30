import React, { useState } from 'react';
import { Download, Share2, PlusSquare, X, CheckCircle2, Info } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Language, translations } from '../i18n';

export const PWAInstallButton: React.FC<{ className?: string; variant?: 'navbar' | 'banner' | 'mobile'; language?: Language }> = ({
  className = '',
  variant = 'navbar',
  language = 'ru',
}) => {
  const { isInstallable, isInstalled, isIOS, platform, install } = usePWAInstall();
  const t = translations[language];
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showInfoGuide, setShowInfoGuide] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);
  const [installError, setInstallError] = useState('');
  const mobileButtonClass =
    variant === 'mobile'
      ? 'flex-1 !flex-col !gap-0 !px-1 !py-1 !border-0 !bg-transparent !shadow-none text-slate-400 hover:!bg-slate-800/80 hover:text-slate-200'
      : '';

  if (isInstalled || justInstalled) {
    if (variant === 'banner') return null;
    if (variant === 'mobile') {
      return (
        <div className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-1 text-emerald-400 ${className}`}>
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-[10px]">{t.installed}</span>
        </div>
      );
    }
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span>{t.pwaActive}</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    try {
      const success = await install();
      if (success) setJustInstalled(true);
    } catch (error) {
      setInstallError(error instanceof Error ? error.message : t.pwaBrowserGuide);
      setShowInfoGuide(true);
    }
  };

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (variant === 'banner') {
      return (
        <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-sky-600 to-cyan-600 text-white px-4 py-2.5 rounded-xl shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-lg">
              <Download className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold">{t.pwaInstalledApp}</p>
              <p className="text-[11px] text-sky-100">{t.pwaAddToDevice}</p>
            </div>
          </div>
          <button
            onClick={handleInstallClick}
            className="px-3.5 py-1.5 bg-white text-sky-700 text-xs font-bold rounded-lg shadow-sm hover:bg-sky-50 active:scale-95 transition-all cursor-pointer"
          >
            {t.pwaInstall}
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={handleInstallClick}
        className={`flex items-center gap-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 active:scale-95 text-white px-3 py-1.5 text-xs font-semibold shadow-sm transition-all cursor-pointer ${mobileButtonClass} ${className}`}
        title={t.pwaInstallOnDevice}
      >
        <Download className="w-3.5 h-3.5" />
        <span className={variant === 'mobile' ? 'text-[10px]' : 'hidden sm:inline'}>
          {t.pwaInstall}
        </span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 rounded-lg border border-sky-300 dark:border-sky-700 bg-sky-50 text-sky-700 px-3 py-1.5 text-xs font-semibold hover:bg-sky-100 transition-all cursor-pointer ${mobileButtonClass} ${className}`}
        >
          <Download className="w-3.5 h-3.5" />
          <span className={variant === 'mobile' ? 'text-[10px]' : ''}>
            {t.pwaInstall}
          </span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl relative border border-slate-100">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mb-3">
                <Download className="w-6 h-6" />
              </div>

              <h3 className="text-base font-bold text-slate-900">{t.pwaIosTitle}</h3>
              <p className="mt-1 text-xs text-slate-500">
                {platform === 'ios-other'
                  ? t.pwaIosSafariHint
                  : t.pwaIosHomeHint}
              </p>

              <div className="mt-4 space-y-2.5 text-xs text-slate-700">
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <span>{t.pwaIosShareStep}</span>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <span>{t.pwaIosHomeStep}</span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-sky-600 py-2.5 text-xs font-bold text-white hover:bg-sky-700 shadow transition-all cursor-pointer"
              >
                {t.pwaGotIt}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Generic fallback install button (for desktop or when browser hasn't fired event yet)
  return (
    <>
      {variant === 'banner' ? (
        <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-sky-600 to-cyan-600 text-white p-3 rounded-xl shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-lg">
              <Download className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">{t.pwaInstallOnDevice}</p>
              <p className="text-[10px] text-sky-100">{t.mobileAppDescription}</p>
            </div>
          </div>
          <button
            onClick={() => setShowInfoGuide(true)}
            className="px-3 py-1.5 bg-white text-sky-800 text-xs font-bold rounded-lg shadow-sm hover:bg-sky-50 active:scale-95 transition cursor-pointer shrink-0"
          >
            {t.pwaInstructions}
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowInfoGuide(true)}
          className={`flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white px-2.5 py-1.5 text-xs font-semibold shadow-xs transition-all cursor-pointer ${mobileButtonClass} ${className}`}
          title={t.pwaInstallOnDevice}
        >
          <Download className="w-3.5 h-3.5 text-sky-400" />
          <span className={variant === 'mobile' ? 'text-[10px]' : ''}>
            {variant === 'mobile' ? t.pwaInstall : 'PWA'}
          </span>
        </button>
      )}

      {showInfoGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl relative border border-slate-100">
            <button
              onClick={() => setShowInfoGuide(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mb-3">
              <Info className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">{t.pwaInstallOnDevice}</h3>
            <div className="mt-2 text-xs text-slate-600 space-y-2 leading-relaxed">
              {installError && (
                <p role="alert" className="rounded-lg bg-amber-50 p-2 text-amber-800">
                  {installError}
                </p>
              )}
              {platform === 'android' ? (
                <p>
                  <strong>Android:</strong> {t.pwaAndroidGuide}
                </p>
              ) : platform === 'desktop' ? (
                <p>
                  <strong>{t.pwaDesktopLabel}:</strong> {t.pwaDesktopGuide}
                </p>
              ) : (
                <p>
                  <strong>{t.pwaBrowserLabel}:</strong> {t.pwaBrowserGuide}
                </p>
              )}
              {!isIOS && (
                <p>
                  {t.pwaHttpsGuide}
                </p>
              )}
            </div>
            <button
              onClick={() => setShowInfoGuide(false)}
              className="mt-4 w-full rounded-xl bg-sky-600 py-2.5 text-xs font-bold text-white hover:bg-sky-700 transition cursor-pointer shadow-sm"
            >
              {t.pwaGotIt}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
