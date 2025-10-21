import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { AppListing } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AppApprovalCard } from "@/components/AppApprovalCard";
import { Shield, ArrowLeft, RotateCcw, Trash2, MessageSquare, Star } from "lucide-react";

interface DeletedComment {
  id: string;
  content: string;
  appId: string;
  userId: string | null;
  parentCommentId: string | null;
  deletedAt: string;
  deletedBy: string | null;
  createdAt: string;
  user: { name: string; email: string } | null;
  app: { id: string; name: string } | null;
}

interface DeletedReview {
  id: string;
  appId: string;
  userId: string;
  rating: number;
  title: string | null;
  body: string | null;
  deletedAt: string;
  deletedBy: string | null;
  createdAt: string;
  updatedAt: string;
  user: { name: string; email: string } | null;
  app: { id: string; name: string } | null;
}

export default function AdminPortalPage() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      setLocation("/");
    }
  }, [user, isAdmin, authLoading, setLocation, toast]);

  // Fetch pending apps
  const { data: pendingApps, isLoading: pendingLoading } = useQuery<AppListing[]>({
    queryKey: ["/api/admin/apps?status=pending_approval"],
    enabled: isAdmin,
  });

  // Fetch rejected apps
  const { data: rejectedApps, isLoading: rejectedLoading } = useQuery<AppListing[]>({
    queryKey: ["/api/admin/apps?status=rejected"],
    enabled: isAdmin,
  });

  // Fetch deleted comments
  const { data: deletedComments, isLoading: commentsLoading } = useQuery<DeletedComment[]>({
    queryKey: ["/api/admin/deleted-comments"],
    enabled: isAdmin,
  });

  // Fetch deleted reviews
  const { data: deletedReviews, isLoading: reviewsLoading } = useQuery<DeletedReview[]>({
    queryKey: ["/api/admin/deleted-reviews"],
    enabled: isAdmin,
  });

  // Approve app mutation
  const approveMutation = useMutation({
    mutationFn: async (appId: string) => {
      const response = await apiRequest("POST", `/api/admin/apps/${appId}/approve`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/apps?status=pending_approval"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/apps?status=rejected"] });
      toast({
        title: "Success",
        description: "App approved and published",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve app",
        variant: "destructive",
      });
    },
  });

  // Reject app mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ appId, reason }: { appId: string; reason?: string }) => {
      const response = await apiRequest("POST", `/api/admin/apps/${appId}/reject`, { reason });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/apps?status=pending_approval"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/apps?status=rejected"] });
      toast({
        title: "Success",
        description: "App rejected",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reject app",
        variant: "destructive",
      });
    },
  });

  // Restore comment mutation
  const restoreCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const response = await apiRequest("POST", `/api/admin/comments/${commentId}/restore`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/deleted-comments"] });
      toast({
        title: "Success",
        description: "Comment restored (including all replies)",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to restore comment",
        variant: "destructive",
      });
    },
  });

  // Restore review mutation
  const restoreReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const response = await apiRequest("POST", `/api/admin/reviews/${reviewId}/restore`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/deleted-reviews"] });
      toast({
        title: "Success",
        description: "Review restored",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to restore review",
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

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-display font-bold">Admin Portal</h1>
            </div>
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
          <p className="text-muted-foreground">
            Manage app submissions, comments, and reviews
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending">
              Pending Approval
              {pendingApps && pendingApps.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {pendingApps.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected Apps
              {rejectedApps && rejectedApps.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {rejectedApps.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="comments">
              Deleted Comments
              {deletedComments && deletedComments.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {deletedComments.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="reviews">
              Deleted Reviews
              {deletedReviews && deletedReviews.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {deletedReviews.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Pending Approval Tab */}
          <TabsContent value="pending" className="mt-6">
            {pendingLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-96 bg-card rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : !pendingApps || pendingApps.length === 0 ? (
              <Card className="p-12 text-center">
                <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No pending apps</h3>
                <p className="text-muted-foreground">
                  All submissions have been reviewed
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {pendingApps.map((app) => (
                  <AppApprovalCard
                    key={app.id}
                    app={app}
                    onApprove={(id) => approveMutation.mutate(id)}
                    onReject={(id, reason) => rejectMutation.mutate({ appId: id, reason })}
                    isLoading={approveMutation.isPending || rejectMutation.isPending}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Rejected Apps Tab */}
          <TabsContent value="rejected" className="mt-6">
            {rejectedLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-96 bg-card rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : !rejectedApps || rejectedApps.length === 0 ? (
              <Card className="p-12 text-center">
                <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No rejected apps</h3>
                <p className="text-muted-foreground">
                  No apps have been rejected
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {rejectedApps.map((app) => (
                  <AppApprovalCard
                    key={app.id}
                    app={app}
                    onApprove={(id) => approveMutation.mutate(id)}
                    onReject={(id, reason) => rejectMutation.mutate({ appId: id, reason })}
                    isLoading={approveMutation.isPending || rejectMutation.isPending}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Deleted Comments Tab */}
          <TabsContent value="comments" className="mt-6">
            {commentsLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-32 bg-card rounded-lg animate-pulse" />
                ))}
              </div>
            ) : !deletedComments || deletedComments.length === 0 ? (
              <Card className="p-12 text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No deleted comments</h3>
                <p className="text-muted-foreground">
                  No comments have been deleted
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {deletedComments.map((comment) => (
                  <Card key={comment.id} className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">
                            {comment.parentCommentId ? "Reply" : "Comment"}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            by {comment.user?.name || "Deleted User"}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            on {comment.app?.name || "Unknown App"}
                          </span>
                        </div>
                        <p className="text-sm mb-2">{comment.content}</p>
                        <p className="text-xs text-muted-foreground">
                          Deleted: {new Date(comment.deletedAt).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => restoreCommentMutation.mutate(comment.id)}
                        disabled={restoreCommentMutation.isPending}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Restore
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Deleted Reviews Tab */}
          <TabsContent value="reviews" className="mt-6">
            {reviewsLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-32 bg-card rounded-lg animate-pulse" />
                ))}
              </div>
            ) : !deletedReviews || deletedReviews.length === 0 ? (
              <Card className="p-12 text-center">
                <Star className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No deleted reviews</h3>
                <p className="text-muted-foreground">
                  No reviews have been deleted
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {deletedReviews.map((review) => (
                  <Card key={review.id} className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            by {review.user?.name || "Deleted User"}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            on {review.app?.name || "Unknown App"}
                          </span>
                        </div>
                        {review.title && (
                          <p className="font-medium mb-1">{review.title}</p>
                        )}
                        {review.body && <p className="text-sm mb-2">{review.body}</p>}
                        <p className="text-xs text-muted-foreground">
                          Deleted: {new Date(review.deletedAt).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => restoreReviewMutation.mutate(review.id)}
                        disabled={restoreReviewMutation.isPending}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Restore
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
