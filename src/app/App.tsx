import React, { useCallback, useEffect } from 'react';
import { useUIStore } from './model/uiStore';
import { useFilterStore } from '../features/filter-properties/model/filtersStore';
import { useAnonymousProfileStore } from '../features/anonymous-profile/model/anonymousProfileStore';
import type { PageId } from '../shared/types';
import { usePropertyQuery } from '../entities/property/model/usePropertiesQuery';
import { QueryProvider } from './providers/QueryProvider';

// Layout & Navigation
import { Navbar } from '../widgets/navbar/Navbar';
import { Footer } from '../widgets/footer/Footer';
import { MobileBottomBar } from '../widgets/mobile-bottom-bar/MobileBottomBar';

// Pages
import { CatalogPage } from '../pages/catalog/CatalogPage';
import { PopularPage } from '../pages/popular/PopularPage';
import { SalePage } from '../pages/sale/SalePage';
import { RentPage } from '../pages/rent/RentPage';
import { DistrictsPage } from '../pages/districts/DistrictsPage';
import { PropertyDetailPage } from '../pages/property-detail/PropertyDetailPage';
import { AdminPage } from '../pages/admin/AdminPage';

// Features / Modals
import { BookingModal } from '../features/booking/ui/BookingModal';
import { PropertyComparisonModal } from '../features/property-comparison/ui/PropertyComparisonModal';
import { SavedPropertiesModal } from '../features/anonymous-profile/ui/SavedPropertiesModal';
import { ShareProfileModal } from '../features/anonymous-profile/ui/ShareProfileModal';

// Shared UI
import { SettingsModal } from '../shared/ui/SettingsModal';
import { CookieBanner } from '../shared/ui/CookieBanner';
import { ScrollToTop } from '../shared/ui/ScrollToTop';
import { useExchangeRates } from '../shared/lib/exchangeRates';
import { convertCurrency, UNLIMITED_PRICE } from '../shared/lib/formatters';
import { ConsentService, CONSENT_CHANGED_EVENT } from '../services/consent';
import { revokeAnalyticsConsent, trackPageView } from '../services/analytics';
import { translations } from '../shared/i18n';

function isNavigablePageId(value: string | null): value is Exclude<PageId, 'property' | 'admin'> {
  return value === 'catalog' ||
    value === 'sale' ||
    value === 'rent' ||
    value === 'popular' ||
    value === 'districts';
}

