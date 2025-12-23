import { create } from "zustand";
import type { ExploreSection, Recommendation, Shop } from "@/types";

interface ExploreState {
  sections: ExploreSection[];
  trending: Shop[];
  forYou: Recommendation[];
  newStores: Shop[];
  isLoading: boolean;
  activeCategory: string | null;

  // Actions
  setSections: (sections: ExploreSection[]) => void;
  setTrending: (trending: Shop[]) => void;
  setForYou: (forYou: Recommendation[]) => void;
  setNewStores: (newStores: Shop[]) => void;
  setIsLoading: (loading: boolean) => void;
  setActiveCategory: (category: string | null) => void;
}

export const useExploreStore = create<ExploreState>((set) => ({
  sections: [],
  trending: [],
  forYou: [],
  newStores: [],
  isLoading: true,
  activeCategory: null,

  setSections: (sections) => set({ sections }),
  setTrending: (trending) => set({ trending }),
  setForYou: (forYou) => set({ forYou }),
  setNewStores: (newStores) => set({ newStores }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setActiveCategory: (activeCategory) => set({ activeCategory }),
}));

