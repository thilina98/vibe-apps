import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import type { AppListing } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface RecentlyAddedAppCardProps {
  app: AppListing;
}

export function RecentlyAddedAppCard({ app }: RecentlyAddedAppCardProps) {
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

  return (
    <Link href={`/app/${app.id}`}>
      <Card
        className="p-4 hover-elevate active-elevate-2 cursor-pointer transition-all h-full"
        data-testid={`card-recently-added-${app.id}`}
      >
        <div className="flex items-start gap-4 h-full">
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
          <div className="flex-1 min-w-0 flex flex-col">
            <h3
              className="font-semibold text-base mb-1 truncate"
              data-testid={`text-app-name-${app.id}`}
            >
              {app.name}
            </h3>
            <p
              className="text-sm text-muted-foreground line-clamp-2 mb-3"
              data-testid={`text-short-description-${app.id}`}
            >
              {app.shortDescription}
            </p>

            {/* Launch Button */}
            <div className="flex justify-end mt-auto">
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
        </div>
      </Card>
    </Link>
  );
}
