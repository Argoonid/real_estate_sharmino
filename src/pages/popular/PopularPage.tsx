import React from 'react';
import { useRecentPropertiesQuery } from '../../entities/property/model/usePropertiesQuery';
import { PropertyCard } from '../../entities/property/ui/PropertyCard';
import { useAnonymousProfileStore } from '../../features/anonymous-profile/model/anonymousProfileStore';
import { useFilterStore } from '../../features/filter-properties/model/filtersStore';
import { useUIStore } from '../../app/model/uiStore';
import { Flame } from 'lucide-react';
import { translations } from '../../shared/i18n';

export const PopularPage: React.FC = () => {
  const { data: properties = [], isLoading, isError, error } = useRecentPropertiesQuery();
  const currency = useFilterStore((state) => state.filter.currency);
  const language = useUIStore((state) => state.language);
  const t = translations[language];
  const openDetail = useUIStore((state) => state.openPropertyDetail);
  const openBooking = useUIStore((state) => state.openBooking);
  const favorites = useAnonymousProfileStore((state) => state.favorites);
  const toggleFavorite = useAnonymousProfileStore((state) => state.toggleFavorite);
  const compareIds = useAnonymousProfileStore((state) => state.compareIds);
  const toggleCompare = useAnonymousProfileStore((state) => state.toggleCompare);

  return (
    <section className="mx-auto w-full max-w-7xl space-y-5 px-4 py-6 sm:px-6">
      <header className="flex items-center gap-3">
        <Flame className="h-6 w-6 text-amber-500" />
        <div>
          <h1 className="text-xl font-black text-slate-900">{t.recentPropertiesHeading}</h1>
          <p className="text-xs text-slate-500">{t.recentPropertiesDescription}</p>
        </div>
      </header>

      {isLoading && <p className="text-sm text-slate-500">{t.loadingProperties}</p>}
      {isError && (
        <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
          {error instanceof Error ? error.message : t.dataErrorTitle}
        </p>
      )}
      {!isLoading && !isError && properties.length === 0 && (
        <p className="rounded-xl bg-white p-5 text-sm text-slate-600">
          {t.emptyRecentProperties}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {properties.map((property) => (
          <div key={property.id} className="space-y-2">
            <PropertyCard
              property={property}
              currency={currency}
              language={language}
              isFavorite={favorites.includes(property.id)}
              isCompared={compareIds.includes(property.id)}
              onSelect={openDetail}
              onBookViewing={openBooking}
              onToggleFavorite={toggleFavorite}
              onToggleCompare={(selected) => toggleCompare(selected.id)}
            />
          </div>
        ))}
      </div>
    </section>
  );
};
