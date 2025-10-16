import { useState, useEffect } from "react";
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
import { Star, User as UserIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Review, User as UserType } from "@shared/schema";

interface ReviewWithUser extends Review {
  user?: UserType;
}

interface ReviewSectionProps {
  appId: string;
  creatorId?: string | null;
}

function StarRating({ rating, onRatingChange, readonly = false }: {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
}) {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  
  const displayRating = !readonly && hoveredStar !== null ? hoveredStar : rating;
  
  return (
    <div className="flex gap-1" onMouseLeave={() => setHoveredStar(null)}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onRatingChange?.(star)}
          onMouseEnter={() => !readonly && setHoveredStar(star)}
          disabled={readonly}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer hover-elevate'} transition-transform active-elevate-2 rounded-sm`}
          data-testid={`star-${star}`}
        >
          <Star
            className={`h-4 w-4 transition-colors ${
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

export function ReviewSection({ appId, creatorId }: ReviewSectionProps) {
  const { user, isAuthenticated, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  const { data: reviews = [] } = useQuery<ReviewWithUser[]>({
    queryKey: ["/api/apps", appId, "reviews"],
  });

  const { data: ratingData } = useQuery<{ averageRating: number | null }>({
    queryKey: ["/api/apps", appId, "rating"],
  });

  const userReview = reviews.find((review) => review.userId === user?.id);
  const isCreator = user?.id === creatorId;
  const avgRating = ratingData?.averageRating;

  // Populate form with existing review when editing
  useEffect(() => {
    if (userReview && isDialogOpen) {
      setRating(userReview.rating);
      setReviewText(userReview.body || "");
    } else if (!userReview && isDialogOpen) {
      setRating(0);
      setReviewText("");
    }
  }, [userReview, isDialogOpen]);

  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      if (rating < 1) {
        throw new Error("Please select a rating (minimum 1 star)");
      }
      const response = await apiRequest("POST", "/api/reviews", {
        appId,
        rating,
        body: reviewText.trim() || undefined,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: userReview ? "Review Updated" : "Review Submitted",
        description: "Thank you for your feedback!",
      });
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/apps", appId, "reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/apps", appId, "rating"] });
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Please log in to submit a review.",
          variant: "destructive",
        });
        setIsDialogOpen(false);
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

  const handleOpenDialog = () => {
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
    setIsDialogOpen(true);
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-heading font-bold mb-6">Reviews & Ratings</h2>

      {/* Average Rating */}
      {avgRating !== null && avgRating !== undefined && reviews.length > 0 && (
        <div className="mb-6 pb-6 border-b">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-4xl font-bold" data-testid="text-average-rating">
                {avgRating.toFixed(1)}<span className="text-lg text-muted-foreground">/10</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
              </div>
            </div>
            <StarRating rating={Math.round(avgRating)} readonly />
          </div>
        </div>
      )}

      {/* Rate Button or User's Rating */}
      {isAuthenticated ? (
        isCreator ? (
          <div className="mb-6 pb-6 border-b">
            <p className="text-sm text-muted-foreground">
              You cannot rate your own app.
            </p>
          </div>
        ) : userReview ? (
          <div className="mb-6 pb-6 border-b">
            <button
              onClick={handleOpenDialog}
              className="flex items-center gap-2 hover-elevate active-elevate-2 px-3 py-2 rounded-md transition-all"
              data-testid="button-edit-rating"
            >
              <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
              <span className="text-lg font-semibold">{userReview.rating}/10</span>
            </button>
            <p className="text-xs text-muted-foreground mt-2">
              Click to edit your rating
            </p>
          </div>
        ) : (
          <div className="mb-6 pb-6 border-b">
            <button
              onClick={handleOpenDialog}
              className="flex items-center gap-2 text-primary hover-elevate active-elevate-2 px-3 py-2 rounded-md transition-all"
              data-testid="button-rate"
            >
              <Star className="h-5 w-5" />
              <span className="font-medium">Rate</span>
            </button>
          </div>
        )
      ) : (
        <div className="mb-6 pb-6 border-b">
          <p className="text-sm text-muted-foreground mb-3">
            Please log in to write a review.
          </p>
          <Button size="sm" data-testid="button-login-to-review" onClick={signInWithGoogle}>
            Log In to Review
          </Button>
        </div>
      )}

      {/* Rating Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]" data-testid="dialog-rate">
          <DialogHeader>
            <DialogTitle>{userReview ? "Edit Your Review" : "Write a Review"}</DialogTitle>
            <DialogDescription>
              Share your experience with this app
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Your Rating *</label>
              <StarRating rating={rating} onRatingChange={setRating} />
              <p className="text-sm text-muted-foreground mt-2">
                {rating === 0 ? "Click a star to rate" : `${rating}/10 stars`}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Your Review (Optional)</label>
              <Textarea
                placeholder="Share your thoughts about this app..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                maxLength={1000}
                rows={4}
                data-testid="textarea-review"
              />
              <div className="text-xs text-muted-foreground mt-1">
                {reviewText.length}/1000 characters
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                data-testid="button-cancel-review"
              >
                Cancel
              </Button>
              <Button
                onClick={() => submitReviewMutation.mutate()}
                disabled={submitReviewMutation.isPending}
                data-testid="button-submit-review"
              >
                {submitReviewMutation.isPending ? "Submitting..." : userReview ? "Update Review" : "Submit Review"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.filter(review => review.body).length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No reviews yet. Be the first to review this app!
          </p>
        ) : (
          reviews.filter(review => review.body).map((review) => (
            <div key={review.id} className="border-b last:border-0 pb-4 last:pb-0" data-testid={`review-${review.id}`}>
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={review.user?.profilePictureUrl || undefined} />
                  <AvatarFallback>
                    <UserIcon className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <p className="font-medium" data-testid={`review-author-${review.id}`}>
                        {review.user?.name?.split(" ")[0] || review.user?.email || "Anonymous"}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <StarRating rating={review.rating} readonly />
                        <span className="text-xs text-muted-foreground">
                          {review.createdAt && formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
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
