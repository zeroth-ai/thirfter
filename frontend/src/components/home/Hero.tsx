"use client";

import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { SmartSearch } from "@/components/search/SmartSearch";
import { Sparkles, MapPin, TrendingUp } from "lucide-react";

export function Hero() {
  const router = useRouter();

  const handleSearch = (query: string, mode: "text" | "semantic" | "image") => {
    router.push(`/search?q=${encodeURIComponent(query)}&mode=${mode}`);
  };

  const handleImageSearch = (file: File) => {
    // In production, this would upload to the AI service
    router.push("/search?mode=image");
  };

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-accent-blue/5 via-transparent to-transparent" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-radial from-accent-purple/5 via-transparent to-transparent" />
      </div>

      <Container className="relative">
        <div className="max-w-3xl mx-auto text-center animate-slideUp">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-green/10 border border-accent-green/20 text-accent-green text-sm font-medium mb-8">
            <Sparkles className="h-4 w-4" />
            <span>AI-Powered Discovery</span>
            <span className="w-1 h-1 rounded-full bg-accent-green" />
            <span>100+ Stores</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            Find Your{" "}
            <span className="relative">
              <span className="gradient-text">Perfect Thrift</span>
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 200 8"
                fill="none"
              >
                <path
                  d="M1 5.5C47.6667 2.16667 141.4 -2.3 199 5.5"
                  stroke="url(#underline-gradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient
                    id="underline-gradient"
                    x1="0"
                    y1="0"
                    x2="200"
                    y2="0"
                  >
                    <stop stopColor="#58a6ff" />
                    <stop offset="0.5" stopColor="#a371f7" />
                    <stop offset="1" stopColor="#f778ba" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-fg-muted max-w-2xl mx-auto mb-10 leading-relaxed text-balance">
            Discover Bangalore's best surplus warehouses, factory outlets & hidden vintage gems. 
            Search naturally or upload an image to find similar styles.
          </p>

          {/* Search */}
          <div className="max-w-2xl mx-auto">
            <SmartSearch
              onSearch={handleSearch}
              onImageSearch={handleImageSearch}
              placeholder="Search for vintage jackets, Y2K finds, budget denim..."
              size="lg"
              showImageSearch
            />
          </div>

          {/* Stats */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-fg-muted">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-accent-blue" />
              <span>12 Areas Covered</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-accent-green" />
              <span>Updated Weekly</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent-purple" />
              <span>AI-Powered Search</span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

