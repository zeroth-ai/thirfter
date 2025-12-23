"use client";

import Link from "next/link";
import { MapPin, ArrowRight, Heart, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn, getShopSlug, getTagColor } from "@/lib/utils";
import type { Shop } from "@/types";

interface StoreGridProps {
  shops: Shop[];
  showFavoriteButton?: boolean;
  onFavorite?: (shopId: string) => void;
  favorites?: string[];
}

export function StoreGrid({
  shops,
  showFavoriteButton = false,
  onFavorite,
  favorites = [],
}: StoreGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
      {shops.map((shop, idx) => {
        const isFavorite = shop._id ? favorites.includes(shop._id) : false;
        const slug = getShopSlug(shop.name);

        return (
          <Card
            key={shop._id || idx}
            className="group flex flex-col h-full hover:border-accent-blue/50 hover:shadow-lg hover:shadow-accent-blue/5 transition-all duration-300 relative overflow-hidden"
          >
            {/* Hover Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/5 to-accent-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Link Overlay */}
            <Link
              href={`/store/${slug}`}
              className="absolute inset-0 z-0"
              aria-label={`View details for ${shop.name}`}
            />

            <CardHeader className="pb-3 relative z-10 pointer-events-none">
              <div className="flex justify-between items-start gap-2">
                <CardTitle className="text-base group-hover:text-accent-blue transition-colors line-clamp-1">
                  {shop.name}
                </CardTitle>
                <Badge
                  className={cn(
                    "shrink-0",
                    getTagColor(shop.tag)
                  )}
                >
                  {shop.tag}
                </Badge>
              </div>

              {/* Rating */}
              {shop.rating && (
                <div className="flex items-center gap-1 mt-2">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm text-fg-muted">
                    {shop.rating.toFixed(1)}
                    {shop.reviewCount && (
                      <span className="ml-1">({shop.reviewCount})</span>
                    )}
                  </span>
                </div>
              )}
            </CardHeader>

            <CardContent className="flex-1 flex flex-col justify-between relative z-10 pointer-events-none">
              <p className="text-sm text-fg-muted leading-6 mb-6 line-clamp-3">
                {shop.desc}
              </p>

              {/* Specialties */}
              {shop.specialties && shop.specialties.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {shop.specialties.slice(0, 3).map((specialty) => (
                    <span
                      key={specialty}
                      className="text-xs text-fg-muted bg-canvas px-2 py-0.5 rounded"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-auto flex gap-2 pointer-events-auto">
                {showFavoriteButton && onFavorite && shop._id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      onFavorite(shop._id!);
                    }}
                    className={cn(
                      "shrink-0",
                      isFavorite && "text-red-400 hover:text-red-500"
                    )}
                  >
                    <Heart
                      className={cn("h-4 w-4", isFavorite && "fill-current")}
                    />
                  </Button>
                )}

                <a
                  href={shop.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-center group/btn hover:bg-canvas-subtle hover:text-accent-blue"
                  >
                    <MapPin className="mr-2 h-3.5 w-3.5 opacity-70" />
                    Map
                  </Button>
                </a>

                <Link href={`/store/${slug}`} className="flex-1">
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full justify-center group/btn"
                  >
                    Details
                    <ArrowRight className="ml-2 h-3.5 w-3.5 opacity-70 group-hover/btn:translate-x-0.5 transition-transform" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

