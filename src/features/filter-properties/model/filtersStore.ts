import { create } from 'zustand';
import { FilterState, Currency } from '../../../shared/types';
import { UNLIMITED_PRICE } from '../../../shared/lib/formatters';

export const INITIAL_FILTER: FilterState = {
  deal: 'all',
  districtId: 'all',
  propertyType: 'all',
  bedrooms: 'all',
  bathrooms: 'all',
  minPrice: 0,
  maxPrice: UNLIMITED_PRICE,
  minArea: 0,
  maxArea: UNLIMITED_PRICE,
  currency: 'USD',
  seaViewOnly: false,
  beachAccessOnly: false,
  poolOnly: false,
  furnishedOnly: false,
  balconyOnly: false,
  gardenOnly: false,
  priceOnRequestOnly: false,
  sortBy: 'featured',
  searchQuery: '',
};

interface FilterStoreState {
  filter: FilterState;
  viewMode: 'split' | 'grid' | 'map';
  isOnlyFavorites: boolean;

  // Actions
  setFilter: (updater: Partial<FilterState> | ((prev: FilterState) => FilterState)) => void;
  resetFilters: () => void;
  setCurrency: (currency: Currency) => void;
  setViewMode: (mode: 'split' | 'grid' | 'map') => void;
  setIsOnlyFavorites: (onlyFav: boolean) => void;
  setSearchQuery: (query: string) => void;
}

export const useFilterStore = create<FilterStoreState>((set) => ({
  filter: INITIAL_FILTER,
  viewMode: 'split',
  isOnlyFavorites: false,

  setFilter: (updater) => {
    set((state) => ({
      filter: typeof updater === 'function' ? updater(state.filter) : { ...state.filter, ...updater },
    }));
  },

  resetFilters: () => {
    set((state) => ({
      filter: {
        ...INITIAL_FILTER,
        currency: state.filter.currency,
      },
      isOnlyFavorites: false,
    }));
  },

  setCurrency: (currency: Currency) => {
    set((state) => ({
      filter: { ...state.filter, currency },
    }));
  },

  setViewMode: (mode) => set({ viewMode: mode }),
  setIsOnlyFavorites: (onlyFav) => set({ isOnlyFavorites: onlyFav }),
  setSearchQuery: (searchQuery) => set((state) => ({ filter: { ...state.filter, searchQuery } })),
}));
