import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { Category, Tool } from "@shared/schema";

interface FilterPanelProps {
  selectedToolIds: string[];
  onToolIdsChange: (toolIds: string[]) => void;
  selectedCategoryId: string;
  onCategoryIdChange: (categoryId: string) => void;
  sortBy: "newest" | "oldest" | "popular";
  onSortChange: (sort: "newest" | "oldest" | "popular") => void;
}

export function FilterPanel({
  selectedToolIds,
  onToolIdsChange,
  selectedCategoryId,
  onCategoryIdChange,
  sortBy,
  onSortChange,
}: FilterPanelProps) {
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: tools, isLoading: toolsLoading } = useQuery<Tool[]>({
    queryKey: ["/api/tools"],
  });

  const hasActiveFilters = selectedToolIds.length > 0 || selectedCategoryId;

  const clearFilters = () => {
    onToolIdsChange([]);
    onCategoryIdChange("");
  };

  const toggleTool = (toolId: string) => {
    if (selectedToolIds.includes(toolId)) {
      onToolIdsChange(selectedToolIds.filter((id) => id !== toolId));
    } else {
      onToolIdsChange([...selectedToolIds, toolId]);
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-lg">Filters</h3>
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
        <div>
          <h4 className="font-semibold text-sm mb-3">Sort By</h4>
          <RadioGroup value={sortBy} onValueChange={(v) => onSortChange(v as any)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="newest" id="newest" data-testid="radio-newest" />
              <Label htmlFor="newest" className="cursor-pointer">Newest First</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="oldest" id="oldest" data-testid="radio-oldest" />
              <Label htmlFor="oldest" className="cursor-pointer">Oldest First</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="popular" id="popular" data-testid="radio-popular" />
              <Label htmlFor="popular" className="cursor-pointer">Most Popular</Label>
            </div>
          </RadioGroup>
        </div>

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
                  <Label htmlFor={tool.id} className="cursor-pointer text-sm">
                    {tool.name}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t pt-4">
          <h4 className="font-semibold text-sm mb-3">Category</h4>
          {categoriesLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-6 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <RadioGroup value={selectedCategoryId} onValueChange={onCategoryIdChange}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="" id="all-categories" data-testid="radio-all-categories" />
                <Label htmlFor="all-categories" className="cursor-pointer text-sm">All Categories</Label>
              </div>
              {categories?.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={category.id} id={category.id} data-testid={`radio-category-${category.name.toLowerCase().replace(/\s+/g, '-')}`} />
                  <Label htmlFor={category.id} className="cursor-pointer text-sm">
                    {category.name}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
        </div>
      </div>
    </Card>
  );
}
