// Referenced from javascript_object_storage blueprint (public file uploading)
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAppListingSchema, insertReviewSchema } from "@shared/schema";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { isAuthenticated } from "./googleAuth";
import passport from "./googleAuth";

export async function registerRoutes(app: Express): Promise<Server> {

  const objectStorageService = new ObjectStorageService();

  // Google OAuth routes
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

  // Get all app listings with optional filters
  app.get("/api/apps", async (req, res) => {
    try {
      const { search, tools, category, sortBy } = req.query;
      
      const filters = {
        search: search as string | undefined,
        tools: tools ? (Array.isArray(tools) ? tools : [tools]) as string[] : undefined,
        category: category as string | undefined,
        sortBy: (sortBy as "newest" | "oldest" | "popular") || "newest",
      };

      const apps = await storage.getAllAppListings(filters);
      res.json(apps);
    } catch (error) {
      console.error("Error fetching apps:", error);
      res.status(500).json({ error: "Failed to fetch apps" });
    }
  });

  // Get single app listing by ID
  app.get("/api/apps/:id", async (req, res) => {
    try {
      const app = await storage.getAppListing(req.params.id);
      if (!app) {
        return res.status(404).json({ error: "App not found" });
      }
      res.json(app);
    } catch (error) {
      console.error("Error fetching app:", error);
      res.status(500).json({ error: "Failed to fetch app" });
    }
  });

  // Create new app listing (protected - requires authentication)
  app.post("/api/apps", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertAppListingSchema.parse(req.body);
      const app = await storage.createAppListing(validatedData);
      res.status(201).json(app);
    } catch (error: any) {
      console.error("Error creating app:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create app" });
    }
  });

  // Increment launch count
  app.post("/api/apps/:id/launch", async (req, res) => {
    try {
      await storage.incrementLaunchCount(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error incrementing launch count:", error);
      res.status(500).json({ error: "Failed to increment launch count" });
    }
  });

  // Review endpoints
  
  // Get reviews for an app
  app.get("/api/apps/:id/reviews", async (req, res) => {
    try {
      const reviews = await storage.getReviewsByApp(req.params.id);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  // Get average rating for an app
  app.get("/api/apps/:id/rating", async (req, res) => {
    try {
      const avgRating = await storage.getAverageRating(req.params.id);
      res.json({ averageRating: avgRating });
    } catch (error) {
      console.error("Error fetching rating:", error);
      res.status(500).json({ error: "Failed to fetch rating" });
    }
  });

  // Create a review (protected - requires authentication)
  app.post("/api/reviews", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Check if user already reviewed this app
      const existingReview = await storage.getUserReviewForApp(req.body.appId, userId);
      if (existingReview) {
        return res.status(400).json({ error: "You have already reviewed this app" });
      }

      const validatedData = insertReviewSchema.parse({
        ...req.body,
        userId,
      });
      
      const review = await storage.createReview(validatedData);
      res.status(201).json(review);
    } catch (error: any) {
      console.error("Error creating review:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create review" });
    }
  });

  // Object storage routes for public file uploading
  
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
