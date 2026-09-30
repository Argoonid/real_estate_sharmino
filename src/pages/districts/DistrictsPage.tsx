import React from 'react';
import { useDistrictsQuery } from '../../entities/district/model/useDistrictsQuery';
import { Language, translations } from '../../shared/i18n';
import { getDistrictLabel } from '../../shared/i18n';
import { useFilterStore } from '../../features/filter-properties/model/filtersStore';
import { useUIStore } from '../../app/model/uiStore';
import { MapPin, ArrowRight } from 'lucide-react';

export interface DistrictsPageProps {
  language?: Language;
  onSelectDistrict?: (districtId: string) => void;
}

export const DistrictsPage: React.FC<DistrictsPageProps> = ({
  language: propLanguage,
  onSelectDistrict,
}) => {
  const storeLanguage = useUIStore((s) => s.language);
  const setActivePage = useUIStore((s) => s.setActivePage);
  const setFilter = useFilterStore((s) => s.setFilter);
  const { data: districts = [], isLoading, isError, error } = useDistrictsQuery();

  const language = propLanguage || storeLanguage;
  const t = translations[language];

  const handleSelectDistrict = (districtId: string) => {
    setFilter({ districtId });
    if (onSelectDistrict) onSelectDistrict(districtId);
    else setActivePage('catalog');
  };

  return (
    <div className="space-y-8 py-4 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          {t.districtsHeroTitle}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          {t.districtsHeroSubtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading && <p className="col-span-full text-center text-sm text-slate-500">{t.loadingDistricts}</p>}
        {isError && (
          <p className="col-span-full text-center text-sm text-rose-600">
            {error instanceof Error ? error.message : t.dataErrorTitle}
          </p>
        )}
        {districts.map((d) => (
          <div
            key={d.id}
            onClick={() => handleSelectDistrict(d.id)}
            className="group bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-xl hover:border-sky-300 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-black text-slate-900 group-hover:text-sky-600 transition-colors flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-sky-600" />
                  {getDistrictLabel(d, language)}
                </h3>
                <p className="text-xs text-slate-400 font-medium">({d.name_en})</p>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-sky-600 font-bold group-hover:translate-x-1 transition-transform">
              <span>{t.showDistrictListings}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
