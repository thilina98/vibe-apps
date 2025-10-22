import { Link } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { AppListing } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface RecentlyAddedAppCardProps {
  app: AppListing;
}

export function RecentlyAddedAppCard({ app }: RecentlyAddedAppCardProps) {
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
    e.stopPropagation();
    window.open(app.launchUrl, "_blank", "noopener,noreferrer");
    launchMutation.mutate();
  };

  const displayRating = ratingData?.averageRating ?? 0;

  return (
    <Link href={`/app/${app.id}`}>
      <Card
        className="group p-4 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl h-full"
        style={{ backgroundColor: 'hsl(240 100% 97% / 0.75)' }}
        data-testid={`card-recently-added-${app.id}`}
      >
        <div className="flex gap-4 h-full">
          {/* Left Column: Image */}
          <div className="flex-shrink-0">
            {/* App Logo */}
            {app.previewImageUrl ? (
              <img
                src={app.previewImageUrl}
                alt={app.name}
                className="w-32 h-24 rounded-md object-cover"
                data-testid={`img-app-logo-${app.id}`}
              />
            ) : (
              <div className="w-32 h-24 rounded-md bg-muted flex items-center justify-center">
                <span className="text-3xl font-bold text-muted-foreground">
                  {app.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Right Column: App Info */}
          <div className="flex-1 min-w-0 flex flex-col">
            <h3
              className="font-semibold text-base truncate"
              style={{ marginBottom: '4px' }}
              data-testid={`text-app-name-${app.id}`}
            >
              {app.name}
            </h3>

            {/* Rating Display */}
            <div className="flex items-center gap-1" style={{ marginBottom: '8px' }}>
              <Star
                className={`h-4 w-4 ${
                  displayRating > 0
                    ? "fill-black text-black"
                    : "text-muted-foreground"
                }`}
              />
              <span className="text-sm font-medium" data-testid={`text-rating-${app.id}`}>
                {displayRating.toFixed(1)}
              </span>
            </div>

            <p
              className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1"
              data-testid={`text-short-description-${app.id}`}
            >
              {app.shortDescription}
            </p>

            {/* Bottom Row: Category and Launch Button */}
            <div className="flex items-center justify-between">
              {/* Category Badge */}
              <Badge variant="outline" className="text-[11px] bg-white text-foreground border-white" data-testid={`badge-category-${app.id}`}>
                {app.category || 'Uncategorized'}
              </Badge>

              {/* Launch Button */}
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
        </div>
      </Card>
    </Link>
  );
}
