import { Switch, Route, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import HomePage from "@/pages/HomePage";
import ExplorePage from "@/pages/ExplorePage";
import AboutPage from "@/pages/AboutPage";
import SubmitAppPage from "@/pages/SubmitAppPage";
import AppDetailPage from "@/pages/AppDetailPage";
import EditAppPage from "@/pages/EditAppPage";
import MyAppsPage from "@/pages/MyAppsPage";
import ProfilePage from "@/pages/ProfilePage";
import AdminPortalPage from "@/pages/AdminPortalPage";
import TermsPage from "@/pages/TermsPage";
import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage";
import NotFound from "@/pages/not-found";
import { useAuth } from "@/hooks/useAuth";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogIn, LogOut, User as UserIcon, LayoutGrid, Shield, Plus } from "lucide-react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/explore" component={ExplorePage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/submit" component={SubmitAppPage} />
      <Route path="/my-apps" component={MyAppsPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/admin" component={AdminPortalPage} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/privacy" component={PrivacyPolicyPage} />
      <Route path="/app/:id/edit" component={EditAppPage} />
      <Route path="/app/:id" component={AppDetailPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function Header() {
  const { user, isLoading, isAuthenticated, isAdmin, signInWithGoogle, signOut } = useAuth();

  const getDisplayName = () => {
    const name = user?.name || user?.email?.split('@')[0] || "User";
    return name.split(' ')[0].charAt(0).toUpperCase() + name.split(' ')[0].slice(1);
  };

  return (
    <header className="border-b bg-card/50">
      <div className="container mx-auto max-w-[1760px] px-[15px] py-3 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 text-3xl font-heading font-bold text-black hover-elevate active-elevate-2 px-3 py-1 rounded-md" data-testid="link-home">
            <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
            Resonance
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/explore" className="text-sm font-medium text-secondary-foreground hover:text-primary transition-colors" data-testid="link-explore">
              Explore
            </Link>
            <Link href="/about" className="text-sm font-medium text-secondary-foreground hover:text-primary transition-colors" data-testid="link-about">
              About
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="h-9 w-20 bg-muted animate-pulse rounded-md" />
          ) : isAuthenticated && user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer" data-testid="button-user-menu">
                    <Avatar className="h-8 w-8" data-testid="avatar-user">
                      <AvatarImage src={user?.profilePictureUrl || undefined} />
                      <AvatarFallback>
                        <UserIcon className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center cursor-pointer">
                      <UserIcon className="h-4 w-4 mr-2" />
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/my-apps" className="flex items-center cursor-pointer">
                      <LayoutGrid className="h-4 w-4 mr-2" />
                      My Apps
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center cursor-pointer text-primary">
                          <Shield className="h-4 w-4 mr-2" />
                          Admin Portal
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="cursor-pointer" data-testid="menuitem-logout">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Link href="/submit">
                <Button size="sm" data-testid="button-submit-app-header">
                  <Plus className="w-4 h-4 mr-2" />
                  Submit Your App
                </Button>
              </Link>
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
          <Footer />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
