import { VIBECODING_TOOLS, CATEGORIES } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface FilterPanelProps {
  selectedTools: string[];
  onToolsChange: (tools: string[]) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  sortBy: "newest" | "oldest" | "popular";
  onSortChange: (sort: "newest" | "oldest" | "popular") => void;
}

export function FilterPanel({
  selectedTools,
  onToolsChange,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
}: FilterPanelProps) {
  const hasActiveFilters = selectedTools.length > 0 || selectedCategory;

  const clearFilters = () => {
    onToolsChange([]);
    onCategoryChange("");
  };

  const toggleTool = (tool: string) => {
    if (selectedTools.includes(tool)) {
      onToolsChange(selectedTools.filter((t) => t !== tool));
    } else {
      onToolsChange([...selectedTools, tool]);
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
            {selectedTools.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">({selectedTools.length})</span>
            )}
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {VIBECODING_TOOLS.map((tool) => (
              <div key={tool} className="flex items-center space-x-2">
                <Checkbox
                  id={tool}
                  checked={selectedTools.includes(tool)}
                  onCheckedChange={() => toggleTool(tool)}
                  data-testid={`checkbox-tool-${tool.toLowerCase().replace(/\s+/g, '-')}`}
                />
                <Label htmlFor={tool} className="cursor-pointer text-sm">
                  {tool}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-semibold text-sm mb-3">Category</h4>
          <RadioGroup value={selectedCategory} onValueChange={onCategoryChange}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="" id="all-categories" data-testid="radio-all-categories" />
              <Label htmlFor="all-categories" className="cursor-pointer text-sm">All Categories</Label>
            </div>
            {CATEGORIES.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <RadioGroupItem value={category} id={category} data-testid={`radio-category-${category.toLowerCase().replace(/\s+/g, '-')}`} />
                <Label htmlFor={category} className="cursor-pointer text-sm">
                  {category}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>
    </Card>
  );
}
