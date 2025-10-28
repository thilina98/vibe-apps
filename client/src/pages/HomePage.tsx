import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import type { AppListing } from "@shared/schema";
import { AppCard } from "../components/AppCard";
import { RecentlyAddedAppCard } from "../components/RecentlyAddedAppCard";
import { TrendingAppCard } from "../components/TrendingAppCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Search, ChevronLeft, ChevronRight } from "lucide-react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Custom Arrow Components for Carousel
interface ArrowProps {
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const PrevArrow = ({ onClick, className }: ArrowProps) => {
  // Hide arrow if slick-disabled class is present
  if (className?.includes("slick-disabled")) return null;

  return (
    <button
      onClick={onClick}
      className="absolute left-2 top-1/2 z-10 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
      style={{ transform: 'translateY(-50%)' }}
      aria-label="Previous slide"
    >
      <ChevronLeft className="w-6 h-6 text-gray-800" strokeWidth={2.5} />
    </button>
  );
};

const NextArrow = ({ onClick, className }: ArrowProps) => {
  // Hide arrow if slick-disabled class is present
  if (className?.includes("slick-disabled")) return null;

  return (
    <button
      onClick={onClick}
      className="absolute right-2 top-1/2 z-10 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
      style={{ transform: 'translateY(-50%)' }}
      aria-label="Next slide"
    >
      <ChevronRight className="w-6 h-6 text-gray-800" strokeWidth={2.5} />
    </button>
  );
};

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  // Fetch top-rated apps from last 4 months
  const { data: topRatedApps } = useQuery<AppListing[]>({
    queryKey: ["/api/apps/landing/top-rated"],
  });

  // Fetch top trending apps by trending score (10 for carousel)
  const { data: topTrendingApps } = useQuery<AppListing[]>({
    queryKey: ["/api/apps/landing/trending?limit=10"],
  });

  // Fetch more trending apps (6 for trending section - 3 columns x 2 rows)
  const { data: trendingApps } = useQuery<AppListing[]>({
    queryKey: ["/api/apps/landing/trending?limit=6"],
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
      <section className="bg-primary/25 py-32 px-4 relative bg-cover bg-center bg-no-repeat rounded-2xl" style={{ backgroundImage: 'url(/landing-page-background.png)' }}>
        <div className="container mx-auto max-w-screen-2xl text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles className="w-8 h-8 text-black" />
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-black" data-testid="text-hero-title">
              Find Your Frequency.
            </h1>
          </div>
          <p className="text-xl text-primary mb-20" data-testid="text-hero-subtitle">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
              {trendingApps.map((app) => (
                <TrendingAppCard key={app.id} app={app} />
              ))}
            </div>
            <div className="text-center mt-10">
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
            <div className="text-center mt-10">
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
            <div className="carousel-container" style={{ margin: '0 -12px' }}>
              <Slider
                {...{
                  dots: true,
                  infinite: false,
                  speed: 500,
                  slidesToShow: 4.5,
                  slidesToScroll: 1,
                  prevArrow: <PrevArrow />,
                  nextArrow: <NextArrow />,
                  dotsClass: "slick-dots custom-dots",
                  responsive: [
                    {
                      breakpoint: 1024,
                      settings: {
                        slidesToShow: 3.5,
                        slidesToScroll: 1,
                        dots: true,
                      }
                    },
                    {
                      breakpoint: 768,
                      settings: {
                        slidesToShow: 2.5,
                        slidesToScroll: 1,
                        dots: true,
                      }
                    }
                  ]
                }}
              >
                {topTrendingApps.map((app) => (
                  <div key={app.id} className="px-3 h-full">
                    <AppCard app={app} />
                  </div>
                ))}
              </Slider>
            </div>
            <div className="text-center mt-5">
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
