import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import type { AppListing } from "@shared/schema";
import { AppCard } from "../components/AppCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Plus, Search, TrendingUp, ArrowRight } from "lucide-react";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  // Fetch top-rated apps from last 4 months
  const { data: topRatedApps } = useQuery<AppListing[]>({
    queryKey: ["/api/apps/landing/top-rated"],
  });

  // Fetch top 5 trending categories
  const { data: trendingCategories } = useQuery<Array<{ name: string; count: number }>>({
    queryKey: ["/api/categories/trending"],
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
      <section className="bg-gradient-to-b from-primary/5 to-background py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-4xl md:text-5xl font-heading font-bold" data-testid="text-hero-title">
              Vibecoded Apps
            </h1>
          </div>
          <p className="text-xl text-muted-foreground mb-8" data-testid="text-hero-subtitle">
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

      {/* Trending Categories */}
      {trendingCategories && trendingCategories.length > 0 && (
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-heading font-bold" data-testid="text-trending-categories-title">
                Trending Categories
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {trendingCategories.map((category) => (
                <Link
                  key={category.name}
                  href={`/explore?category=${encodeURIComponent(category.name)}`}
                >
                  <Badge
                    variant="outline"
                    className="text-base py-2 px-4 hover-elevate active-elevate-2 cursor-pointer"
                    data-testid={`badge-category-${category.name}`}
                  >
                    <span className="font-semibold">{category.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">({category.count})</span>
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Apps */}
      {topRatedApps && topRatedApps.length > 0 && (
        <section className="py-12 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-heading font-bold" data-testid="text-featured-apps-title">
                Top Rated Apps
              </h2>
              <Link href="/explore">
                <Button variant="ghost" data-testid="button-view-all">
                  View all
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            {/* Grid: 3 rows of 2 + 1 app on left and submit card on right */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* First 6 apps in 2 columns */}
              {topRatedApps.slice(0, 6).map((app) => (
                <AppCard key={app.id} app={app} />
              ))}
              
              {/* Third row: 7th app on left, submit card on right */}
              {topRatedApps.length > 6 && (
                <AppCard app={topRatedApps[6]} />
              )}
              
              {/* Submit Card */}
              <Card className="p-8 flex flex-col items-center justify-center text-center hover-elevate active-elevate-2 min-h-[300px]">
                <div className="mb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Plus className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-heading font-bold mb-2" data-testid="text-submit-card-title">
                    Submit Your App
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4" data-testid="text-submit-card-description">
                    Built something awesome? Share it with the community!
                  </p>
                </div>
                <Link href="/submit">
                  <Button data-testid="button-submit-app">
                    <Plus className="w-4 h-4 mr-2" />
                    Submit App
                  </Button>
                </Link>
              </Card>
              
              {/* If there are fewer than 7 apps, fill remaining space */}
              {topRatedApps.length < 7 && (
                <Card className="p-8 flex flex-col items-center justify-center text-center hover-elevate active-elevate-2 min-h-[300px]">
                  <div className="mb-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <Plus className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-heading font-bold mb-2" data-testid="text-submit-card-title">
                      Submit Your App
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4" data-testid="text-submit-card-description">
                      Built something awesome? Share it with the community!
                    </p>
                  </div>
                  <Link href="/submit">
                    <Button data-testid="button-submit-app">
                      <Plus className="w-4 h-4 mr-2" />
                      Submit App
                    </Button>
                  </Link>
                </Card>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
