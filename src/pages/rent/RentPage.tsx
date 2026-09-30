import React from 'react';
import { DatabaseProperty, Currency } from '../../shared/types';
import { Language, translations } from '../../shared/i18n';
import { PropertyCard } from '../../entities/property/ui/PropertyCard';
import { useRentalPropertiesQuery } from '../../entities/property/model/usePropertiesQuery';
import { useFilterStore } from '../../features/filter-properties/model/filtersStore';
import { useUIStore } from '../../app/model/uiStore';
import {
  Waves,
  Calendar,
  Building,
  ArrowRight,
} from 'lucide-react';

export interface RentPageProps {
  properties?: DatabaseProperty[];
  currency?: Currency;
  language?: Language;
  onSelectProperty?: (property: DatabaseProperty) => void;
  onBookViewing?: (property: DatabaseProperty) => void;
  onExploreCatalog?: () => void;
}

export const RentPage: React.FC<RentPageProps> = ({
  properties: propProperties,
  currency: propCurrency,
  language: propLanguage,
  onSelectProperty,
  onBookViewing,
  onExploreCatalog,
}) => {
  const { data: rentalProperties = [] } = useRentalPropertiesQuery();
  const storeCurrency = useFilterStore((s) => s.filter.currency);
  const storeLanguage = useUIStore((s) => s.language);
  const openDetail = useUIStore((s) => s.openPropertyDetail);
  const openBooking = useUIStore((s) => s.openBooking);
  const setActivePage = useUIStore((s) => s.setActivePage);
  const setFilter = useFilterStore((s) => s.setFilter);

  const currency = propCurrency || storeCurrency;
  const language = propLanguage || storeLanguage;
  const properties = propProperties || rentalProperties;

  const t = translations[language];

  const featuredRentals = properties.slice(0, 6);

  const handleSelect = (p: DatabaseProperty) => {
    if (onSelectProperty) onSelectProperty(p);
    else openDetail(p);
  };

  const handleBooking = (p: DatabaseProperty) => {
    if (onBookViewing) onBookViewing(p);
    else openBooking(p);
  };

  const handleExplore = (deal: 'long_term_rent' | 'daily_rent') => {
    setFilter({ deal });
    if (onExploreCatalog) onExploreCatalog();
    else setActivePage('catalog');
  };

  return (
    <div className="space-y-10 py-4 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-sky-950 via-slate-900 to-cyan-950 text-white p-8 sm:p-14 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />
        <div className="relative max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold border border-sky-400/30">
            <Waves className="w-3.5 h-3.5 text-cyan-400" />
            {t.rentHeroTitle}
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            {t.rentHeroTitle}
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            {t.rentHeroSubtitle}
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => handleExplore('long_term_rent')}
              className="px-6 py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <span>{t.rentLongTerm}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleExplore('daily_rent')}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs rounded-xl border border-white/20 backdrop-blur-md transition flex items-center gap-2 cursor-pointer"
            >
              <span>{t.rentDaily}</span>
              <Calendar className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Popular Rentals */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              {t.rentListingsHeading}
            </h2>
            <p className="text-xs text-slate-500">
              {t.rentListingsDescription}
            </p>
          </div>
          <button
            onClick={() => handleExplore('long_term_rent')}
            className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
          >
            <span>{t.browseAllRentals}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredRentals.map((property) => (
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
