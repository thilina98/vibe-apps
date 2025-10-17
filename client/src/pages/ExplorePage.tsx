import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { AppListing, Category, Tool } from "@shared/schema";
import { AppCard } from "../components/AppCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Plus, X, Filter, Search } from "lucide-react";

export default function ExplorePage() {
  // Get URL params
  const urlParams = new URLSearchParams(window.location.search);
  
  // Initialize state from URL or defaults
  const [searchQuery, setSearchQuery] = useState(urlParams.get("search") || "");
  const [selectedToolIds, setSelectedToolIds] = useState<string[]>(urlParams.getAll("tools"));
  const [selectedCategoryId, setSelectedCategoryId] = useState(urlParams.get("category") || "");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "most_launched" | "highest_rated" | "trending">(
    (urlParams.get("sortBy") as any) || "newest"
  );
  const [dateRange, setDateRange] = useState<"week" | "month" | "3months" | "6months" | "all">(
    (urlParams.get("dateRange") as any) || "all"
  );
  const [page, setPage] = useState(parseInt(urlParams.get("page") || "1"));
  const itemsPerPage = 12;

  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: tools, isLoading: toolsLoading } = useQuery<Tool[]>({
    queryKey: ["/api/tools"],
  });

  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append("search", searchQuery);
    if (selectedToolIds.length > 0) {
      selectedToolIds.forEach(toolId => params.append("tools", toolId));
    }
    if (selectedCategoryId) params.append("category", selectedCategoryId);
    params.append("sortBy", sortBy);
    if (dateRange !== "all") params.append("dateRange", dateRange);
    return params.toString();
  };

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.append("search", searchQuery);
    if (selectedToolIds.length > 0) {
      selectedToolIds.forEach(toolId => params.append("tools", toolId));
    }
    if (selectedCategoryId) params.append("category", selectedCategoryId);
    params.append("sortBy", sortBy);
    if (dateRange !== "all") params.append("dateRange", dateRange);
    if (page > 1) params.append("page", page.toString());
    
    const newUrl = `/explore${params.toString() ? `?${params.toString()}` : ''}`;
    window.history.replaceState({}, '', newUrl);
  }, [searchQuery, selectedToolIds, selectedCategoryId, sortBy, dateRange, page]);

  const queryString = buildQueryString();
  const { data: apps, isLoading } = useQuery<AppListing[]>({
    queryKey: ["/api/apps?" + queryString],
  });

  const filteredApps = apps || [];
  const totalPages = Math.ceil(filteredApps.length / itemsPerPage);
  const paginatedApps = filteredApps.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const hasActiveFilters = selectedToolIds.length > 0 || selectedCategoryId || dateRange !== "all";

  const clearFilters = () => {
    setSelectedToolIds([]);
    setSelectedCategoryId("");
    setDateRange("all");
    setPage(1);
  };

  const toggleTool = (toolId: string) => {
    if (selectedToolIds.includes(toolId)) {
      setSelectedToolIds(selectedToolIds.filter((id) => id !== toolId));
    } else {
      setSelectedToolIds([...selectedToolIds, toolId]);
    }
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-display font-bold">Explore Apps</h1>
            <Link href="/">
              <Button variant="outline" data-testid="button-back-home">
                Back to Home
              </Button>
            </Link>
          </div>
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for apps..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="pl-10"
              data-testid="input-search-explore"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filter Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-4">
              <Card className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-semibold text-lg flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filters
                  </h3>
                  {hasActiveFilters && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearFilters}
                      data-testid="button-clear-filters"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Sort By */}
                  <div>
                    <h4 className="font-semibold text-sm mb-3">Sort By</h4>
                    <RadioGroup value={sortBy} onValueChange={(v: any) => { setSortBy(v); setPage(1); }}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="newest" id="newest" data-testid="radio-newest" />
                        <Label htmlFor="newest" className="cursor-pointer">Newest First</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="oldest" id="oldest" data-testid="radio-oldest" />
                        <Label htmlFor="oldest" className="cursor-pointer">Oldest First</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="most_launched" id="most_launched" data-testid="radio-most-launched" />
                        <Label htmlFor="most_launched" className="cursor-pointer">Most Launched</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="highest_rated" id="highest_rated" data-testid="radio-highest-rated" />
                        <Label htmlFor="highest_rated" className="cursor-pointer">Highest Rated</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="trending" id="trending" data-testid="radio-trending" />
                        <Label htmlFor="trending" className="cursor-pointer">Trending This Week</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Date Range */}
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-sm mb-3">Date Range</h4>
                    <Select value={dateRange} onValueChange={(v: any) => { setDateRange(v); setPage(1); }}>
                      <SelectTrigger data-testid="select-date-range">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="week">Last Week</SelectItem>
                        <SelectItem value="month">Last Month</SelectItem>
                        <SelectItem value="3months">Last 3 Months</SelectItem>
                        <SelectItem value="6months">Last 6 Months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Vibecoding Tools */}
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-sm mb-3">
                      Vibecoding Tools
                      {selectedToolIds.length > 0 && (
                        <span className="ml-2 text-xs text-muted-foreground">({selectedToolIds.length})</span>
                      )}
                    </h4>
                    {toolsLoading ? (
                      <div className="space-y-2">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="h-6 bg-muted rounded animate-pulse" />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {tools?.map((tool) => (
                          <div key={tool.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={tool.id}
                              checked={selectedToolIds.includes(tool.id)}
                              onCheckedChange={() => toggleTool(tool.id)}
                              data-testid={`checkbox-tool-${tool.name.toLowerCase().replace(/\s+/g, '-')}`}
                            />
                            <Label htmlFor={tool.id} className="cursor-pointer flex-1">
                              {tool.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Category */}
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-sm mb-3">Category</h4>
                    {categoriesLoading ? (
                      <div className="space-y-2">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="h-6 bg-muted rounded animate-pulse" />
                        ))}
                      </div>
                    ) : (
                      <RadioGroup value={selectedCategoryId} onValueChange={(v) => { setSelectedCategoryId(v); setPage(1); }}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="" id="all-categories" data-testid="radio-all-categories" />
                          <Label htmlFor="all-categories" className="cursor-pointer">All Categories</Label>
                        </div>
                        {categories?.map((category) => (
                          <div key={category.id} className="flex items-center space-x-2">
                            <RadioGroupItem value={category.id} id={category.id} data-testid={`radio-category-${category.name.toLowerCase().replace(/\s+/g, '-')}`} />
                            <Label htmlFor={category.id} className="cursor-pointer">
                              {category.name}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </aside>

          {/* Main Content */}
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
