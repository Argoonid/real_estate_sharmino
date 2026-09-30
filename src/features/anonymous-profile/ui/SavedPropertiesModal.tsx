import React, { useState, useEffect } from 'react';
import { DatabaseProperty, Currency } from '../../../shared/types';
import { getDistrictLabel, Language, translations } from '../../../shared/i18n';
import { formatPrice } from '../../../shared/lib/formatters';
import { useExchangeRates } from '../../../shared/lib/exchangeRates';
import { OptimizedImage } from '../../../shared/ui/OptimizedImage';
import { useAnonymousProfileStore } from '../model/anonymousProfileStore';
import { usePropertiesByIdsQuery } from '../../../entities/property/model/usePropertiesQuery';
import { useFilterStore } from '../../filter-properties/model/filtersStore';
import { useUIStore } from '../../../app/model/uiStore';
import {
  Heart,
  Share2,
  Trash2,
  ExternalLink,
  Send,
  Copy,
  Check,
  Info,
  Clock,
  Layers,
  ArrowRight,
  ShieldCheck,
  X,
  Sparkles,
} from 'lucide-react';

export interface SavedPropertiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties?: DatabaseProperty[];
  favorites?: string[];
  compareIds?: string[];
  recentIds?: string[];
  currency?: Currency;
  language?: Language;
  onSelectProperty?: (property: DatabaseProperty) => void;
  onToggleFavorite?: (id: string) => void;
  onToggleCompare?: (property: DatabaseProperty) => void;
  onClearFavorites?: () => void;
  onClearRecents?: () => void;
}

