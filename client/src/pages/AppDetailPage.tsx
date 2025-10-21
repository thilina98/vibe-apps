import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Link } from "wouter";
import { AppListing } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ExternalLink, ArrowLeft, Lightbulb, Calendar, User, Tag, Edit } from "lucide-react";
import { getToolColor } from "../lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { RatingDisplay } from "@/components/RatingDisplay";
import { ReviewsSection } from "@/components/ReviewsSection";
import { CommentsSection } from "@/components/CommentsSection";
import { useAuth } from "@/hooks/useAuth";

export default function AppDetailPage() {
  const [, params] = useRoute("/app/:id");
  const [, setLocation] = useLocation();
  const appId = params?.id;
  const { user } = useAuth();

  const { data: app, isLoading } = useQuery<AppListing>({
    queryKey: [`/api/apps/${appId}`],
    enabled: !!appId,
  });

  const isCreator = user?.id === app?.creatorId;

  const launchMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/apps/${appId}/launch`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/apps/${appId}`] });
    },
  });

  const handleLaunch = () => {
    if (app) {
      window.open(app.launchUrl, "_blank", "noopener,noreferrer");
      launchMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-96 bg-card animate-pulse" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="space-y-4">
            <div className="h-8 bg-card rounded animate-pulse w-3/4" />
            <div className="h-4 bg-card rounded animate-pulse w-1/2" />
            <div className="h-32 bg-card rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-display font-semibold mb-4">App not found</h2>
          <Link href="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="relative h-96 overflow-hidden">
        <img
          src={app.previewImageUrl}
          alt={app.name}
          className="w-full h-full object-cover"
          data-testid="img-detail-preview"
        />
        <div className="absolute inset-0 bg-black/50" />
        
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center gap-4 text-sm text-white/90 font-medium">
            <button 
              onClick={() => document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="hover:text-white transition-colors"
              data-testid="link-about"
            >
              About
            </button>
            <span className="text-white/40">•</span>
            <button 
              onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="hover:text-white transition-colors"
              data-testid="link-reviews"
            >
              Reviews
            </button>
            <span className="text-white/40">•</span>
            <button 
              onClick={() => document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="hover:text-white transition-colors"
              data-testid="link-comments"
            >
              Comments
            </button>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 max-w-5xl mx-auto">
          <Card className="p-6 bg-background/95 backdrop-blur-md border">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1 space-y-4">
                <h1 className="text-3xl md:text-4xl font-display font-bold" data-testid="text-app-name">
                  {app.name}
                </h1>
                
                <div className="flex flex-wrap gap-2">
                  {app.vibecodingTools && app.vibecodingTools.map((tool: string) => (
                    <Badge 
                      key={tool}
                      className={getToolColor(tool)}
                      data-testid={`badge-tool-${tool.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {tool}
                    </Badge>
                  ))}
                  <Badge variant="outline" data-testid="badge-category">
                    {app.category}
                  </Badge>
                </div>
              </div>
              
              <div className="flex flex-col gap-3.5 w-[240px]">
                <RatingDisplay 
                  appId={app.id} 
                  appName=""
                  creatorId={app.creatorId}
                />
                
                <div className="flex flex-col gap-2">
                  <Button 
                    size="lg"
                    onClick={handleLaunch}
                    className="bg-chart-2 hover:bg-chart-2/90 text-white font-semibold shadow-lg w-full"
                    data-testid="button-launch-app"
                  >
                    Launch App
                    <ExternalLink className="w-5 h-5 ml-2" />
                  </Button>
                  
                  {isCreator && (
                    <Button 
                      size="lg"
                      variant="outline"
                      onClick={() => setLocation(`/app/${app.id}/edit`)}
                      className="w-full"
                      data-testid="button-edit-app"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit App
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section id="about-section">
              <h2 className="text-2xl font-display font-semibold mb-4">About this app</h2>
              <div className="prose prose-slate max-w-none" data-testid="text-full-description">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {app.fullDescription}
                </ReactMarkdown>
              </div>
            </section>

            {app.keyLearnings && (
              <section>
                <Card className="border-l-4 border-l-primary bg-accent/30 p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <Lightbulb className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <h2 className="text-2xl font-display font-semibold">Key Learnings</h2>
                  </div>
                  <div className="prose prose-slate max-w-none" data-testid="text-key-learnings">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {app.keyLearnings}
                    </ReactMarkdown>
                  </div>
                </Card>
              </section>
            )}
          </div>

          <aside className="space-y-6">
            <Card className="p-6">
              <h3 className="font-display font-semibold mb-4">Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Creator</span>
                  <span className="ml-auto font-medium" data-testid="text-creator-name">{app.creatorName}</span>
                </div>
                {app.creatorContact && !app.creatorContact.includes("@") && (
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Website</span>
                    <a 
                      href={app.creatorContact.startsWith("http") ? app.creatorContact : `https://${app.creatorContact}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-auto hover:text-primary hover:underline"
                      data-testid="text-creator-contact"
                    >
                      Visit
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Created</span>
                  <span className="ml-auto" data-testid="text-created-date">
                    {new Date(app.createdDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Launches</span>
                  <span className="ml-auto font-semibold" data-testid="text-launch-count">{app.launchCount}</span>
                </div>
                {app.tags && app.tags.length > 0 && (
                  <div className="pt-2 mt-2 border-t">
                    <div className="flex items-center gap-2 mb-2">
                      <Tag className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Tags</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {app.tags.map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-xs" data-testid={`badge-tag-${tag}`}>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </aside>
        </div>

        {/* Reviews Section */}
        <div id="reviews-section" className="mt-12">
          <ReviewsSection appId={app.id} creatorId={app.creatorId} />
        </div>

        {/* Comments Section */}
        <div id="comments-section" className="mt-8">
          <CommentsSection appId={app.id} />
        </div>
      </div>
    </div>
  );
}
