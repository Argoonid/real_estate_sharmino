import React, { useState, useEffect } from 'react';
import { ConsentService, OPEN_CONSENT_PREFERENCES_EVENT } from '../../services/consent';
import { Language, translations } from '../i18n';
import { Cookie, X } from 'lucide-react';
import { ENV } from '../../config/env';

export interface CookieBannerProps {
  language: Language;
}

export const CookieBanner: React.FC<CookieBannerProps> = ({ language }) => {
  const [show, setShow] = useState(false);
  const t = translations[language];

  useEffect(() => {
    const openPreferences = () => setShow(true);
    window.addEventListener(OPEN_CONSENT_PREFERENCES_EVENT, openPreferences);
    const status = ConsentService.getConsentStatus();
    if (status === 'pending') {
      const timer = setTimeout(() => setShow(true), 1200);
      return () => {
        clearTimeout(timer);
        window.removeEventListener(OPEN_CONSENT_PREFERENCES_EVENT, openPreferences);
      };
    }
    return () => window.removeEventListener(OPEN_CONSENT_PREFERENCES_EVENT, openPreferences);
  }, []);

  if (!show) return null;

  const handleAcceptAll = () => {
    ConsentService.setConsent('all');
    setShow(false);
  };

  const handleNecessaryOnly = () => {
    ConsentService.setConsent('necessary');
    setShow(false);
  };

  return (
    <div className="fixed bottom-24 lg:bottom-4 right-4 left-4 sm:left-auto sm:max-w-md z-50 bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-slate-700 animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-sky-500/20 text-sky-400 rounded-xl shrink-0 mt-0.5">
          <Cookie className="w-5 h-5" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white">{t.cookieTitle}</h4>
            <button
              onClick={handleNecessaryOnly}
              aria-label={ENV.ANALYTICS_ID ? t.cookieNecessaryOnly : t.close}
              className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            {ENV.ANALYTICS_ID ? t.cookieDesc : t.cookieNoAnalytics}
          </p>
          <div className="flex items-center gap-2 pt-2">
            {ENV.ANALYTICS_ID && (
              <button
                onClick={handleAcceptAll}
                className="flex-1 py-1.5 px-3 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
              >
                {t.cookieAcceptAll}
              </button>
            )}
            <button
              onClick={handleNecessaryOnly}
              className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition cursor-pointer"
            >
              {ENV.ANALYTICS_ID ? t.cookieNecessaryOnly : t.close}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
