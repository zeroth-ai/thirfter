"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles, SlidersHorizontal, X, Camera, Search as SearchIcon } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { SmartSearch } from "@/components/search/SmartSearch";
import { StoreGrid } from "@/components/home/StoreGrid";
import { useSearchStore } from "@/store/searchStore";
import { searchShops, getAllShops, shoppingData } from "@/data/stores";
import { cn } from "@/lib/utils";
import type { Shop } from "@/types";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialMode = searchParams.get("mode") as "text" | "semantic" | "image" | null;

  const {
    query,
    setQuery,
    results,
    setResults,
    isSearching,
    setIsSearching,
    searchMode,
    setSearchMode,
    imagePreview,
  } = useSearchStore();

  const [showFilters, setShowFilters] = useState(false);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Get all unique tags
  const allTags = Array.from(
    new Set(getAllShops().map((shop) => shop.tag))
  ).sort();

  // Initialize from URL params
  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      performSearch(initialQuery);
    }
    if (initialMode) {
      setSearchMode(initialMode);
    }
  }, [initialQuery, initialMode]);

  const performSearch = useCallback(
    async (searchQuery: string) => {
      setIsSearching(true);

      // Simulate AI search delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // In production, this would call the AI service
      // For now, use local search
      let searchResults = searchShops(searchQuery);

      // Apply filters
      if (selectedLocations.length > 0) {
        searchResults = searchResults.filter((shop) =>
          selectedLocations.includes(shop.location.id)
        );
      }

      if (selectedTags.length > 0) {
        searchResults = searchResults.filter((shop) =>
          selectedTags.includes(shop.tag)
        );
      }

      setResults(searchResults);
      setIsSearching(false);
    },
    [selectedLocations, selectedTags, setIsSearching, setResults]
  );

  const handleSearch = (searchQuery: string, mode: "text" | "semantic" | "image") => {
    setSearchMode(mode);
    performSearch(searchQuery);
  };

  const handleImageSearch = async (file: File) => {
    setIsSearching(true);
    // In production, this would upload to the AI service for CLIP embedding
    // For now, show random results
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setResults(getAllShops().slice(0, 6));
    setIsSearching(false);
  };

  const toggleLocation = (locationId: string) => {
    setSelectedLocations((prev) =>
      prev.includes(locationId)
        ? prev.filter((l) => l !== locationId)
        : [...prev, locationId]
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSelectedLocations([]);
    setSelectedTags([]);
  };

  const hasFilters = selectedLocations.length > 0 || selectedTags.length > 0;

  // Re-search when filters change
  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [selectedLocations, selectedTags]);

  return (
    <div className="min-h-screen py-8">
      <Container>
        {/* Header */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-purple/10 border border-accent-purple/20 text-accent-purple text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              AI-Powered Search
            </div>
            <h1 className="text-3xl font-bold mb-2">Find Your Perfect Thrift</h1>
            <p className="text-fg-muted">
              Search naturally or upload an image to find similar styles
            </p>
          </div>

          {/* Search Bar */}
          <SmartSearch
            onSearch={handleSearch}
            onImageSearch={handleImageSearch}
            placeholder="vintage leather jacket, Y2K aesthetic, under ₹1000..."
            size="lg"
            autoFocus
          />

          {/* Search Mode Tabs */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              onClick={() => setSearchMode("semantic")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors",
                searchMode === "semantic"
                  ? "bg-accent-purple/10 text-accent-purple"
                  : "text-fg-muted hover:text-fg"
              )}
            >
              <Sparkles className="h-3.5 w-3.5" />
              AI Search
            </button>
            <button
              onClick={() => setSearchMode("text")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors",
                searchMode === "text"
                  ? "bg-canvas-subtle text-fg"
                  : "text-fg-muted hover:text-fg"
              )}
            >
              <SearchIcon className="h-3.5 w-3.5" />
              Text Search
            </button>
            <button
              onClick={() => setSearchMode("image")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors",
                searchMode === "image"
                  ? "bg-accent-blue/10 text-accent-blue"
                  : "text-fg-muted hover:text-fg"
              )}
            >
              <Camera className="h-3.5 w-3.5" />
              Image Search
            </button>
          </div>
        </div>

        {/* Filters Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4 mr-1.5" />
              Filters
              {hasFilters && (
                <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-accent-blue text-white">
                  {selectedLocations.length + selectedTags.length}
                </span>
              )}
            </Button>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear all
              </Button>
            )}
          </div>

          {query && (
            <p className="text-sm text-fg-muted">
              {isSearching ? (
                "Searching..."
              ) : (
                <>
                  Found <span className="text-fg font-medium">{results.length}</span> stores
                </>
              )}
            </p>
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-8 p-6 bg-canvas-subtle border border-border rounded-2xl animate-slideDown">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Locations */}
              <div>
                <h3 className="text-sm font-semibold text-fg-on-canvas mb-3">
                  Locations
                </h3>
                <div className="flex flex-wrap gap-2">
                  {shoppingData.map((location) => (
                    <button
                      key={location.id}
                      onClick={() => toggleLocation(location.id)}
                      className={cn(
                        "px-3 py-1.5 text-sm rounded-lg border transition-colors",
                        selectedLocations.includes(location.id)
                          ? "bg-accent-blue/10 text-accent-blue border-accent-blue/30"
                          : "border-border hover:border-fg-muted"
                      )}
                    >
                      {location.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <h3 className="text-sm font-semibold text-fg-on-canvas mb-3">
                  Categories
                </h3>
                <div className="flex flex-wrap gap-2">
                  {allTags.slice(0, 12).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={cn(
                        "px-3 py-1.5 text-sm rounded-lg border transition-colors",
                        selectedTags.includes(tag)
                          ? "bg-accent-purple/10 text-accent-purple border-accent-purple/30"
                          : "border-border hover:border-fg-muted"
                      )}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {isSearching ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center gap-2 text-fg-muted">
              <div className="animate-spin h-5 w-5 border-2 border-accent-blue border-t-transparent rounded-full" />
              <span>
                {searchMode === "image"
                  ? "Analyzing image..."
                  : "Finding the best matches..."}
              </span>
            </div>
          </div>
        ) : query || imagePreview ? (
          results.length > 0 ? (
            <StoreGrid shops={results} />
          ) : (
            <div className="text-center py-20 border border-dashed border-border rounded-2xl">
              <p className="text-fg-muted mb-2">No stores found for your search</p>
              <p className="text-sm text-fg-muted">
                Try different keywords or{" "}
                <button
                  onClick={clearFilters}
                  className="text-accent-blue hover:underline"
                >
                  clear filters
                </button>
              </p>
            </div>
          )
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-canvas-subtle flex items-center justify-center">
              <SearchIcon className="h-8 w-8 text-fg-muted" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Start Searching</h3>
            <p className="text-fg-muted max-w-md mx-auto">
              Type what you're looking for or upload an image to find similar
              styles across Bangalore's best thrift stores
            </p>
          </div>
        )}
      </Container>
    </div>
  );
}

