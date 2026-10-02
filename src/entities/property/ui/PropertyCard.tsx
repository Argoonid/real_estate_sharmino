import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { DatabaseProperty, Currency } from '../../../shared/types';
import { formatPrice, formatPricePerSquareMeter } from '../../../shared/lib/formatters';
import { useExchangeRates } from '../../../shared/lib/exchangeRates';
import { OptimizedImage } from '../../../shared/ui/OptimizedImage';
import { ImageOptimizerService } from '../../../services/imageOptimizer';
import { formatBathrooms, formatBedrooms, getDistrictLabel, Language, translations } from '../../../shared/i18n';
import { useAnonymousProfileStore } from '../../../features/anonymous-profile/model/anonymousProfileStore';
import {
  Heart,
  Calendar,
  Waves,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Layers,
  Eye,
  Share2,
  Navigation,
  Check,
  Maximize2,
  X,
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [failedImages, setFailedImages] = useState<{ propertyId: string; urls: string[] }>({
    propertyId: '',
    urls: [],
  });
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

  // Предзагрузка соседних картинок для мгновенного отклика
  useEffect(() => {
    if (images.length <= 1) return;
    const nextIdx = (safeImgIndex + 1) % images.length;
    const prevIdx = (safeImgIndex - 1 + images.length) % images.length;
    [images[nextIdx], images[prevIdx]].forEach((url) => {
      if (url) {
        const img = new Image();
        img.src = ImageOptimizerService.cleanExternalUrl(url);
      }
    });
  }, [safeImgIndex, images]);

  const handleNextImg = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (images.length <= 1) return;
    setCurrentImgIndex((prev) => (prev >= images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const handlePrevImg = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (images.length <= 1) return;
    setCurrentImgIndex((prev) => (prev <= 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  // Управление свайпами (тач-жесты)
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isSwiping = useRef<boolean>(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwiping.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const diffX = e.touches[0].clientX - touchStartX.current;
    const diffY = e.touches[0].clientY - touchStartY.current;

    // Если движение горизонтальное и превышает минимальный порог
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
      isSwiping.current = true;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchEndX - touchStartX.current;
    const diffY = touchEndY - touchStartY.current;

    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
      e.stopPropagation();
      if (diffX < 0) {
        handleNextImg();
      } else {
        handlePrevImg();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
    // Оставляем флаг свайпа на 150мс, чтобы не сработал клик по карточке
    setTimeout(() => {
      isSwiping.current = false;
    }, 150);
  };

  // Управление горячими клавишами и блокировкой скролла в модалке
  useEffect(() => {
    if (!isFullscreen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullscreen(false);
      if (e.key === 'ArrowRight') handleNextImg();
      if (e.key === 'ArrowLeft') handlePrevImg();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen, handleNextImg, handlePrevImg]);

  const handleCopyShareLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}${window.location.pathname}?property=${property.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  const handleCardClick = () => {
    if (isSwiping.current) return;
    onSelect(property);
  };

  return (
    <>
      <div
        onMouseEnter={() => onHover && onHover(property.id)}
        onMouseLeave={() => onHover && onHover(null)}
        onClick={handleCardClick}
        className={`group bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer relative ${
          isViewed ? 'opacity-70 hover:opacity-100' : ''
        }`}
      >
        {images.length > 0 && (
          <div
            className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 touch-pan-y select-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
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

            {/* Стрелки перелистывания на десктопе */}
            {images.length > 1 && (
              <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                <button
                  onClick={handlePrevImg}
                  aria-label="Previous photo"
                  className="p-2 rounded-full bg-slate-950/65 hover:bg-slate-950/90 text-white shadow-md backdrop-blur-md transition-all hover:scale-110 pointer-events-auto"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextImg}
                  aria-label="Next photo"
                  className="p-2 rounded-full bg-slate-950/65 hover:bg-slate-950/90 text-white shadow-md backdrop-blur-md transition-all hover:scale-110 pointer-events-auto"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Верхние бейджи сделки и статусов */}
            <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10 pointer-events-none">
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

            {/* Верхние кнопки действий: Поделиться, Сравнить, Избранное */}
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

            {/* Нижняя панель над фото: Развернуть на весь экран и Счетчик фото */}
            <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between z-10 pointer-events-none">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFullscreen(true);
                }}
                className="p-1.5 rounded-xl bg-slate-950/70 hover:bg-slate-950/90 text-white backdrop-blur-md shadow-md transition hover:scale-105 pointer-events-auto flex items-center gap-1 text-[11px] font-semibold border border-white/10"
                title={language === 'ru' ? 'На весь экран' : 'Fullscreen'}
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>

              {images.length > 1 && (
                <span className="px-2 py-0.5 rounded-xl bg-slate-950/70 backdrop-blur-md text-white font-semibold text-[11px] border border-white/10 shadow-xs">
                  {safeImgIndex + 1} / {images.length}
                </span>
              )}
            </div>

            {/* Точки пагинации */}
            {images.length > 1 && (
              <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1 z-10 pointer-events-auto">
                {images.slice(0, 5).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImgIndex(idx);
                    }}
                    aria-label={`Go to photo ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      safeImgIndex === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/60 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Секция описания объекта */}
        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
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

            <h3 className="font-extrabold text-sm text-slate-900 line-clamp-2 leading-snug group-hover:text-sky-600 transition-colors">
              {property.title}
            </h3>

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

          <div className="pt-2 flex items-center gap-2">
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

      {/* Полноэкранный Lightbox (React Portal) */}
      {isFullscreen &&
        createPortal(
          <div
            className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-4 md:p-6 animate-in fade-in duration-200 select-none"
            onClick={() => setIsFullscreen(false)}
          >
            {/* Верхняя строка: Заголовок, район и закрытие */}
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
                  {safeImgIndex + 1} / {images.length}
                </span>
                <button
                  onClick={() => setIsFullscreen(false)}
                  className="p-2 md:p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition hover:scale-105 cursor-pointer"
                  title={language === 'ru' ? 'Закрыть (Esc)' : 'Close (Esc)'}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Главная область фото */}
            <div
              className="relative flex-1 flex items-center justify-center my-3 w-full max-w-6xl mx-auto touch-pan-y"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {images.length > 1 && (
                <button
                  onClick={handlePrevImg}
                  aria-label="Previous image"
                  className="absolute left-2 md:left-4 z-20 p-3 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white backdrop-blur-md border border-white/10 transition hover:scale-110 cursor-pointer"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              <img
                src={ImageOptimizerService.cleanExternalUrl(images[safeImgIndex])}
                alt={property.title}
                className="max-h-[68vh] md:max-h-[76vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl transition-all duration-300"
              />

              {images.length > 1 && (
                <button
                  onClick={handleNextImg}
                  aria-label="Next image"
                  className="absolute right-2 md:right-4 z-20 p-3 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white backdrop-blur-md border border-white/10 transition hover:scale-110 cursor-pointer"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Нижняя лента миниатюр (Thumbnail Strip) */}
            {images.length > 1 && (
              <div
                className="w-full max-w-4xl mx-auto flex items-center justify-center gap-2 overflow-x-auto py-2 px-4 no-scrollbar z-20"
                onClick={(e) => e.stopPropagation()}
              >
                {images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImgIndex(idx)}
                    className={`shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-xl overflow-hidden transition-all duration-200 border-2 ${
                      safeImgIndex === idx
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