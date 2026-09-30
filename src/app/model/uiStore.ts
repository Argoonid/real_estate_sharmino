import { create } from 'zustand';
import { PageId, DatabaseProperty } from '../../shared/types';
import { Language, getInitialLanguage } from '../../shared/i18n';

interface UIState {
  activePage: PageId;
  language: Language;

  // Selected property for detail view/modal (URL-ready)
  selectedPropertyId: string | null;
  selectedProperty: DatabaseProperty | null;

  // Property for booking
  bookingProperty: DatabaseProperty | null;

  // Modals state
  isSettingsOpen: boolean;
  isComparisonOpen: boolean;
  isSavedOpen: boolean;
  isShareProfileOpen: boolean;

  // Actions
  setActivePage: (page: PageId) => void;
  setLanguage: (lang: Language) => void;
  openPropertyDetail: (prop: DatabaseProperty | string) => void;
  closePropertyDetail: () => void;
  openBooking: (prop: DatabaseProperty) => void;
  closeBooking: () => void;

  setSettingsOpen: (open: boolean) => void;
  setComparisonOpen: (open: boolean) => void;
  setSavedOpen: (open: boolean) => void;
  setShareProfileOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activePage: 'catalog',
  language: getInitialLanguage(),

  selectedPropertyId: null,
  selectedProperty: null,
  bookingProperty: null,

  isSettingsOpen: false,
  isComparisonOpen: false,
  isSavedOpen: false,
  isShareProfileOpen: false,

  setActivePage: (page) => {
    set({ activePage: page });
    try {
      const url = new URL(window.location.href);
      if (page === 'catalog') {
        url.searchParams.delete('page');
      } else {
        url.searchParams.set('page', page);
      }
      window.history.pushState(null, '', url.pathname + (url.search ? url.search : ''));
    } catch {
      // ignore
    }
  },

  setLanguage: (lang) => {
    localStorage.setItem('sharmino_lang', lang);
    set({ language: lang });
  },

  openPropertyDetail: (prop) => {
    if (typeof prop === 'string') {
      set({ selectedPropertyId: prop });
      try {
        window.history.pushState(null, '', `?property=${prop}`);
      } catch {
        // ignore
      }
    } else {
      set({ selectedPropertyId: prop.id, selectedProperty: prop });
      try {
        window.history.pushState(null, '', `?property=${prop.id}`);
      } catch {
        // ignore
      }
    }
  },

  closePropertyDetail: () => {
    set({ selectedPropertyId: null, selectedProperty: null });
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('property');
      window.history.pushState(null, '', url.pathname + (url.search ? url.search : ''));
    } catch {
      // ignore
    }
  },

  openBooking: (prop) => set({ bookingProperty: prop }),
  closeBooking: () => set({ bookingProperty: null }),

  setSettingsOpen: (open) => set({ isSettingsOpen: open }),
  setComparisonOpen: (open) => set({ isComparisonOpen: open }),
  setSavedOpen: (open) => set({ isSavedOpen: open }),
  setShareProfileOpen: (open) => set({ isShareProfileOpen: open }),
}));
