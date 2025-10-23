import { Link } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { AppListing } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface TrendingAppCardProps {
  app: AppListing & { tools?: Array<{ id: string; name: string; websiteUrl?: string | null; logoUrl?: string | null }> };
}

export function TrendingAppCard({ app }: TrendingAppCardProps) {
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
      <Card
        className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl cursor-pointer border-0 aspect-[4/3]"
        data-testid={`trending-card-app-${app.id}`}
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          {app.previewImageUrl ? (
            <img
              src={app.previewImageUrl}
              alt={app.name}
              className="w-full h-full object-cover"
              data-testid={`img-trending-preview-${app.id}`}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <span className="text-6xl font-bold text-muted-foreground/30">
                {app.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Overlay - appears on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Default State - App Name and Category (bottom, visible by default, hidden on hover) */}
        <div className="absolute bottom-0 left-0 right-0 z-10 opacity-100 group-hover:opacity-0 transition-opacity duration-300">
          <div className="bg-gradient-to-t from-black/60 to-transparent pt-8 pb-4 px-6">
            <h3
              className="font-display font-semibold text-lg text-white mb-1 line-clamp-1"
              data-testid={`text-trending-app-name-default-${app.id}`}
            >
              {app.name}
            </h3>
            <p
              className="text-sm text-white/80 font-medium"
              data-testid={`text-trending-category-${app.id}`}
            >
              {app.category || 'Uncategorized'}
            </p>
          </div>
        </div>

        {/* Hover State - App Info with Description, Rating and Launch (appears on hover) */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-start justify-between gap-6">
            {/* Left: App Name and Description */}
            <div className="flex-1 min-w-0">
              <h4
                className="font-display font-semibold text-lg text-white line-clamp-1"
                style={{ marginBottom: '8px' }}
                data-testid={`text-trending-app-name-bottom-${app.id}`}
              >
                {app.name}
              </h4>
              <p
                className="text-sm text-white/90 leading-relaxed"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                data-testid={`text-trending-description-${app.id}`}
              >
                {app.shortDescription}
              </p>
            </div>

            {/* Right: Rating and Launch */}
            <div className="flex items-center gap-3 flex-shrink-0 mt-auto">
              {/* Rating */}
              <div className="flex items-center gap-1.5">
                <Star
                  className={`h-4 w-4 ${
                    ratingData?.averageRating && ratingData.averageRating > 0
                      ? "fill-white text-white"
                      : "text-white/60"
                  }`}
                />
                <span
                  className="text-base font-semibold text-white"
                  data-testid={`text-trending-rating-${app.id}`}
                >
                  {(ratingData?.averageRating ?? 0).toFixed(1)}
                </span>
              </div>

              {/* Launch Icon */}
              <button
                onClick={handleLaunch}
                className="text-white group/launch"
                data-testid={`button-trending-launch-${app.id}`}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6"
                >
                  {/* Arrow corner (top-right L shape) - always visible */}
                  <polyline points="15 3 21 3 21 9" />
                  {/* Arrow line (diagonal) - always visible */}
                  <line x1="10" y1="14" x2="21" y2="3" />
                  {/* Box (square container) - animates in on hover */}
                  <path
                    d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
                    className="opacity-0 group-hover/launch:opacity-100 transition-opacity duration-300"
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
