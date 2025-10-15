import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { App } from "@shared/schema";
import { AppCard } from "../components/AppCard";
import { SearchBar } from "../components/SearchBar";
import { FilterPanel } from "../components/FilterPanel";
import { Button } from "@/components/ui/button";
import { Sparkles, Plus } from "lucide-react";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedToolIds, setSelectedToolIds] = useState<string[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "popular">("newest");
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append("search", searchQuery);
    if (selectedToolIds.length > 0) {
      selectedToolIds.forEach(toolId => params.append("tools", toolId));
    }
    if (selectedCategoryId) params.append("category", selectedCategoryId);
    params.append("sortBy", sortBy);
    return params.toString();
  };

  const queryString = buildQueryString();
  const { data: apps, isLoading } = useQuery<App[]>({
    queryKey: ["/api/apps?" + queryString],
  });

  const filteredApps = apps || [];
  const totalPages = Math.ceil(filteredApps.length / itemsPerPage);
  const paginatedApps = filteredApps.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-purple-800 to-primary min-h-[500px] md:min-h-[600px] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
        
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white mb-6">
            Discover Amazing AI-Built Apps
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto">
            Explore apps created with AI-powered coding tools. Get inspired, learn from others, and share your own creations.
          </p>
          
          <div className="max-w-2xl mx-auto mb-8">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/submit">
              <Button 
                size="lg" 
                className="bg-chart-2 hover:bg-chart-2/90 text-white font-semibold px-8 shadow-xl"
                data-testid="button-submit-app"
              >
                <Plus className="w-5 h-5 mr-2" />
                Submit Your App
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-4">
              <FilterPanel
                selectedToolIds={selectedToolIds}
                onToolIdsChange={setSelectedToolIds}
                selectedCategoryId={selectedCategoryId}
                onCategoryIdChange={setSelectedCategoryId}
                sortBy={sortBy}
                onSortChange={setSortBy}
              />
            </div>
          </aside>

          <main className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-96 bg-card rounded-2xl animate-pulse" data-testid={`skeleton-card-${i}`} />
                ))}
              </div>
            ) : paginatedApps.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-display font-semibold mb-3">No apps found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery || selectedToolIds.length > 0 || selectedCategoryId
                    ? "Try adjusting your filters or search query"
                    : "Be the first to submit an app!"}
                </p>
                <Link href="/submit">
                  <Button data-testid="button-submit-first-app">
                    <Plus className="w-4 h-4 mr-2" />
                    Submit the First App
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-6 text-sm text-muted-foreground">
                  Showing {paginatedApps.length} of {filteredApps.length} apps
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {paginatedApps.map((app) => (
                    <AppCard key={app.id} app={app} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      data-testid="button-prev-page"
                    >
                      Previous
                    </Button>
                    
                    <div className="flex gap-2">
                      {[...Array(totalPages)].map((_, i) => (
                        <Button
                          key={i + 1}
                          variant={page === i + 1 ? "default" : "outline"}
                          onClick={() => setPage(i + 1)}
                          className="min-w-10"
                          data-testid={`button-page-${i + 1}`}
                        >
                          {i + 1}
                        </Button>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      data-testid="button-next-page"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
