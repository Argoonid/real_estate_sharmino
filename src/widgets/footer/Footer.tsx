import React from 'react';
import type { PageId } from '../../shared/types';
import type { Language } from '../../shared/i18n';
import { translations } from '../../shared/i18n';

export interface FooterProps {
  language?: Language;
  onNavigate?: (page: PageId) => void;
  onOpenSettings?: () => void;
  onOpenFavorites?: () => void;
  onResetFilters?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenSettings,
  onOpenFavorites,
  onResetFilters,
  language = 'ru',
}) => {
  const t = translations[language];
  return (
  <footer className="border-t border-slate-200 bg-white px-4 py-5 text-xs text-slate-500">
    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
      <p>Sharmino Real Estate</p>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <a
          href="https://www.exchangerate-api.com"
          target="_blank"
          rel="noreferrer"
          className="hover:text-sky-700"
        >
          Rates By Exchange Rate API
        </a>
        <nav className="flex flex-wrap items-center gap-4" aria-label={t.additionalNavigation}>
          <button onClick={() => onNavigate?.('catalog')} className="hover:text-sky-700">{t.navCatalog}</button>
          <button onClick={() => onNavigate?.('districts')} className="hover:text-sky-700">{t.navDistricts}</button>
          <button onClick={onOpenFavorites} className="hover:text-sky-700">{t.navFavorites}</button>
          <button onClick={onOpenSettings} className="hover:text-sky-700">{t.settingsMenu}</button>
          <button onClick={onResetFilters} className="hover:text-sky-700">{t.resetFilters}</button>
        </nav>
      </div>
    </div>
  </footer>
  );
};
