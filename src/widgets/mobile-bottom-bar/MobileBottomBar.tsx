import React from 'react';
import { PageId } from '../../shared/types';
import { Building2, Map, Heart, Sliders } from 'lucide-react';
import { useUIStore } from '../../app/model/uiStore';
import { useFilterStore } from '../../features/filter-properties/model/filtersStore';
import { useAnonymousProfileStore } from '../../features/anonymous-profile/model/anonymousProfileStore';
import { Language, translations } from '../../shared/i18n';

export interface MobileBottomBarProps {
  currentPage?: PageId;
  onNavigate?: (page: PageId) => void;
  viewMode?: 'split' | 'grid' | 'map';
  onViewModeChange?: (m: 'split' | 'grid' | 'map') => void;
  favoritesCount?: number;
  onOpenFavorites?: () => void;
  onOpenSettings?: () => void;
  onOpenFiltersSheet?: () => void;
  activeFilterCount?: number;
  language?: Language;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
  currentPage: propCurrentPage,
  onNavigate: propOnNavigate,
  viewMode: propViewMode,
  onViewModeChange: propOnViewModeChange,
  favoritesCount: propFavoritesCount,
  onOpenFavorites: propOnOpenFavorites,
  onOpenSettings: propOnOpenSettings,
  language = 'ru',
}) => {
  const storeCurrentPage = useUIStore((s) => s.activePage);
  const setStorePage = useUIStore((s) => s.setActivePage);
  const setSavedOpen = useUIStore((s) => s.setSavedOpen);
  const setSettingsOpen = useUIStore((s) => s.setSettingsOpen);

  const storeViewMode = useFilterStore((s) => s.viewMode);
  const setStoreViewMode = useFilterStore((s) => s.setViewMode);

  const favorites = useAnonymousProfileStore((s) => s.favorites);

  const currentPage = propCurrentPage || storeCurrentPage;
  const onNavigate = propOnNavigate || setStorePage;
  const viewMode = propViewMode || storeViewMode;
  const onViewModeChange = propOnViewModeChange || setStoreViewMode;
  const favoritesCount = propFavoritesCount !== undefined ? propFavoritesCount : favorites.length;
  const onOpenFavorites = propOnOpenFavorites || (() => setSavedOpen(true));
  const onOpenSettings = propOnOpenSettings || (() => setSettingsOpen(true));

  const isCatalog = currentPage === 'catalog';
  const isMapView = isCatalog && viewMode === 'map';
  const t = translations[language];

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1 safe-area-pb shadow-2xl">
      <div className="flex items-center justify-around h-14">
        {/* 1. Каталог */}
        <button
          onClick={() => {
            onNavigate('catalog');
            if (viewMode === 'map') onViewModeChange('split');
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition cursor-pointer ${
            isCatalog && viewMode !== 'map'
              ? 'text-sky-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">{t.navCatalog}</span>
        </button>

        {/* 2. Карта */}
        <button
          onClick={() => {
            onNavigate('catalog');
            onViewModeChange(viewMode === 'map' ? 'split' : 'map');
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition cursor-pointer ${
            isMapView
              ? 'text-sky-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Map className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">{t.viewMap}</span>
        </button>

        {/* 3. Избранное */}
        <button
          onClick={onOpenFavorites}
          className="relative flex flex-col items-center justify-center flex-1 py-1 rounded-xl text-slate-400 hover:text-slate-200 transition cursor-pointer"
        >
          <div className="relative">
            <Heart className="w-5 h-5 mb-0.5" />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-xs">
                {favoritesCount > 9 ? '9+' : favoritesCount}
              </span>
            )}
          </div>
          <span className="text-[10px]">{t.navFavorites}</span>
        </button>

        {/* 4. Настройки / Меню */}
        <button
          onClick={onOpenSettings}
          className="flex flex-col items-center justify-center flex-1 py-1 rounded-xl text-slate-400 hover:text-slate-200 transition cursor-pointer"
        >
          <Sliders className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">{t.settingsMenu}</span>
        </button>
      </div>
    </div>
  );
};
