import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import type { AppListing } from "@shared/schema";
import { AppCard } from "../components/AppCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Plus, Search, TrendingUp, ArrowRight, Lightbulb, Rocket, Users } from "lucide-react";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  // Fetch top-rated apps from last 4 months
  const { data: topRatedApps } = useQuery<AppListing[]>({
    queryKey: ["/api/apps/landing/top-rated"],
  });

  // Fetch top trending apps by trending score
  const { data: trendingApps } = useQuery<AppListing[]>({
    queryKey: ["/api/apps/landing/trending"],
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

      {/* Top Rated Apps (by trending score) */}
      {trendingApps && trendingApps.length > 0 && (
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-heading font-bold" data-testid="text-top-rated-apps-title">
                Top Rated Apps
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingApps.map((app) => (
                <AppCard key={app.id} app={app} />
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
                Recently Added Apps
              </h2>
              <Link href="/explore">
                <Button variant="ghost" data-testid="button-view-all">
                  View all
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topRatedApps.map((app) => (
                <AppCard key={app.id} app={app} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How it Works */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-heading font-bold text-center mb-12" data-testid="text-how-it-works-title">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Search className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-heading font-bold mb-2" data-testid="text-discover-title">
                Discover
              </h3>
              <p className="text-sm text-muted-foreground" data-testid="text-discover-description">
                Browse through our curated collection of AI-built apps. Use filters to find exactly what you need.
              </p>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Lightbulb className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-heading font-bold mb-2" data-testid="text-explore-title">
                Explore
              </h3>
              <p className="text-sm text-muted-foreground" data-testid="text-explore-description">
                Try out apps, see how they're built, and learn from others' experiences.
              </p>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Rocket className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-heading font-bold mb-2" data-testid="text-launch-title">
                Launch
              </h3>
              <p className="text-sm text-muted-foreground" data-testid="text-launch-description">
                Click to visit any app and start using it immediately. No installation required.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Submit Your App */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-heading font-bold mb-6" data-testid="text-why-submit-title">
            Why Submit Your App?
          </h2>
          <p className="text-lg text-muted-foreground mb-8" data-testid="text-why-submit-description">
            Share your AI-built creations with a growing community of developers and users.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1" data-testid="text-get-feedback-title">Get Feedback</h3>
                <p className="text-sm text-muted-foreground" data-testid="text-get-feedback-description">
                  Receive valuable insights and ratings from the community.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1" data-testid="text-showcase-title">Showcase Skills</h3>
                <p className="text-sm text-muted-foreground" data-testid="text-showcase-description">
                  Demonstrate your ability to build with AI tools.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1" data-testid="text-grow-audience-title">Grow Your Audience</h3>
                <p className="text-sm text-muted-foreground" data-testid="text-grow-audience-description">
                  Reach users who are looking for solutions like yours.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1" data-testid="text-inspire-others-title">Inspire Others</h3>
                <p className="text-sm text-muted-foreground" data-testid="text-inspire-others-description">
                  Help others learn from your approach and techniques.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-10">
            <Link href="/submit">
              <Button size="lg" data-testid="button-submit-your-app">
                <Plus className="w-5 h-5 mr-2" />
                Submit Your App
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Building a Community */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-heading font-bold text-center mb-12" data-testid="text-community-title">
            Building a Community
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 text-center">
              <div className="text-4xl font-bold text-primary mb-2" data-testid="text-apps-count">
                {(topRatedApps?.length || 0) + (trendingApps?.length || 0)}+
              </div>
              <p className="text-sm text-muted-foreground" data-testid="text-apps-label">
                AI-Built Apps
              </p>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="text-4xl font-bold text-primary mb-2" data-testid="text-trending-count">
                {trendingApps?.length || 0}+
              </div>
              <p className="text-sm text-muted-foreground" data-testid="text-trending-label">
                Trending Apps
              </p>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="text-4xl font-bold text-primary mb-2" data-testid="text-creators-count">
                Growing
              </div>
              <p className="text-sm text-muted-foreground" data-testid="text-creators-label">
                Creator Community
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
