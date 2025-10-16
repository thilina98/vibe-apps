import { Switch, Route, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import HomePage from "@/pages/HomePage";
import SubmitAppPage from "@/pages/SubmitAppPage";
import AppDetailPage from "@/pages/AppDetailPage";
import EditAppPage from "@/pages/EditAppPage";
import NotFound from "@/pages/not-found";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogIn, LogOut, User as UserIcon } from "lucide-react";
import type { User } from "@shared/schema";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/submit" component={SubmitAppPage} />
      <Route path="/app/:id/edit" component={EditAppPage} />
      <Route path="/app/:id" component={AppDetailPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function Header() {
  const { user, isLoading, isAuthenticated, signInWithGoogle, signOut } = useAuth();

  return (
    <header className="border-b bg-card/50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-heading font-bold text-primary hover-elevate active-elevate-2 px-3 py-1 rounded-md" data-testid="link-home">
            Vibecoded Apps
          </Link>
        </div>
        
        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="h-9 w-20 bg-muted animate-pulse rounded-md" />
          ) : isAuthenticated && user ? (
            <>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8" data-testid="avatar-user">
                  <AvatarImage src={user?.profileImageUrl || undefined} />
                  <AvatarFallback>
                    <UserIcon className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-secondary-foreground hidden sm:inline" data-testid="text-username">
                  {user?.firstName || user?.email || "User"}
                </span>
              </div>
              <Button variant="outline" size="sm" data-testid="button-logout" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
            <Button variant="default" size="sm" data-testid="button-login" onClick={signInWithGoogle}>
              <LogIn className="h-4 w-4 mr-2" />
              Login with Google
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Router />
          </main>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
