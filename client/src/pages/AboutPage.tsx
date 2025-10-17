import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { AppListing } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Plus, Search, TrendingUp, Lightbulb, Rocket, Users } from "lucide-react";

export default function AboutPage() {
  // Fetch trending apps for community stats
  const { data: trendingApps } = useQuery<AppListing[]>({
    queryKey: ["/api/apps/landing/trending?limit=8"],
  });

  const { data: topRatedApps } = useQuery<AppListing[]>({
    queryKey: ["/api/apps/landing/top-rated"],
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-primary/5 py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-4xl md:text-5xl font-heading font-bold" data-testid="text-about-hero-title">
              About Vibecoded Apps
            </h1>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-heading font-bold text-center mb-6" data-testid="text-about-us-title">
            About Us
          </h2>
          <div className="text-lg text-muted-foreground text-center space-y-4">
            <p data-testid="text-about-us-description">
              Welcome to Vibecoded Apps, your premier destination for discovering and sharing AI-built applications.
              We're building a community where developers can showcase their AI-powered creations and users can
              discover innovative tools that make their lives easier.
            </p>
            <p>
              Our platform celebrates the intersection of artificial intelligence and human creativity,
              providing a space where innovation thrives and ideas come to life.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 px-4 bg-muted/30">
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
      <section className="py-16 px-4">
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
      <section className="py-16 px-4 bg-muted/30">
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
