import React, { useState, useMemo } from 'react';
import { FilterState, Currency, DealType } from '../../shared/types';
import { useDistrictsQuery } from '../../entities/district/model/useDistrictsQuery';
import { getDistrictLabel, Language, translations } from '../../shared/i18n';
import { useFilterStore } from '../../features/filter-properties/model/filtersStore';
import { useUIStore } from '../../app/model/uiStore';
import { UNLIMITED_PRICE } from '../../shared/lib/formatters';
import { CustomDropdown } from '../../shared/ui/CustomDropdown';
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  Waves,
  Building,
  Check,
  ChevronDown,
  X,
  Sparkles,
} from 'lucide-react';

export interface FilterBarProps {
  filter?: FilterState;
  onChange?: (updater: (prev: FilterState) => FilterState) => void;
  onReset?: () => void;
  totalFound?: number;
  language?: Language;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filter: propFilter,
  onChange: propOnChange,
  onReset: propOnReset,
  totalFound = 0,
  language: propLanguage,
}) => {
  const storeFilter = useFilterStore((s) => s.filter);
  const setStoreFilter = useFilterStore((s) => s.setFilter);
  const resetStoreFilter = useFilterStore((s) => s.resetFilters);
  const storeLanguage = useUIStore((s) => s.language);
  const { data: districts = [] } = useDistrictsQuery();

  const filter = propFilter || storeFilter;
  const onChange = propOnChange || setStoreFilter;
  const onReset = propOnReset || resetStoreFilter;
  const language = propLanguage || storeLanguage;

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const t = translations[language];

  const handleDealType = (type: DealType | 'all') => {
    onChange((prev) => ({ ...prev, deal: type }));
  };

  const handleDistrict = (districtId: string) => {
    onChange((prev) => ({
      ...prev,
      districtId: prev.districtId === districtId ? 'all' : districtId,
    }));
  };

  const currencySymbol =
    filter.currency === 'USD'
      ? '$'
      : filter.currency === 'EUR'
      ? '€'
      : filter.currency === 'GBP'
      ? '£'
      : filter.currency === 'EGP'
      ? 'EGP'
      : '₽';

  // Count active non-default filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filter.deal && filter.deal !== 'all') count++;
    if (filter.districtId && filter.districtId !== 'all') count++;
    if (filter.propertyType && filter.propertyType !== 'all') count++;
    if (filter.bedrooms && filter.bedrooms !== 'all') count++;
    if (filter.bathrooms && filter.bathrooms !== 'all') count++;
    if (filter.minPrice && filter.minPrice > 0) count++;
    if (filter.maxPrice && filter.maxPrice < UNLIMITED_PRICE) count++;
    if (filter.minArea && filter.minArea > 0) count++;
    if (filter.maxArea < UNLIMITED_PRICE) count++;
    if (filter.seaViewOnly) count++;
    if (filter.beachAccessOnly) count++;
    if (filter.poolOnly) count++;
    if (filter.furnishedOnly) count++;
    if (filter.balconyOnly) count++;
    if (filter.gardenOnly) count++;
    return count;
  }, [filter]);

  const hasActiveFilters = activeFilterCount > 0 || Boolean(filter.searchQuery);

  // Active district name for collapsed summary chip
  const activeDistrictName = useMemo(() => {
    if (!filter.districtId || filter.districtId === 'all') return null;
    const d = districts.find((x) => x.id === filter.districtId);
    return d ? getDistrictLabel(d, language) : filter.districtId;
  }, [filter.districtId, districts, language]);

  const propertyTypeLabels: Record<string, string> = {
    apartment: t.typeApartment,
    villa: t.typeVilla,
    studio: t.typeStudio,
    duplex: t.typeDuplex,
    penthouse: t.typePenthouse,
    chalet: t.typeChalet,
    commercial: t.typeCommercial,
  };

  return (
    <div className="bg-white border-b border-slate-200/90 shadow-2xs sticky top-0 lg:top-[68px] z-30 backdrop-blur-md bg-white/95 transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 space-y-2.5">
        {/* Row 1: Search Bar, Advanced Filters Toggle, Reset & Collapse Arrow */}
        <div className="flex items-center gap-2">
          {/* Search Input with Clear Button */}
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={filter.searchQuery || ''}
              onChange={(e) => onChange((prev) => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full pl-9 pr-8 py-2 sm:py-1.5 text-xs bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition truncate"
            />
            {filter.searchQuery && (
              <button
                onClick={() => onChange((prev) => ({ ...prev, searchQuery: '' }))}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-700 rounded-full cursor-pointer"
                title={t.close}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filters Button with Active Count Badge */}
          <button
            onClick={() => {
              if (isCollapsed) setIsCollapsed(false);
              setShowAdvanced(!showAdvanced);
            }}
            aria-label={t.filters}
            title={t.filters}
            className={`px-3 py-2 sm:py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
              showAdvanced || activeFilterCount > 0
                ? 'bg-sky-50 border-sky-300 text-sky-700 shadow-2xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.filters}</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 bg-sky-600 text-white rounded-full text-[10px] font-extrabold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Reset Filters Button (if active) */}
          {hasActiveFilters && (
            <button
              onClick={onReset}
              title={t.reset}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Collapse/Expand Arrow Toggle Button (Стрелочка скрытия фильтров) */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-2 rounded-xl border transition cursor-pointer shrink-0 flex items-center justify-center ${
              isCollapsed
                ? 'bg-sky-50 border-sky-200 text-sky-700 hover:bg-sky-100'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
            title={isCollapsed ? t.expandFilters : t.collapseFilters}
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-300 ${
                isCollapsed ? '' : 'rotate-180'
              }`}
            />
          </button>
        </div>

        {/* Collapsed State Quick Summary Bar (Visible only when collapsed and active filters exist) */}
        {isCollapsed && hasActiveFilters && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-[11px] animate-in fade-in duration-200">
            <span className="text-slate-400 font-medium shrink-0">{t.activeFilters}</span>
            {filter.deal && filter.deal !== 'all' && (
              <span
                onClick={() => setIsCollapsed(false)}
                className="px-2 py-0.5 rounded-lg bg-sky-100 text-sky-800 font-bold shrink-0 cursor-pointer hover:bg-sky-200"
              >
                {filter.deal === 'sale'
                  ? t.dealSale
                  : filter.deal === 'long_term_rent'
                  ? t.dealRentLong
                  : t.dealRentDaily}
              </span>
            )}
            {activeDistrictName && (
              <span
                onClick={() => setIsCollapsed(false)}
                className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-bold shrink-0 cursor-pointer hover:bg-slate-200"
              >
                {activeDistrictName}
              </span>
            )}
            {(filter.minPrice > 0 || filter.maxPrice < UNLIMITED_PRICE) && (
              <span
                onClick={() => setIsCollapsed(false)}
                className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-bold shrink-0 cursor-pointer hover:bg-slate-200"
              >
                {filter.minPrice > 0 && `${currencySymbol}${filter.minPrice.toLocaleString(language)}`}
                {filter.minPrice > 0 && filter.maxPrice < UNLIMITED_PRICE && ' – '}
                {filter.maxPrice < UNLIMITED_PRICE && `${currencySymbol}${filter.maxPrice.toLocaleString(language)}`}
              </span>
            )}
            {filter.bedrooms && filter.bedrooms !== 'all' && (
              <span
                onClick={() => setIsCollapsed(false)}
                className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-bold shrink-0 cursor-pointer hover:bg-slate-200"
              >
                {filter.bedrooms === '0' ? t.studio : filter.bedrooms === '4+' ? '4+' : t.bedroomsCount(Number(filter.bedrooms))}
              </span>
            )}
            {filter.seaViewOnly && (
              <span
                onClick={() => setIsCollapsed(false)}
                className="px-2 py-0.5 rounded-lg bg-cyan-100 text-cyan-800 font-bold shrink-0 cursor-pointer hover:bg-cyan-200"
              >
                {t.seaView}
              </span>
            )}
            {filter.beachAccessOnly && (
              <span
                onClick={() => setIsCollapsed(false)}
                className="px-2 py-0.5 rounded-lg bg-sky-100 text-sky-800 font-bold shrink-0 cursor-pointer hover:bg-sky-200"
              >
                {t.beachAccess}
              </span>
            )}
            <button
              onClick={() => setIsCollapsed(false)}
              className="text-sky-600 font-bold underline hover:text-sky-800 shrink-0 ml-1 cursor-pointer"
            >
              {t.editFilters}
            </button>
          </div>
        )}

        {/* Expandable Section: Deal Tabs & District Chips */}
        {!isCollapsed && (
          <div className="space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
            {/* Deal Type Switcher Segment (Equal width on mobile, no multi-line wrap!) */}
            <div className="flex lg:hidden items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/80 overflow-x-auto no-scrollbar">
              <button
                onClick={() => handleDealType('all')}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap text-center cursor-pointer ${
                  filter.deal === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {t.dealAll}
              </button>
              <button
                onClick={() => handleDealType('sale')}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap text-center cursor-pointer ${
                  filter.deal === 'sale'
                    ? 'bg-white text-sky-700 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {t.dealSale}
              </button>
              <button
                onClick={() => handleDealType('long_term_rent')}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap text-center cursor-pointer ${
                  filter.deal === 'long_term_rent'
                    ? 'bg-white text-sky-700 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className="sm:hidden">{t.navRent}</span>
                <span className="hidden sm:inline">{t.dealRentLong}</span>
              </button>
              <button
                onClick={() => handleDealType('daily_rent')}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap text-center cursor-pointer ${
                  filter.deal === 'daily_rent'
                    ? 'bg-white text-sky-700 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {t.dealRentDaily}
              </button>
            </div>

            {/* Districts Scrollable Horizontal Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <button
                onClick={() => handleDistrict('all')}
                className={`px-3 py-1 rounded-full text-[11px] font-bold shrink-0 transition cursor-pointer whitespace-nowrap ${
                  filter.districtId === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                {t.allDistricts}
              </button>
              {districts.map((d) => (
                <button
                  key={d.id}
                  onClick={() => handleDistrict(d.id)}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold shrink-0 transition cursor-pointer flex items-center gap-1 whitespace-nowrap ${
                    filter.districtId === d.id
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                  }`}
                >
                  <span>{getDistrictLabel(d, language)}</span>
                  {filter.districtId === d.id && <Check className="w-3 h-3 ml-0.5" />}
                </button>
              ))}
            </div>

            {/* Advanced Filters Panel (expanded on demand) */}
            {showAdvanced && (
              <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2.5 animate-in fade-in duration-150">
                <CustomDropdown
                  value={filter.deal}
                  onChange={(value) => onChange((prev) => ({ ...prev, deal: value }))}
                  label={t.dealAll}
                  options={[
                    { value: 'all', label: t.dealAll },
                    { value: 'sale', label: t.dealSale },
                    { value: 'long_term_rent', label: t.dealRentLong },
                    { value: 'daily_rent', label: t.dealRentDaily },
                  ]}
                  className="w-full"
                />

                {/* Property Type */}
                <CustomDropdown
                  value={filter.propertyType || 'all'}
                  onChange={(value) => onChange((prev) => ({ ...prev, propertyType: value }))}
                  label={t.propertyType}
                  options={[
                    { value: 'all', label: t.propertyTypeAny },
                    ...Object.entries(propertyTypeLabels).map(([value, label]) => ({ value, label })),
                  ]}
                  className="w-full"
                />

                {/* Bedrooms */}
                <CustomDropdown
                  value={filter.bedrooms || 'all'}
                  onChange={(value) => onChange((prev) => ({ ...prev, bedrooms: value }))}
                  label={t.bedrooms}
                  options={[
                    { value: 'all', label: t.bedroomsAll },
                    { value: '0', label: t.studio },
                    ...[1, 2, 3].map((count) => ({ value: String(count), label: t.bedroomsCount(count) })),
                    { value: '4+', label: `${t.bedroomsCount(4)}+` },
                  ]}
                  className="w-full"
                />

                {/* Bathrooms */}
                <CustomDropdown
                  value={filter.bathrooms || 'all'}
                  onChange={(value) => onChange((prev) => ({ ...prev, bathrooms: value }))}
                  label={t.bathrooms}
                  options={[
                    { value: 'all', label: t.bedroomsAll },
                    ...[1, 2].map((count) => ({ value: String(count), label: t.bathroomsCount(count) })),
                    { value: '3+', label: `${t.bathroomsCount(3)}+` },
                  ]}
                  className="w-full"
                />

                {/* Minimum Price */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {t.priceFrom} ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    inputMode="numeric"
                    placeholder="0"
                    value={filter.minPrice || ''}
                    onChange={(e) => {
                      const value = Math.max(0, Number(e.target.value) || 0);
                      onChange((prev) => ({
                        ...prev,
                        minPrice: value,
                        maxPrice: prev.maxPrice !== UNLIMITED_PRICE && value > prev.maxPrice ? value : prev.maxPrice,
                      }));
                    }}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500 font-medium"
                  />
                </div>

                {/* Maximum Price */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {t.maxPrice} ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    min={filter.minPrice}
                    step={1000}
                    inputMode="numeric"
                    placeholder={t.noLimit}
                    value={filter.maxPrice === UNLIMITED_PRICE ? '' : filter.maxPrice}
                    onChange={(e) => {
                      const val = e.target.value === '' ? UNLIMITED_PRICE : Math.max(filter.minPrice, Number(e.target.value) || 0);
                      onChange((prev) => ({ ...prev, maxPrice: val }));
                    }}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500 font-medium"
                  />
                </div>

                {/* Minimum Area */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {t.areaFrom}
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={10}
                    inputMode="numeric"
                    placeholder="0"
                    value={filter.minArea || ''}
                    onChange={(e) => {
                      const value = Math.max(0, Number(e.target.value) || 0);
                      onChange((prev) => ({
                        ...prev,
                        minArea: value,
                        maxArea: prev.maxArea < value ? value : prev.maxArea,
                      }));
                    }}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500 font-medium"
                  />
                </div>

                {/* Maximum Area */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {t.areaTo}
                  </label>
                  <input
                    type="number"
                    min={filter.minArea}
                    step={10}
                    inputMode="numeric"
                    placeholder={t.noLimit}
                    value={filter.maxArea >= UNLIMITED_PRICE ? '' : filter.maxArea}
                    onChange={(e) => {
                      const value = e.target.value === '' ? UNLIMITED_PRICE : Math.max(filter.minArea, Number(e.target.value) || filter.minArea);
                      onChange((prev) => ({ ...prev, maxArea: value }));
                    }}
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-sky-500 font-medium"
                  />
                </div>

                {/* Result sorting */}
                <CustomDropdown
                  value={filter.sortBy}
                  onChange={(value) => onChange((prev) => ({ ...prev, sortBy: value as FilterState['sortBy'] }))}
                  label={t.sortBy}
                  options={[
                    { value: 'featured', label: t.sortFeatured },
                    { value: 'newest', label: t.sortNewest },
                    { value: 'price_asc', label: t.sortPriceAsc },
                    { value: 'price_desc', label: t.sortPriceDesc },
                    { value: 'area_desc', label: t.sortAreaDesc },
                  ]}
                  className="w-full"
                />

                {[
                  { key: 'seaViewOnly', label: t.seaView },
                  { key: 'beachAccessOnly', label: t.privateBeach },
                  { key: 'poolOnly', label: t.swimmingPool },
                  { key: 'furnishedOnly', label: t.furnished },
                  { key: 'balconyOnly', label: t.balcony },
                  { key: 'gardenOnly', label: t.garden },
                  { key: 'priceOnRequestOnly', label: t.priceOnRequest },
                ].map(({ key, label }) => (
                  <label key={key} className="flex min-h-10 items-center gap-2 rounded-xl border border-slate-100 px-2.5 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filter[key as keyof FilterState] as boolean}
                      onChange={(e) => onChange((prev) => ({ ...prev, [key]: e.target.checked }))}
                      className="w-4 h-4 rounded-md border-slate-300 text-sky-600 focus:ring-sky-500"
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