export const SavedPropertiesModal: React.FC<SavedPropertiesModalProps> = ({
  isOpen,
  onClose,
  properties: propProperties,
  favorites: propFavorites,
  compareIds: propCompareIds,
  recentIds: propRecentIds,
  currency: propCurrency,
  language: propLanguage,
  onSelectProperty: propOnSelect,
  onToggleFavorite: propToggleFav,
  onToggleCompare: propToggleComp,
  onClearFavorites: propClearFav,
  onClearRecents: propClearRecents,
}) => {
  const [failedImageUrls, setFailedImageUrls] = useState<Record<string, string[]>>({});
  const storeFavorites = useAnonymousProfileStore((s) => s.favorites);
  const storeCompareIds = useAnonymousProfileStore((s) => s.compareIds);
  const storeRecentIds = useAnonymousProfileStore((s) => s.recentViews);
  const storeToggleFavorite = useAnonymousProfileStore((s) => s.toggleFavorite);
  const storeToggleCompare = useAnonymousProfileStore((s) => s.toggleCompare);
  const storeClearFavorites = useAnonymousProfileStore((s) => s.clearFavorites);
  const storeClearRecents = useAnonymousProfileStore((s) => s.clearRecents);
  const exportProfileBase64 = useAnonymousProfileStore((s) => s.exportProfileBase64);

  const storeCurrency = useFilterStore((s) => s.filter.currency);
  const openDetail = useUIStore((s) => s.openPropertyDetail);
  const storeLanguage = useUIStore((s) => s.language);

  const favorites = propFavorites || storeFavorites;
  const compareIds = propCompareIds || storeCompareIds;
  const recentIds = propRecentIds || storeRecentIds;
  const currency = propCurrency || storeCurrency;
  const language = propLanguage || storeLanguage;
  const t = translations[language];
  const onSelectProperty = propOnSelect || openDetail;
  const onToggleFavorite = propToggleFav || storeToggleFavorite;
  const onToggleCompare = propToggleComp || ((p: DatabaseProperty) => storeToggleCompare(p.id));
  const onClearFavorites = propClearFav || storeClearFavorites;
  const onClearRecents = propClearRecents || storeClearRecents;
  const { data: allProperties = [] } = usePropertiesByIdsQuery([
    ...favorites,
    ...compareIds,
    ...recentIds,
  ]);
  const properties = propProperties || allProperties;
  const { data: exchangeRates } = useExchangeRates();

  const [activeTab, setActiveTab] = useState<'favorites' | 'compare' | 'recents'>('favorites');
  const [copiedLink, setCopiedLink] = useState(false);

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

  const favoriteProperties = properties.filter((p) => favorites.includes(p.id));
  const compareProperties = properties.filter((p) => compareIds.includes(p.id));
  const recentProperties = recentIds
    .map((id) => properties.find((p) => p.id === id))
    .filter((p): p is DatabaseProperty => Boolean(p));

  const handleCopyShareLink = () => {
    const base64Code = exportProfileBase64();
    const url = `${window.location.origin}${window.location.pathname}#profile=${base64Code}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleShareTelegram = () => {
    const base64Code = exportProfileBase64();
    const url = `${window.location.origin}${window.location.pathname}#profile=${base64Code}`;
    const text = encodeURIComponent(
      `${t.shareFavorites} (${favoriteProperties.length}): ${url}`
    );
    window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${text}`, '_blank');
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col border border-slate-100 animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 flex items-center justify-center border border-rose-400/30 text-rose-400">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">{t.savedProfileTitle}</h3>
              </div>
              <p className="text-xs text-slate-400">
                {t.savedProfileDescription}
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

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 shrink-0 overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab('favorites')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'favorites'
                ? 'border-rose-600 text-rose-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            {t.navFavorites} ({favoriteProperties.length})
          </button>

          <button
            onClick={() => setActiveTab('compare')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'compare'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            {t.navCompare} ({compareProperties.length})
          </button>

          <button
            onClick={() => setActiveTab('recents')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'recents'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            {t.historyTab} ({recentProperties.length})
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {activeTab === 'favorites' && (
            <div>
              {favoriteProperties.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <Heart className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-sm font-semibold">{t.favoritesEmptyTitle}</p>
                  <p className="text-xs">{t.favoritesEmptyDescription}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="text-xs font-semibold text-slate-700">
                      {t.shareFavorites} ({favoriteProperties.length}):
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopyShareLink}
                        className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedLink ? t.copiedLink : t.copyLink}</span>
                      </button>

                      <button
                        onClick={handleShareTelegram}
                        className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{t.shareTelegram}</span>
                      </button>

                      <button
                        onClick={onClearFavorites}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title={t.clearFavorites}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {favoriteProperties.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          onSelectProperty(p);
                          onClose();
                        }}
                        className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition cursor-pointer group flex flex-col"
                      >
                        {p.images?.[0] && !failedImageUrls[p.id]?.includes(p.images[0]) && (
                          <div className="relative aspect-[16/10] overflow-hidden">
                            <OptimizedImage
                              src={p.images[0]}
                              alt={p.title}
                              className="group-hover:scale-105 transition duration-300"
                              onError={(src) => setFailedImageUrls((current) => ({
                                ...current,
                                [p.id]: [...(current[p.id] ?? []), src],
                              }))}
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleFavorite(p.id);
                              }}
                              className="absolute top-2 right-2 p-1.5 rounded-xl bg-black/50 text-rose-400 hover:bg-black/70 transition"
                            >
                              <Heart className="w-4 h-4 fill-current" />
                            </button>
                          </div>
                        )}
                        <div className="p-3 flex-1 flex flex-col justify-between">
                          <div className="flex items-start justify-between gap-2">
                            <div className="text-xs font-bold text-slate-900 line-clamp-1">{p.title}</div>
                            {(!p.images?.[0] || failedImageUrls[p.id]?.includes(p.images[0])) && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleFavorite(p.id);
                                }}
                                className="shrink-0 text-rose-500"
                                aria-label={t.removeFavorite}
                              >
                                <Heart className="h-4 w-4 fill-current" />
                              </button>
                            )}
                          </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">{getDistrictLabel(p.location.district, language)}</div>
                          <div className="mt-2 text-sm font-black text-sky-700">
                            {formatPrice(p, currency, language, exchangeRates)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'compare' && (
            <div>
              {compareProperties.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <Layers className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-sm font-semibold">{t.compareEmptyTitle}</p>
                  <p className="text-xs">{t.compareEmptyDescription}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {compareProperties.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        onSelectProperty(p);
                        onClose();
                      }}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition cursor-pointer group p-3 flex flex-col justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-900">{p.title}</div>
                        <div className="text-[11px] text-slate-500">{getDistrictLabel(p.location.district, language)}</div>
                        <div className="mt-1 text-xs text-slate-600">
                          {p.specs.bedrooms === 0 ? t.studio : t.bedroomsCount(p.specs.bedrooms)} • {t.areaUnit(p.specs.area_sqm)} • {p.specs.has_beach_access ? t.privateBeach : t.bathroomsCount(p.specs.bathrooms)}
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="font-bold text-sky-700 text-sm">{formatPrice(p, currency, language, exchangeRates)}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleCompare(p);
                          }}
                          className="text-[11px] text-slate-400 hover:text-rose-600"
                        >
                          {t.removeFromList}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'recents' && (
            <div>
              {recentProperties.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <Clock className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-sm font-semibold">{t.historyEmptyTitle}</p>
                  <p className="text-xs">{t.historyEmptyDescription}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-end">
                    <button
                      onClick={onClearRecents}
                      className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{t.clearHistory}</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {recentProperties.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          onSelectProperty(p);
                          onClose();
                        }}
                        className="p-3 bg-slate-50 rounded-2xl border border-slate-200 hover:bg-white hover:shadow-md transition cursor-pointer flex items-center gap-3"
                      >
                        <OptimizedImage
                          src={p.images?.[0] || ''}
                          alt={p.title}
                          aspectRatioClass="w-14 h-14 shrink-0 rounded-xl"
                          className="object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-slate-900 truncate">{p.title}</div>
                          <div className="text-[10px] text-slate-500">{getDistrictLabel(p.location.district, language)}</div>
                          <div className="text-xs font-bold text-sky-700 mt-0.5">
                            {formatPrice(p, currency, language, exchangeRates)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
