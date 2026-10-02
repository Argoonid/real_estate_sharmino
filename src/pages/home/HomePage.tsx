import React, { useState } from 'react';
import { DealType, PropertyType } from '../../shared/types';
import { useFilterStore } from '../../features/filter-properties/model/filtersStore';
import { useUIStore } from '../../app/model/uiStore';
import { useDistrictsQuery } from '../../entities/district/model/useDistrictsQuery';
import { useRecentPropertiesQuery } from '../../entities/property/model/usePropertiesQuery';
import { useAnonymousProfileStore } from '../../features/anonymous-profile/model/anonymousProfileStore';
import { PropertyCard } from '../../entities/property/ui/PropertyCard';
import { translations, getDistrictLabel } from '../../shared/i18n';
import {
  Search,
  Building2,
  ShieldCheck,
  Scale,
  BadgePercent,
  Video,
  ArrowRight,
  Sparkles,
  PhoneCall,
  ChevronRight,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const language = useUIStore((s) => s.language);
  const setActivePage = useUIStore((s) => s.setActivePage);
  const openDetail = useUIStore((s) => s.openPropertyDetail);
  const openBooking = useUIStore((s) => s.openBooking);
  const t = translations[language];

  const setFilter = useFilterStore((s) => s.setFilter);
  const currency = useFilterStore((s) => s.filter.currency);

  const favorites = useAnonymousProfileStore((s) => s.favorites);
  const toggleFavorite = useAnonymousProfileStore((s) => s.toggleFavorite);
  const compareIds = useAnonymousProfileStore((s) => s.compareIds);
  const toggleCompare = useAnonymousProfileStore((s) => s.toggleCompare);

  const { data: districts = [] } = useDistrictsQuery();
  const { data: recentProperties = [], isLoading: isRecentLoading } = useRecentPropertiesQuery();

  const [deal, setDeal] = useState<DealType>('sale');
  const [districtId, setDistrictId] = useState<string>('all');
  const [propertyType, setPropertyType] = useState<PropertyType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilter({
      deal,
      districtId,
      propertyType,
      searchQuery: searchQuery.trim(),
    });
    setActivePage('catalog');
  };

  const handleDistrictClick = (id: string) => {
    setFilter({
      deal: 'all',
      districtId: id,
      searchQuery: '',
    });
    setActivePage('catalog');
  };

  const districtHighlights = [
    {
      id: 'hadaba',
      title: language === 'ru' ? 'Хадаба' : 'Hadaba',
      desc: t.homeDistrictHadabaDesc,
      tag: t.homeDistrictHadabaTag,
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'naama_bay',
      title: language === 'ru' ? 'Наама Бей' : 'Naama Bay',
      desc: t.homeDistrictNaamaDesc,
      tag: t.homeDistrictNaamaTag,
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'nabq_bay',
      title: language === 'ru' ? 'Набк Бей' : 'Nabq Bay',
      desc: t.homeDistrictNabqDesc,
      tag: t.homeDistrictNabqTag,
      image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'montazah',
      title: language === 'ru' ? 'Монтаза' : 'Montazah',
      desc: t.homeDistrictMontazahDesc,
      tag: t.homeDistrictMontazahTag,
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'delta_sharm',
      title: language === 'ru' ? 'Дельта Шарм' : 'Delta Sharm',
      desc: t.homeDistrictDeltaDesc,
      tag: t.homeDistrictDeltaTag,
      image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
    },
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      {/* 1. HERO SECTION */}
      <section className="relative bg-slate-950 text-white overflow-hidden py-10 sm:py-16 lg:py-20 border-b border-slate-800">
        <div className="absolute inset-0 bg-radial-[at_top_right] from-sky-900/30 via-slate-950 to-slate-950 pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 space-y-6 sm:space-y-8">
          <div className="max-w-3xl space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/80 border border-sky-800/60 text-sky-400 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.homeHeroBadge}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              {t.homeHeroTitle}
            </h1>

            <p className="text-xs sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              {t.homeHeroSubtitle}
            </p>
          </div>

          {/* Интерактивная капсула поиска */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/15 p-3.5 sm:p-5 rounded-3xl shadow-2xl max-w-4xl">
            {/* Переключатель сделки */}
            <div className="flex items-center gap-1 p-1 bg-slate-900/80 rounded-2xl w-full sm:w-fit mb-3 sm:mb-4 border border-white/10">
              <button
                type="button"
                onClick={() => setDeal('sale')}
                className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer text-center ${
                  deal === 'sale' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.dealSale}
              </button>
              <button
                type="button"
                onClick={() => setDeal('long_term_rent')}
                className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer text-center ${
                  deal === 'long_term_rent' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.dealRentLong}
              </button>
              <button
                type="button"
                onClick={() => setDeal('daily_rent')}
                className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer text-center ${
                  deal === 'daily_rent' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.dealRentDaily}
              </button>
            </div>

            {/* Адаптивная форма: на десктопе 1 строка, кнопка не ломается */}
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5">
              <div className="sm:col-span-2 lg:col-span-4 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 pl-10 pr-3 text-xs bg-white text-slate-900 rounded-xl focus:outline-hidden font-medium placeholder:text-slate-400 shadow-xs"
                />
              </div>

              <div className="sm:col-span-1 lg:col-span-3">
                <select
                  value={districtId}
                  onChange={(e) => setDistrictId(e.target.value)}
                  className="w-full h-11 px-3 text-xs bg-white text-slate-900 rounded-xl focus:outline-hidden font-semibold cursor-pointer shadow-xs"
                >
                  <option value="all">{t.allDistricts}</option>
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {getDistrictLabel(d, language)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-1 lg:col-span-2">
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value as PropertyType | 'all')}
                  className="w-full h-11 px-3 text-xs bg-white text-slate-900 rounded-xl focus:outline-hidden font-semibold cursor-pointer shadow-xs"
                >
                  <option value="all">{t.propertyTypeAny}</option>
                  <option value="apartment">{t.typeApartment}</option>
                  <option value="villa">{t.typeVilla}</option>
                  <option value="studio">{t.typeStudio}</option>
                  <option value="duplex">{t.typeDuplex}</option>
                  <option value="penthouse">{t.typePenthouse}</option>
                  <option value="chalet">{t.typeChalet}</option>
                  <option value="commercial">{t.typeCommercial}</option>
                </select>
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <button
                  type="submit"
                  className="w-full h-11 px-5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-sky-600/30 cursor-pointer whitespace-nowrap"
                >
                  <span>{t.homeFindButton}</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 2. АТМОСФЕРА РАЙОНОВ: Свайп на мобилках + сетка на десктопе */}
      <section className="py-10 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 w-full space-y-5 sm:space-y-6">
        <div className="flex items-end justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
              {t.homeDistrictsTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {t.homeDistrictsSubtitle}
            </p>
          </div>
          <button
            onClick={() => setActivePage('districts')}
            className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span>{t.navDistricts}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* На мобилках: горизонтальный snap-скролл, на десктопе: 5 аккуратных колонок */}
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-3.5 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 lg:grid lg:grid-cols-5 lg:gap-3.5 no-scrollbar">
          {districtHighlights.map((dist) => (
            <div
              key={dist.id}
              onClick={() => handleDistrictClick(dist.id)}
              className="group relative w-[260px] sm:w-[280px] lg:w-auto shrink-0 snap-start h-80 sm:h-84 rounded-3xl overflow-hidden cursor-pointer shadow-xs hover:shadow-xl transition-all duration-300 border border-slate-200/80 flex flex-col justify-end p-4 select-none"
            >
              <img
                src={dist.image}
                alt={dist.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />

              <div className="relative z-10 space-y-1.5">
                <span className="px-2.5 py-0.5 rounded-lg bg-sky-600/95 text-white font-bold text-[10px] tracking-wide inline-block shadow-xs">
                  {dist.tag}
                </span>
                <h3 className="text-base sm:text-lg font-black text-white group-hover:text-sky-300 transition-colors">
                  {dist.title}
                </h3>
                <p className="text-[11px] text-slate-300 line-clamp-3 leading-snug">
                  {dist.desc}
                </p>
                <div className="pt-1 flex items-center gap-1 text-[11px] font-bold text-sky-400 group-hover:translate-x-1 transition-transform">
                  <span>{t.homeDistrictsExplore}</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. ЮРИДИЧЕСКИЙ КОНТУР */}
      <section className="bg-white py-10 sm:py-16 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
              {t.homeTrustTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              {t.homeTrustSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">{t.homeTrust1Title}</h3>
              <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">{t.homeTrust1Desc}</p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <BadgePercent className="w-4 h-4" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">{t.homeTrust2Title}</h3>
              <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">{t.homeTrust2Desc}</p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Scale className="w-4 h-4" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">{t.homeTrust3Title}</h3>
              <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">{t.homeTrust3Desc}</p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Video className="w-4 h-4" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">{t.homeTrust4Title}</h3>
              <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">{t.homeTrust4Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. СВЕЖИЕ ОБЪЕКТЫ */}
      <section className="py-10 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 w-full space-y-5 sm:space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
              {t.homeRecentTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {t.homeRecentSubtitle}
            </p>
          </div>
          <button
            onClick={() => {
              setFilter({ deal: 'all' });
              setActivePage('catalog');
            }}
            className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span>{t.homeViewAll}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {isRecentLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-72 rounded-3xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {recentProperties.slice(0, 6).map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                currency={currency}
                language={language}
                isFavorite={favorites.includes(property.id)}
                isCompared={compareIds.includes(property.id)}
                onSelect={(p) => openDetail(p)}
                onToggleFavorite={toggleFavorite}
                onToggleCompare={(p) => toggleCompare(p.id)}
                onBookViewing={openBooking}
              />
            ))}
          </div>
        )}
      </section>

      {/* 5. КОНСЬЕРЖ-СЕРВИС: Запрос на персональный подбор */}
      <section className="pb-16 sm:pb-20 max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="bg-gradient-to-br from-sky-900 to-slate-950 rounded-3xl p-5 sm:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-xl border border-sky-800/40">
          <div className="space-y-1.5 max-w-xl">
            <h3 className="text-lg sm:text-2xl font-black">{t.homeConciergeTitle}</h3>
            <p className="text-xs sm:text-sm text-sky-100/90 leading-relaxed">
              {t.homeConciergeSubtitle}
            </p>
          </div>

          <button
            onClick={() => openBooking(null)}
            className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-white text-slate-950 font-bold text-xs sm:text-sm hover:bg-sky-50 transition shadow-lg shrink-0 flex items-center justify-center gap-2 cursor-pointer hover:scale-105"
          >
            <PhoneCall className="w-4 h-4 text-sky-600 shrink-0" />
            <span>{t.homeConciergeAction}</span>
          </button>
        </div>
      </section>
    </div>
  );
};