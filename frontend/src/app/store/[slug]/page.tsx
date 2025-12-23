"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Share2,
  Heart,
  Star,
  Clock,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getShopBySlug, getAllShops, getShopSlug } from "@/data/stores";
import { useAuthStore } from "@/store/authStore";
import { cn, getTagColor } from "@/lib/utils";
import type { Shop } from "@/types";

export default function StorePage() {
  const params = useParams();
  const slug = params.slug as string;
  const { isAuthenticated } = useAuthStore();

  const [shop, setShop] = useState<Shop | null>(null);
  const [locationLabel, setLocationLabel] = useState("");
  const [similarShops, setSimilarShops] = useState<Shop[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const data = getShopBySlug(slug);
    if (data) {
      setShop(data.shop);
      setLocationLabel(data.locationLabel);

      // Get similar shops (same tag or location)
      const allShops = getAllShops();
      const similar = allShops
        .filter(
          (s) =>
            s.name !== data.shop.name &&
            (s.tag === data.shop.tag ||
              s.location.id === data.shop.location.id)
        )
        .slice(0, 4);
      setSimilarShops(similar);
    }
  }, [slug]);

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Store not found</h1>
          <p className="text-fg-muted mb-4">
            The store you're looking for doesn't exist.
          </p>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: shop.name,
        text: shop.desc,
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen py-8">
      <Container size="lg">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center text-sm text-fg-muted hover:text-fg transition-colors mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Explore
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-canvas-subtle border border-border rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="p-6 md:p-8 border-b border-border bg-canvas-overlay/30">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <Badge
                    variant="accent"
                    className={cn("text-sm py-1 px-3", getTagColor(shop.tag))}
                  >
                    {shop.tag}
                  </Badge>
                  <Badge variant="outline" className="text-sm py-1 px-3">
                    <MapPin className="h-3 w-3 mr-1" />
                    {locationLabel}
                  </Badge>
                  {shop.rating && (
                    <Badge
                      variant="outline"
                      className="text-sm py-1 px-3 bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                    >
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      {shop.rating.toFixed(1)}
                    </Badge>
                  )}
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-fg-on-canvas mb-4">
                  {shop.name}
                </h1>

                <div className="flex flex-wrap gap-3">
                  {isAuthenticated && (
                    <Button
                      variant={isFavorite ? "default" : "outline"}
                      size="sm"
                      onClick={() => setIsFavorite(!isFavorite)}
                      className={cn(
                        isFavorite && "bg-red-500/10 text-red-400 border-red-500/20"
                      )}
                    >
                      <Heart
                        className={cn("h-4 w-4 mr-2", isFavorite && "fill-current")}
                      />
                      {isFavorite ? "Saved" : "Save"}
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <a
                    href={shop.mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="primary" size="sm">
                      <MapPin className="h-4 w-4 mr-2" />
                      Get Directions
                    </Button>
                  </a>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 md:p-8 space-y-8">
                {/* Description */}
                <div>
                  <h2 className="text-lg font-semibold text-fg-on-canvas mb-3">
                    About this Store
                  </h2>
                  <p className="text-fg-muted leading-relaxed text-lg">
                    {shop.desc}
                  </p>
                </div>

                {/* Specialties */}
                {shop.specialties && shop.specialties.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-fg-on-canvas mb-3">
                      Known For
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {shop.specialties.map((specialty) => (
                        <span
                          key={specialty}
                          className="px-3 py-1.5 rounded-lg bg-canvas border border-border text-sm"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tips */}
                <div className="p-4 rounded-xl bg-accent-blue/10 border border-accent-blue/20">
                  <h3 className="flex items-center text-accent-blue font-semibold mb-2">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Pro Tips
                  </h3>
                  <ul className="text-sm text-fg-muted space-y-2">
                    <li>
                      • Located in <strong>{locationLabel}</strong>. Look for
                      small signboards - many surplus stores are in basements or
                      upper floors.
                    </li>
                    <li>
                      • Best to visit on weekdays for a less crowded experience.
                    </li>
                    <li>• Don't hesitate to bargain for better prices!</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="bg-canvas-subtle border border-border rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wider mb-4">
                Quick Info
              </h3>
              <ul className="space-y-4">
                <li className="flex justify-between items-center">
                  <span className="text-fg-muted">Type</span>
                  <Badge className={getTagColor(shop.tag)}>{shop.tag}</Badge>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-fg-muted">Area</span>
                  <span className="text-fg-on-canvas font-medium">
                    {locationLabel}
                  </span>
                </li>
                {shop.rating && (
                  <li className="flex justify-between items-center">
                    <span className="text-fg-muted">Rating</span>
                    <span className="flex items-center text-fg-on-canvas font-medium">
                      <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
                      {shop.rating.toFixed(1)}
                      {shop.reviewCount && (
                        <span className="text-fg-muted ml-1">
                          ({shop.reviewCount})
                        </span>
                      )}
                    </span>
                  </li>
                )}
                <li className="flex justify-between items-center">
                  <span className="text-fg-muted">Hours</span>
                  <span className="text-fg-on-canvas font-medium flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-fg-muted" />
                    10AM - 9PM
                  </span>
                </li>
              </ul>

              <div className="mt-6 pt-6 border-t border-border">
                <a
                  href={shop.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on Google Maps
                  </Button>
                </a>
              </div>
            </div>

            {/* Similar Stores */}
            {similarShops.length > 0 && (
              <div className="bg-canvas-subtle border border-border rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-fg-muted uppercase tracking-wider mb-4">
                  Similar Stores
                </h3>
                <div className="space-y-3">
                  {similarShops.map((s) => (
                    <Link
                      key={s.name}
                      href={`/store/${getShopSlug(s.name)}`}
                      className="block p-3 rounded-xl bg-canvas border border-border hover:border-accent-blue/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm truncate">
                          {s.name}
                        </span>
                        <Badge
                          className={cn("text-xs shrink-0 ml-2", getTagColor(s.tag))}
                        >
                          {s.tag}
                        </Badge>
                      </div>
                      <p className="text-xs text-fg-muted flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {s.location.label}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}

