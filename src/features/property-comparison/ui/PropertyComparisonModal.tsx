import React, { useEffect, useMemo, useState } from 'react';
import { DatabaseProperty, Currency } from '../../../shared/types';
import { getDistrictLabel, Language, translations } from '../../../shared/i18n';
import { formatPrice } from '../../../shared/lib/formatters';
import { useExchangeRates } from '../../../shared/lib/exchangeRates';
import { OptimizedImage } from '../../../shared/ui/OptimizedImage';
import { useAnonymousProfileStore } from '../../anonymous-profile/model/anonymousProfileStore';
import { usePropertiesByIdsQuery } from '../../../entities/property/model/usePropertiesQuery';
import { useFilterStore } from '../../filter-properties/model/filtersStore';
import {
  X,
  Layers,
  CheckCircle2,
  XCircle,
  Calendar,
  Waves,
  Trash2,
} from 'lucide-react';

export interface PropertyComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties?: DatabaseProperty[];
  compareIds?: string[];
  currency?: Currency;
  language?: Language;
  onRemove?: (id: string) => void;
  onBookViewing?: (property: DatabaseProperty) => void;
}

export const PropertyComparisonModal: React.FC<PropertyComparisonModalProps> = ({
  isOpen,
  onClose,
  properties: propProperties,
  compareIds: propCompareIds,
  currency: propCurrency,
  language = 'ru',
  onRemove: propOnRemove,
  onBookViewing,
}) => {
  const [failedImageUrls, setFailedImageUrls] = useState<Record<string, string[]>>({});
  const storeCompareIds = useAnonymousProfileStore((s) => s.compareIds);
  const storeToggleCompare = useAnonymousProfileStore((s) => s.toggleCompare);
  const storeCurrency = useFilterStore((s) => s.filter.currency);

  // Support reading compare IDs from URL params (?compare=id1,id2)
  const urlCompareIds = useMemo(() => {
    if (typeof window === 'undefined') return [];
    try {
      const p = new URLSearchParams(window.location.search).get('compare');
      return p ? p.split(',').filter(Boolean) : [];
    } catch {
      return [];
    }
  }, []);

  const activeCompareIds = useMemo(() => {
    if (propCompareIds && propCompareIds.length > 0) return propCompareIds;
    if (storeCompareIds.length > 0) return storeCompareIds;
    return urlCompareIds;
  }, [propCompareIds, storeCompareIds, urlCompareIds]);
  const { data: allProperties = [] } = usePropertiesByIdsQuery(activeCompareIds);

  const currency = propCurrency || storeCurrency;
  const t = translations[language];

  const compareList = useMemo(() => {
    if (propProperties && propProperties.length > 0) return propProperties;
    return allProperties;
  }, [propProperties, allProperties, activeCompareIds]);
  const { data: exchangeRates } = useExchangeRates();

  // Sync compare IDs to URL when modal is open
  useEffect(() => {
    if (!isOpen) return;
    try {
      const url = new URL(window.location.href);
      if (activeCompareIds.length > 0) {
        url.searchParams.set('compare', activeCompareIds.join(','));
      } else {
        url.searchParams.delete('compare');
      }
      window.history.pushState(null, '', url.pathname + (url.search ? url.search : ''));
    } catch {
      // ignore
    }
  }, [isOpen, activeCompareIds]);

  const handleRemove = (id: string) => {
    if (propOnRemove) propOnRemove(id);
    else storeToggleCompare(id);
  };

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

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden my-4 max-h-[90vh] flex flex-col border border-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 flex items-center justify-center border border-sky-400/30">
              <Layers className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">{t.comparisonTitle}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  {t.comparisonCount(compareList.length)}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {t.comparisonDescription}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Table */}
        <div className="p-6 overflow-x-auto overflow-y-auto">
          {compareList.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Layers className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">{t.comparisonEmpty}</p>
              <p className="text-xs text-slate-400 mt-1">
                {t.comparisonEmptyHelp}
              </p>
            </div>
          ) : (
            <div className="min-w-[600px]">
              <div className="grid grid-cols-5 gap-4 pb-4 border-b border-slate-100 font-semibold text-xs text-slate-400">
                <div className="col-span-1">{t.comparisonParameter}</div>
                {compareList.map((p) => (
                  <div key={p.id} className="col-span-1 flex items-center justify-between">
                    <span className="truncate font-bold text-slate-900">{p.title}</span>
                    <button
                      onClick={() => handleRemove(p.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                      title={t.comparisonRemove}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Photos & Prices */}
              <div className="grid grid-cols-5 gap-4 py-4 border-b border-slate-100 items-start">
                <div className="col-span-1 font-bold text-xs text-slate-900">{t.comparisonPhotoPrice}</div>
                {compareList.map((p) => (
                  <div key={p.id} className="col-span-1 space-y-2">
                    {p.images[0] && !failedImageUrls[p.id]?.includes(p.images[0]) && (
                      <div className="relative aspect-[16/10] rounded-xl overflow-hidden">
                        <OptimizedImage
                          src={p.images[0]}
                          alt={p.title}
                          className="w-full h-full object-cover"
                          onError={(src) => setFailedImageUrls((current) => ({
                            ...current,
                            [p.id]: [...(current[p.id] ?? []), src],
                          }))}
                        />
                      </div>
                    )}
                    <div className="text-sm font-black text-slate-900">
                      {formatPrice(p, currency, language, exchangeRates)}
                    </div>
                    {onBookViewing && (
                      <button
                        onClick={() => onBookViewing(p)}
                        className="w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                      >
                        <Calendar className="w-3 h-3" />
                        <span>{t.bookViewing}</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* District & Compound */}
              <div className="grid grid-cols-5 gap-4 py-3 border-b border-slate-100 text-xs">
                <div className="col-span-1 font-semibold text-slate-500">{t.comparisonDistrictCompound}</div>
                {compareList.map((p) => (
                  <div key={p.id} className="col-span-1 text-slate-800 font-medium">
                    <div>{getDistrictLabel(p.location.district, language)}</div>
                    {p.location.compound && (
                      <div className="text-[11px] text-slate-400">
                        {language === 'ru' ? p.location.compound.name_ru : p.location.compound.name_en}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Area */}
              <div className="grid grid-cols-5 gap-4 py-3 border-b border-slate-100 text-xs">
                <div className="col-span-1 font-semibold text-slate-500">{t.comparisonTotalArea}</div>
                {compareList.map((p) => (
                  <div key={p.id} className="col-span-1 font-bold text-slate-900">
                    {t.areaUnit(p.specs.area_sqm)}
                  </div>
                ))}
              </div>

              {/* Bedrooms & Bathrooms */}
              <div className="grid grid-cols-5 gap-4 py-3 border-b border-slate-100 text-xs">
                <div className="col-span-1 font-semibold text-slate-500">{t.comparisonBedroomsBathrooms}</div>
                {compareList.map((p) => (
                  <div key={p.id} className="col-span-1 text-slate-800">
                    {p.specs.bedrooms === 0 ? t.studio : t.bedroomsCount(p.specs.bedrooms)}, {t.bathroomsCount(p.specs.bathrooms)}
                  </div>
                ))}
              </div>

              {/* Beach Access */}
              <div className="grid grid-cols-5 gap-4 py-3 border-b border-slate-100 text-xs">
                <div className="col-span-1 font-semibold text-slate-500">{t.comparisonBeachAccess}</div>
                {compareList.map((p) => (
                  <div key={p.id} className="col-span-1">
                    {p.specs.has_beach_access ? (
                      <span className="inline-flex items-center gap-1 text-sky-600 font-bold">
                        <Waves className="w-3.5 h-3.5" />
                        <span>{t.comparisonHasBeach}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400">{t.comparisonNoBeach}</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Furnished */}
              <div className="grid grid-cols-5 gap-4 py-3 border-b border-slate-100 text-xs">
                <div className="col-span-1 font-semibold text-slate-500">{t.comparisonFurniture}</div>
                {compareList.map((p) => (
                  <div key={p.id} className="col-span-1">
                    {p.specs.is_furnished ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{t.furnished}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-400">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>{t.comparisonUnfurnished}</span>
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
