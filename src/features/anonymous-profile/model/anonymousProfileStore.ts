import { create } from 'zustand';
import { AnonymousUserProfile } from '../../../shared/types';

const STORAGE_KEY_FAVORITES = 'sharmino_favorites';
const STORAGE_KEY_COMPARE = 'sharmino_compare';
const STORAGE_KEY_RECENTS = 'sharmino_recent_views';

interface AnonymousProfileState {
  favorites: string[];
  compareIds: string[];
  recentViews: string[];

  // Actions
  toggleFavorite: (id: string) => void;
  toggleCompare: (id: string) => void;
  addRecentView: (id: string) => void;
  clearFavorites: () => void;
  clearRecents: () => void;
  clearCompare: () => void;

  // PWA State Export / Import
  exportProfileJSON: () => string;
  exportProfileBase64: () => string;
  importProfileData: (dataOrBase64: string) => { success: boolean; message: string };
}

function loadInitialArray(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveArray(key: string, arr: string[]) {
  try {
    localStorage.setItem(key, JSON.stringify(arr));
  } catch (e) {
    console.warn(`[AnonymousProfile] Failed to save ${key}`, e);
  }
}

export const useAnonymousProfileStore = create<AnonymousProfileState>((set, get) => ({
  favorites: loadInitialArray(STORAGE_KEY_FAVORITES),
  compareIds: loadInitialArray(STORAGE_KEY_COMPARE),
  recentViews: loadInitialArray(STORAGE_KEY_RECENTS),

  toggleFavorite: (id: string) => {
    set((state) => {
      const exists = state.favorites.includes(id);
      const updated = exists ? state.favorites.filter((x) => x !== id) : [...state.favorites, id];
      saveArray(STORAGE_KEY_FAVORITES, updated);
      return { favorites: updated };
    });
  },

  toggleCompare: (id: string) => {
    set((state) => {
      const exists = state.compareIds.includes(id);
      let updated: string[];
      if (exists) {
        updated = state.compareIds.filter((x) => x !== id);
      } else {
        if (state.compareIds.length >= 4) {
          updated = [...state.compareIds.slice(1), id];
        } else {
          updated = [...state.compareIds, id];
        }
      }
      saveArray(STORAGE_KEY_COMPARE, updated);
      return { compareIds: updated };
    });
  },

  addRecentView: (id: string) => {
    set((state) => {
      const filtered = state.recentViews.filter((x) => x !== id);
      const updated = [id, ...filtered].slice(0, 30);
      saveArray(STORAGE_KEY_RECENTS, updated);
      return { recentViews: updated };
    });
  },

  clearFavorites: () => {
    saveArray(STORAGE_KEY_FAVORITES, []);
    set({ favorites: [] });
  },

  clearRecents: () => {
    saveArray(STORAGE_KEY_RECENTS, []);
    set({ recentViews: [] });
  },

  clearCompare: () => {
    saveArray(STORAGE_KEY_COMPARE, []);
    set({ compareIds: [] });
  },

  exportProfileJSON: () => {
    const payload: AnonymousUserProfile = {
      version: 1,
      exportedAt: new Date().toISOString(),
      favorites: get().favorites,
      recentViews: get().recentViews,
      compareIds: get().compareIds,
    };
    return JSON.stringify(payload, null, 2);
  },

  exportProfileBase64: () => {
    const jsonStr = get().exportProfileJSON();
    try {
      return btoa(encodeURIComponent(jsonStr));
    } catch {
      return btoa(jsonStr);
    }
  },

  importProfileData: (raw: string) => {
    try {
      let jsonString = raw.trim();
      // Try decoding base64 if input doesn't start with {
      if (!jsonString.startsWith('{')) {
        try {
          jsonString = decodeURIComponent(atob(jsonString));
        } catch {
          jsonString = atob(jsonString);
        }
      }

      const parsed = JSON.parse(jsonString) as AnonymousUserProfile;
      if (!parsed || !Array.isArray(parsed.favorites)) {
        return { success: false, message: 'Неверный формат данных профиля' };
      }

      const newFavorites = Array.isArray(parsed.favorites) ? parsed.favorites : [];
      const newRecents = Array.isArray(parsed.recentViews) ? parsed.recentViews : [];
      const newCompare = Array.isArray(parsed.compareIds) ? parsed.compareIds : [];

      saveArray(STORAGE_KEY_FAVORITES, newFavorites);
      saveArray(STORAGE_KEY_RECENTS, newRecents);
      saveArray(STORAGE_KEY_COMPARE, newCompare);

      set({
        favorites: newFavorites,
        recentViews: newRecents,
        compareIds: newCompare,
      });

      return {
        success: true,
        message: `Успешно импортировано: ${newFavorites.length} в избранном, ${newRecents.length} в истории`,
      };
    } catch (e: any) {
      return { success: false, message: `Ошибка чтения данных: ${e.message}` };
    }
  },
}));
