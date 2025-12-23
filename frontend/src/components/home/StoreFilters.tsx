"use client";

import { MapPin, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { cn, getTagColor } from "@/lib/utils";

interface FilterProps {
  uniqueTags: string[];
  locations: { id: string; label: string }[];
  activeLocation: string;
  activeTags: string[];
  onLocationChange: (id: string) => void;
  onTagToggle: (tag: string) => void;
  onClearTags: () => void;
}

export function StoreFilters({
  uniqueTags,
  locations,
  activeLocation,
  activeTags,
  onLocationChange,
  onTagToggle,
  onClearTags,
}: FilterProps) {
  return (
    <div className="sticky top-16 z-40 w-full border-b border-border bg-canvas/95 backdrop-blur-xl supports-[backdrop-filter]:bg-canvas/60">
      <Container className="py-4">
        <div className="flex flex-col gap-4">
          {/* Location Tabs */}
          <div className="flex overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 gap-2">
            {locations.map((loc) => (
              <Button
                key={loc.id}
                variant={activeLocation === loc.id ? "default" : "ghost"}
                size="sm"
                onClick={() => onLocationChange(loc.id)}
                className={cn(
                  "whitespace-nowrap shrink-0",
                  activeLocation === loc.id &&
                    "bg-accent-blue text-white hover:bg-accent-blue"
                )}
              >
                <MapPin className="mr-1.5 h-3.5 w-3.5" />
                {loc.label}
              </Button>
            ))}
          </div>

          {/* Tag Cloud */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-fg-muted uppercase tracking-wider mr-1 flex items-center shrink-0">
              <Filter className="h-3 w-3 mr-1" />
              Filters:
            </span>
            {uniqueTags.map((tag) => {
              const isActive = activeTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => onTagToggle(tag)}
                  className={cn(
                    "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border transition-all duration-200",
                    isActive
                      ? "bg-accent-blue/10 text-accent-blue border-accent-blue/30 shadow-sm"
                      : cn(
                          "hover:border-fg-muted",
                          getTagColor(tag)
                        )
                  )}
                >
                  {tag}
                </button>
              );
            })}
            {activeTags.length > 0 && (
              <button
                onClick={onClearTags}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs text-accent-orange hover:text-accent-orange/80 transition-colors"
              >
                <X className="h-3 w-3" />
                Clear all
              </button>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}

