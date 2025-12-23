// User Types
export interface User {
  _id: string;
  email: string;
  name: string;
  avatar?: string;
  preferences: UserPreferences;
  searchHistory: SearchHistoryItem[];
  favorites: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  style: StylePreference[];
  budget: BudgetRange;
  favoriteCategories: string[];
  sizes: SizePreferences;
  favoriteLocations: string[];
  shoppingFrequency: string;
  sustainabilityImportance: number;
  vintagePreference: number;
  brandPreference: BrandPreference;
  aestheticVibes: string[];
}

export type StylePreference = 
  | "vintage" 
  | "y2k" 
  | "grunge" 
  | "minimalist" 
  | "streetwear" 
  | "cottagecore"
  | "old-money"
  | "bohemian"
  | "preppy"
  | "athleisure";

export interface BudgetRange {
  min: number;
  max: number;
  currency: string;
}

export interface SizePreferences {
  tops: string;
  bottoms: string;
  shoes: string;
}

export type BrandPreference = "luxury" | "high-street" | "budget" | "no-preference";

export interface SearchHistoryItem {
  query: string;
  timestamp: string;
  type: "text" | "image";
  results: number;
}

// Store/Shop Types
export interface Shop {
  _id?: string;
  name: string;
  tag: string;
  desc: string;
  mapLink: string;
  location: LocationInfo;
  rating?: number;
  reviewCount?: number;
  images?: string[];
  specialties?: string[];
  priceRange?: string;
  openingHours?: OpeningHours;
  bestTimeToVisit?: string;
  embedding?: number[];
  createdAt?: string;
  updatedAt?: string;
}

export interface LocationInfo {
  id: string;
  label: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface OpeningHours {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

export interface LocationData {
  id: string;
  label: string;
  mapEmbedUrl: string;
  shops: Shop[];
}

// Search Types
export interface SearchQuery {
  query: string;
  filters?: SearchFilters;
  type: "text" | "semantic" | "image";
}

export interface SearchFilters {
  locations?: string[];
  tags?: string[];
  priceRange?: BudgetRange;
  rating?: number;
}

export interface SearchResult {
  shops: Shop[];
  totalCount: number;
  query: string;
  suggestions?: string[];
}

// Image Search Types
export interface ImageSearchResult {
  shop: Shop;
  similarity: number;
  matchedItems?: string[];
}

// Onboarding Quiz Types
export interface OnboardingQuestion {
  id: string;
  question: string;
  type: "single" | "multiple" | "slider" | "text";
  options?: OnboardingOption[];
  min?: number;
  max?: number;
  step?: number;
  labels?: { min: string; max: string };
}

export interface OnboardingOption {
  value: string;
  label: string;
  icon?: string;
  description?: string;
}

export interface OnboardingAnswers {
  [questionId: string]: string | string[] | number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Recommendation Types
export interface Recommendation {
  shop: Shop;
  reason: string;
  matchScore: number;
  basedOn: "style" | "history" | "similar-users" | "trending";
}

export interface ExploreSection {
  title: string;
  subtitle?: string;
  type: "trending" | "for-you" | "new" | "nearby" | "category";
  items: Recommendation[];
}

