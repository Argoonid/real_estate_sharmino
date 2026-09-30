import React, { useState, useEffect, useMemo } from 'react';
import { DatabaseProperty, Currency } from '../../shared/types';
import {
  formatPrice,
  formatPricePerSquareMeter,
} from '../../shared/lib/formatters';
import { useExchangeRates } from '../../shared/lib/exchangeRates';
import { getDistrictLabel, Language, translations } from '../../shared/i18n';
import { usePropertyQuery } from '../../entities/property/model/usePropertiesQuery';
import { useAnonymousProfileStore } from '../../features/anonymous-profile/model/anonymousProfileStore';
import { useFilterStore } from '../../features/filter-properties/model/filtersStore';
import { useUIStore } from '../../app/model/uiStore';
import { OptimizedImage } from '../../shared/ui/OptimizedImage';
import {
  X,
  MapPin,
  Calendar,
  Share2,
  Heart,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Waves,
  CheckCircle2,
  Clock,
  Sparkles,
  Check,
  Navigation,
  Layers,
} from 'lucide-react';

export interface PropertyDetailPageProps {
  property?: DatabaseProperty | null;
  propertyId?: string | null;
  currency?: Currency;
  language?: Language;
  onClose: () => void;
  onBookViewing: (property: DatabaseProperty) => void;
  onOpenCompare?: (property: DatabaseProperty) => void;
  onShowOnMap?: (property: DatabaseProperty) => void;
}

