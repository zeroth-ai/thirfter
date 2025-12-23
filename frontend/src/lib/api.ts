import axios from "axios";
import type { 
  ApiResponse, 
  AuthResponse, 
  User, 
  Shop, 
  SearchResult, 
  OnboardingAnswers,
  ExploreSection,
  ImageSearchResult,
  UserPreferences
} from "@/types";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("blr-thrifter-auth");
    if (stored) {
      const { state } = JSON.parse(stored);
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    }
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth state on unauthorized
      if (typeof window !== "undefined") {
        localStorage.removeItem("blr-thrifter-auth");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// AI Service API
const aiApi = axios.create({
  baseURL: "/ai",
  headers: {
    "Content-Type": "application/json",
  },
});

// ==================== AUTH API ====================

export const authApi = {
  register: async (data: {
    email: string;
    password: string;
    name: string;
    onboardingAnswers: OnboardingAnswers;
  }): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  login: async (data: {
    email: string;
    password: string;
  }): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post("/auth/login", data);
    return response.data;
  },

  getMe: async (): Promise<ApiResponse<User>> => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await api.put("/auth/profile", data);
    return response.data;
  },

  updatePreferences: async (preferences: Partial<UserPreferences>): Promise<ApiResponse<User>> => {
    const response = await api.put("/auth/preferences", preferences);
    return response.data;
  },
};

// ==================== SHOPS API ====================

export const shopsApi = {
  getAll: async (filters?: {
    location?: string;
    tags?: string[];
    search?: string;
  }): Promise<ApiResponse<Shop[]>> => {
    const response = await api.get("/shops", { params: filters });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Shop>> => {
    const response = await api.get(`/shops/${id}`);
    return response.data;
  },

  getBySlug: async (slug: string): Promise<ApiResponse<{ shop: Shop; locationLabel: string }>> => {
    const response = await api.get(`/shops/slug/${slug}`);
    return response.data;
  },

  getLocations: async (): Promise<ApiResponse<{ id: string; label: string }[]>> => {
    const response = await api.get("/shops/locations");
    return response.data;
  },

  getTags: async (locationId?: string): Promise<ApiResponse<string[]>> => {
    const response = await api.get("/shops/tags", { params: { locationId } });
    return response.data;
  },
};

// ==================== SEARCH API ====================

export const searchApi = {
  semantic: async (query: string, filters?: {
    locations?: string[];
    tags?: string[];
  }): Promise<ApiResponse<SearchResult>> => {
    const response = await aiApi.post("/search/semantic", { query, filters });
    return response.data;
  },

  byImage: async (image: File, filters?: {
    locations?: string[];
    tags?: string[];
  }): Promise<ApiResponse<ImageSearchResult[]>> => {
    const formData = new FormData();
    formData.append("image", image);
    if (filters) {
      formData.append("filters", JSON.stringify(filters));
    }
    
    const response = await aiApi.post("/search/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  getSuggestions: async (query: string): Promise<ApiResponse<string[]>> => {
    const response = await aiApi.get("/search/suggestions", { params: { query } });
    return response.data;
  },
};

// ==================== EXPLORE API ====================

export const exploreApi = {
  getSections: async (): Promise<ApiResponse<ExploreSection[]>> => {
    const response = await api.get("/explore/sections");
    return response.data;
  },

  getTrending: async (): Promise<ApiResponse<Shop[]>> => {
    const response = await api.get("/explore/trending");
    return response.data;
  },

  getForYou: async (): Promise<ApiResponse<ExploreSection>> => {
    const response = await api.get("/explore/for-you");
    return response.data;
  },

  getNewStores: async (): Promise<ApiResponse<Shop[]>> => {
    const response = await api.get("/explore/new");
    return response.data;
  },

  getByCategory: async (category: string): Promise<ApiResponse<Shop[]>> => {
    const response = await api.get(`/explore/category/${category}`);
    return response.data;
  },
};

// ==================== FAVORITES API ====================

export const favoritesApi = {
  getAll: async (): Promise<ApiResponse<Shop[]>> => {
    const response = await api.get("/favorites");
    return response.data;
  },

  add: async (shopId: string): Promise<ApiResponse<{ success: boolean }>> => {
    const response = await api.post(`/favorites/${shopId}`);
    return response.data;
  },

  remove: async (shopId: string): Promise<ApiResponse<{ success: boolean }>> => {
    const response = await api.delete(`/favorites/${shopId}`);
    return response.data;
  },
};

// ==================== RAG API ====================

export const ragApi = {
  query: async (question: string): Promise<ApiResponse<{
    answer: string;
    sources: Shop[];
    confidence: number;
  }>> => {
    const response = await aiApi.post("/rag/query", { question });
    return response.data;
  },

  getRecommendations: async (userId: string): Promise<ApiResponse<Shop[]>> => {
    const response = await aiApi.get(`/rag/recommendations/${userId}`);
    return response.data;
  },
};

export default api;

