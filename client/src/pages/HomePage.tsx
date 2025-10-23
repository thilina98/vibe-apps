import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import type { AppListing } from "@shared/schema";
import { AppCard } from "../components/AppCard";
import { RecentlyAddedAppCard } from "../components/RecentlyAddedAppCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Search, ChevronLeft, ChevronRight } from "lucide-react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Custom arrow components for the carousel
function NextArrow(props: any) {
  const { onClick, className } = props;
  // Hide arrow when it's disabled (can't scroll further)
  if (className?.includes('slick-disabled')) {
    return null;
  }
  return (
    <button
      onClick={onClick}
      className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-card border border-border hover:bg-accent rounded-full p-3 shadow-lg transition-all hover:scale-110"
      aria-label="Next slide"
    >
      <ChevronRight className="w-5 h-5 text-foreground" />
    </button>
  );
}

function PrevArrow(props: any) {
  const { onClick, className } = props;
  // Hide arrow when it's disabled (can't scroll further)
  if (className?.includes('slick-disabled')) {
    return null;
  }
  return (
    <button
      onClick={onClick}
      className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-card border border-border hover:bg-accent rounded-full p-3 shadow-lg transition-all hover:scale-110"
      aria-label="Previous slide"
    >
      <ChevronLeft className="w-5 h-5 text-foreground" />
    </button>
  );
}

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
    <div className="min-h-screen mx-5">
      {/* Hero Section */}
      <section className="bg-primary/25 py-32 px-4 relative bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(/landing-page-background.png)' }}>
        <div className="container mx-auto max-w-screen-2xl text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles className="w-8 h-8 text-white drop-shadow-2xl [filter:_drop-shadow(0_10px_20px_rgb(0_0_0_/_50%))]" />
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-white drop-shadow-2xl [text-shadow:_0_4px_8px_rgb(0_0_0_/_70%),_0_8px_16px_rgb(0_0_0_/_50%)]" data-testid="text-hero-title">
              Find Your Frequency.
            </h1>
          </div>
          <p className="text-xl text-gray-300 mb-20 drop-shadow-lg [text-shadow:_0_2px_4px_rgb(0_0_0_/_60%)]" data-testid="text-hero-subtitle">
            A showcase for intuitive creations. Built by the community.
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
        <section className="py-12 px-4 mt-5">
          <div className="container mx-auto max-w-screen-2xl">
            <div className="mb-6">
              <h2 className="text-3xl font-heading font-bold" data-testid="text-trending-apps-title">
                Trending Apps
              </h2>
            </div>
            <div className="relative py-6 [&_.slick-track]:flex [&_.slick-slide]:h-auto [&_.slick-slide>div]:h-full [&_.slick-track]:!ml-0 [&_.slick-list]:!pl-0 [&_.slick-list]:overflow-hidden">
              <Slider
              dots={true}
              infinite={false}
              speed={500}
              slidesToShow={3.5}
              slidesToScroll={1}
              arrows={true}
              nextArrow={<NextArrow />}
              prevArrow={<PrevArrow />}
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
              {trendingApps.map((app, index) => (
                <div key={app.id} className={`h-full ${index === 0 ? 'pr-3' : index === trendingApps.length - 1 ? 'pl-3' : 'px-3'}`}>
                  <AppCard app={app} />
                </div>
              ))}
              </Slider>
            </div>
            <div className="text-center mt-2.5">
              <Link href="/explore">
                <span className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  check all the apps →
                </span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Recently Added Apps */}
      {topRatedApps && topRatedApps.length > 0 && (
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-screen-2xl">
            <div className="mb-6">
              <h2 className="text-3xl font-heading font-bold" data-testid="text-featured-apps-title">
                Recently Added Apps
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
              {topRatedApps.slice(0, 6).map((app) => (
                <RecentlyAddedAppCard key={app.id} app={app} />
              ))}
            </div>
            <div className="text-center mt-2.5">
              <Link href="/explore">
                <span className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  check all the apps →
                </span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Top Rated Apps (by trending score) */}
      {topTrendingApps && topTrendingApps.length > 0 && (
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-screen-2xl">
            <div className="mb-6">
              <h2 className="text-3xl font-heading font-bold" data-testid="text-top-rated-apps-title">
                Top Rated Apps
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-fr">
              {topTrendingApps.map((app) => (
                <AppCard key={app.id} app={app} />
              ))}
            </div>
            <div className="text-center mt-2.5">
              <Link href="/explore">
                <span className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  check all the apps →
                </span>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
