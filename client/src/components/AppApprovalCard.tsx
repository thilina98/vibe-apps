import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Eye, ExternalLink, Calendar, User } from "lucide-react";
import type { AppListing } from "@shared/schema";
import { Link } from "wouter";
import { RejectAppDialog } from "./RejectAppDialog";

interface AppApprovalCardProps {
  app: AppListing;
  onApprove: (appId: string) => void;
  onReject: (appId: string, reason?: string) => void;
  isLoading: boolean;
}

export function AppApprovalCard({
  app,
  onApprove,
  onReject,
  isLoading,
}: AppApprovalCardProps) {
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  const handleReject = (reason?: string) => {
    onReject(app.id, reason);
    setRejectDialogOpen(false);
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-all">
        <div className="relative h-48 bg-gradient-to-br from-primary/10 to-primary/5">
          {app.previewImageUrl ? (
            <img
              src={app.previewImageUrl}
              alt={app.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-6xl text-muted-foreground">
              {app.name.charAt(0)}
            </div>
          )}
          {app.status === 'rejected' && (
            <div className="absolute top-3 right-3">
              <Badge variant="destructive">Rejected</Badge>
            </div>
          )}
        </div>

        <div className="p-6 space-y-4">
          {/* App Name and Description */}
          <div>
            <h3 className="text-2xl font-heading font-bold mb-2">{app.name}</h3>
            <p className="text-sm text-muted-foreground mb-3">
              {app.shortDescription}
            </p>
          </div>

          {/* App Details */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="w-4 h-4" />
              <span>Creator: {app.creatorName}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>
                Submitted: {new Date(app.createdDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{app.category}</Badge>
              {app.vibecodingTools.map((tool) => (
                <Badge key={tool} variant="secondary">
                  {tool}
                </Badge>
              ))}
            </div>
          </div>

          {/* Full Description */}
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground line-clamp-4">
              {app.fullDescription}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Link href={`/app/${app.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </Link>
            {app.launchUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(app.launchUrl, "_blank")}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Rejection Reason (if rejected) */}
          {app.status === 'rejected' && (app as any).rejectionReason && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm">
              <p className="font-medium text-destructive mb-1">Previous Rejection Reason:</p>
              <p className="text-muted-foreground">{(app as any).rejectionReason}</p>
            </div>
          )}

          {/* Approve/Reject Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={() => onApprove(app.id)}
              disabled={isLoading}
            >
              <Check className="w-4 h-4 mr-2" />
              Approve
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => setRejectDialogOpen(true)}
              disabled={isLoading}
            >
              <X className="w-4 h-4 mr-2" />
              Reject
            </Button>
          </div>
        </div>
      </Card>

      <RejectAppDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        onReject={handleReject}
        isLoading={isLoading}
        appName={app.name}
      />
    </>
  );
}
