import { Link } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { AppListing } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ExternalLink, Star } from "lucide-react";
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
      <Card className="group overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer border h-full flex flex-col" data-testid={`card-app-${app.id}`}>
        <div className="relative aspect-video overflow-hidden">
          {app.previewImageUrl ? (
            <img
              src={app.previewImageUrl}
              alt={app.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              data-testid={`img-preview-${app.id}`}
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-6xl font-bold text-muted-foreground/40">
                {app.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/30" />

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
          
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-white font-display font-semibold text-xl mb-1 line-clamp-1" data-testid={`text-app-name-${app.id}`}>
              {app.name}
            </h3>
          </div>
        </div>

        <div className="p-5">
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3" data-testid={`text-description-${app.id}`}>
            {app.shortDescription}
          </p>

          <div className="flex items-center gap-1.5 mb-3">
            <Star
              className={`h-4 w-4 ${
                ratingData?.averageRating && ratingData.averageRating > 0
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground"
              }`}
            />
            <span className="text-sm font-medium" data-testid={`text-rating-${app.id}`}>
              {(ratingData?.averageRating ?? 0).toFixed(1)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <Badge variant="outline" className="text-xs" data-testid={`badge-category-${app.id}`}>
              {app.category || 'Uncategorized'}
            </Badge>
            
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
