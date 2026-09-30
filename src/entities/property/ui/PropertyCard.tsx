import React, { useState } from 'react';
import { DatabaseProperty, Currency } from '../../../shared/types';
import { formatPrice, formatPricePerSquareMeter } from '../../../shared/lib/formatters';
import { useExchangeRates } from '../../../shared/lib/exchangeRates';
import { OptimizedImage } from '../../../shared/ui/OptimizedImage';
import { formatBathrooms, formatBedrooms, getDistrictLabel, Language, translations } from '../../../shared/i18n';
import { useAnonymousProfileStore } from '../../../features/anonymous-profile/model/anonymousProfileStore';
import {
  Heart,
  Calendar,
  Waves,
  Sparkles,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Phone,
  MessageCircle,
  Layers,
  CheckCircle2,
  Eye,
  ShieldCheck,
  Share2,
  Navigation,
  Check,
} from 'lucide-react';

export interface PropertyCardProps {
  property: DatabaseProperty;
  currency: Currency;
  language?: Language;
  isFavorite?: boolean;
  isCompared?: boolean;
  isViewed?: boolean;
  onToggleFavorite?: (id: string) => void;
  onToggleCompare?: (property: DatabaseProperty) => void;
  onSelect: (property: DatabaseProperty) => void;
  onBookViewing: (property: DatabaseProperty) => void;
  onShowOnMap?: (property: DatabaseProperty) => void;
  onHover?: (id: string | null) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  currency,
  language = 'ru',
  isFavorite: propIsFavorite,
  isCompared: propIsCompared,
  isViewed: propIsViewed,
  onToggleFavorite: propToggleFav,
  onToggleCompare: propToggleComp,
  onSelect,
  onBookViewing,
  onShowOnMap,
  onHover,
}) => {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<{ propertyId: string; urls: string[] }>({
    propertyId: '',
    urls: [],
  });
  const [showPhone, setShowPhone] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const { data: exchangeRates } = useExchangeRates();

  // Fallback to Zustand store if not provided via props
  const storeFavorites = useAnonymousProfileStore((s) => s.favorites);
  const storeCompareIds = useAnonymousProfileStore((s) => s.compareIds);
  const storeRecentViews = useAnonymousProfileStore((s) => s.recentViews);
  const storeToggleFav = useAnonymousProfileStore((s) => s.toggleFavorite);
  const storeToggleComp = useAnonymousProfileStore((s) => s.toggleCompare);

  const isFavorite = propIsFavorite !== undefined ? propIsFavorite : storeFavorites.includes(property.id);
  const isCompared = propIsCompared !== undefined ? propIsCompared : storeCompareIds.includes(property.id);
  const isViewed = propIsViewed !== undefined ? propIsViewed : storeRecentViews.includes(property.id);
  const handleToggleFavorite = () => (propToggleFav ? propToggleFav(property.id) : storeToggleFav(property.id));
  const handleToggleCompare = () => (propToggleComp ? propToggleComp(property) : storeToggleComp(property.id));

  const t = translations[language];
  const priceDisplay = formatPrice(property, currency, language, exchangeRates);
  const pricePerSquareMeter = formatPricePerSquareMeter(
    property,
    currency,
    language,
    exchangeRates,
  );

  const failedUrls = failedImages.propertyId === property.id ? failedImages.urls : [];
  const images = (property.images ?? []).filter((image) => !failedUrls.includes(image));
  const safeImgIndex = Math.min(currentImgIndex, Math.max(0, images.length - 1));

  const handleNextImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handlePrevImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleCopyShareLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}${window.location.pathname}?property=${property.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  return (
    <div
      onMouseEnter={() => onHover && onHover(property.id)}
      onMouseLeave={() => onHover && onHover(null)}
      onClick={() => onSelect(property)}
      className={`group bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer relative ${
        isViewed ? 'opacity-70 hover:opacity-100' : ''
      }`}
    >
      {images.length > 0 && (
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
          <OptimizedImage
            src={images[safeImgIndex]}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(src) => {
              setFailedImages((current) => ({
                propertyId: property.id,
                urls: [...(current.propertyId === property.id ? current.urls : []), src],
              }));
              setCurrentImgIndex((current) => Math.min(current, Math.max(0, images.length - 2)));
            }}
          />

        {/* Carousel arrows */}
        {images.length > 1 && (
          <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <button
              onClick={handlePrevImg}
              className="p-1.5 rounded-full bg-black/60 hover:bg-black/85 text-white transition pointer-events-auto"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextImg}
              className="p-1.5 rounded-full bg-black/60 hover:bg-black/85 text-white transition pointer-events-auto"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          )}

        {/* Top Floating Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
          <span className="px-2.5 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md text-white font-bold text-[10px] uppercase tracking-wider shadow-xs border border-white/10">
            {property.deal === 'sale'
              ? t.propertySale
              : property.deal === 'long_term_rent'
                ? t.propertyLongRent
                : t.propertyDailyRent}
          </span>
          {property.specs.has_beach_access && (
            <span className="px-2 py-1 rounded-xl bg-sky-600/90 backdrop-blur-md text-white font-bold text-[10px] flex items-center gap-1 shadow-xs">
              <Waves className="w-3 h-3" />
              <span>{t.beach}</span>
            </span>
          )}
          {isViewed && (
            <span className="px-2 py-1 rounded-xl bg-slate-900/80 backdrop-blur-md text-slate-300 font-bold text-[10px] uppercase tracking-wider shadow-xs border border-white/10 flex items-center gap-1">
              <Eye className="w-3 h-3 text-sky-400" />
              <span>{t.viewed}</span>
            </span>
          )}
        </div>

        {/* Top Right Action Icons: Favorite, Compare, Share */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
          <button
            onClick={handleCopyShareLink}
            className="p-2 rounded-full bg-white/90 backdrop-blur-md text-slate-600 hover:text-slate-900 shadow-md transition hover:scale-110"
            title={t.shareProperty}
          >
            {copiedShare ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleCompare();
            }}
            className={`p-2 rounded-full backdrop-blur-md transition shadow-md hover:scale-110 ${
              isCompared
                ? 'bg-sky-600 text-white font-bold'
                : 'bg-white/90 text-slate-600 hover:text-slate-900'
            }`}
            title={t.navCompare}
          >
            <Layers className="w-4 h-4" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleFavorite();
            }}
            className={`p-2 rounded-full backdrop-blur-md transition shadow-md hover:scale-110 ${
              isFavorite
                ? 'bg-rose-500 text-white'
                : 'bg-white/90 text-slate-600 hover:text-rose-500'
            }`}
            title={t.navFavorites}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Carousel Pagination Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-2.5 inset-x-0 flex justify-center gap-1 z-10">
            {images.slice(0, 5).map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  safeImgIndex === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/60'
                }`}
              />
            ))}
          </div>
        )}
      </div>
      )}

      {/* Property Details Section */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Price display with currency */}
          <div className="flex items-baseline justify-between">
            <div className="text-lg font-black text-slate-950 font-sans tracking-tight">
              {priceDisplay}
            </div>
            {pricePerSquareMeter && (
              <div className="text-[11px] font-semibold text-slate-600">
                {pricePerSquareMeter}
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className="font-extrabold text-sm text-slate-900 line-clamp-2 leading-snug group-hover:text-sky-600 transition-colors">
            {property.title}
          </h3>

          {/* Location & District */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span className="truncate">
              {getDistrictLabel(property.location.district, language)}
              {property.location.compound
                ? ` • ${language === 'ru' ? property.location.compound.name_ru : property.location.compound.name_en ?? property.location.compound.name_ru}`
                : ''}
            </span>
          </div>
        </div>

        {/* Specs Pill Badges */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-1">
            <span className="text-slate-900 font-bold">
              {formatBedrooms(property.specs.bedrooms, language)}
            </span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1">
            <span className="text-slate-900 font-bold">{formatBathrooms(property.specs.bathrooms, language)}</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1">
            <span className="text-slate-900 font-bold">{t.areaUnit(property.specs.area_sqm)}</span>
          </div>
        </div>

        {/* Bottom Action Buttons */}
        <div className="pt-2 flex items-center gap-2">
          {/* Booking Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBookViewing(property);
            }}
            className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{t.bookViewing}</span>
          </button>

          {/* Show on Map Button */}
          {onShowOnMap && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShowOnMap(property);
              }}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
              title={t.showOnMap}
            >
              <Navigation className="w-4 h-4 text-sky-600" />
            </button>
          )}

          {/* Details Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(property);
            }}
            className="py-2 px-3 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            {t.details}
          </button>
        </div>
      </div>
    </div>
  );
};
