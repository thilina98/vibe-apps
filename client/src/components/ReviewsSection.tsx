import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Star, User as UserIcon, Pencil, Trash2, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Review, User as UserType } from "@shared/schema";

interface ReviewWithUser extends Review {
  user?: UserType;
}

interface ReviewsSectionProps {
  appId: string;
  creatorId?: string | null;
}

function StarRating({ rating, onRatingChange }: {
  rating: number;
  onRatingChange?: (rating: number) => void;
}) {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  
  const displayRating = hoveredStar !== null ? hoveredStar : rating;
  
  return (
    <div className="flex gap-1" onMouseLeave={() => setHoveredStar(null)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRatingChange?.(star)}
          onMouseEnter={() => setHoveredStar(star)}
          className="cursor-pointer hover-elevate transition-transform active-elevate-2 rounded-sm"
          data-testid={`review-star-${star}`}
        >
          <Star
            className={`h-5 w-5 transition-colors ${
              star <= displayRating
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export function ReviewsSection({ appId, creatorId }: ReviewsSectionProps) {
  const { user, isAuthenticated, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);

  const { data: reviews = [] } = useQuery<ReviewWithUser[]>({
    queryKey: ["/api/apps", appId, "reviews"],
  });

  const userReview = reviews.find((review) => review.userId === user?.id);
  const isCreator = user?.id === creatorId;
  const reviewsWithText = reviews.filter(review => review.body);

  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      if (!reviewText.trim()) {
        throw new Error("Please enter a review");
      }
      if (rating < 1) {
        throw new Error("Please select a rating (minimum 1 star)");
      }
      
      const response = await apiRequest("POST", "/api/reviews", {
        appId,
        body: reviewText.trim(),
        rating: rating,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: editingReviewId ? "Review Updated" : "Review Submitted",
        description: "Thank you for your feedback!",
      });
      setIsReviewDialogOpen(false);
      setReviewText("");
      setEditingReviewId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/apps", appId, "reviews"] });
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Please log in to submit a review.",
          variant: "destructive",
        });
        setIsReviewDialogOpen(false);
        setTimeout(() => {
          signInWithGoogle();
        }, 500);
        return;
      }
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to submit review. Please try again.",
      });
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/reviews/${appId}?deleteRating=false`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Review Deleted",
        description: "Your review has been deleted, but your rating remains.",
      });
      setIsDeleteDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/apps", appId, "reviews"] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete review. Please try again.",
      });
    },
  });

  const handleOpenReviewDialog = (edit = false) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to write a review.",
        variant: "destructive",
      });
      setTimeout(() => {
        signInWithGoogle();
      }, 500);
      return;
    }

    if (edit && userReview?.body) {
      setReviewText(userReview.body);
      setRating(userReview.rating);
      setEditingReviewId(userReview.id);
    } else {
      setReviewText("");
      setRating(userReview?.rating || 0);
      setEditingReviewId(null);
    }
    setIsReviewDialogOpen(true);
  };

  return (
    <Card className="p-6" id="reviews-section">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-heading font-bold">Reviews</h2>
        {isAuthenticated && !isCreator && (
          <Button
            onClick={() => handleOpenReviewDialog(false)}
            size="sm"
            data-testid="button-add-review"
          >
            <Plus className="h-4 w-4 mr-2" />
            Review
          </Button>
        )}
      </div>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]" data-testid="dialog-review">
          <DialogHeader>
            <DialogTitle>{editingReviewId ? "Edit Your Review" : "Write a Review"}</DialogTitle>
            <DialogDescription>
              Share your experience with this app
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Your Rating</label>
              <StarRating rating={rating} onRatingChange={setRating} />
              <p className="text-sm text-muted-foreground mt-2">
                {rating === 0 ? "Click a star to rate" : `${rating}/5`}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Your Review</label>
              <Textarea
                placeholder="Share your thoughts about this app..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                maxLength={1000}
                rows={5}
                data-testid="textarea-review"
              />
              <div className="text-xs text-muted-foreground mt-1">
                {reviewText.length}/500 characters
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsReviewDialogOpen(false)}
                data-testid="button-cancel-review"
              >
                Cancel
              </Button>
              <Button
                onClick={() => submitReviewMutation.mutate()}
                disabled={submitReviewMutation.isPending || !reviewText.trim() || rating < 1}
                data-testid="button-submit-review"
              >
                {submitReviewMutation.isPending ? "Submitting..." : editingReviewId ? "Update Review" : "Submit Review"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent data-testid="dialog-delete-review">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your review? Your rating will remain. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteReviewMutation.mutate()}
              disabled={deleteReviewMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteReviewMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviewsWithText.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No reviews yet. Be the first to review this app!
          </p>
        ) : (
          reviewsWithText.map((review) => (
            <div key={review.id} className="border-b last:border-0 pb-4 last:pb-0" data-testid={`review-${review.id}`}>
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={review.user?.profilePictureUrl || undefined} />
                  <AvatarFallback>
                    <UserIcon className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1">
                      <p className="font-medium" data-testid={`review-author-${review.id}`}>
                        {review.user?.name?.split(" ")[0] || review.user?.email || "Anonymous"}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{review.rating}/5</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {review.createdAt && formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    {review.userId === user?.id && (
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenReviewDialog(true)}
                          data-testid="button-edit-review"
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsDeleteDialogOpen(true)}
                          data-testid="button-delete-review"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                  {review.body && (
                    <p className="text-sm text-secondary-foreground mt-2" data-testid={`review-text-${review.id}`}>
                      {review.body}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
