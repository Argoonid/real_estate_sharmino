import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
import { ImageOptimizerService } from '../../services/imageOptimizer';
import {
  X,
  MapPin,
  Calendar,
  Share2,
  Heart,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  CheckCircle2,
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

  // Сброс при смене объекта
  useEffect(() => {
    setActiveImgIndex(0);
    setFailedImages({ propertyId: property?.id ?? '', urls: [] });
    setIsFullscreenGallery(false);

    if (!property) return;
    addRecentView(property.id);

    const prevTitle = document.title;
    document.title = `${property.title} — Sharmino Real Estate`;

    return () => {
      document.title = prevTitle;
    };
  }, [property?.id, language]);

  // Фоновая предзагрузка соседних изображений
  useEffect(() => {
    if (images.length <= 1) return;
    const nextIdx = (safeActiveImgIndex + 1) % images.length;
    const prevIdx = (safeActiveImgIndex - 1 + images.length) % images.length;
    [images[nextIdx], images[prevIdx]].forEach((url) => {
      if (url) {
        const img = new Image();
        img.src = ImageOptimizerService.cleanExternalUrl(url);
      }
    });
  }, [safeActiveImgIndex, images]);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (images.length <= 1) return;
    setActiveImgIndex((prev) => (prev >= images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (images.length <= 1) return;
    setActiveImgIndex((prev) => (prev <= 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  // Обработка тач-свайпов
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchEndX - touchStartX.current;
    const diffY = touchEndY - touchStartY.current;

    // Горизонтальный свайп с порогом более 40px
    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Горячие клавиши и блокировка скролла
  useEffect(() => {
    if (!property) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreenGallery) setIsFullscreenGallery(false);
        else onClose();
      } else if (images.length > 0 && e.key === 'ArrowRight') {
        handleNext();
      } else if (images.length > 0 && e.key === 'ArrowLeft') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [property, images, isFullscreenGallery, onClose, handleNext, handlePrev]);

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
    <>
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-0 sm:p-4 overflow-hidden animate-in fade-in duration-200"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full h-[100dvh] sm:h-auto sm:max-w-4xl bg-white sm:rounded-3xl shadow-2xl overflow-hidden min-h-0 sm:max-h-[92dvh] flex flex-col border border-slate-100 animate-in zoom-in-95 duration-150"
        >
          {/* Верхняя плавающая панель действий */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2.5 rounded-full bg-slate-950/60 hover:bg-slate-950/85 text-white backdrop-blur-md transition shadow-md cursor-pointer hover:scale-105"
              title={t.shareProperty}
            >
              {copiedShare ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>

            <button
              onClick={() => {
                if (onOpenCompare) onOpenCompare(property);
                else toggleCompare(property.id);
              }}
              className={`p-2.5 rounded-full backdrop-blur-md transition shadow-md cursor-pointer hover:scale-105 ${
                isCompared ? 'bg-sky-600 text-white' : 'bg-slate-950/60 hover:bg-slate-950/85 text-white'
              }`}
              title={t.navCompare}
            >
              <Layers className="w-4 h-4" />
            </button>

            <button
              onClick={() => toggleFavorite(property.id)}
              className={`p-2.5 rounded-full backdrop-blur-md transition shadow-md cursor-pointer hover:scale-105 ${
                isFavorite ? 'bg-rose-600 text-white' : 'bg-slate-950/60 hover:bg-slate-950/85 text-white'
              }`}
              title={t.navFavorites}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-slate-950/60 hover:bg-slate-950/85 text-white backdrop-blur-md transition shadow-md cursor-pointer ml-1 hover:scale-105"
              title={t.close}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Тело модалки со скроллом */}
          <div className="min-h-0 overflow-y-auto overscroll-contain flex-1">
            {images.length > 0 && (
              <div
                className="relative h-[34dvh] min-h-44 max-h-80 sm:h-auto sm:aspect-[21/9] w-full bg-slate-950 overflow-hidden touch-pan-y select-none group"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <div
                  className="w-full h-full cursor-zoom-in"
                  onClick={() => setIsFullscreenGallery(true)}
                >
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
                </div>

                {/* Навигационные стрелки */}
                {images.length > 1 && (
                  <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 flex justify-between items-center pointer-events-none z-10">
                    <button
                      onClick={handlePrev}
                      className="p-2.5 rounded-full bg-slate-950/60 hover:bg-slate-950/85 text-white backdrop-blur-md transition pointer-events-auto cursor-pointer hover:scale-110 shadow-lg"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNext}
                      className="p-2.5 rounded-full bg-slate-950/60 hover:bg-slate-950/85 text-white backdrop-blur-md transition pointer-events-auto cursor-pointer hover:scale-110 shadow-lg"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {/* Нижняя панель над фото: Кнопка во весь экран + счетчик фото */}
                <div className="absolute bottom-14 sm:bottom-16 inset-x-3 flex items-center justify-between z-10 pointer-events-none">
                  <button
                    onClick={() => setIsFullscreenGallery(true)}
                    className="p-2 rounded-xl bg-slate-950/70 hover:bg-slate-950/90 text-white backdrop-blur-md shadow-md transition pointer-events-auto flex items-center gap-1.5 text-xs font-semibold border border-white/10 hover:scale-105 cursor-pointer"
                    title={language === 'ru' ? 'На весь экран' : 'Fullscreen'}
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>

                  {images.length > 1 && (
                    <span className="px-2.5 py-1 rounded-xl bg-slate-950/70 backdrop-blur-md text-white font-semibold text-xs border border-white/10 shadow-md">
                      {safeActiveImgIndex + 1} / {images.length}
                    </span>
                  )}
                </div>

                {/* Полоса миниатюр снизу */}
                {images.length > 1 && (
                  <div className="absolute bottom-2.5 inset-x-0 flex justify-center gap-2 px-4 overflow-x-auto no-scrollbar z-10">
                    {images.map((img: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImgIndex(idx)}
                        className={`w-12 h-9 rounded-lg overflow-hidden border-2 transition shrink-0 cursor-pointer ${
                          safeActiveImgIndex === idx
                            ? 'border-sky-400 scale-105 shadow-md'
                            : 'border-transparent opacity-60 hover:opacity-90'
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

            {/* Секция описания и характеристик */}
            <div className="p-4 sm:p-8 space-y-5 sm:space-y-6">
              {/* Заголовок и цена */}
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

              {/* Сетка характеристик */}
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

              {/* Описание */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900">{t.propertyDescription}</h3>
                <p className="max-h-44 sm:max-h-60 overflow-y-auto overscroll-contain pr-2 text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </div>

              {/* Удобства */}
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

          {/* Фиксированный футер с действиями */}
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

      {/* Полноэкранный Lightbox (React Portal) */}
      {isFullscreenGallery &&
        createPortal(
          <div
            className="fixed inset-0 z-[60] bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-4 md:p-6 animate-in fade-in duration-200 select-none"
            onClick={() => setIsFullscreenGallery(false)}
          >
            {/* Верхняя строка лайтбокса */}
            <div
              className="flex items-center justify-between text-white w-full max-w-6xl mx-auto z-20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="truncate max-w-[70%]">
                <h4 className="text-base md:text-lg font-bold truncate">{property.title}</h4>
                <p className="text-xs md:text-sm text-slate-400">
                  {getDistrictLabel(property.location.district, language)} • {priceDisplay}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs md:text-sm font-semibold bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                  {safeActiveImgIndex + 1} / {images.length}
                </span>
                <button
                  onClick={() => setIsFullscreenGallery(false)}
                  className="p-2 md:p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition hover:scale-105 cursor-pointer"
                  title="Закрыть (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Главная область фото на весь экран */}
            <div
              className="relative flex-1 flex items-center justify-center my-3 w-full max-w-6xl mx-auto touch-pan-y"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {images.length > 1 && (
                <button
                  onClick={handlePrev}
                  className="absolute left-2 md:left-4 z-20 p-3 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white backdrop-blur-md border border-white/10 transition hover:scale-110 cursor-pointer"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              <img
                src={ImageOptimizerService.cleanExternalUrl(images[safeActiveImgIndex])}
                alt={property.title}
                className="max-h-[68vh] md:max-h-[76vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl transition-all duration-300"
              />

              {images.length > 1 && (
                <button
                  onClick={handleNext}
                  className="absolute right-2 md:right-4 z-20 p-3 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white backdrop-blur-md border border-white/10 transition hover:scale-110 cursor-pointer"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Нижняя лента миниатюр */}
            {images.length > 1 && (
              <div
                className="w-full max-w-4xl mx-auto flex items-center justify-center gap-2 overflow-x-auto py-2 px-4 no-scrollbar z-20"
                onClick={(e) => e.stopPropagation()}
              >
                {images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImgIndex(idx)}
                    className={`shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-xl overflow-hidden transition-all duration-200 border-2 ${
                      safeActiveImgIndex === idx
                        ? 'border-sky-400 scale-105 opacity-100 shadow-md'
                        : 'border-transparent opacity-50 hover:opacity-80'
                    }`}
                  >
                    <img
                      src={ImageOptimizerService.cleanExternalUrl(imgUrl)}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>,
          document.body,
        )}
    </>
  );
};