import React, { useEffect, useRef, useState, useMemo, Component, ErrorInfo, ReactNode } from 'react';
import L from 'leaflet';
import { DatabaseProperty, Currency, District } from '../../shared/types';
import { formatPrice, getBasePriceUSD } from '../../shared/lib/formatters';
import { useExchangeRates } from '../../shared/lib/exchangeRates';
import { getDistrictLabel, Language, translations } from '../../shared/i18n';
import { useAnonymousProfileStore } from '../../features/anonymous-profile/model/anonymousProfileStore';
import { useDistrictsQuery } from '../../entities/district/model/useDistrictsQuery';
import { ENV } from '../../config/env';
import { OptimizedImage } from '../../shared/ui/OptimizedImage';
import {
  Layers,
  MapPin,
  Maximize2,
  Minimize2,
  Navigation,
  X,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Waves,
  Search,
  Building2,
  Eye,
  Heart,
  ZoomIn,
  RefreshCw,
} from 'lucide-react';

// Safely patch Leaflet's getPosition / setPosition to guarantee _leaflet_pos never throws
if (typeof window !== 'undefined' && L && L.DomUtil) {
  const origGetPosition = L.DomUtil.getPosition;
  L.DomUtil.getPosition = function (el: any): L.Point {
    if (!el) return new L.Point(0, 0);
    try {
      return origGetPosition.call(L.DomUtil, el) || new L.Point(0, 0);
    } catch {
      return new L.Point(0, 0);
    }
  };

  const origSetPosition = L.DomUtil.setPosition;
  L.DomUtil.setPosition = function (el: any, point: L.Point): void {
    if (!el) return;
    try {
      origSetPosition.call(L.DomUtil, el, point);
    } catch {}
  };
}

export interface PropertyMapProps {
  properties: DatabaseProperty[];
  selectedProperty: DatabaseProperty | null;
  hoveredPropertyId: string | null;
  onSelectProperty: (property: DatabaseProperty) => void;
  onBookViewing?: (property: DatabaseProperty) => void;
  onDistrictSelect?: (districtId: string) => void;
  currency: Currency;
  language?: Language;
  activeDistrictId: string;
  isLoading?: boolean;
}

export interface PropertyCluster {
  id: string;
  center: { lat: number; lng: number };
  districtName: string;
  properties: DatabaseProperty[];
  minPrice: number;
  maxPrice: number;
}

const DEFAULT_SHARM_CENTER = { lat: 27.9158, lng: 34.3299 };
const CARTO_VOYAGER_TILES = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

function getCartoVoyagerTileUrl(): string {
  if (!ENV.CARTO_API_KEY) return CARTO_VOYAGER_TILES;
  return `${CARTO_VOYAGER_TILES}?key=${encodeURIComponent(ENV.CARTO_API_KEY)}`;
}

function isValidLatLng(lat?: any, lng?: any): boolean {
  return typeof lat === 'number' && !isNaN(lat) && isFinite(lat) &&
         typeof lng === 'number' && !isNaN(lng) && isFinite(lng);
}

function flyToDistrict(map: L.Map | null, district: District, zoom = 13): void {
  if (!map || !isValidLatLng(district.lat, district.lng)) return;
  map.flyTo([district.lat, district.lng], zoom, { duration: 0.8 });
}

