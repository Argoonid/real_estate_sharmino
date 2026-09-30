import React, { useState, useCallback } from 'react';
import { DatabaseProperty } from '../../shared/types';
import {
  useAllMapPropertiesQuery,
  useInfinitePropertiesQuery,
} from '../../entities/property/model/usePropertiesQuery';
import { useFilterStore } from '../../features/filter-properties/model/filtersStore';
import { useAnonymousProfileStore } from '../../features/anonymous-profile/model/anonymousProfileStore';
import { useUIStore } from '../../app/model/uiStore';
import { FilterBar } from '../../widgets/filter-bar/FilterBar';
import { PropertyMap } from '../../widgets/property-map/PropertyMap';
import { PropertyCard } from '../../entities/property/ui/PropertyCard';
import { useExchangeRates } from '../../shared/lib/exchangeRates';
import { translations } from '../../shared/i18n';
import {
  RefreshCw,
  Heart,
  Share2,
  AlertTriangle,
} from 'lucide-react';

export const CatalogPage: React.FC = () => {
  const filter = useFilterStore((s) => s.filter);
  const setFilter = useFilterStore((s) => s.setFilter);
  const resetFilters = useFilterStore((s) => s.resetFilters);
  const viewMode = useFilterStore((s) => s.viewMode);
  const isOnlyFavorites = useFilterStore((s) => s.isOnlyFavorites);
  const setIsOnlyFavorites = useFilterStore((s) => s.setIsOnlyFavorites);

  const favorites = useAnonymousProfileStore((s) => s.favorites);
  const toggleFavorite = useAnonymousProfileStore((s) => s.toggleFavorite);
  const compareIds = useAnonymousProfileStore((s) => s.compareIds);
  const toggleCompare = useAnonymousProfileStore((s) => s.toggleCompare);
  const addRecentView = useAnonymousProfileStore((s) => s.addRecentView);
  const catalogQuery = useInfinitePropertiesQuery(filter, {
    favoriteIds: isOnlyFavorites ? favorites : undefined,
  });
  const exchangeRatesQuery = useExchangeRates();
  const mapPropertiesQuery = useAllMapPropertiesQuery(filter, {
    favoriteIds: isOnlyFavorites ? favorites : undefined,
    enabled: viewMode !== 'grid',
  });
  const mapProperties = mapPropertiesQuery.data ?? [];
  const allProperties = catalogQuery.data?.pages ?? [];
  const totalFound = catalogQuery.data?.total ?? 0;
  const isLoading = catalogQuery.isLoading;
  const isFetching = catalogQuery.isFetching;

  const language = useUIStore((s) => s.language);
  const t = translations[language];
  const openDetail = useUIStore((s) => s.openPropertyDetail);
  const openBooking = useUIStore((s) => s.openBooking);
  const openShareProfile = () => useUIStore.getState().setShareProfileOpen(true);

  const [selectedMapProperty, setSelectedMapProperty] = useState<DatabaseProperty | null>(null);
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null);

  const filteredProperties = allProperties;
  const visibleProperties = allProperties;

  const handleSelectProperty = useCallback((p: DatabaseProperty) => {
    setSelectedMapProperty(p);
    addRecentView(p.id);
    openDetail(p);
  }, [addRecentView, openDetail, setSelectedMapProperty]);

  const handleDistrictSelectFromMap = useCallback((distId: string) => {
    setFilter((prev) => ({
      ...prev,
      districtId: prev.districtId === distId ? 'all' : distId,
    }));
  }, [setFilter]);

  return (
    <div className="flex-1 flex flex-col">
      {/* Sticky Filter Bar Widget */}
      <FilterBar
        filter={filter}
        onChange={(updater) => setFilter(updater)}
        onReset={resetFilters}
        totalFound={totalFound}
        language={language}
      />

      {/* Main Catalog Body */}
      <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 py-3 sm:py-4 flex-1 flex flex-col pb-24 lg:pb-8">
        {/* Results stats row */}
        <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-wrap">
            <h1 className="text-xs sm:text-base font-extrabold text-slate-900 tracking-tight truncate">
              {t.catalogTitle}
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-bold bg-sky-100 text-sky-800 shrink-0">
              {totalFound}
            </span>
            {isFetching && (
              <span title={t.syncingData} className="shrink-0">
                <RefreshCw className="w-3 h-3 text-sky-600 animate-spin" />
              </span>
            )}

          </div>

          <div className="flex items-center gap-1.5 text-xs shrink-0">
            {/* Anonymous Profile Fast Share */}
            <button
              onClick={openShareProfile}
              className="px-2 sm:px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs text-xs"
              title={t.shareSelection}
            >
              <Share2 className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span className="hidden sm:inline">{t.shareSelection}</span>
            </button>

            {/* Only Favorites Filter */}
            <button
              onClick={() => setIsOnlyFavorites(!isOnlyFavorites)}
              className={`px-2 sm:px-2.5 py-1.5 rounded-xl border transition flex items-center gap-1 cursor-pointer font-bold text-xs ${
                isOnlyFavorites
                  ? 'bg-rose-50 border-rose-300 text-rose-600 shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isOnlyFavorites ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span className="hidden sm:inline">{t.favorites}</span>
              <span>({favorites.length})</span>
            </button>
          </div>
        </div>

        {/* Supabase Error Alert Banner */}
        {(catalogQuery.isError || mapPropertiesQuery.isError || exchangeRatesQuery.isError) && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <div>
                <p className="font-bold">{t.dataErrorTitle}</p>
                <p className="text-[11px] text-rose-700 font-mono mt-0.5">
                  {catalogQuery.error instanceof Error
                    ? catalogQuery.error.message
                    : mapPropertiesQuery.error instanceof Error
                      ? mapPropertiesQuery.error.message
                      : exchangeRatesQuery.error instanceof Error
                        ? exchangeRatesQuery.error.message
                      : t.dataErrorTitle}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                void catalogQuery.refetch();
                void mapPropertiesQuery.refetch();
                void exchangeRatesQuery.refetch();
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shrink-0 transition cursor-pointer"
            >
              {t.retry}
            </button>
          </div>
        )}

        {/* No matching properties */}
        {!isLoading && totalFound === 0 && !catalogQuery.isError && (
          <div className="mb-4 p-4 rounded-2xl bg-sky-50 border border-sky-300 text-sky-950 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div>
              <p className="font-bold">{t.noProperties}</p>
              <p className="text-[11px] text-sky-800 mt-0.5">
                {t.noPropertiesHint}
              </p>
            </div>
            <button
              onClick={resetFilters}
              className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shrink-0 transition cursor-pointer"
            >
              {t.resetFilters}
            </button>
          </div>
        )}

        {/* View Mode Switching: Split / Grid / Map */}
        {viewMode === 'split' && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[500px]">
            {/* Left list column */}
            <div className="lg:col-span-7 xl:col-span-7 flex flex-col">
              {filteredProperties.length === 0 ? (
                null
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                    {visibleProperties.map((property) => (
                      <div
                        key={property.id}
                        onMouseEnter={() => setHoveredPropertyId(property.id)}
                        onMouseLeave={() => setHoveredPropertyId(null)}
                      >
                        <PropertyCard
                          property={property}
                          currency={filter.currency}
                          language={language}
                          isFavorite={favorites.includes(property.id)}
                          isCompared={compareIds.includes(property.id)}
                          onSelect={handleSelectProperty}
                          onToggleFavorite={toggleFavorite}
                          onToggleCompare={(p) => toggleCompare(p.id)}
                          onBookViewing={openBooking}
                        />
                      </div>
                    ))}
                  </div>

                  {catalogQuery.hasNextPage && (
                    <div className="pt-4 text-center">
                      <button
                        onClick={() => catalogQuery.fetchNextPage()}
                        disabled={catalogQuery.isFetchingNextPage}
                        className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-2xl text-xs font-bold shadow-xs hover:shadow-md transition cursor-pointer inline-flex items-center gap-2"
                      >
                        <span>
                          {catalogQuery.isFetchingNextPage
                            ? t.mapLoading
                            : `${t.loadMore} (${t.remainingCount(totalFound - visibleProperties.length)})`}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Map column (Sticky on desktop) */}
            <div className="hidden lg:block lg:col-span-5 xl:col-span-5">
              <div className="sticky top-[138px] h-[calc(100vh-160px)] min-h-[500px]">
                <PropertyMap
                  properties={mapProperties}
                  selectedProperty={selectedMapProperty}
                  hoveredPropertyId={hoveredPropertyId}
                  onSelectProperty={handleSelectProperty}
                  onBookViewing={openBooking}
                  currency={filter.currency}
                  language={language}
                  activeDistrictId={filter.districtId}
                  onDistrictSelect={handleDistrictSelectFromMap}
                  isLoading={mapPropertiesQuery.isLoading}
                />
              </div>
            </div>
          </div>
        )}

        {viewMode === 'grid' && (
          <div className="flex-1 space-y-4">
            {filteredProperties.length === 0 ? (
              null
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
                  {visibleProperties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      currency={filter.currency}
                      language={language}
                      isFavorite={favorites.includes(property.id)}
                      isCompared={compareIds.includes(property.id)}
                      onSelect={handleSelectProperty}
                      onToggleFavorite={toggleFavorite}
                      onToggleCompare={(p) => toggleCompare(p.id)}
                      onBookViewing={openBooking}
                    />
                  ))}
                </div>

                {catalogQuery.hasNextPage && (
                  <div className="pt-4 text-center">
                    <button
                      onClick={() => catalogQuery.fetchNextPage()}
                      disabled={catalogQuery.isFetchingNextPage}
                      className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-2xl text-xs font-bold shadow-xs hover:shadow-md transition cursor-pointer inline-flex items-center gap-2"
                    >
                      <span>
                        {catalogQuery.isFetchingNextPage
                          ? t.mapLoading
                          : `${t.loadMore} (${t.remainingCount(totalFound - visibleProperties.length)})`}
                      </span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {viewMode === 'map' && (
          <div className="flex-1 h-[calc(100vh-140px)] sm:h-[calc(100vh-170px)] min-h-[480px]">
            <PropertyMap
              properties={mapProperties}
              selectedProperty={selectedMapProperty}
              hoveredPropertyId={hoveredPropertyId}
              onSelectProperty={handleSelectProperty}
              onBookViewing={openBooking}
              currency={filter.currency}
              language={language}
              activeDistrictId={filter.districtId}
              onDistrictSelect={handleDistrictSelectFromMap}
              isLoading={mapPropertiesQuery.isLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
};
