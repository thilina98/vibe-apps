import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import type { AppListing } from "@shared/schema";
import { AppCard } from "../components/AppCard";
import { RecentlyAddedAppCard } from "../components/RecentlyAddedAppCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Search, TrendingUp, ArrowRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  // Fetch top-rated apps from last 4 months
  const { data: topRatedApps } = useQuery<AppListing[]>({
    queryKey: ["/api/apps/landing/top-rated"],
  });

  // Fetch top trending apps by trending score (8 for carousel)
  const { data: topTrendingApps } = useQuery<AppListing[]>({
    queryKey: ["/api/apps/landing/trending?limit=8"],
  });

  // Fetch more trending apps (8 for trending section)
  const { data: trendingApps } = useQuery<AppListing[]>({
    queryKey: ["/api/apps/landing/trending?limit=8"],
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      setLocation('/explore');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary/25 py-32 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-4xl md:text-5xl font-heading font-bold" data-testid="text-hero-title">
              Vibecoded Apps
            </h1>
          </div>
          <p className="text-xl text-muted-foreground mb-20" data-testid="text-hero-subtitle">
            Discover amazing apps built with AI. Search, explore, and find your next favorite tool.
          </p>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for apps..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-hero"
                />
              </div>
              <Button type="submit" data-testid="button-search-hero">
                Search
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Trending Apps */}
      {trendingApps && trendingApps.length > 0 && (
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-heading font-bold" data-testid="text-trending-apps-title">
                Trending Apps
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-fr">
              {trendingApps.map((app) => (
                <AppCard key={app.id} app={app} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recently Added Apps */}
      {topRatedApps && topRatedApps.length > 0 && (
        <section className="py-12 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-heading font-bold" data-testid="text-featured-apps-title">
                Recently Added Apps
              </h2>
              <Link href="/explore">
                <Button variant="ghost" data-testid="button-view-all">
                  View all
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
              {topRatedApps.slice(0, 6).map((app) => (
                <RecentlyAddedAppCard key={app.id} app={app} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Top Rated Apps (by trending score) */}
      {topTrendingApps && topTrendingApps.length > 0 && (
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-heading font-bold" data-testid="text-top-rated-apps-title">
                Top Rated Apps
              </h2>
            </div>
            <Carousel
              opts={{
                align: "start",
                loop: false,
                slidesToScroll: 1,
              }}
              className="w-full"
            >
              <CarouselPrevious />
              <CarouselContent className="-ml-6">
                {topTrendingApps.map((app) => (
                  <CarouselItem key={app.id} className="pl-6 md:basis-1/2 lg:basis-[calc(100%/3.5)]">
                    <AppCard app={app} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselNext />
            </Carousel>
          </div>
        </section>
      )}
    </div>
  );
}