export const AppContent: React.FC = () => {
  const activePage = useUIStore((s) => s.activePage);
  const setActivePage = useUIStore((s) => s.setActivePage);
  const language = useUIStore((s) => s.language);
  const setLanguage = useUIStore((s) => s.setLanguage);

  const openAdmin = useCallback(() => {
    if (window.location.pathname.replace(/\/+$/, '') !== '/admin') {
      window.history.pushState({}, '', '/admin');
    }
    setActivePage('admin');
  }, [setActivePage]);

  const closeAdmin = useCallback(() => {
    window.history.replaceState({}, '', '/');
    setActivePage('catalog');
  }, [setActivePage]);

  const selectedPropertyId = useUIStore((s) => s.selectedPropertyId);
  const selectedProperty = useUIStore((s) => s.selectedProperty);
  const selectedPropertyQuery = usePropertyQuery(selectedPropertyId);
  const closePropertyDetail = useUIStore((s) => s.closePropertyDetail);

  useEffect(() => {
    const t = translations[language];
    document.documentElement.lang = language;
    if (!selectedPropertyId) {
      document.title = `${t.appName} — ${t.brandSubtitle}`;
      document.querySelector('meta[name="description"]')?.setAttribute('content', t.tagline);
    }
  }, [language, selectedPropertyId]);

  useEffect(() => {
    const trackCurrentPage = () => {
      if (ConsentService.getConsentStatus() === 'all') {
        const pagePath = `${window.location.pathname}?page=${activePage}${selectedPropertyId ? `&property=${encodeURIComponent(selectedPropertyId)}` : ''}`;
        trackPageView(pagePath);
      } else {
        revokeAnalyticsConsent();
      }
    };
    trackCurrentPage();
    window.addEventListener(CONSENT_CHANGED_EVENT, trackCurrentPage);
    return () => window.removeEventListener(CONSENT_CHANGED_EVENT, trackCurrentPage);
  }, [activePage, selectedPropertyId]);

  const bookingProperty = useUIStore((s) => s.bookingProperty);
  const closeBooking = useUIStore((s) => s.closeBooking);

  const isSettingsOpen = useUIStore((s) => s.isSettingsOpen);
  const setSettingsOpen = useUIStore((s) => s.setSettingsOpen);

  const isComparisonOpen = useUIStore((s) => s.isComparisonOpen);
  const setComparisonOpen = useUIStore((s) => s.setComparisonOpen);

  const isSavedOpen = useUIStore((s) => s.isSavedOpen);
  const setSavedOpen = useUIStore((s) => s.setSavedOpen);

  const isShareProfileOpen = useUIStore((s) => s.isShareProfileOpen);
  const setShareProfileOpen = useUIStore((s) => s.setShareProfileOpen);

  // Filter store sync
  const currency = useFilterStore((s) => s.filter.currency);
  const { data: exchangeRates } = useExchangeRates();
  const setCurrency = useCallback((nextCurrency: typeof currency) => {
    const currentFilter = useFilterStore.getState().filter;
    const convertLimit = (value: number) =>
      Math.round(
        convertCurrency(value, currentFilter.currency, nextCurrency, exchangeRates) ?? value,
      );

    useFilterStore.getState().setFilter({
      currency: nextCurrency,
      minPrice: convertLimit(currentFilter.minPrice),
      maxPrice:
        currentFilter.maxPrice === UNLIMITED_PRICE
          ? UNLIMITED_PRICE
          : convertLimit(currentFilter.maxPrice),
    });
  }, [exchangeRates]);
  const isOnlyFavorites = useFilterStore((s) => s.isOnlyFavorites);
  const setIsOnlyFavorites = useFilterStore((s) => s.setIsOnlyFavorites);
  const resetFilters = useFilterStore((s) => s.resetFilters);

  // Profile store for saved/compare
  const favorites = useAnonymousProfileStore((s) => s.favorites);
  const compareIds = useAnonymousProfileStore((s) => s.compareIds);
  const importProfileData = useAnonymousProfileStore((s) => s.importProfileData);

  // Deep Link URL Hydration
  useEffect(() => {
    if (window.location.pathname.replace(/\/+$/, '') === '/admin') {
      setActivePage('admin');
    }

    const handleAdminShortcut = (event: KeyboardEvent) => {
      const target = event.target;
      const isEditing = target instanceof HTMLElement &&
        (target.isContentEditable || target.matches('input, textarea, select'));
      if (
        !isEditing &&
        !event.defaultPrevented &&
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        event.key.toLowerCase() === 'a'
      ) {
        event.preventDefault();
        openAdmin();
      }
    };

    window.addEventListener('keydown', handleAdminShortcut);
    return () => window.removeEventListener('keydown', handleAdminShortcut);
  }, [openAdmin, setActivePage]);

  useEffect(() => {
    try {
      const url = new URL(window.location.href);

      // Check URL query parameters
      const pageParam = url.searchParams.get('page');
      if (isNavigablePageId(pageParam)) {
        setActivePage(pageParam);
      }

      const propParam = url.searchParams.get('property');
      if (propParam) {
        useUIStore.getState().openPropertyDetail(propParam);
      }

      const compParam = url.searchParams.get('compare');
      if (compParam) {
        setComparisonOpen(true);
      }

      // Check Hash for Anonymous Profile import (#profile=base64...)
      const hash = window.location.hash;
      if (hash && hash.includes('profile=')) {
        const base64 = hash.split('profile=')[1];
        if (base64) {
          const res = importProfileData(base64);
          if (res.success) {
            // Clean hash
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
            setSavedOpen(true);
          }
        }
      }
    } catch {
      // ignore
    }
  }, [setActivePage, setComparisonOpen, setSavedOpen, importProfileData]);

  // Sync title and language on root
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // Find selected property for modal
  const activePropertyDetail = React.useMemo(() => {
    if (selectedProperty) return selectedProperty;
    if (selectedPropertyId) {
      return selectedPropertyQuery.data || null;
    }
    return null;
  }, [selectedProperty, selectedPropertyId, selectedPropertyQuery.data]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 selection:bg-sky-500 selection:text-white font-sans antialiased">
      {/* Primary Navigation Header */}
      <Navbar
        currentPage={activePage}
        onNavigate={setActivePage}
        currency={currency}
        onCurrencyChange={setCurrency}
        language={language}
        onLanguageChange={setLanguage}
        favoritesCount={favorites.length}
        compareCount={compareIds.length}
        onOpenCompare={() => setComparisonOpen(true)}
        onOpenFavorites={() => setSavedOpen(true)}
        onOpenSavedManager={() => setShareProfileOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        isOnlyFavorites={isOnlyFavorites}
      />

      {/* 3. Main Viewport & Dynamic Routing */}
      <main className="flex-1 flex flex-col pb-16 lg:pb-0">
        {activePage === 'catalog' && <CatalogPage />}
        {activePage === 'popular' && <PopularPage />}
        {activePage === 'sale' && <SalePage />}
        {activePage === 'rent' && <RentPage />}
        {activePage === 'districts' && <DistrictsPage />}
        {activePage === 'admin' && (
          <AdminPage
            language={language}
            onClose={closeAdmin}
          />
        )}
      </main>

      {/* 4. Footer */}
      {activePage !== 'admin' && (
        <Footer
          language={language}
          onNavigate={setActivePage}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenFavorites={() => setSavedOpen(true)}
          onResetFilters={resetFilters}
        />
      )}

      {/* 5. Mobile Bottom App Bar */}
      <MobileBottomBar
        currentPage={activePage}
        language={language}
        onNavigate={setActivePage}
        favoritesCount={favorites.length}
        onOpenFavorites={() => setSavedOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* ======================================================== */}
      {/* MODAL OVERLAYS & DIALOGS */}
      {/* ======================================================== */}

      {/* 1. Property Detail Full-Screen Drawer / Modal */}
      {activePropertyDetail && (
        <PropertyDetailPage
          property={activePropertyDetail}
          currency={currency}
          language={language}
          onClose={closePropertyDetail}
          onBookViewing={(prop) => useUIStore.getState().openBooking(prop)}
          onOpenCompare={(prop) => {
            useAnonymousProfileStore.getState().toggleCompare(prop.id);
            setComparisonOpen(true);
          }}
        />
      )}

      {/* 2. Booking Modal */}
      {bookingProperty && (
        <BookingModal
          property={bookingProperty}
          currency={currency}
          language={language}
          isOpen={Boolean(bookingProperty)}
          onClose={closeBooking}
        />
      )}

      {/* 3. Comparison Modal */}
      <PropertyComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setComparisonOpen(false)}
        currency={currency}
        language={language}
        onBookViewing={(p) => useUIStore.getState().openBooking(p)}
      />

      {/* 4. Saved Properties & Anonymous Profile Modal */}
      <SavedPropertiesModal
        isOpen={isSavedOpen}
        onClose={() => setSavedOpen(false)}
        currency={currency}
        language={language}
      />

      {/* 5. Share Anonymous Profile Modal */}
      <ShareProfileModal
        isOpen={isShareProfileOpen}
        onClose={() => setShareProfileOpen(false)}
      />

      {/* 6. Global Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setSettingsOpen(false)}
        currency={currency}
        onCurrencyChange={setCurrency}
        language={language}
        onLanguageChange={setLanguage}
        onNavigate={setActivePage}
      />

      {/* 7. Cookie & Privacy Consent Banner */}
      <CookieBanner language={language} />

      {/* 8. Scroll To Top Floater */}
      <ScrollToTop language={language} />
    </div>
  );
};

export default function App() {
  return (
    <QueryProvider>
      <AppContent />
    </QueryProvider>
  );
}
