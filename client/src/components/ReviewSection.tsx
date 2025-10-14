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
import { Star, User as UserIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Review, User as UserType } from "@shared/schema";

interface ReviewWithUser extends Review {
  user?: UserType;
}

interface ReviewSectionProps {
  appId: string;
}

function StarRating({ rating, onRatingChange, readonly = false }: {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onRatingChange?.(star)}
          disabled={readonly}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer hover-elevate'} transition-transform active-elevate-2 rounded-sm`}
          data-testid={`star-${star}`}
        >
          <Star
            className={`h-5 w-5 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export function ReviewSection({ appId }: ReviewSectionProps) {
  const { user, isAuthenticated } = useAuth() as { 
    user: UserType | undefined; 
    isAuthenticated: boolean;
  };
  const { toast } = useToast();
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  const { data: reviews = [] } = useQuery<ReviewWithUser[]>({
    queryKey: ["/api/apps", appId, "reviews"],
  });

  const { data: ratingData } = useQuery<{ averageRating: number | null }>({
    queryKey: ["/api/apps", appId, "rating"],
  });

  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/reviews", {
        appId,
        rating,
        reviewText: reviewText.trim() || undefined,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!",
      });
      setRating(5);
      setReviewText("");
      queryClient.invalidateQueries({ queryKey: ["/api/apps", appId, "reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/apps", appId, "rating"] });
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
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

  const userAlreadyReviewed = reviews.some((review) => review.userId === user?.id);
  const avgRating = ratingData?.averageRating;

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-heading font-bold mb-6">Reviews & Ratings</h2>

      {/* Average Rating */}
      {avgRating !== null && avgRating !== undefined && reviews.length > 0 && (
        <div className="mb-6 pb-6 border-b">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-4xl font-bold" data-testid="text-average-rating">
                {avgRating.toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">
                {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
              </div>
            </div>
            <StarRating rating={Math.round(avgRating)} readonly />
          </div>
        </div>
      )}

      {/* Submit Review Form */}
      {isAuthenticated ? (
        !userAlreadyReviewed ? (
          <div className="mb-6 pb-6 border-b">
            <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Your Rating</label>
                <StarRating rating={rating} onRatingChange={setRating} />
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
              <Button
                onClick={() => submitReviewMutation.mutate()}
                disabled={submitReviewMutation.isPending}
                data-testid="button-submit-review"
              >
                {submitReviewMutation.isPending ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="mb-6 pb-6 border-b">
            <p className="text-sm text-muted-foreground">
              You have already reviewed this app.
            </p>
          </div>
        )
      ) : (
        <div className="mb-6 pb-6 border-b">
          <p className="text-sm text-muted-foreground mb-3">
            Please log in to write a review.
          </p>
          <a href="/api/login">
            <Button size="sm" data-testid="button-login-to-review">Log In to Review</Button>
          </a>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No reviews yet. Be the first to review this app!
          </p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b last:border-0 pb-4 last:pb-0" data-testid={`review-${review.id}`}>
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={review.user?.profileImageUrl || undefined} />
                  <AvatarFallback>
                    <UserIcon className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <p className="font-medium" data-testid={`review-author-${review.id}`}>
                        {review.user?.firstName || review.user?.email || "Anonymous"}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <StarRating rating={review.rating} readonly />
                        <span className="text-xs text-muted-foreground">
                          {review.createdAt && formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                  {review.reviewText && (
                    <p className="text-sm text-secondary-foreground mt-2" data-testid={`review-text-${review.id}`}>
                      {review.reviewText}
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
