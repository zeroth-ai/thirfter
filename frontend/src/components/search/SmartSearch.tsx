"use client";

import { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import {
  Search,
  Camera,
  X,
  Sparkles,
  Upload,
  Wand2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useSearchStore } from "@/store/searchStore";

interface SmartSearchProps {
  onSearch: (query: string, mode: "text" | "semantic" | "image") => void;
  onImageSearch: (file: File) => void;
  placeholder?: string;
  autoFocus?: boolean;
  showImageSearch?: boolean;
  size?: "sm" | "md" | "lg";
}

export function SmartSearch({
  onSearch,
  onImageSearch,
  placeholder = "Search for vintage jackets, streetwear, denim...",
  autoFocus = false,
  showImageSearch = true,
  size = "md",
}: SmartSearchProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    query,
    setQuery,
    searchMode,
    setSearchMode,
    imagePreview,
    setUploadedImage,
    suggestions,
  } = useSearchStore();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          setUploadedImage(file, reader.result as string);
          onImageSearch(file);
        };
        reader.readAsDataURL(file);
      }
    },
    [setUploadedImage, onImageSearch]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxFiles: 1,
    noClick: true,
    noKeyboard: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query, searchMode);
    }
  };

  const handleClearImage = () => {
    setUploadedImage(null, null);
    setSearchMode("semantic");
  };

  const sizes = {
    sm: "h-10 text-sm",
    md: "h-12 text-base",
    lg: "h-14 text-lg",
  };

  return (
    <div {...getRootProps()} className="relative w-full">
      <input {...getInputProps()} />

      {/* Drag Overlay */}
      {isDragActive && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-accent-blue/10 border-2 border-dashed border-accent-blue rounded-2xl">
          <div className="text-center">
            <Upload className="h-8 w-8 mx-auto mb-2 text-accent-blue" />
            <p className="text-accent-blue font-medium">
              Drop your image here
            </p>
          </div>
        </div>
      )}

      {/* Image Preview Mode */}
      {imagePreview && (
        <div className="mb-4 relative inline-block">
          <div className="relative rounded-xl overflow-hidden border border-border">
            <img
              src={imagePreview}
              alt="Search by image"
              className="h-32 w-auto object-cover"
            />
            <button
              onClick={handleClearImage}
              className="absolute top-2 right-2 p-1 rounded-full bg-canvas/80 hover:bg-canvas transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 text-sm text-fg-muted flex items-center gap-1">
            <Wand2 className="h-3 w-3" />
            Finding similar styles...
          </p>
        </div>
      )}

      {/* Search Input */}
      <form onSubmit={handleSubmit}>
        <div
          className={cn(
            "relative flex items-center gap-2 rounded-2xl border bg-canvas-subtle transition-all duration-200",
            sizes[size],
            isFocused
              ? "border-accent-blue ring-4 ring-accent-blue/10"
              : "border-border hover:border-fg-muted"
          )}
        >
          {/* Search Icon / AI Badge */}
          <div className="flex items-center gap-2 pl-4">
            {searchMode === "semantic" ? (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent-purple/10 text-accent-purple text-xs font-medium">
                <Sparkles className="h-3 w-3" />
                <span className="hidden sm:inline">AI</span>
              </div>
            ) : (
              <Search className="h-5 w-5 text-fg-muted" />
            )}
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className="flex-1 bg-transparent border-none outline-none text-fg placeholder:text-fg-muted"
          />

          {/* Actions */}
          <div className="flex items-center gap-1 pr-2">
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}

            {showImageSearch && !imagePreview && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={open}
                title="Search by image"
              >
                <Camera className="h-4 w-4" />
              </Button>
            )}

            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="h-8 px-3 rounded-xl"
              disabled={!query.trim() && !imagePreview}
            >
              <Search className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Search</span>
            </Button>
          </div>
        </div>
      </form>

      {/* Suggestions */}
      {isFocused && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 py-2 bg-canvas-subtle border border-border rounded-xl shadow-xl z-20">
          {suggestions.map((suggestion, i) => (
            <button
              key={i}
              onClick={() => {
                setQuery(suggestion);
                onSearch(suggestion, "semantic");
              }}
              className="flex items-center gap-3 w-full px-4 py-2 text-left text-sm hover:bg-canvas-overlay transition-colors"
            >
              <Search className="h-4 w-4 text-fg-muted shrink-0" />
              <span className="text-fg">{suggestion}</span>
              <ArrowRight className="h-3 w-3 text-fg-muted ml-auto" />
            </button>
          ))}
        </div>
      )}

      {/* Quick Searches */}
      {!imagePreview && !query && size === "lg" && (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-fg-muted">Try:</span>
          {[
            "vintage denim jacket",
            "oversized tees under ₹500",
            "Y2K aesthetic finds",
            "leather jackets",
          ].map((term) => (
            <button
              key={term}
              onClick={() => {
                setQuery(term);
                onSearch(term, "semantic");
              }}
              className="px-3 py-1 text-sm rounded-full bg-canvas-subtle border border-border hover:border-accent-blue hover:text-accent-blue transition-colors"
            >
              {term}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