export const PropertyDetailPage: React.FC<PropertyDetailPageProps> = ({
  property: propProperty,
  propertyId: propPropertyId,
  currency: propCurrency,
  language = 'ru',
  onClose,
  onBookViewing,
  onOpenCompare,
  onShowOnMap,
}) => {
  const storePropertyId = useUIStore((s) => s.selectedPropertyId);
  const storeProperty = useUIStore((s) => s.selectedProperty);
  const storeCurrency = useFilterStore((s) => s.filter.currency);
  const currency = propCurrency || storeCurrency;

  const urlPropertyId = useMemo(() => {
    if (typeof window === 'undefined') return null;
    try {
      return new URLSearchParams(window.location.search).get('property');
    } catch {
      return null;
    }
  }, []);

  const effectiveId = propPropertyId || storePropertyId || urlPropertyId;
  const { data: queriedProperty } = usePropertyQuery(effectiveId);
  const { data: exchangeRates } = useExchangeRates();

  const property =
    propProperty ||
    storeProperty ||
    queriedProperty ||
    null;
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<{ propertyId: string; urls: string[] }>({
    propertyId: '',
    urls: [],
  });
  const [copiedShare, setCopiedShare] = useState(false);
  const [isFullscreenGallery, setIsFullscreenGallery] = useState(false);
  const failedUrls = failedImages.propertyId === property?.id ? failedImages.urls : [];
  const images = useMemo(
    () => (property?.images ?? []).filter((image) => !failedUrls.includes(image)),
    [property?.id, property?.images, failedUrls],
  );
  const safeActiveImgIndex = Math.min(activeImgIndex, Math.max(0, images.length - 1));

  const favorites = useAnonymousProfileStore((s) => s.favorites);
  const toggleFavorite = useAnonymousProfileStore((s) => s.toggleFavorite);
  const compareIds = useAnonymousProfileStore((s) => s.compareIds);
  const toggleCompare = useAnonymousProfileStore((s) => s.toggleCompare);
  const addRecentView = useAnonymousProfileStore((s) => s.addRecentView);

  const isFavorite = property ? favorites.includes(property.id) : false;
  const isCompared = property ? compareIds.includes(property.id) : false;

  // Reset the detail view when the selected property changes.
  useEffect(() => {
    setActiveImgIndex(0);
    setFailedImages({ propertyId: property?.id ?? '', urls: [] });
    setIsFullscreenGallery(false);

    if (!property) return;
    addRecentView(property.id);

    // Dynamic Title for SEO & browser history
    const prevTitle = document.title;
    document.title = `${property.title} — Sharmino Real Estate`;

    return () => {
      document.title = prevTitle;
    };
  }, [property?.id, language]);

  // Handle keyboard navigation & Escape key & Lock body scroll
  useEffect(() => {
    if (!property) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreenGallery) setIsFullscreenGallery(false);
        else onClose();
      } else if (images.length > 0 && e.key === 'ArrowRight') {
        setActiveImgIndex((prev) => (prev >= images.length - 1 ? 0 : prev + 1));
      } else if (images.length > 0 && e.key === 'ArrowLeft') {
        setActiveImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [property, images, isFullscreenGallery, onClose]);

  if (!property) return null;

  const t = translations[language];
  const priceDisplay = formatPrice(property, currency, language, exchangeRates);
  const pricePerSquareMeter = formatPricePerSquareMeter(
    property,
    currency,
    language,
    exchangeRates,
  );

  const handleShare = () => {
    const url = `${window.location.origin}${window.location.pathname}?property=${property.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4 overflow-hidden animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full h-[100dvh] sm:h-auto sm:max-w-4xl bg-white sm:rounded-3xl shadow-2xl overflow-hidden min-h-0 sm:max-h-[92dvh] flex flex-col border border-slate-100 animate-in zoom-in-95 duration-150"
      >
        {/* Top Floating Action Bar */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition shadow-md cursor-pointer"
            title={t.shareProperty}
          >
            {copiedShare ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              if (onOpenCompare) onOpenCompare(property);
              else toggleCompare(property.id);
            }}
            className={`p-2.5 rounded-full backdrop-blur-md transition shadow-md cursor-pointer ${
              isCompared ? 'bg-sky-600 text-white' : 'bg-black/60 hover:bg-black/80 text-white'
            }`}
            title={t.navCompare}
          >
            <Layers className="w-4 h-4" />
          </button>

          <button
            onClick={() => toggleFavorite(property.id)}
            className={`p-2.5 rounded-full backdrop-blur-md transition shadow-md cursor-pointer ${
              isFavorite ? 'bg-rose-600 text-white' : 'bg-black/60 hover:bg-black/80 text-white'
            }`}
            title={t.navFavorites}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition shadow-md cursor-pointer ml-1"
            title={t.close}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="min-h-0 overflow-y-auto overscroll-contain flex-1">
          {images.length > 0 && (
            <div className="relative h-[30dvh] min-h-36 max-h-64 sm:h-auto sm:aspect-[21/9] w-full bg-slate-950 overflow-hidden">
            <OptimizedImage
              src={images[safeActiveImgIndex]}
              alt={property.title}
              aspectRatioClass="w-full h-full"
              priority
              onError={(src) => {
                setFailedImages((current) => ({
                  propertyId: property.id,
                  urls: [...(current.propertyId === property.id ? current.urls : []), src],
                }));
                setActiveImgIndex((current) => Math.min(current, Math.max(0, images.length - 2)));
              }}
            />

            {/* Navigation arrows */}
            {images.length > 1 && (
              <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between items-center pointer-events-none">
                <button
                  onClick={() =>
                    setActiveImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
                  }
                  className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition pointer-events-auto cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() =>
                    setActiveImgIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
                  }
                  className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition pointer-events-auto cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Bottom thumbnail selector */}
            {images.length > 1 && (
              <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5 px-4 overflow-x-auto no-scrollbar">
                {images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImgIndex(idx)}
                    className={`w-12 h-8 rounded-lg overflow-hidden border-2 transition shrink-0 cursor-pointer ${
                      activeImgIndex === idx ? 'border-white scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-90'
                    }`}
                  >
                    <OptimizedImage
                      src={img}
                      alt=""
                      aspectRatioClass="w-full h-full"
                      onError={(src) => {
                        setFailedImages((current) => ({
                          propertyId: property.id,
                          urls: [...(current.propertyId === property.id ? current.urls : []), src],
                        }));
                        setActiveImgIndex((current) => Math.min(current, Math.max(0, images.length - 2)));
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
            </div>
          )}

          {/* Details Section */}
          <div className="p-4 sm:p-8 space-y-5 sm:space-y-6">
            {/* Header: Title & Price */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 rounded-xl bg-sky-100 text-sky-800 font-bold text-xs">
                    {property.deal === 'sale'
                      ? t.propertySale
                      : property.deal === 'long_term_rent'
                        ? t.propertyLongRent
                        : t.propertyDailyRent}
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs">
                    ID: {property.id}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-950 leading-snug">
                  {property.title}
                </h1>
                <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                  <MapPin className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>
                    {getDistrictLabel(property.location.district, language)}
                    {property.location.compound
                      ? ` • ${t.compound} ${language === 'ru'
                        ? property.location.compound.name_ru
                        : property.location.compound.name_en}`
                      : ''}
                  </span>
                </div>
              </div>

              <div className="sm:text-right space-y-1">
                <div className="text-2xl sm:text-3xl font-black text-slate-900 font-sans tracking-tight">
                  {priceDisplay}
                </div>
                {pricePerSquareMeter && (
                  <div className="text-xs text-slate-500 font-semibold">
                    {pricePerSquareMeter}
                  </div>
                )}
              </div>
            </div>

            {/* Key Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="text-[11px] text-slate-400 font-medium">{t.bedrooms}</div>
                <div className="text-lg font-black text-slate-900">
                  {property.specs.bedrooms === 0 ? t.studio : t.bedroomsCount(property.specs.bedrooms)}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="text-[11px] text-slate-400 font-medium">{t.bathrooms}</div>
                <div className="text-lg font-black text-slate-900">{t.bathroomsCount(property.specs.bathrooms)}</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="text-[11px] text-slate-400 font-medium">{t.area}</div>
                <div className="text-lg font-black text-slate-900">{t.areaUnit(property.specs.area_sqm)}</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="text-[11px] text-slate-400 font-medium">{t.viewFromWindows}</div>
                <div className="text-sm font-bold text-slate-900 truncate">
                  {property.specs.view === 'sea_view'
                    ? t.seaView
                    : property.specs.view === 'pool_view'
                    ? t.poolView
                    : t.gardenView}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900">{t.propertyDescription}</h3>
              <p className="max-h-44 sm:max-h-60 overflow-y-auto overscroll-contain pr-2 text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Amenities & Features */}
            {property.specs.amenities && property.specs.amenities.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">{t.amenitiesTitle}</h3>
                <div className="max-h-36 sm:max-h-48 overflow-y-auto overscroll-contain pr-2 flex flex-wrap gap-2">
                  {property.specs.amenities.map((am: string, i: number) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{am}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {onShowOnMap && (
              <button
                onClick={() => {
                  onShowOnMap(property);
                  onClose();
                }}
                className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Navigation className="w-4 h-4 text-sky-600" />
                <span>{t.showOnMap}</span>
              </button>
            )}

          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onBookViewing(property);
                onClose();
              }}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-2 shadow-md cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>{t.bookViewing}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