// Error Boundary specifically to prevent white screen crashes
class MapErrorBoundary extends Component<{ children: ReactNode; onReset?: () => void; language?: Language }, { hasError: boolean; error: string }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('[MapErrorBoundary] Caught map render error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const t = translations[this.props.language ?? 'ru'];
      return (
        <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center p-6 bg-slate-100 rounded-2xl border border-slate-200 text-center">
          <Building2 className="w-10 h-10 text-slate-400 mb-2" />
          <h4 className="text-sm font-bold text-slate-800">{t.mapReloadTitle}</h4>
          <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
            {t.mapRefreshDescription}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              if (this.props.onReset) this.props.onReset();
            }}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t.refreshMap}</span>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const PropertyMapContent: React.FC<PropertyMapProps> = ({
  properties = [],
  selectedProperty,
  hoveredPropertyId,
  onSelectProperty,
  onBookViewing,
  onDistrictSelect,
  currency,
  language = 'ru',
  activeDistrictId,
  isLoading = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersMapRef = useRef<Map<string, L.Marker>>(new Map());
  const lastFittedDistrictRef = useRef<string>('');

  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite'>('streets');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDistricts, setShowDistricts] = useState(true);
  const { data: districts = [] } = useDistrictsQuery();
  const { data: exchangeRates } = useExchangeRates();
  const t = translations[language];

  // Active district resolution
  const activeDistrict = useMemo(() => {
    if (!activeDistrictId || activeDistrictId === 'all') return null;
    return districts.find((d) => d.id === activeDistrictId) || null;
  }, [activeDistrictId, districts]);

  const activeDistrictCount = useMemo(() => {
    if (!activeDistrict) return 0;
    return properties.filter((p) => p.location.district?.id === activeDistrict.id).length;
  }, [activeDistrict, properties]);

  // Map Previews
  const [activePreviewProperty, setActivePreviewProperty] = useState<DatabaseProperty | null>(null);
  const [activePreviewCluster, setActivePreviewCluster] = useState<PropertyCluster | null>(null);
  const [previewImgIndex, setPreviewImgIndex] = useState(0);
  const [failedImageUrls, setFailedImageUrls] = useState<Set<string>>(() => new Set());
  const previewImages = useMemo(
    () => (activePreviewProperty?.images ?? []).filter((image) => !failedImageUrls.has(image)),
    [activePreviewProperty?.images, failedImageUrls],
  );
  const safePreviewImgIndex = Math.min(previewImgIndex, Math.max(0, previewImages.length - 1));

  const handleImageError = (src: string) => {
    setFailedImageUrls((current) => new Set(current).add(src));
    setPreviewImgIndex((current) => Math.min(current, Math.max(0, previewImages.length - 2)));
  };

  // Address search inside map
  const [addressSearch, setAddressSearch] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // User profile
  const recentViews = useAnonymousProfileStore((s) => s.recentViews);
  const favorites = useAnonymousProfileStore((s) => s.favorites);
  const toggleFavorite = useAnonymousProfileStore((s) => s.toggleFavorite);

  // Close search suggestions on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // When fullscreen changes, invalidate map size
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [isFullscreen]);

  // Aggregate listings at district level; individual property coordinates are not used on the map.
  const clusters = useMemo(() => {
    return districts.flatMap((district) => {
      if (!isValidLatLng(district.lat, district.lng)) return [];
      const districtProperties = properties.filter(
        (property) => property.location.district?.id === district.id,
      );
      if (districtProperties.length === 0) return [];

      const prices = districtProperties.map((property) => getBasePriceUSD(property, exchangeRates));
      return [{
        id: `district_${district.id}`,
        center: { lat: district.lat, lng: district.lng },
        districtName: getDistrictLabel(district, language),
        properties: districtProperties,
        minPrice: Math.min(...prices),
        maxPrice: Math.max(...prices),
      }];
    });
  }, [districts, properties, exchangeRates, language]);
  const mappedPropertiesCount = clusters.reduce(
    (count, cluster) => count + cluster.properties.length,
    0,
  );
  const propertiesWithoutDistrict = properties.length - mappedPropertiesCount;

  // Autocomplete suggestions
  const searchSuggestions = useMemo(() => {
    if (!addressSearch.trim() || addressSearch.trim().length < 2) return [];
    const query = addressSearch.toLowerCase();

    return districts.filter((district) =>
      `${district.name_ru} ${district.name_en} ${district.slug}`.toLowerCase().includes(query)
    ).slice(0, 5);
  }, [addressSearch, districts]);

  // Initialize Map safely
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    if ((mapContainerRef.current as any)._leaflet_id) {
      (mapContainerRef.current as any)._leaflet_id = null;
    }

    try {
      const map = L.map(mapContainerRef.current, {
        center: [27.9400, 34.3600],
        zoom: 12,
        zoomControl: false,
      });

      const zoomCtrl = L.control.zoom({ position: 'topright' });
      zoomCtrl.addTo(map);

      const tileLayer = L.tileLayer(getCartoVoyagerTileUrl(), {
        subdomains: 'abcd',
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        maxZoom: 20,
      }).addTo(map);

      tileLayerRef.current = tileLayer;

      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;

      mapInstanceRef.current = map;

      const t1 = setTimeout(() => map.invalidateSize(), 100);
      const t2 = setTimeout(() => map.invalidateSize(), 300);
      const t3 = setTimeout(() => map.invalidateSize(), 600);

      map.on('click', () => {
        setActivePreviewProperty(null);
        setActivePreviewCluster(null);
      });

      const resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserver.observe(mapContainerRef.current);

      const handleWindowResize = () => {
        map.invalidateSize();
      };
      window.addEventListener('resize', handleWindowResize);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        window.removeEventListener('resize', handleWindowResize);
        resizeObserver.disconnect();
        if (mapInstanceRef.current) {
          try {
            mapInstanceRef.current.stop();
            mapInstanceRef.current.off();
            if (markersLayerRef.current) {
              markersLayerRef.current.clearLayers();
            }
            mapInstanceRef.current.remove();
          } catch {}
          mapInstanceRef.current = null;
        }
        if (mapContainerRef.current) {
          try {
            delete (mapContainerRef.current as any)._leaflet_id;
          } catch {
            (mapContainerRef.current as any)._leaflet_id = null;
          }
        }
      };
    } catch (err) {
      console.warn('[PropertyMap] Leaflet initialization error:', err);
    }
  }, []);

  // Switch map tiles
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    try {
      if (tileLayerRef.current) {
        map.removeLayer(tileLayerRef.current);
      }

      if (mapStyle === 'satellite') {
        tileLayerRef.current = L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          {
            attribution: 'Esri Satellite &mdash; Sharm El Sheikh Coast',
            maxZoom: 18,
          }
        ).addTo(map);
      } else {
        tileLayerRef.current = L.tileLayer(getCartoVoyagerTileUrl(), {
          subdomains: 'abcd',
          attribution: '&copy; OpenStreetMap &copy; CARTO',
          maxZoom: 20,
        }).addTo(map);
      }
    } catch {}
  }, [mapStyle]);

  // Auto-pan / fit bounds when activeDistrictId changes
  useEffect(() => {
    if (!activeDistrictId || activeDistrictId === 'all') {
      lastFittedDistrictRef.current = 'all';
      return;
    }
    if (lastFittedDistrictRef.current === activeDistrictId) return;
    lastFittedDistrictRef.current = activeDistrictId;

    const targetDistrict = districts.find((district) => district.id === activeDistrictId);
    if (targetDistrict) flyToDistrict(mapInstanceRef.current, targetDistrict);
  }, [activeDistrictId, districts]);

  // Render one approximate district marker for each group of listings.
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    try {
      layer.clearLayers();
      markersMapRef.current.clear();
      if (!showDistricts) return;

      clusters.forEach((cluster) => {
        if (!isValidLatLng(cluster.center.lat, cluster.center.lng)) return;

        const isHovered = cluster.properties.some((property) => property.id === hoveredPropertyId);
        const isSelected =
          cluster.properties.some((property) =>
            property.id === selectedProperty?.id || property.id === activePreviewProperty?.id
          ) || activePreviewCluster?.id === cluster.id;
        const minPriceText = formatPrice(cluster.minPrice, currency, language, exchangeRates);
        const html = `
            <div class="cursor-pointer transition-all duration-200 transform ${
              isSelected
                ? 'scale-125 z-[9999]'
                : isHovered
                ? 'scale-125 z-[9999]'
                : 'hover:scale-110'
            }">
              <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-xl border text-xs font-bold whitespace-nowrap transition-colors ${
                isSelected
                  ? 'bg-sky-600 text-white border-white ring-4 ring-sky-300 shadow-2xl'
                  : isHovered
                  ? 'bg-slate-950 text-white border-white ring-4 ring-sky-400 shadow-2xl'
                  : 'bg-white text-slate-900 border-sky-400 hover:border-sky-600 shadow-lg'
              }">
                <span class="flex h-2 w-2 rounded-full bg-sky-500 ring-2 ring-sky-200"></span>
                <span class="truncate max-w-[120px] font-extrabold">${cluster.districtName}</span>
                <span class="px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                  isSelected || isHovered ? 'bg-white text-slate-900' : 'bg-sky-600 text-white'
                }">${cluster.properties.length}</span>
                <span class="text-[10px] font-medium opacity-90">${minPriceText}</span>
              </div>
            </div>
          `;

        const marker = L.marker([cluster.center.lat, cluster.center.lng], {
          icon: L.divIcon({
            className: 'custom-district-cluster-pin',
            html,
            iconSize: [170, 34],
            iconAnchor: [85, 17],
          }),
        });

        marker.setZIndexOffset(isHovered || isSelected ? 10000 : 0);
        marker.bindTooltip(`${cluster.districtName} · ${t.mapListings(cluster.properties.length)}`, {
          direction: 'top',
        });
        marker.on('click', () => {
          setActivePreviewProperty(null);
          setActivePreviewCluster(cluster);
          setPreviewImgIndex(0);
        });

        cluster.properties.forEach((property) => {
          markersMapRef.current.set(property.id, marker);
        });
        markersMapRef.current.set(cluster.id, marker);
        layer.addLayer(marker);
      });
    } catch (e) {
      console.warn('[PropertyMap] Marker rendering caught error:', e);
    }
  }, [
    showDistricts,
    clusters,
    currency,
    language,
    t,
    exchangeRates,
    selectedProperty,
    hoveredPropertyId,
    activePreviewProperty,
    activePreviewCluster,
  ]);

  // Dynamically elevate marker z-index when hoveredPropertyId changes
  useEffect(() => {
    if (!hoveredPropertyId) return;
    const targetMarker = markersMapRef.current.get(hoveredPropertyId);
    if (targetMarker && (targetMarker as any)._icon) {
      try {
        targetMarker.setZIndexOffset(10000);
      } catch {}
    }
  }, [hoveredPropertyId]);

  // Selected listings only pan to their approximate district center.
  useEffect(() => {
    if (selectedProperty && mapInstanceRef.current) {
      const district = selectedProperty.location.district;
      if (district) flyToDistrict(mapInstanceRef.current, district, 13);
      setActivePreviewProperty(selectedProperty);
      setActivePreviewCluster(null);
      setPreviewImgIndex(0);
    }
  }, [selectedProperty]);

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([27.9400, 34.3600], 12, { duration: 0.6 });
    }
    setActivePreviewProperty(null);
    setActivePreviewCluster(null);
  };

  const handleSelectLocation = (district: District) => {
    flyToDistrict(mapInstanceRef.current, district);
    onDistrictSelect?.(district.id);
    setAddressSearch(getDistrictLabel(district, language));
    setIsSearchFocused(false);
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressSearch.trim()) return;

    const matched = districts.find((district) =>
      `${district.name_ru} ${district.name_en} ${district.slug}`
        .toLowerCase()
        .includes(addressSearch.trim().toLowerCase())
    );
    if (matched) handleSelectLocation(matched);
  };

  return (
    <div
      className={`relative w-full h-full min-h-[480px] rounded-2xl overflow-hidden shadow-inner border border-slate-200 bg-slate-100 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none min-h-screen' : ''
      }`}
    >
      <div ref={mapContainerRef} className="w-full h-full z-0 min-h-[480px]" />

      {/* Top Floating Bar: Address / Compound Search with Fuzzy Matching */}
      <div ref={searchContainerRef} className="absolute top-3 left-3 right-16 sm:right-auto sm:w-80 z-30">
        <form onSubmit={handleAddressSubmit} className="relative">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-sky-600 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder={t.searchDistrict}
              value={addressSearch}
              onChange={(e) => setAddressSearch(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              className="w-full pl-9 pr-8 py-2 text-xs bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl shadow-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
            />
            {addressSearch && (
              <button
                type="button"
                onClick={() => setAddressSearch('')}
                className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isSearchFocused && searchSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-slate-200 overflow-hidden divide-y divide-slate-100 animate-in fade-in slide-in-from-top-1 text-xs z-40 max-h-60 overflow-y-auto">
              {searchSuggestions.map((loc, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectLocation(loc)}
                  className="w-full text-left px-3 py-2.5 hover:bg-sky-50 flex items-center justify-between transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0 group-hover:scale-110 transition-transform" />
                    <div>
                      <div className="font-bold text-slate-900">{getDistrictLabel(loc, language)}</div>
                    </div>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-100 text-slate-600">
                    {t.mapDistrictTag}
                  </span>
                </button>
              ))}
            </div>
          )}
        </form>
      </div>

      {/* Floating Map Controls & "Search in current area" toggle */}
      <div className="absolute top-14 left-3 right-16 sm:right-auto z-20 flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full bg-white/95 backdrop-blur-md p-1.5 rounded-xl shadow-md border border-slate-200 text-xs">
        <button
          onClick={() => setMapStyle(mapStyle === 'streets' ? 'satellite' : 'streets')}
          className={`flex items-center gap-1.5 px-2.5 py-1 font-semibold rounded-lg transition-all shrink-0 cursor-pointer ${
            mapStyle === 'satellite'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{mapStyle === 'streets' ? t.mapSatellite : t.mapScheme}</span>
        </button>

        {/* District boundaries layer toggle */}
        <button
          onClick={() => setShowDistricts(!showDistricts)}
          className={`flex items-center gap-1.5 px-2.5 py-1 font-semibold rounded-lg transition-all shrink-0 cursor-pointer ${
            showDistricts
              ? 'bg-sky-600 text-white shadow-2xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
          title={t.mapToggleDistrictGroups}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>{t.mapDistricts.replace(':', '')}</span>
        </button>

        <button
          onClick={handleResetView}
          className="flex items-center gap-1 px-2.5 py-1 font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all shrink-0 cursor-pointer"
        >
          <Navigation className="w-3.5 h-3.5 text-sky-600" />
          <span>{t.mapWholeSharm}</span>
        </button>

        {/* Active District Quick Filter Pill */}
        {activeDistrictId && activeDistrictId !== 'all' && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-sky-100 border border-sky-300 text-sky-900 text-xs font-bold shrink-0 animate-in fade-in">
            <span>{activeDistrict ? getDistrictLabel(activeDistrict, language) : activeDistrictId}</span>
            {onDistrictSelect && (
              <button
                onClick={() => onDistrictSelect('all')}
                className="p-0.5 hover:bg-sky-200 rounded-full cursor-pointer ml-0.5 text-sky-700"
                title={t.mapResetDistrict}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        <div
          className="text-[11px] text-slate-500 font-medium px-2 hidden md:block border-l border-slate-200 shrink-0"
          title={t.mapApproxCenters}
        >
          {t.mapProperties}{' '}
          <span className="font-bold text-slate-900">
            {isLoading ? t.mapLoading : mappedPropertiesCount}
          </span>
          {!isLoading && propertiesWithoutDistrict > 0 && (
            <span className="ml-1 text-amber-700" title={t.mapApproxCenters}>
              ({t.mapWithoutDistrict(propertiesWithoutDistrict)})
            </span>
          )}
        </div>
      </div>

      {/* Quick District Selector Strip on Map */}
      {showDistricts && (
        <div className="absolute top-26 left-3 right-3 sm:right-auto z-20 flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full bg-white/95 backdrop-blur-md px-2 py-1.5 rounded-xl shadow-md border border-slate-200 text-xs animate-in fade-in duration-150">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-0.5">
            {t.mapDistricts}
          </span>
          <button
            onClick={() => onDistrictSelect && onDistrictSelect('all')}
            className={`px-2 py-0.5 rounded-lg text-[11px] font-bold shrink-0 transition cursor-pointer whitespace-nowrap ${
              !activeDistrictId || activeDistrictId === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t.mapAll}
          </button>
          {districts.map((d) => {
            const isSel = activeDistrictId === d.id;
            const cnt = properties.filter((p) =>
              p.location.district?.id === d.id
            ).length;
            return (
              <button
                key={d.id}
                onClick={() => {
                  if (onDistrictSelect) {
                    onDistrictSelect(isSel ? 'all' : d.id);
                  }
                  flyToDistrict(mapInstanceRef.current, d);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold shrink-0 transition cursor-pointer whitespace-nowrap border ${
                  isSel
                    ? 'bg-sky-600 text-white border-sky-600 shadow-xs scale-105'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: isSel ? '#ffffff' : '#0284c7' }}
                />
                <span>{getDistrictLabel(d, language)}</span>
                <span
                  className={`text-[9px] px-1 rounded-sm font-black ${
                    isSel ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {cnt}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Active District Floating Info Card */}
      {activeDistrict && activeDistrictId !== 'all' && (
        <div className="absolute bottom-6 left-3 z-30 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-sky-300 p-3 max-w-xs animate-in slide-in-from-bottom duration-200">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span
                className="w-3.5 h-3.5 rounded-full ring-2 ring-white shadow-xs shrink-0"
                style={{ backgroundColor: '#0284c7' }}
              />
              <div>
                <div className="font-extrabold text-xs text-slate-900 leading-tight">
                  {getDistrictLabel(activeDistrict, language)}
                </div>
                <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
                  {t.mapFoundListings(activeDistrictCount)}
                </div>
              </div>
            </div>
            <button
              onClick={() => onDistrictSelect && onDistrictSelect('all')}
              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition cursor-pointer"
              title={t.mapResetDistrict}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                flyToDistrict(mapInstanceRef.current, activeDistrict);
              }}
              className="flex-1 py-1 px-2 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-[10px] rounded-lg transition text-center cursor-pointer"
            >
              {t.mapZoomDistrict}
            </button>
            <button
              onClick={() => onDistrictSelect && onDistrictSelect('all')}
              className="flex-1 py-1 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] rounded-lg transition text-center cursor-pointer"
            >
              {t.mapResetFilter}
            </button>
          </div>
        </div>
      )}

      {/* Fullscreen Toggle Button */}
      <div className="absolute top-3 right-3 z-20">
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2 bg-white/95 backdrop-blur-md text-slate-700 hover:text-slate-900 rounded-xl shadow-md border border-slate-200 transition-all cursor-pointer"
          title={t.mapFullscreen}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* 1. SINGLE PROPERTY PREVIEW CARD (opens when clicking a single marker) */}
      {activePreviewProperty && !activePreviewCluster && (
        <div className="absolute bottom-20 sm:bottom-4 left-3 right-3 sm:left-auto sm:right-4 sm:w-96 z-40 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
          <button
            onClick={() => setActivePreviewProperty(null)}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition cursor-pointer z-20"
            title={t.mapClosePreview}
          >
            <X className="w-4 h-4" />
          </button>
          {/* Photos Header with Carousel */}
          {previewImages.length > 0 && (
          <div className="relative aspect-[16/9] w-full bg-slate-100">
            <OptimizedImage
              src={previewImages[safePreviewImgIndex]}
              alt={activePreviewProperty.title || t.appName}
              aspectRatioClass="w-full h-full"
              onError={handleImageError}
            />

            {/* Image navigation arrows if multiple images */}
            {previewImages.length > 1 && (
              <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex justify-between items-center z-10 pointer-events-none">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const len = previewImages.length;
                    setPreviewImgIndex((prev) => (prev === 0 ? len - 1 : prev - 1));
                  }}
                  className="p-1 rounded-full bg-black/60 text-white hover:bg-black/80 transition pointer-events-auto cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const len = previewImages.length;
                    setPreviewImgIndex((prev) => (prev === len - 1 ? 0 : prev + 1));
                  }}
                  className="p-1 rounded-full bg-black/60 text-white hover:bg-black/80 transition pointer-events-auto cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Badges Overlay */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
              <span className="px-2 py-0.5 rounded-lg bg-slate-900/80 backdrop-blur-md text-white font-bold text-[10px] uppercase tracking-wider">
                {activePreviewProperty.deal === 'sale'
                  ? t.propertySale
                  : activePreviewProperty.deal === 'daily_rent'
                    ? t.propertyDailyRent
                    : t.propertyLongRent}
              </span>
              {activePreviewProperty.specs?.has_beach_access && (
                <span className="px-2 py-0.5 rounded-lg bg-sky-600/90 backdrop-blur-md text-white font-bold text-[10px] flex items-center gap-1">
                  <Waves className="w-3 h-3" />
                  <span>{t.beach}</span>
                </span>
              )}
              {recentViews.includes(activePreviewProperty.id) && (
                <span className="px-2 py-0.5 rounded-lg bg-emerald-600/90 backdrop-blur-md text-white font-bold text-[10px] flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{t.viewed}</span>
                </span>
              )}
            </div>

            {/* Price Tag */}
            <div className="absolute bottom-3 left-3 bg-sky-600 text-white font-black text-sm px-3 py-1 rounded-xl shadow-md">
              {formatPrice(activePreviewProperty, currency, language, exchangeRates)}
            </div>
          </div>
          )}

          {/* Details Content */}
          <div className="p-4 space-y-3">
            <div>
              <h4 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug">
                {activePreviewProperty.title}
              </h4>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>
                  {getDistrictLabel(activePreviewProperty.location?.district, language)}
                </span>
              </div>
            </div>

            {/* Specs row */}
            <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-center text-xs">
              <div className="bg-slate-50 p-1.5 rounded-xl">
                <div className="text-[10px] text-slate-400">{t.area}</div>
                <div className="font-bold text-slate-800">{t.areaUnit(activePreviewProperty.specs?.area_sqm || 0)}</div>
              </div>
              <div className="bg-slate-50 p-1.5 rounded-xl">
                <div className="text-[10px] text-slate-400">{t.bedrooms}</div>
                <div className="font-bold text-slate-800">
                  {activePreviewProperty.specs?.bedrooms === 0 ? t.studio : t.bedroomsCount(activePreviewProperty.specs?.bedrooms || 1)}
                </div>
              </div>
              <div className="bg-slate-50 p-1.5 rounded-xl">
                <div className="text-[10px] text-slate-400">{t.bathrooms}</div>
                <div className="font-bold text-slate-800">{t.bathroomsCount(activePreviewProperty.specs?.bathrooms || 1)}</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => onSelectProperty(activePreviewProperty)}
                className="flex-1 py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
              >
                <span>{t.mapPropertyDetails}</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => toggleFavorite(activePreviewProperty.id)}
                className={`p-2.5 rounded-xl border transition cursor-pointer ${
                  favorites.includes(activePreviewProperty.id)
                    ? 'bg-rose-50 border-rose-300 text-rose-600'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800'
                }`}
                title={t.navFavorites}
              >
                <Heart
                  className={`w-4 h-4 ${
                    favorites.includes(activePreviewProperty.id) ? 'fill-rose-500 text-rose-500' : ''
                  }`}
                />
              </button>

              {onBookViewing && (
                <button
                  onClick={() => onBookViewing(activePreviewProperty)}
                  className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-xs transition cursor-pointer"
                  title={t.bookViewing}
                >
                  <Calendar className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. MASTER POINT PREVIEW (opens when clicking a cluster of multiple properties) */}
      {activePreviewCluster && !activePreviewProperty && (
        <div className="absolute bottom-20 sm:bottom-4 left-3 right-3 sm:left-auto sm:right-4 sm:w-[420px] max-w-[calc(100%-1.5rem)] z-40 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-4 duration-200 flex flex-col max-h-[75vh]">
          {/* Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-white">
                    {activePreviewCluster.districtName}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-sky-500 text-white">
                    {t.mapListings(activePreviewCluster.properties.length)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  {activePreviewCluster.districtName} • {t.mapStartingPrice}{' '}
                  {formatPrice(activePreviewCluster.minPrice, currency, language, exchangeRates)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  mapInstanceRef.current?.flyTo(
                    [activePreviewCluster.center.lat, activePreviewCluster.center.lng],
                    13,
                    { duration: 0.8 }
                  );
                }}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
                title={t.mapZoomDistrictCenter}
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActivePreviewCluster(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
                title={t.close}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List of previews inside this Master Point */}
          <div className="p-3 space-y-2.5 overflow-y-auto max-h-[55vh] divide-y divide-slate-100">
            {activePreviewCluster.properties.map((prop) => {
              if (!prop || !prop.id) return null;
              const isViewed = recentViews.includes(prop.id);
              const isFav = favorites.includes(prop.id);

              return (
                <div
                  key={prop.id}
                  className={`pt-2.5 first:pt-0 flex gap-3 items-center group transition-opacity ${
                    isViewed ? 'opacity-70 hover:opacity-100' : ''
                  }`}
                >
                  {/* Thumbnail */}
                  {prop.images?.[0] && !failedImageUrls.has(prop.images[0]) && (
                    <div
                      onClick={() => onSelectProperty(prop)}
                      className="relative w-24 h-20 rounded-2xl overflow-hidden shrink-0 cursor-pointer shadow-xs"
                    >
                      <OptimizedImage
                        src={prop.images[0]}
                        alt={prop.title || t.appName}
                        aspectRatioClass="w-full h-full"
                        className="group-hover:scale-105 transition-transform"
                        onError={handleImageError}
                      />
                      {isViewed && (
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-xs text-white text-[9px] font-bold flex items-center gap-0.5">
                          <Eye className="w-2.5 h-2.5 text-sky-400" />
                        </span>
                      )}
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-black text-sky-700 text-xs">
                        {formatPrice(prop, currency, language, exchangeRates)}
                      </span>
                      <button
                        onClick={() => toggleFavorite(prop.id)}
                        className={`p-1 rounded-lg transition cursor-pointer ${
                          isFav ? 'text-rose-500' : 'text-slate-300 hover:text-slate-600'
                        }`}
                        title={t.navFavorites}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500' : ''}`} />
                      </button>
                    </div>

                    <h5
                      onClick={() => onSelectProperty(prop)}
                      className="font-bold text-slate-800 text-xs truncate hover:text-sky-600 cursor-pointer"
                    >
                      {prop.title}
                    </h5>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span>{prop.specs?.bedrooms === 0 ? t.studio : t.bedroomsCount(prop.specs?.bedrooms || 1)}</span>
                      <span>•</span>
                      <span>{t.areaUnit(prop.specs?.area_sqm || 0)}</span>
                      {prop.specs?.has_beach_access && (
                        <>
                          <span>•</span>
                          <span className="text-sky-600 font-semibold">{t.beach}</span>
                        </>
                      )}
                    </div>

                    <div className="pt-0.5">
                      <button
                        onClick={() => onSelectProperty(prop)}
                        className="text-[11px] font-bold text-sky-600 hover:text-sky-700 inline-flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>{t.mapCard}</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export const PropertyMap: React.FC<PropertyMapProps> = (props) => {
  return (
    <MapErrorBoundary language={props.language}>
      <PropertyMapContent {...props} />
    </MapErrorBoundary>
  );
};
