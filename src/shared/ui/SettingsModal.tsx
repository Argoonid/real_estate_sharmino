import React, { useEffect } from 'react';
import { Currency, PageId } from '../types';
import { Language, translations } from '../i18n';
import { ConsentService } from '../../services/consent';
import {
  X,
  Check,
  Cookie,
  Sliders,
  Coins,
  Globe2,
  Send,
  Mail,
  Building2,
  Flame,
  Map,
  Smartphone,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { useExchangeRates } from '../lib/exchangeRates';

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: Currency;
  onCurrencyChange: (c: Currency) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onNavigate?: (page: PageId) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currency,
  onCurrencyChange,
  language,
  onLanguageChange,
  onNavigate,
}) => {
  const exchangeRatesQuery = useExchangeRates();
  const exchangeRates = exchangeRatesQuery.data;

  // Close on Escape & Lock body scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const t = translations[language];

  const currencies: { code: Currency; symbol: string; labels: Record<Language, string> }[] = [
    { code: 'USD', symbol: '$', labels: { ru: 'Доллар США', en: 'US dollar', it: 'Dollaro statunitense' } },
    { code: 'EUR', symbol: '€', labels: { ru: 'Евро', en: 'Euro', it: 'Euro' } },
    { code: 'GBP', symbol: '£', labels: { ru: 'Фунт стерлингов', en: 'Pound sterling', it: 'Sterlina britannica' } },
    { code: 'EGP', symbol: 'EGP', labels: { ru: 'Египетский фунт', en: 'Egyptian pound', it: 'Sterlina egiziana' } },
    { code: 'RUB', symbol: '₽', labels: { ru: 'Российский рубль', en: 'Russian ruble', it: 'Rublo russo' } },
  ];

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  ];

  const handleMobileNav = (page: PageId) => {
    if (onNavigate) {
      onNavigate(page);
      onClose();
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{t.settingsTitle}</h3>
              <p className="text-[11px] text-slate-500">Sharmino Real Estate Platform</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          <button
            type="button"
            onClick={() => {
              ConsentService.openPreferences();
              onClose();
            }}
            className="flex w-full items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-left text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Cookie className="h-4 w-4 text-sky-600" />
            {t.privacySettings}
          </button>

          {/* Quick Navigation Links */}
          {onNavigate && (
            <div className="space-y-2.5">
              <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                <span>{t.quickSections}</span>
                <span className="text-[10px] text-slate-400 font-normal">{t.quickLink}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => handleMobileNav('catalog')}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-sky-50 text-slate-700 hover:text-sky-700 font-semibold border border-slate-200 flex items-center gap-2 transition text-left cursor-pointer"
                >
                  <Building2 className="w-4 h-4 text-sky-600" />
                  <span>{t.navCatalog}</span>
                </button>
                <button
                  onClick={() => handleMobileNav('sale')}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-sky-50 text-slate-700 hover:text-sky-700 font-semibold border border-slate-200 flex items-center gap-2 transition text-left cursor-pointer"
                >
                  <Coins className="w-4 h-4 text-emerald-600" />
                  <span>{t.navBuy}</span>
                </button>
                <button
                  onClick={() => handleMobileNav('rent')}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-sky-50 text-slate-700 hover:text-sky-700 font-semibold border border-slate-200 flex items-center gap-2 transition text-left cursor-pointer"
                >
                  <Building2 className="w-4 h-4 text-cyan-600" />
                  <span>{t.navRent}</span>
                </button>
                <button
                  onClick={() => handleMobileNav('popular')}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-800 font-semibold border border-slate-200 flex items-center gap-2 transition text-left cursor-pointer"
                >
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>{t.navPopular}</span>
                </button>
                <button
                  onClick={() => handleMobileNav('districts')}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-sky-50 text-slate-700 hover:text-sky-700 font-semibold border border-slate-200 flex items-center gap-2 transition text-left cursor-pointer"
                >
                  <Map className="w-4 h-4 text-sky-600" />
                  <span>{t.navDistricts}</span>
                </button>
              </div>
            </div>
          )}

          {/* Currency Section */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <Coins className="w-4 h-4 text-sky-600" />
              <span>{t.currencyDisplay}</span>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {currencies.map((curr) => {
                const isSelected = currency === curr.code;
                return (
                  <button
                    key={curr.code}
                    onClick={() => onCurrencyChange(curr.code)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs transition cursor-pointer text-left ${
                      isSelected
                        ? 'bg-sky-50 border-sky-400 text-sky-950 font-bold shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 font-mono font-black text-slate-900">{curr.symbol}</span>
                      <span>{curr.labels[language]}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-normal">
                        {exchangeRates
                          ? `1 USD ≈ ${exchangeRates[curr.code].toLocaleString(language, { maximumFractionDigits: 2 })} ${curr.code}`
                          : exchangeRatesQuery.isError
                            ? t.currencyRatesUnavailable
                            : t.currencyRatesLoading}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-sky-600" />}
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-500">
              {t.currencyRatesUpdatedDaily}{' '}
              <a
                href="https://www.exchangerate-api.com"
                target="_blank"
                rel="noreferrer"
                className="text-sky-700 underline"
              >
                Rates By Exchange Rate API
              </a>
            </p>
          </div>

          {/* Language Section */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <Globe2 className="w-4 h-4 text-sky-600" />
              <span>{t.languageInterface}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {languages.map((lang) => {
                const isSelected = language === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => onLanguageChange(lang.code)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs transition cursor-pointer ${
                      isSelected
                        ? 'bg-sky-50 border-sky-400 text-sky-950 font-bold shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xl mb-1">{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PWA App Installation Card */}
          <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-sky-600" />
                <span className="text-xs font-bold text-slate-900">{t.mobileAppTitle}</span>
              </div>
            </div>
            <div className="pt-1">
              <PWAInstallButton variant="banner" language={language} />
            </div>
          </div>

          {/* Direct Support Contacts */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {t.directSupport}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <a
                href="https://t.me/sharmino_realty"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold transition border border-sky-200"
              >
                <Send className="w-4 h-4" />
                <span>Telegram</span>
              </a>
              <a
                href="mailto:info@sharmino.com"
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold transition border border-slate-200"
              >
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
