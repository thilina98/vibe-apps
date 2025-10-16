// Referenced from javascript_object_storage blueprint (public file uploading)
import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertAppSchema, 
  insertReviewSchema, 
  insertCommentSchema, 
  insertToolSuggestionSchema,
  type Category,
  type Tool,
  type Tag,
  type App,
  type User,
  type AppListing,
} from "@shared/schema";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { isAuthenticated } from "./googleAuth";
import passport from "./googleAuth";

// Helper function to transform App to AppListing format for frontend compatibility
async function transformAppToListing(app: App, includeRelated: boolean = true): Promise<AppListing> {
  let tools: Tool[] = [];
  let tags: Tag[] = [];
  let category: Category | undefined = undefined;
  let creator: User | undefined = undefined;

  if (includeRelated) {
    [tools, tags, category, creator] = await Promise.all([
      storage.getToolsForApp(app.id),
      storage.getTagsForApp(app.id),
      app.categoryId ? storage.getCategoryById(app.categoryId) : Promise.resolve(undefined),
      app.creatorId ? storage.getUserById(app.creatorId) : Promise.resolve(undefined),
    ]);
  }

  return {
    id: app.id,
    name: app.name,
    shortDescription: app.shortDescription,
    fullDescription: app.fullDescription,
    launchUrl: app.launchUrl,
    vibecodingTools: tools.map(t => t.name),
    category: category?.name || "Other",
    creatorName: creator?.name || "Unknown Creator",
    creatorContact: creator?.email || null,
    previewImage: app.screenshotUrl,
    screenshotUrl: app.screenshotUrl,
    tags: tags.map(t => t.name),
    keyLearnings: app.keyLearnings,
    launchCount: app.viewCount,
    createdDate: app.createdAt,
    submissionDate: app.createdAt,
    status: app.status,
    creatorId: app.creatorId || null,
    categoryId: app.categoryId || null,
  };
}

