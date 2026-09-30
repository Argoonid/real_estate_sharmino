import React, { useState } from 'react';
import { Currency, PageId } from '../../shared/types';
import { Language, translations } from '../../shared/i18n';
import {
  Building2,
  Heart,
  Layers,
  Map,
  Grid,
  Split,
  Menu,
  X,
  Share2,
  Flame,
  ChevronDown,
  Sliders,
  Send,
} from 'lucide-react';
import { useUIStore } from '../../app/model/uiStore';
import { useFilterStore } from '../../features/filter-properties/model/filtersStore';
import { useAnonymousProfileStore } from '../../features/anonymous-profile/model/anonymousProfileStore';
import { PWAInstallButton } from '../../shared/ui/PWAInstallButton';

export interface NavbarProps {
  currentPage?: PageId;
  onNavigate?: (page: PageId) => void;
  currency?: Currency;
  onCurrencyChange?: (c: Currency) => void;
  language?: Language;
  onLanguageChange?: (lang: Language) => void;
  viewMode?: 'split' | 'grid' | 'map';
  onViewModeChange?: (m: 'split' | 'grid' | 'map') => void;
  favoritesCount?: number;
  compareCount?: number;
  onOpenCompare?: () => void;
  onOpenFavorites?: () => void;
  onOpenSavedManager?: () => void;
  onOpenSettings?: () => void;
  isOnlyFavorites?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage: propCurrentPage,
  onNavigate: propOnNavigate,
  currency: propCurrency,
  onCurrencyChange: propOnCurrencyChange,
  language: propLanguage,
  onLanguageChange: propOnLanguageChange,
  viewMode: propViewMode,
  onViewModeChange: propOnViewModeChange,
  favoritesCount: propFavoritesCount,
  compareCount: propCompareCount,
  onOpenCompare: propOnOpenCompare,
  onOpenFavorites: propOnOpenFavorites,
  onOpenSavedManager: propOnOpenSavedManager,
  onOpenSettings: propOnOpenSettings,
  isOnlyFavorites = false,
}) => {
  const storePage = useUIStore((s) => s.activePage);
  const setStorePage = useUIStore((s) => s.setActivePage);
  const storeLanguage = useUIStore((s) => s.language);
  const setStoreLanguage = useUIStore((s) => s.setLanguage);
  const setCompareOpen = useUIStore((s) => s.setComparisonOpen);
  const setSavedOpen = useUIStore((s) => s.setSavedOpen);
  const setSettingsOpen = useUIStore((s) => s.setSettingsOpen);
  const setShareProfileOpen = useUIStore((s) => s.setShareProfileOpen);

  const storeCurrency = useFilterStore((s) => s.filter.currency);
  const setStoreCurrency = useFilterStore((s) => s.setCurrency);
  const storeViewMode = useFilterStore((s) => s.viewMode);
  const setStoreViewMode = useFilterStore((s) => s.setViewMode);

  const favorites = useAnonymousProfileStore((s) => s.favorites);
  const compareIds = useAnonymousProfileStore((s) => s.compareIds);

  const currentPage = propCurrentPage || storePage;
  const onNavigate = propOnNavigate || setStorePage;
  const currency = propCurrency || storeCurrency;
  const onCurrencyChange = propOnCurrencyChange || setStoreCurrency;
  const language = propLanguage || storeLanguage;
  const onLanguageChange = propOnLanguageChange || setStoreLanguage;
  const viewMode = propViewMode || storeViewMode;
  const onViewModeChange = propOnViewModeChange || setStoreViewMode;
  const favoritesCount = propFavoritesCount !== undefined ? propFavoritesCount : favorites.length;
  const compareCount = propCompareCount !== undefined ? propCompareCount : compareIds.length;
  const onOpenCompare = propOnOpenCompare || (() => setCompareOpen(true));
  const onOpenFavorites = propOnOpenFavorites || (() => setSavedOpen(true));
  const onOpenSavedManager = propOnOpenSavedManager || (() => setShareProfileOpen(true));
  const onOpenSettings = propOnOpenSettings || (() => setSettingsOpen(true));

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currDropdownOpen, setCurrDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const t = translations[language];

  const currencies: Currency[] = ['USD', 'EUR', 'GBP', 'EGP', 'RUB'];
  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'ru', label: 'RU', flag: '🇷🇺' },
    { code: 'en', label: 'EN', flag: '🇬🇧' },
    { code: 'it', label: 'IT', flag: '🇮🇹' },
  ];

  const handleMobileNav = (page: PageId) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="hidden lg:block sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md text-white border-b border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[68px] flex items-center justify-between gap-4">
        {/* Brand Logo & Primary Navigation */}
        <div className="flex items-center gap-7">
          <div
            className="flex items-center gap-2.5 cursor-pointer group select-none"
            onClick={() => onNavigate('catalog')}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center shadow-md shadow-sky-900/30 group-hover:scale-105 transition-transform duration-300">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-base font-extrabold tracking-wider text-white uppercase font-sans">
                  sharmino
                </span>
                <span className="text-[9px] font-semibold text-sky-400 bg-sky-950/80 px-1 py-0.5 rounded border border-sky-800/60 uppercase tracking-wider">
                  Sharm
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide mt-0.5">
                {t.brandSubtitle}
              </p>
            </div>
          </div>

          {/* Clean Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold text-slate-300">
            <button
              onClick={() => onNavigate('catalog')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                currentPage === 'catalog'
                  ? 'bg-slate-800 text-white font-bold border border-slate-700/80 shadow-xs'
                  : 'hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {t.navCatalog}
            </button>
            <button
              onClick={() => onNavigate('sale')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                currentPage === 'sale'
                  ? 'bg-slate-800 text-white font-bold border border-slate-700/80 shadow-xs'
                  : 'hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {t.navBuy}
            </button>
            <button
              onClick={() => onNavigate('rent')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                currentPage === 'rent'
                  ? 'bg-slate-800 text-white font-bold border border-slate-700/80 shadow-xs'
                  : 'hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {t.navRent}
            </button>
            <button
              onClick={() => onNavigate('popular')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                currentPage === 'popular'
                  ? 'bg-amber-500/15 text-amber-300 font-bold border border-amber-500/40 shadow-xs'
                  : 'text-amber-400/90 hover:text-amber-300 hover:bg-slate-800/50'
              }`}
            >
              <Flame className="w-3.5 h-3.5 fill-current text-amber-400" />
              <span>{t.navPopular}</span>
            </button>
            <button
              onClick={() => onNavigate('districts')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                currentPage === 'districts'
                  ? 'bg-slate-800 text-white font-bold border border-slate-700/80 shadow-xs'
                  : 'hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {t.navDistricts}
            </button>
          </nav>
        </div>

        {/* View Mode Switcher */}
        <div className="hidden xl:flex items-center p-1 bg-slate-900/90 rounded-xl border border-slate-800 text-xs font-medium text-slate-400">
          <button
            onClick={() => {
              if (currentPage !== 'catalog') onNavigate('catalog');
              onViewModeChange('split');
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              currentPage === 'catalog' && viewMode === 'split' ? 'bg-slate-800 text-white shadow-2xs font-semibold' : 'hover:text-white'
            }`}
            title={t.viewSplit}
          >
            <Split className="w-3.5 h-3.5" />
            <span>{t.viewSplit}</span>
          </button>
          <button
            onClick={() => {
              if (currentPage !== 'catalog') onNavigate('catalog');
              onViewModeChange('grid');
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              currentPage === 'catalog' && viewMode === 'grid' ? 'bg-slate-800 text-white shadow-2xs font-semibold' : 'hover:text-white'
            }`}
            title={t.viewGrid}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>{t.viewGrid}</span>
          </button>
          <button
            onClick={() => {
              if (currentPage !== 'catalog') onNavigate('catalog');
              onViewModeChange('map');
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              currentPage === 'catalog' && viewMode === 'map' ? 'bg-sky-600 text-white shadow-2xs font-semibold' : 'hover:text-white'
            }`}
            title={t.viewMap}
          >
            <Map className="w-3.5 h-3.5" />
            <span>{t.viewMap}</span>
          </button>
        </div>

        {/* Right Tools: Currency, Language, Saved, Compare, Concierge */}
        <div className="hidden lg:flex items-center gap-2">
          {/* Currency Dropdown Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setCurrDropdownOpen(!currDropdownOpen);
                setLangDropdownOpen(false);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-200 transition cursor-pointer"
            >
              <span>{currency}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {currDropdownOpen && (
              <div className="absolute right-0 mt-1 w-24 bg-slate-900 border border-slate-700 rounded-xl shadow-xl py-1 z-50 text-xs font-semibold">
                {currencies.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      onCurrencyChange(c);
                      setCurrDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 transition flex items-center justify-between cursor-pointer ${
                      currency === c ? 'bg-sky-600/30 text-sky-400 font-bold' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <span>{c}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {c === 'USD' ? '$' : c === 'EUR' ? '€' : c === 'GBP' ? '£' : c === 'EGP' ? 'EGP' : '₽'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setLangDropdownOpen(!langDropdownOpen);
                setCurrDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-200 transition cursor-pointer"
            >
              <span>{languages.find((l) => l.code === language)?.flag}</span>
              <span>{language.toUpperCase()}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-1 w-28 bg-slate-900 border border-slate-700 rounded-xl shadow-xl py-1 z-50 text-xs font-semibold">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      onLanguageChange(l.code);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 transition flex items-center gap-2 cursor-pointer ${
                      language === l.code ? 'bg-sky-600/30 text-sky-400 font-bold' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <span>{l.flag}</span>
                    <span>{l.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Compare Button */}
          {compareCount > 0 && (
            <button
              onClick={onOpenCompare}
              className="relative p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title={t.navCompare}
            >
              <Layers className="w-4 h-4 text-purple-400" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-600 text-white rounded-full text-[9px] font-extrabold flex items-center justify-center">
                {compareCount}
              </span>
            </button>
          )}

          {/* Favorites Button */}
          <button
            onClick={onOpenFavorites}
            className={`relative p-2 rounded-lg border transition cursor-pointer ${
              isOnlyFavorites
                ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-rose-400'
            }`}
            title={t.navFavorites}
          >
            <Heart className={`w-4 h-4 ${favoritesCount > 0 ? 'text-rose-400' : ''} ${isOnlyFavorites ? 'fill-current' : ''}`} />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-extrabold flex items-center justify-center">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Saved Collections / Share Manager */}
          {onOpenSavedManager && (
            <button
              onClick={onOpenSavedManager}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-sky-400 transition cursor-pointer"
              title={t.savedProfileTitle}
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}

          {/* PWA Install Button */}
          <PWAInstallButton className="inline-flex" language={language} />

          {/* Settings Modal Button */}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title={t.settingsTitle}
            >
              <Sliders className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
