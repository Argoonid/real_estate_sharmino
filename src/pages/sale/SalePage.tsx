import React from 'react';
import { DatabaseProperty, Currency } from '../../shared/types';
import { Language, translations } from '../../shared/i18n';
import { PropertyCard } from '../../entities/property/ui/PropertyCard';
import { usePropertyPageQuery } from '../../entities/property/model/usePropertiesQuery';
import { INITIAL_FILTER } from '../../features/filter-properties/model/filtersStore';
import { useAnonymousProfileStore } from '../../features/anonymous-profile/model/anonymousProfileStore';
import { useFilterStore } from '../../features/filter-properties/model/filtersStore';
import { useUIStore } from '../../app/model/uiStore';
import {
  ArrowRight,
} from 'lucide-react';

export interface SalePageProps {
  properties?: DatabaseProperty[];
  currency?: Currency;
  language?: Language;
  onSelectProperty?: (property: DatabaseProperty) => void;
  onBookViewing?: (property: DatabaseProperty) => void;
  onExploreCatalog?: () => void;
}

export const SalePage: React.FC<SalePageProps> = ({
  properties: propProperties,
  currency: propCurrency,
  language: propLanguage,
  onSelectProperty,
  onBookViewing,
  onExploreCatalog,
}) => {
  const { data: salePage, isLoading, isError, error } = usePropertyPageQuery({ ...INITIAL_FILTER, deal: 'sale' }, 6);
  const storeCurrency = useFilterStore((s) => s.filter.currency);
  const storeLanguage = useUIStore((s) => s.language);
  const openDetail = useUIStore((s) => s.openPropertyDetail);
  const openBooking = useUIStore((s) => s.openBooking);
  const setActivePage = useUIStore((s) => s.setActivePage);
  const setFilter = useFilterStore((s) => s.setFilter);

  const currency = propCurrency || storeCurrency;
  const language = propLanguage || storeLanguage;
  const properties = propProperties || salePage?.properties || [];

  const t = translations[language];

  const saleProperties = properties.slice(0, 6);
  const saleTotal = propProperties ? propProperties.length : salePage?.total ?? 0;

  const handleSelect = (p: DatabaseProperty) => {
    if (onSelectProperty) onSelectProperty(p);
    else openDetail(p);
  };

  const handleBooking = (p: DatabaseProperty) => {
    if (onBookViewing) onBookViewing(p);
    else openBooking(p);
  };

  const handleExplore = () => {
    setFilter({ deal: 'sale' });
    if (onExploreCatalog) onExploreCatalog();
    else setActivePage('catalog');
  };

  return (
    <div className="space-y-10 py-4 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Hero */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-sky-950 to-blue-900 text-white p-8 sm:p-14 shadow-2xl">
        <div className="max-w-2xl space-y-4">
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            {t.saleHeroTitle}
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            {t.saleHeroSubtitle}
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={handleExplore}
              className="px-6 py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <span>{t.browseSaleListings}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Featured Properties */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              {t.saleListingsHeading}
            </h2>
            <p className="text-xs text-slate-500">
              {t.saleListingsDescription}
            </p>
          </div>
          <button
            onClick={handleExplore}
            className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
          >
            <span>{t.browseSaleListings} ({saleTotal})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {isLoading && <p className="text-sm text-slate-500">{t.loadingProperties}</p>}
        {isError && <p role="alert" className="text-sm text-rose-700">{error instanceof Error ? error.message : t.dataErrorTitle}</p>}
        {!isLoading && !isError && saleProperties.length === 0 && (
          <p className="text-sm text-slate-500">{t.noProperties}</p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {saleProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              currency={currency}
              language={language}
              onSelect={handleSelect}
              onBookViewing={handleBooking}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
