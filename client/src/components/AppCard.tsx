import { Link } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { AppListing } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";
import { getToolColor } from "../lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface AppCardProps {
  app: AppListing & { tools?: Array<{ id: string; name: string; websiteUrl?: string | null; logoUrl?: string | null }> };
}

export function AppCard({ app }: AppCardProps) {
  const { data: ratingData } = useQuery<{ averageRating: number | null }>({
    queryKey: ["/api/apps", app.id, "rating"],
  });
  const launchMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/apps/${app.id}/launch`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/apps/${app.id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/apps"] });
    },
  });

  const handleLaunch = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open(app.launchUrl, "_blank", "noopener,noreferrer");
    launchMutation.mutate();
  };

  return (
    <Link href={`/app/${app.id}`}>
      <Card className="group overflow-hidden rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer border-0 h-full flex flex-col p-4" style={{ backgroundColor: 'hsl(240 100% 97% / 0.75)' }} data-testid={`card-app-${app.id}`}>
        <div className="relative aspect-[5/4] overflow-hidden rounded-2xl mb-3">
          {app.previewImageUrl ? (
            <img
              src={app.previewImageUrl}
              alt={app.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              data-testid={`img-preview-${app.id}`}
            />
          ) : (
            <div className="w-full h-full bg-background flex items-center justify-center">
              <span className="text-6xl font-bold text-muted-foreground/40">
                {app.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          <div className="absolute top-3 right-3 flex flex-wrap gap-1.5 justify-end max-w-[70%]">
            {app.tools?.slice(0, 2).map((tool) => (
              <Badge
                key={tool.id}
                className={`${getToolColor(tool.name)} text-xs font-medium px-2 py-0.5 no-default-hover-elevate`}
                data-testid={`badge-tool-${tool.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {tool.name}
              </Badge>
            ))}
            {(app.tools?.length || 0) > 2 && (
              <Badge
                className="bg-background/80 text-foreground text-xs font-medium px-2 py-0.5 no-default-hover-elevate"
                data-testid="badge-more-tools"
              >
                +{(app.tools?.length || 0) - 2}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex flex-col flex-1">
          <h3 className="font-display font-semibold text-lg line-clamp-1" style={{ marginBottom: '4px' }} data-testid={`text-app-name-${app.id}`}>
            {app.name}
          </h3>

          <div className="flex items-center gap-1.5" style={{ marginBottom: '8px' }}>
            <Star
              className={`h-4 w-4 ${
                ratingData?.averageRating && ratingData.averageRating > 0
                  ? "fill-black text-black"
                  : "text-muted-foreground"
              }`}
            />
            <span className="text-sm font-semibold" data-testid={`text-rating-${app.id}`}>
              {(ratingData?.averageRating ?? 0).toFixed(1)}
            </span>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1" data-testid={`text-description-${app.id}`}>
            {app.shortDescription}
          </p>

          <div className="flex items-center justify-between gap-3 mt-auto">
            <Badge variant="outline" className="text-xs bg-white text-foreground border-white" data-testid={`badge-category-${app.id}`}>
              {app.category || 'Uncategorized'}
            </Badge>

            <button
              onClick={handleLaunch}
              className="relative p-0 text-primary hover:text-primary/70 transition-all duration-300"
              data-testid={`button-launch-${app.id}`}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 transition-colors duration-300"
              >
                {/* Arrow corner (top-right L shape) - always visible */}
                <polyline points="15 3 21 3 21 9" />
                {/* Arrow line (diagonal) - always visible */}
                <line x1="10" y1="14" x2="21" y2="3" />
                {/* Box (square container) - animates in on hover */}
                <path
                  d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
              </svg>
            </button>
          </div>
        </div>
      </Card>
    </Link>
  );
}