// Admin authorization middleware
function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  const user = req.user as any;
  if (user?.role !== 'admin') {
    return res.status(403).json({ error: "Forbidden: Admin access required" });
  }
  
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {

  const objectStorageService = new ObjectStorageService();

  // ============================================================================
  // GOOGLE OAUTH ROUTES
  // ============================================================================

  app.get('/api/login', passport.authenticate('google', { scope: ['profile', 'email'] }));

  app.get('/api/callback',
    passport.authenticate('google', { 
      failureRedirect: '/',
      successRedirect: '/'
    })
  );

  app.post('/api/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: 'Logout failed' });
      }
      res.json({ success: true });
    });
  });

  // Auth route - returns current user from session
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user;
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // ============================================================================
  // APP ROUTES
  // ============================================================================

  // Get all apps with optional filters
  app.get("/api/apps", async (req, res) => {
    try {
      const { search, tools, category, sortBy, status } = req.query;
      const user = req.user as any;
      
      const filters = {
        search: search as string | undefined,
        toolIds: tools ? (Array.isArray(tools) ? tools : [tools]) as string[] : undefined,
        categoryId: category as string | undefined,
        status: status as "draft" | "published" | undefined,
        sortBy: (sortBy as "newest" | "oldest" | "popular" | "rating") || "newest",
        userId: user?.id, // Pass userId to show user's drafts
      };

      const apps = await storage.getAllApps(filters);
      const appListings = await Promise.all(apps.map(app => transformAppToListing(app)));
      res.json(appListings);
    } catch (error) {
      console.error("Error fetching apps:", error);
      res.status(500).json({ error: "Failed to fetch apps" });
    }
  });

  // Get single app by ID with tools and tags
  app.get("/api/apps/:id", async (req, res) => {
    try {
      const user = req.user as any;
      const app = await storage.getApp(req.params.id, user?.id);
      
      if (!app) {
        return res.status(404).json({ error: "App not found" });
      }

      const appListing = await transformAppToListing(app);
      res.json(appListing);
    } catch (error) {
      console.error("Error fetching app:", error);
      res.status(500).json({ error: "Failed to fetch app" });
    }
  });

  // Create new app (protected - requires authentication)
  app.post("/api/apps", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Extract tools and tags from request body
      const { toolIds, tagNames, ...appData } = req.body;
      
      // Validate app data with default status='draft'
      const validatedData = insertAppSchema.parse({
        ...appData,
        creatorId: userId,
        status: appData.status || 'draft'
      });
      
      const app = await storage.createApp(validatedData);

      // Add tools to app
      if (toolIds && Array.isArray(toolIds)) {
        for (const toolId of toolIds) {
          await storage.addToolToApp(app.id, toolId);
        }
      }

      // Add tags to app (create if they don't exist)
      if (tagNames && Array.isArray(tagNames)) {
        for (const tagName of tagNames) {
          const tag = await storage.getOrCreateTag(tagName);
          await storage.addTagToApp(app.id, tag.id);
        }
      }

      res.status(201).json(app);
    } catch (error: any) {
      console.error("Error creating app:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create app" });
    }
  });

  // Update app (protected - creator only)
  app.patch("/api/apps/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const appId = req.params.id;
      
      // Get existing app
      const existingApp = await storage.getApp(appId, userId);
      
      if (!existingApp) {
        return res.status(404).json({ error: "App not found" });
      }
      
      // Check if user is creator
      if (existingApp.creatorId !== userId) {
        return res.status(403).json({ error: "Forbidden: You don't have permission to update this app" });
      }
      
      // Extract tools and tags from request body
      const { toolIds, tagNames, ...appData } = req.body;
      
      // Validate app data (exclude creatorId and status from update)
      const { creatorId, status, ...dataToUpdate } = appData;
      
      // Update app
      const updatedApp = await storage.updateApp(appId, dataToUpdate);
      
      // Update tools if provided
      if (toolIds !== undefined && Array.isArray(toolIds)) {
        // Get current tools
        const currentTools = await storage.getToolsForApp(appId);
        const currentToolIds = currentTools.map(t => t.id);
        
        // Remove tools that are not in the new list
        for (const toolId of currentToolIds) {
          if (!toolIds.includes(toolId)) {
            await storage.removeToolFromApp(appId, toolId);
          }
        }
        
        // Add new tools
        for (const toolId of toolIds) {
          if (!currentToolIds.includes(toolId)) {
            await storage.addToolToApp(appId, toolId);
          }
        }
      }
      
      // Update tags if provided
      if (tagNames !== undefined && Array.isArray(tagNames)) {
        // Get current tags
        const currentTags = await storage.getTagsForApp(appId);
        const currentTagNames = currentTags.map(t => t.name);
        
        // Remove tags that are not in the new list
        for (const tag of currentTags) {
          if (!tagNames.includes(tag.name)) {
            await storage.removeTagFromApp(appId, tag.id);
          }
        }
        
        // Add new tags
        for (const tagName of tagNames) {
          if (!currentTagNames.includes(tagName)) {
            const tag = await storage.getOrCreateTag(tagName);
            await storage.addTagToApp(appId, tag.id);
          }
        }
      }
      
      const appListing = await transformAppToListing(updatedApp);
      res.json(appListing);
    } catch (error: any) {
      console.error("Error updating app:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update app" });
    }
  });

  // Increment view count (was launch count)
  app.post("/api/apps/:id/launch", async (req, res) => {
    try {
      await storage.incrementViewCount(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error incrementing view count:", error);
      res.status(500).json({ error: "Failed to increment view count" });
    }
  });

  // Update app status (creator or admin only)
  app.patch("/api/apps/:id/status", isAuthenticated, async (req: any, res) => {
    try {
      const { status } = req.body;
      const user = req.user;
      const app = await storage.getApp(req.params.id, user.id);

      if (!app) {
        return res.status(404).json({ error: "App not found" });
      }

      // Check if user is creator or admin
      if (app.creatorId !== user.id && user.role !== 'admin') {
        return res.status(403).json({ error: "Forbidden: You don't have permission to update this app" });
      }

      if (status !== 'draft' && status !== 'published') {
        return res.status(400).json({ error: "Invalid status. Must be 'draft' or 'published'" });
      }

      await storage.updateAppStatus(req.params.id, status);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating app status:", error);
      res.status(500).json({ error: "Failed to update app status" });
    }
  });

  // ============================================================================
  // REVIEW ROUTES
  // ============================================================================
  
  // Get reviews for an app with user info
  app.get("/api/apps/:id/reviews", async (req, res) => {
    try {
      const reviews = await storage.getReviewsByApp(req.params.id);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  // Get average rating for an app (from app table)
  app.get("/api/apps/:id/rating", async (req, res) => {
    try {
      const app = await storage.getApp(req.params.id);
      if (!app) {
        return res.status(404).json({ error: "App not found" });
      }
      res.json({ 
        averageRating: parseFloat(app.averageRating),
        ratingCount: app.ratingCount
      });
    } catch (error) {
      console.error("Error fetching rating:", error);
      res.status(500).json({ error: "Failed to fetch rating" });
    }
  });

  // Create or update a review (protected - requires authentication)
  app.post("/api/reviews", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Get the app to check if user is the creator
      const app = await storage.getApp(req.body.appId, userId);
      if (!app) {
        return res.status(404).json({ error: "App not found" });
      }
      
      // Prevent creators from rating their own apps
      if (app.creatorId === userId) {
        return res.status(403).json({ error: "You cannot rate your own app" });
      }
      
      // Check if user already reviewed this app
      const existingReview = await storage.getUserReviewForApp(req.body.appId, userId);
      
      let review;
      if (existingReview) {
        // Update existing review
        review = await storage.updateReview(
          req.body.appId, 
          userId, 
          req.body.rating, 
          req.body.body
        );
        res.json(review);
      } else {
        // Create new review
        const validatedData = insertReviewSchema.parse({
          ...req.body,
          userId,
        });
        
        review = await storage.createReview(validatedData);
        res.status(201).json(review);
      }
    } catch (error: any) {
      console.error("Error creating/updating review:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Failed to save review" });
    }
  });

  // Delete a review (protected - requires authentication)
  app.delete("/api/reviews/:appId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { appId } = req.params;
      const deleteRating = req.query.deleteRating === 'true';
      
      // Check if user has a review for this app
      const existingReview = await storage.getUserReviewForApp(appId, userId);
      if (!existingReview) {
        return res.status(404).json({ error: "Review not found" });
      }
      
      await storage.deleteReview(appId, userId, deleteRating);
      res.json({ success: true, message: "Review deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting review:", error);
      res.status(500).json({ error: "Failed to delete review" });
    }
  });

  // ============================================================================
  // CATEGORY ROUTES
  // ============================================================================

  // Get all categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  // Create category (admin only)
  app.post("/api/admin/categories", isAdmin, async (req, res) => {
    try {
      const { name } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: "Category name is required" });
      }

      const category = await storage.createCategory({ name });
      res.status(201).json(category);
    } catch (error: any) {
      console.error("Error creating category:", error);
      if (error.code === '23505') { // Unique constraint violation
        return res.status(400).json({ error: "Category already exists" });
      }
      res.status(500).json({ error: "Failed to create category" });
    }
  });

  // ============================================================================
  // TOOL ROUTES
  // ============================================================================

  // Get all tools
  app.get("/api/tools", async (req, res) => {
    try {
      const tools = await storage.getAllTools();
      res.json(tools);
    } catch (error) {
      console.error("Error fetching tools:", error);
      res.status(500).json({ error: "Failed to fetch tools" });
    }
  });

  // Create/update tool (admin only)
  app.post("/api/admin/tools", isAdmin, async (req, res) => {
    try {
      const { name, websiteUrl, logoUrl } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: "Tool name is required" });
      }

      const tool = await storage.createTool({ name, websiteUrl, logoUrl });
      res.status(201).json(tool);
    } catch (error: any) {
      console.error("Error creating tool:", error);
      if (error.code === '23505') { // Unique constraint violation
        return res.status(400).json({ error: "Tool already exists" });
      }
      res.status(500).json({ error: "Failed to create tool" });
    }
  });

  // ============================================================================
  // TAG ROUTES
  // ============================================================================

  // Get all tags
  app.get("/api/tags", async (req, res) => {
    try {
      const tags = await storage.getAllTags();
      res.json(tags);
    } catch (error) {
      console.error("Error fetching tags:", error);
      res.status(500).json({ error: "Failed to fetch tags" });
    }
  });

  // ============================================================================
  // COMMENT ROUTES
  // ============================================================================

  // Create comment (protected - requires authentication)
  app.post("/api/comments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      const validatedData = insertCommentSchema.parse({
        ...req.body,
        userId,
      });
      
      const comment = await storage.createComment(validatedData);
      res.status(201).json(comment);
    } catch (error: any) {
      console.error("Error creating comment:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create comment" });
    }
  });

  // Get comments for an app (top-level and replies)
  app.get("/api/apps/:id/comments", async (req, res) => {
    try {
      const { parentCommentId } = req.query;
      const comments = await storage.getCommentsByApp(
        req.params.id, 
        parentCommentId === 'null' ? null : (parentCommentId as string | undefined)
      );
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  // ============================================================================
  // TOOL SUGGESTION ROUTES
  // ============================================================================

  // Create tool suggestion (protected - requires authentication)
  app.post("/api/tool-suggestions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      const validatedData = insertToolSuggestionSchema.parse({
        ...req.body,
        userId,
      });
      
      const suggestion = await storage.createToolSuggestion(validatedData);
      res.status(201).json(suggestion);
    } catch (error: any) {
      console.error("Error creating tool suggestion:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create tool suggestion" });
    }
  });

  // Get pending tool suggestions (admin only)
  app.get("/api/admin/tool-suggestions", isAdmin, async (req, res) => {
    try {
      const suggestions = await storage.getPendingToolSuggestions();
      res.json(suggestions);
    } catch (error) {
      console.error("Error fetching tool suggestions:", error);
      res.status(500).json({ error: "Failed to fetch tool suggestions" });
    }
  });

  // Approve tool suggestion (admin only)
  app.post("/api/admin/tool-suggestions/:id/approve", isAdmin, async (req, res) => {
    try {
      const { name, websiteUrl, logoUrl } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: "Tool name is required" });
      }

      const tool = await storage.approveToolSuggestion(req.params.id, {
        name,
        websiteUrl,
        logoUrl
      });
      
      res.json(tool);
    } catch (error: any) {
      console.error("Error approving tool suggestion:", error);
      if (error.message === "Tool suggestion not found") {
        return res.status(404).json({ error: "Tool suggestion not found" });
      }
      res.status(500).json({ error: "Failed to approve tool suggestion" });
    }
  });

  // Reject tool suggestion (admin only)
  app.post("/api/admin/tool-suggestions/:id/reject", isAdmin, async (req, res) => {
    try {
      await storage.rejectToolSuggestion(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error rejecting tool suggestion:", error);
      if (error.message === "Tool suggestion not found") {
        return res.status(404).json({ error: "Tool suggestion not found" });
      }
      res.status(500).json({ error: "Failed to reject tool suggestion" });
    }
  });

  // ============================================================================
  // OBJECT STORAGE ROUTES
  // ============================================================================
  
  // Endpoint for serving uploaded objects (publicly accessible)
  app.get("/objects/:objectPath(*)", async (req, res) => {
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error accessing object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Endpoint to get upload URL for image
  app.post("/api/objects/upload", async (req, res) => {
    try {
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  // Endpoint to normalize uploaded image path
  app.put("/api/apps/image", async (req, res) => {
    try {
      if (!req.body.imageURL) {
        return res.status(400).json({ error: "imageURL is required" });
      }

      const objectPath = objectStorageService.normalizeObjectEntityPath(req.body.imageURL);
      res.status(200).json({ objectPath });
    } catch (error) {
      console.error("Error normalizing image path:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
