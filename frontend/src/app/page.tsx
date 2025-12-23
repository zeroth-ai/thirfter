"use client";

import { useState, useMemo } from "react";
import { Hero } from "@/components/home/Hero";
import { StoreFilters } from "@/components/home/StoreFilters";
import { StoreGrid } from "@/components/home/StoreGrid";
import { Container } from "@/components/ui/Container";
import { shoppingData } from "@/data/stores";

export default function HomePage() {
  const [activeLocation, setActiveLocation] = useState(shoppingData[0].id);
  const [activeTags, setActiveTags] = useState<string[]>([]);

  // Derived state
  const currentLocation =
    shoppingData.find((d) => d.id === activeLocation) || shoppingData[0];

  // Get unique tags from the current location's shops
  const uniqueTags = useMemo(() => {
    const tags = new Set<string>();
    currentLocation.shops.forEach((shop) => tags.add(shop.tag));
    return Array.from(tags).sort();
  }, [currentLocation]);

  // Filter shops based on active tags
  const filteredShops = useMemo(() => {
    if (activeTags.length === 0) return currentLocation.shops;
    return currentLocation.shops.filter((shop) =>
      activeTags.includes(shop.tag)
    );
  }, [currentLocation, activeTags]);

  const handleTagToggle = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleLocationChange = (id: string) => {
    setActiveLocation(id);
    setActiveTags([]); // Clear tags when changing location
  };

  return (
    <>
      <Hero />

      <div id="explore" className="relative z-40">
        <StoreFilters
          locations={shoppingData.map((d) => ({ id: d.id, label: d.label }))}
          uniqueTags={uniqueTags}
          activeLocation={activeLocation}
          activeTags={activeTags}
          onLocationChange={handleLocationChange}
          onTagToggle={handleTagToggle}
          onClearTags={() => setActiveTags([])}
        />
      </div>

      <section className="py-10 min-h-[50vh]">
        <Container>
          {/* Map Embed */}
          <div
            id="map"
            className="scroll-mt-32 mb-10 rounded-2xl overflow-hidden border border-border bg-canvas-subtle h-[300px] md:h-[400px] shadow-lg relative group"
          >
            <iframe
              src={currentLocation.mapEmbedUrl}
              className="w-full h-full border-0 block grayscale-[40%] opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
              loading="lazy"
              title={`${currentLocation.label} Map`}
              style={{
                filter:
                  "invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%)",
              }}
            />
            <div className="absolute bottom-4 right-4 bg-canvas/80 backdrop-blur px-3 py-1 rounded-lg text-xs font-mono text-fg-muted border border-border pointer-events-none">
              Google Maps
            </div>
          </div>

          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-fg-on-canvas">
                {filteredShops.length} Stores in {currentLocation.label}
              </h2>
              {activeTags.length > 0 && (
                <p className="text-sm text-fg-muted mt-1">
                  Filtered by {activeTags.length} tag
                  {activeTags.length > 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>

          {/* Store Grid */}
          <StoreGrid shops={filteredShops} />

          {/* Empty State */}
          {filteredShops.length === 0 && (
            <div className="py-20 text-center border border-dashed border-border rounded-2xl bg-canvas-subtle/50">
              <p className="text-fg-muted">
                No stores found with the selected filters.
              </p>
              <button
                onClick={() => setActiveTags([])}
                className="mt-2 text-accent-blue hover:underline text-sm"
              >
                Clear all filters
              </button>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}

