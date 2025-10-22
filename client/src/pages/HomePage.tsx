import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import type { AppListing } from "@shared/schema";
import { AppCard } from "../components/AppCard";
import { RecentlyAddedAppCard } from "../components/RecentlyAddedAppCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Search, TrendingUp, ArrowRight } from "lucide-react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

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
      <section className="bg-primary/25 py-32 px-4 relative bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(/landing-page-background.png)' }}>
        <div className="container mx-auto max-w-screen-2xl text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-4xl md:text-5xl font-heading font-bold" data-testid="text-hero-title">
              Vibecoded Apps
            </h1>
          </div>
          <p className="text-xl text-muted-foreground mb-20" data-testid="text-hero-subtitle">
            Discover amazing apps built with AI. Search, explore, and find your next favorite tool.
          </p>

          <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 bg-card rounded-xl shadow-lg pl-6 pr-3 py-3 border border-border/50">
              <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <Input
                type="text"
                placeholder="What app are you looking for?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-muted-foreground/70"
                data-testid="input-search-hero"
              />
              <Button type="submit" size="lg" className="rounded-lg px-6" data-testid="button-search-hero">
                Search Apps
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Trending Apps */}
      {trendingApps && trendingApps.length > 0 && (
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-screen-2xl">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-heading font-bold" data-testid="text-trending-apps-title">
                Trending Apps
              </h2>
            </div>
            <Slider
              dots={true}
              infinite={false}
              speed={500}
              slidesToShow={3.5}
              slidesToScroll={1}
              arrows={true}
              responsive={[
                {
                  breakpoint: 1024,
                  settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                  }
                },
                {
                  breakpoint: 768,
                  settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                  }
                }
              ]}
            >
              {trendingApps.map((app) => (
                <div key={app.id} className="px-3">
                  <AppCard app={app} />
                </div>
              ))}
            </Slider>
          </div>
        </section>
      )}

      {/* Recently Added Apps */}
      {topRatedApps && topRatedApps.length > 0 && (
        <section className="py-12 px-4 bg-muted/30">
          <div className="container mx-auto max-w-screen-2xl">
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
          <div className="container mx-auto max-w-screen-2xl">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-heading font-bold" data-testid="text-top-rated-apps-title">
                Top Rated Apps
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-fr">
              {topTrendingApps.map((app) => (
                <AppCard key={app.id} app={app} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
