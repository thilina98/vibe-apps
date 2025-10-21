import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import type { AppListing } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { LayoutGrid, Plus, Edit, Eye, ArrowLeft, AlertCircle, Send, CheckCircle, Clock, FileEdit, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Reusable App Card Component
function AppCard({ app, onResubmit, isResubmitting }: {
  app: AppListing;
  onResubmit: (appId: string) => void;
  isResubmitting: boolean;
}) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-500 hover:bg-green-600">Published</Badge>;
      case 'pending_approval':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending Approval</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'draft':
      default:
        return <Badge variant="secondary">Draft</Badge>;
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
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
        <div className="absolute top-3 right-3">
          {getStatusBadge(app.status)}
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div>
          <h3 className="text-xl font-heading font-bold mb-2 line-clamp-1">
            {app.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {app.shortDescription}
          </p>
        </div>

        {/* Show rejection reason for rejected apps */}
        {app.status === 'rejected' && app.rejectionReason && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
            <div className="flex-1 text-sm">
              <p className="font-medium text-destructive">Rejection Reason:</p>
              <p className="text-muted-foreground mt-1">{app.rejectionReason}</p>
            </div>
          </div>
        )}

        {/* Show pending message for pending apps */}
        {app.status === 'pending_approval' && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div className="flex-1 text-sm">
              <p className="font-medium text-yellow-600 dark:text-yellow-400">Awaiting Review</p>
              <p className="text-muted-foreground mt-1">Your app is being reviewed by an admin</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Eye className="w-4 h-4" />
          <span>{app.launchCount || 0} {app.launchCount === 1 ? 'launch' : 'launches'}</span>
        </div>

        <div className="space-y-2 pt-2">
          <div className="flex gap-2">
            <Link href={`/app/${app.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                <Eye className="w-4 h-4 mr-2" />
                View
              </Button>
            </Link>
            <Link href={`/app/${app.id}/edit`} className="flex-1">
              <Button size="sm" className="w-full" data-testid={`button-edit-${app.id}`}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </Link>
          </div>

          {/* Show resubmit button for draft and rejected apps */}
          {(app.status === 'draft' || app.status === 'rejected') && (
            <Button
              size="sm"
              className="w-full"
              variant="default"
              onClick={() => onResubmit(app.id)}
              disabled={isResubmitting}
              data-testid={`button-resubmit-${app.id}`}
            >
              <Send className="w-4 h-4 mr-2" />
              {isResubmitting ? 'Submitting...' : 'Submit for Approval'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

// Empty State Component
function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction
}: {
  icon: any;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="text-center py-16">
      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
        <Icon className="w-12 h-12 text-muted-foreground" />
      </div>
      <h3 className="text-2xl font-display font-semibold mb-3">{title}</h3>
      <p className="text-muted-foreground mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>
          <Plus className="w-4 h-4 mr-2" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default function MyAppsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: apps, isLoading } = useQuery<AppListing[]>({
    queryKey: [`/api/apps?creatorId=${user?.id}`],
    enabled: !!user?.id,
  });

  // Mutation to resubmit app for approval
  const resubmitMutation = useMutation({
    mutationFn: async (appId: string) => {
      const response = await apiRequest("PATCH", `/api/apps/${appId}/status`, { status: "pending_approval" });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/apps?creatorId=${user?.id}`] });
      toast({
        title: "Success",
        description: "App submitted for approval",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit app",
        variant: "destructive",
      });
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    setLocation("/");
    return null;
  }

  // Filter apps by status
  const publishedApps = apps?.filter(app => app.status === 'published') || [];
  const pendingRejectedApps = apps?.filter(app => app.status === 'pending_approval' || app.status === 'rejected') || [];
  const draftApps = apps?.filter(app => app.status === 'draft') || [];
  const rejectedAppsCount = apps?.filter(app => app.status === 'rejected').length || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <LayoutGrid className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-display font-bold">My Apps</h1>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => window.history.back()} data-testid="button-back">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Link href="/submit">
                <Button data-testid="button-submit-new-app">
                  <Plus className="w-4 h-4 mr-2" />
                  Submit New App
                </Button>
              </Link>
            </div>
          </div>
          <p className="text-muted-foreground">
            Manage and track your submitted applications
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-card rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : !apps || apps.length === 0 ? (
          <EmptyState
            icon={LayoutGrid}
            title="No apps yet"
            description="You haven't submitted any apps. Start by creating your first one!"
            actionLabel="Submit Your First App"
            onAction={() => setLocation("/submit")}
          />
        ) : (
          <Tabs defaultValue="published" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="published" className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Published
                {publishedApps.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {publishedApps.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Pending & Rejected
                {pendingRejectedApps.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {pendingRejectedApps.length}
                  </Badge>
                )}
                {rejectedAppsCount > 0 && (
                  <Badge variant="destructive" className="ml-1">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {rejectedAppsCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="drafts" className="flex items-center gap-2">
                <FileEdit className="w-4 h-4" />
                Drafts
                {draftApps.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {draftApps.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Published Tab */}
            <TabsContent value="published">
              {publishedApps.length === 0 ? (
                <EmptyState
                  icon={CheckCircle}
                  title="No published apps"
                  description="You don't have any published apps yet. Submit an app and wait for admin approval!"
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {publishedApps.map((app) => (
                    <AppCard
                      key={app.id}
                      app={app}
                      onResubmit={resubmitMutation.mutate}
                      isResubmitting={resubmitMutation.isPending}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Pending & Rejected Tab */}
            <TabsContent value="pending">
              {pendingRejectedApps.length === 0 ? (
                <EmptyState
                  icon={Clock}
                  title="No pending or rejected apps"
                  description="All your apps are either published or in drafts."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingRejectedApps.map((app) => (
                    <AppCard
                      key={app.id}
                      app={app}
                      onResubmit={resubmitMutation.mutate}
                      isResubmitting={resubmitMutation.isPending}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Drafts Tab */}
            <TabsContent value="drafts">
              {draftApps.length === 0 ? (
                <EmptyState
                  icon={FileEdit}
                  title="No draft apps"
                  description="You don't have any draft apps. Create a new app to get started!"
                  actionLabel="Submit New App"
                  onAction={() => setLocation("/submit")}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {draftApps.map((app) => (
                    <AppCard
                      key={app.id}
                      app={app}
                      onResubmit={resubmitMutation.mutate}
                      isResubmitting={resubmitMutation.isPending}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
