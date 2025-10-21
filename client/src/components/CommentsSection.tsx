import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Reply, User as UserIcon, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Comment, User as UserType } from "@shared/schema";

interface CommentWithUser extends Comment {
  user?: UserType | null;
  replies?: CommentWithUser[];
}

interface CommentsSectionProps {
  appId: string;
}

function CommentItem({
  comment,
  onReply,
  onDelete,
  isAdmin,
  isReply = false
}: {
  comment: CommentWithUser;
  onReply: (commentId: string) => void;
  onDelete: (commentId: string) => void;
  isAdmin: boolean;
  isReply?: boolean;
}) {
  const userName = comment.user
    ? comment.user.name || comment.user.email
    : "Deleted User";

  return (
    <div className={`${isReply ? 'ml-12' : ''}`} data-testid={`comment-${comment.id}`}>
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.user?.profilePictureUrl || undefined} />
          <AvatarFallback>
            <UserIcon className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-medium text-sm" data-testid={`comment-author-${comment.id}`}>
              {userName}
            </p>
            <span className="text-xs text-muted-foreground">
              {comment.createdAt && formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
          </div>
          <p className="text-sm text-foreground mb-2" data-testid={`comment-text-${comment.id}`}>
            {comment.content}
          </p>
          <div className="flex items-center gap-2">
            {!isReply && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => onReply(comment.id)}
                data-testid={`button-reply-${comment.id}`}
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
            )}
            {isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                onClick={() => onDelete(comment.id)}
                data-testid={`button-delete-${comment.id}`}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Render replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} onReply={onReply} onDelete={onDelete} isAdmin={isAdmin} isReply />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentsSection({ appId }: CommentsSectionProps) {
  const { user, isAuthenticated, isAdmin, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const [commentText, setCommentText] = useState("");
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const lastDeletedCommentId = useRef<string | null>(null);

  const { data: comments = [] } = useQuery<CommentWithUser[]>({
    queryKey: ["/api/apps", appId, "comments"],
  });

  // Organize comments into parent-child structure
  const organizedComments = comments.reduce((acc, comment) => {
    if (!comment.parentCommentId) {
      // This is a top-level comment
      const replies = comments.filter(c => c.parentCommentId === comment.id);
      acc.push({ ...comment, replies });
    }
    return acc;
  }, [] as CommentWithUser[]);

  const addCommentMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/apps/${appId}/comments`, {
        content: commentText.trim(),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Comment Added",
        description: "Your comment has been posted!",
      });
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["/api/apps", appId, "comments"] });
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Please log in to add a comment.",
          variant: "destructive",
        });
        setTimeout(() => {
          signInWithGoogle();
        }, 500);
        return;
      }
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add comment. Please try again.",
      });
    },
  });

  const addReplyMutation = useMutation({
    mutationFn: async () => {
      if (!replyingToId) return;
      const response = await apiRequest("POST", `/api/apps/${appId}/comments`, {
        content: replyText.trim(),
        parentCommentId: replyingToId,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Reply Added",
        description: "Your reply has been posted!",
      });
      setReplyText("");
      setReplyingToId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/apps", appId, "comments"] });
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Please log in to reply.",
          variant: "destructive",
        });
        setTimeout(() => {
          signInWithGoogle();
        }, 500);
        return;
      }
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add reply. Please try again.",
      });
    },
  });

  const handleReply = (commentId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "Please log in to reply.",
        variant: "destructive",
      });
      setTimeout(() => {
        signInWithGoogle();
      }, 500);
      return;
    }
    setReplyingToId(commentId);
  };

  // Admin delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const response = await apiRequest("DELETE", `/api/admin/comments/${commentId}`, {});
      return response.json();
    },
    onSuccess: (_, commentId) => {
      lastDeletedCommentId.current = commentId;
      queryClient.invalidateQueries({ queryKey: ["/api/apps", appId, "comments"] });

      // Show toast with undo button
      toast({
        title: "Comment Deleted",
        description: "Comment and all replies have been hidden.",
        action: (
          <Button
            size="sm"
            variant="outline"
            onClick={() => restoreCommentMutation.mutate(commentId)}
          >
            Undo
          </Button>
        ),
        duration: 30000, // 30 seconds
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
    },
  });

  // Admin restore comment mutation
  const restoreCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const response = await apiRequest("POST", `/api/admin/comments/${commentId}/restore`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/apps", appId, "comments"] });
      toast({
        title: "Comment Restored",
        description: "Comment and all replies have been restored.",
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

  const handleDeleteComment = (commentId: string) => {
    deleteCommentMutation.mutate(commentId);
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-heading font-bold mb-6 flex items-center gap-2">
        <MessageCircle className="h-6 w-6" />
        Comments ({organizedComments.length})
      </h2>

      {/* Add Comment Form */}
      {isAuthenticated ? (
        <div className="mb-6 pb-6 border-b">
          <div className="space-y-3">
            <Textarea
              placeholder="Share your thoughts about this app..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              maxLength={1000}
              rows={3}
              data-testid="textarea-comment"
            />
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                {commentText.length}/1000 characters
              </div>
              <Button
                onClick={() => addCommentMutation.mutate()}
                disabled={addCommentMutation.isPending || !commentText.trim()}
                data-testid="button-submit-comment"
              >
                {addCommentMutation.isPending ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 pb-6 border-b">
          <p className="text-sm text-muted-foreground mb-3">
            Please log in to add a comment.
          </p>
          <Button size="sm" data-testid="button-login-to-comment" onClick={signInWithGoogle}>
            Log In to Comment
          </Button>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {organizedComments.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No comments yet. Be the first to share your thoughts!
          </p>
        ) : (
          organizedComments.map((comment) => (
            <div key={comment.id} className="border-b last:border-0 pb-4 last:pb-0">
              <CommentItem comment={comment} onReply={handleReply} onDelete={handleDeleteComment} isAdmin={isAdmin} />
              
              {/* Reply Form */}
              {replyingToId === comment.id && (
                <div className="ml-12 mt-3 space-y-3">
                  <Textarea
                    placeholder="Write your reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    maxLength={1000}
                    rows={2}
                    data-testid={`textarea-reply-${comment.id}`}
                  />
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      {replyText.length}/1000 characters
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setReplyingToId(null);
                          setReplyText("");
                        }}
                        data-testid={`button-cancel-reply-${comment.id}`}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => addReplyMutation.mutate()}
                        disabled={addReplyMutation.isPending || !replyText.trim()}
                        data-testid={`button-submit-reply-${comment.id}`}
                      >
                        {addReplyMutation.isPending ? "Posting..." : "Post Reply"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
