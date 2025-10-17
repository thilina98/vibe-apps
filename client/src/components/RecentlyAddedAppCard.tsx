import { Link } from "wouter";
import type { AppListing } from "@shared/schema";
import { Card } from "@/components/ui/card";

interface RecentlyAddedAppCardProps {
  app: AppListing;
}

export function RecentlyAddedAppCard({ app }: RecentlyAddedAppCardProps) {
  return (
    <Link href={`/app/${app.id}`}>
      <Card
        className="p-4 hover-elevate active-elevate-2 cursor-pointer transition-all h-full"
        data-testid={`card-recently-added-${app.id}`}
      >
        <div className="flex items-start gap-4 h-full">
          {/* App Logo */}
          <div className="flex-shrink-0">
            {app.previewImage ? (
              <img
                src={app.previewImage}
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
              className="text-sm text-muted-foreground mb-1" 
              data-testid={`text-creator-${app.id}`}
            >
              By {app.creatorName}
            </p>
            <p 
              className="text-sm text-muted-foreground line-clamp-2" 
              data-testid={`text-short-description-${app.id}`}
            >
              {app.shortDescription}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
