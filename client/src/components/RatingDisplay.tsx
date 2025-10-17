import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import type { Review } from "@shared/schema";

interface RatingDisplayProps {
  appId: string;
  appName: string;
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
          data-testid={`star-${star}`}
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

export function RatingDisplay({ appId, appName, creatorId }: RatingDisplayProps) {
  const { user, isAuthenticated, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);
  const [rating, setRating] = useState(0);

  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ["/api/apps", appId, "reviews"],
  });

  const { data: ratingData } = useQuery<{ averageRating: number | null; ratingCount: number }>({
    queryKey: ["/api/apps", appId, "rating"],
  });

  const userReview = reviews.find((review) => review.userId === user?.id);
  const isCreator = user?.id === creatorId;
  const avgRating = ratingData?.averageRating;
  const ratingCount = ratingData?.ratingCount || 0;

  useEffect(() => {
    if (userReview && isRatingDialogOpen) {
      setRating(userReview.rating);
    } else if (!userReview && isRatingDialogOpen) {
      setRating(0);
    }
  }, [userReview, isRatingDialogOpen]);

  const submitRatingMutation = useMutation({
    mutationFn: async (selectedRating: number) => {
      if (selectedRating < 1) {
        throw new Error("Please select a rating (minimum 1 star)");
      }
      const response = await apiRequest("POST", "/api/reviews", {
        appId,
        rating: selectedRating,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: userReview ? "Rating Updated" : "Rating Submitted",
        description: "Thank you for your feedback!",
      });
      setIsRatingDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/apps", appId, "reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/apps", appId, "rating"] });
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Please log in to rate.",
          variant: "destructive",
        });
        setIsRatingDialogOpen(false);
        setTimeout(() => {
          signInWithGoogle();
        }, 500);
        return;
      }
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to submit rating. Please try again.",
      });
    },
  });

  const deleteRatingMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", `/api/reviews/${appId}`, {
        deleteRating: true,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Rating Removed",
        description: "Your rating has been removed.",
      });
      setIsRatingDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/apps", appId, "reviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/apps", appId, "rating"] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to remove rating. Please try again.",
      });
    },
  });

  const handleOpenRatingDialog = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to rate this app.",
        variant: "destructive",
      });
      setTimeout(() => {
        signInWithGoogle();
      }, 500);
      return;
    }
    setIsRatingDialogOpen(true);
  };

  const handleStarClick = (selectedRating: number) => {
    setRating(selectedRating);
    submitRatingMutation.mutate(selectedRating);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        {appName && (
          <h1 className="text-3xl md:text-4xl font-display font-bold" data-testid="text-app-name">
            {appName}
          </h1>
        )}
        
        <div className={`flex items-start gap-0.5 ${!appName ? 'w-full justify-between' : ''}`}>
          {/* App Rating */}
          {avgRating !== null && avgRating !== undefined && (
            <div className="flex flex-col items-center flex-1">
              <div className="text-xs font-medium text-muted-foreground mb-1">APP RATING</div>
              <div className="flex items-start gap-2">
                <Star className="h-6 w-6 fill-yellow-400 text-yellow-400 mt-0.5" />
                <div className="flex flex-col">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold leading-none" data-testid="text-average-rating">
                      {avgRating.toFixed(1)}
                    </span>
                    <span className="text-sm text-muted-foreground">/5</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {ratingCount.toLocaleString()} {ratingCount === 1 ? 'rating' : 'ratings'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* User Rating */}
          {isAuthenticated && !isCreator && (
            <div className="flex flex-col items-center flex-1">
              <div className="text-xs font-medium text-muted-foreground mb-1">YOUR RATING</div>
              <button
                onClick={handleOpenRatingDialog}
                className="flex items-start gap-2 hover-elevate active-elevate-2 px-3 py-2 rounded-md transition-all"
                data-testid="button-rate"
              >
                <Star className={`h-6 w-6 ${userReview ? 'fill-blue-500 text-blue-500' : 'text-muted-foreground'} mt-0.5`} />
                {userReview ? (
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold leading-none">{userReview.rating}</span>
                    <span className="text-sm text-muted-foreground">/5</span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">Rate</span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Rating Dialog */}
      <Dialog open={isRatingDialogOpen} onOpenChange={setIsRatingDialogOpen}>
        <DialogContent className="sm:max-w-[500px]" data-testid="dialog-rate">
          <DialogHeader>
            <DialogTitle>Your Rating</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <StarRating rating={rating} onRatingChange={handleStarClick} />
              <p className="text-sm text-muted-foreground mt-2">
                {rating === 0 ? "Click a star to rate" : `${rating}/5`}
              </p>
            </div>
            <div className="flex gap-2 justify-end pt-4">
              {userReview && (
                <Button
                  variant="outline"
                  onClick={() => deleteRatingMutation.mutate()}
                  disabled={deleteRatingMutation.isPending}
                  data-testid="button-remove-rating"
                >
                  {deleteRatingMutation.isPending ? "Removing..." : "Remove Rating"}
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setIsRatingDialogOpen(false)}
                data-testid="button-cancel-rating"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
