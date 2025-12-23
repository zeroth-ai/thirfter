import { create } from "zustand";
import type { Shop, SearchFilters, SearchHistoryItem } from "@/types";

interface SearchState {
  query: string;
  results: Shop[];
  isSearching: boolean;
  filters: SearchFilters;
  searchHistory: SearchHistoryItem[];
  suggestions: string[];
  searchMode: "text" | "semantic" | "image";
  uploadedImage: File | null;
  imagePreview: string | null;

  // Actions
  setQuery: (query: string) => void;
  setResults: (results: Shop[]) => void;
  setIsSearching: (searching: boolean) => void;
  setFilters: (filters: SearchFilters) => void;
  updateFilters: (filters: Partial<SearchFilters>) => void;
  clearFilters: () => void;
  addToHistory: (item: SearchHistoryItem) => void;
  clearHistory: () => void;
  setSuggestions: (suggestions: string[]) => void;
  setSearchMode: (mode: "text" | "semantic" | "image") => void;
  setUploadedImage: (file: File | null, preview: string | null) => void;
  clearSearch: () => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  query: "",
  results: [],
  isSearching: false,
  filters: {},
  searchHistory: [],
  suggestions: [],
  searchMode: "semantic",
  uploadedImage: null,
  imagePreview: null,

  setQuery: (query) => set({ query }),

  setResults: (results) => set({ results }),

  setIsSearching: (isSearching) => set({ isSearching }),

  setFilters: (filters) => set({ filters }),

  updateFilters: (updates) => {
    const currentFilters = get().filters;
    set({ filters: { ...currentFilters, ...updates } });
  },

  clearFilters: () => set({ filters: {} }),

  addToHistory: (item) => {
    const history = get().searchHistory;
    const newHistory = [item, ...history.slice(0, 19)]; // Keep last 20
    set({ searchHistory: newHistory });
  },

  clearHistory: () => set({ searchHistory: [] }),

  setSuggestions: (suggestions) => set({ suggestions }),

  setSearchMode: (searchMode) => set({ searchMode }),

  setUploadedImage: (file, preview) => set({ 
    uploadedImage: file, 
    imagePreview: preview,
    searchMode: file ? "image" : "semantic"
  }),

  clearSearch: () => set({
    query: "",
    results: [],
    uploadedImage: null,
    imagePreview: null,
    searchMode: "semantic",
  }),
}));

