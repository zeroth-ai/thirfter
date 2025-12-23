"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  TrendingUp,
  Clock,
  Heart,
  ArrowRight,
  Star,
  MapPin,
  Zap,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { useAuthStore } from "@/store/authStore";
import { getAllShops, shoppingData } from "@/data/stores";
import { cn, getShopSlug, getGreeting, styleEmojis } from "@/lib/utils";
import { STYLE_CATEGORIES, AESTHETIC_VIBES } from "@/lib/constants";
import type { Shop } from "@/types";

export default function ExplorePage() {
  const { user, isAuthenticated } = useAuthStore();
  const [forYouShops, setForYouShops] = useState<Shop[]>([]);
  const [trendingShops, setTrendingShops] = useState<Shop[]>([]);
  const [newShops, setNewShops] = useState<Shop[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    // Simulate personalized recommendations
    const allShops = getAllShops();
    
    // "For You" - In production, this would use the RAG system
    const shuffled = [...allShops].sort(() => Math.random() - 0.5);
    setForYouShops(shuffled.slice(0, 6));
    
    // Trending - Sort by rating/reviews
    const trending = [...allShops]
      .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
      .slice(0, 6);
    setTrendingShops(trending);
    
    // New - Random selection
    setNewShops(shuffled.slice(6, 12));
  }, [user]);

  const greeting = getGreeting();

  return (
    <div className="min-h-screen py-8">
      <Container>
        {/* Header */}
        <div className="mb-10">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold">
                  {greeting}, {user.name.split(" ")[0]} 👋
                </h1>
                <p className="text-fg-muted mt-1">
                  Here's what we've found for your style
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-purple/10 border border-accent-purple/20 text-accent-purple text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4" />
                Personalized For You
              </div>
              <h1 className="text-4xl font-bold mb-4">Explore Curated Picks</h1>
              <p className="text-fg-muted mb-6">
                Discover stores tailored to your style.{" "}
                <Link href="/signup" className="text-accent-blue hover:underline">
                  Sign up
                </Link>{" "}
                to get personalized recommendations.
              </p>
            </div>
          )}
        </div>

        {/* Categories */}
        <section className="mb-12">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4">
            {STYLE_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() =>
                  setActiveCategory(
                    activeCategory === category.id ? null : category.id
                  )
                }
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl border whitespace-nowrap transition-all",
                  activeCategory === category.id
                    ? "bg-accent-blue/10 border-accent-blue/30 text-accent-blue"
                    : "bg-canvas-subtle border-border hover:border-fg-muted"
                )}
              >
                <span>{category.emoji}</span>
                <span className="font-medium">{category.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* For You Section */}
        {isAuthenticated && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-accent-purple/10">
                  <Sparkles className="h-5 w-5 text-accent-purple" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">For You</h2>
                  <p className="text-sm text-fg-muted">
                    Based on your style preferences
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                See All <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {forYouShops.map((shop, idx) => (
                <ExploreCard
                  key={shop.name + idx}
                  shop={shop}
                  reason={`Matches your ${
                    user?.preferences?.style?.[0] || "style"
                  } vibe`}
                />
              ))}
            </div>
          </section>
        )}

        {/* Trending Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-accent-orange/10">
                <TrendingUp className="h-5 w-5 text-accent-orange" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Trending This Week</h2>
                <p className="text-sm text-fg-muted">
                  Most visited stores in Bangalore
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              See All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingShops.map((shop, idx) => (
              <ExploreCard
                key={shop.name + idx}
                shop={shop}
                badge={
                  <Badge variant="warning" className="gap-1">
                    <Zap className="h-3 w-3" />
                    Trending
                  </Badge>
                }
              />
            ))}
          </div>
        </section>

        {/* Aesthetic Vibes Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-accent-pink/10">
              <Heart className="h-5 w-5 text-accent-pink" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Shop by Aesthetic</h2>
              <p className="text-sm text-fg-muted">Find your vibe</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {AESTHETIC_VIBES.map((vibe) => (
              <Link
                key={vibe.id}
                href={`/search?q=${encodeURIComponent(vibe.label)}`}
                className="group relative overflow-hidden rounded-2xl border border-border bg-canvas-subtle p-6 hover:border-accent-blue/50 transition-all"
              >
                <div
                  className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity"
                  style={{
                    background: `linear-gradient(135deg, ${vibe.colors[0]}, ${vibe.colors[1]}, ${vibe.colors[2]})`,
                  }}
                />
                <div className="relative">
                  <div className="flex gap-1 mb-3">
                    {vibe.colors.map((color, i) => (
                      <div
                        key={i}
                        className="w-4 h-4 rounded-full border border-border"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <h3 className="font-semibold group-hover:text-accent-blue transition-colors">
                    {vibe.label}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Newly Added Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-accent-green/10">
                <Clock className="h-5 w-5 text-accent-green" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Recently Added</h2>
                <p className="text-sm text-fg-muted">Fresh finds in our database</p>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              See All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newShops.map((shop, idx) => (
              <ExploreCard
                key={shop.name + idx}
                shop={shop}
                badge={
                  <Badge variant="success" className="gap-1">
                    New
                  </Badge>
                }
              />
            ))}
          </div>
        </section>

        {/* Location Quick Links */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-accent-blue/10">
              <MapPin className="h-5 w-5 text-accent-blue" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Explore by Location</h2>
              <p className="text-sm text-fg-muted">
                Jump to your favorite area
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {shoppingData.map((location) => (
              <Link
                key={location.id}
                href={`/?location=${location.id}#explore`}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-border bg-canvas-subtle hover:border-accent-blue/50 hover:bg-accent-blue/5 transition-all group"
              >
                <MapPin className="h-4 w-4 text-fg-muted group-hover:text-accent-blue transition-colors" />
                <span className="font-medium text-sm">{location.label}</span>
                <span className="ml-auto text-xs text-fg-muted">
                  {location.shops.length}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </Container>
    </div>
  );
}

// Explore Card Component
function ExploreCard({
  shop,
  reason,
  badge,
}: {
  shop: Shop;
  reason?: string;
  badge?: React.ReactNode;
}) {
  return (
    <Card className="group hover:border-accent-blue/50 hover:shadow-lg hover:shadow-accent-blue/5 transition-all duration-300 overflow-hidden">
      <CardContent className="p-0">
        <Link href={`/store/${getShopSlug(shop.name)}`}>
          <div className="p-5">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <h3 className="font-semibold group-hover:text-accent-blue transition-colors line-clamp-1">
                  {shop.name}
                </h3>
                <p className="text-sm text-fg-muted flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3" />
                  {shop.location.label}
                </p>
              </div>
              {badge || (
                <Badge variant="outline" className="shrink-0">
                  {shop.tag}
                </Badge>
              )}
            </div>

            <p className="text-sm text-fg-muted line-clamp-2 mb-4">
              {shop.desc}
            </p>

            {shop.rating && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{shop.rating.toFixed(1)}</span>
                </div>
                {shop.reviewCount && (
                  <span className="text-xs text-fg-muted">
                    ({shop.reviewCount} reviews)
                  </span>
                )}
              </div>
            )}

            {reason && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-accent-purple flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  {reason}
                </p>
              </div>
            )}
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}

