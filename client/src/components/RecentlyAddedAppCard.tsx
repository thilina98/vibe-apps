import { Link } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { AppListing } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { ExternalLink, Star } from "lucide-react";
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
        className="p-4 hover-elevate active-elevate-2 cursor-pointer transition-all h-full"
        data-testid={`card-recently-added-${app.id}`}
      >
        <div className="flex flex-col gap-3 h-full">
          <div className="flex items-start gap-4">
            {/* App Logo */}
            <div className="flex-shrink-0">
              {app.previewImageUrl ? (
                <img
                  src={app.previewImageUrl}
                  alt={app.name}
                  className="w-16 h-16 rounded-md object-cover"
                  data-testid={`img-app-logo-${app.id}`}
                />
              ) : (
                <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center">
                  <span className="text-2xl font-bold text-muted-foreground">
                    {app.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* App Info */}
            <div className="flex-1 min-w-0">
              <h3
                className="font-semibold text-base mb-1 truncate"
                data-testid={`text-app-name-${app.id}`}
              >
                {app.name}
              </h3>
              <p
                className="text-sm text-muted-foreground line-clamp-2"
                data-testid={`text-short-description-${app.id}`}
              >
                {app.shortDescription}
              </p>
            </div>
          </div>

          {/* Bottom Row: Rating and Launch Button */}
          <div className="flex items-center justify-between mt-auto">
            {/* Rating Display */}
            <div className="flex items-center gap-1">
              <Star
                className={`h-4 w-4 ${
                  displayRating > 0
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                }`}
              />
              <span className="text-sm font-medium" data-testid={`text-rating-${app.id}`}>
                {displayRating.toFixed(1)}
              </span>
            </div>

            {/* Launch Button */}
            <button
              onClick={handleLaunch}
              className="flex items-center gap-1.5 text-sm font-semibold text-chart-2 hover:text-chart-2/80 transition-colors"
              data-testid={`button-launch-${app.id}`}
            >
              Launch
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>
    </Link>
  );
}
