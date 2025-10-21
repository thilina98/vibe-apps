import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import type { AppListing } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { User as UserIcon, Mail, Calendar, LayoutGrid, ArrowLeft } from "lucide-react";

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: userApps, isLoading: appsLoading } = useQuery<AppListing[]>({
    queryKey: [`/api/apps?creatorId=${user?.id}`],
    enabled: !!user?.id,
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

  const publishedApps = userApps?.filter(app => app.status === 'published') || [];
  const draftApps = userApps?.filter(app => app.status === 'draft') || [];
  const totalLaunches = userApps?.reduce((sum, app) => sum + (app.launchCount || 0), 0) || 0;
  const joinDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  }) : 'Unknown';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-display font-bold">My Profile</h1>
            <Link href="/">
              <Button variant="outline" data-testid="button-back-home">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Profile Card */}
          <Card className="p-8">
            <div className="flex items-start gap-6">
              <Avatar className="h-24 w-24" data-testid="avatar-profile">
                <AvatarImage src={user.profileImageUrl || undefined} />
                <AvatarFallback className="text-2xl">
                  <UserIcon className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-2xl font-heading font-bold mb-1" data-testid="text-user-name">
                    {user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user.firstName || user.name || "User"}
                  </h2>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span data-testid="text-user-email">{user.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {joinDate}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Apps</p>
                  <p className="text-3xl font-bold" data-testid="stat-total-apps">
                    {userApps?.length || 0}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <LayoutGrid className="w-6 h-6 text-primary" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Published</p>
                  <p className="text-3xl font-bold text-green-600" data-testid="stat-published-apps">
                    {publishedApps.length}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-600/10 flex items-center justify-center">
                  <LayoutGrid className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Launches</p>
                  <p className="text-3xl font-bold text-blue-600" data-testid="stat-total-launches">
                    {totalLaunches}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-600/10 flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-heading font-semibold mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <Link href="/my-apps">
                <Button variant="outline" data-testid="button-view-my-apps">
                  <LayoutGrid className="w-4 h-4 mr-2" />
                  View My Apps
                </Button>
              </Link>
              <Link href="/submit">
                <Button variant="outline" data-testid="button-submit-app">
                  Submit New App
                </Button>
              </Link>
              <Link href="/explore">
                <Button variant="outline" data-testid="button-explore">
                  Explore Apps
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
