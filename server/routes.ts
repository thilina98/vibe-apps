// Referenced from javascript_object_storage blueprint (public file uploading)
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAppListingSchema } from "@shared/schema";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";

export async function registerRoutes(app: Express): Promise<Server> {
  const objectStorageService = new ObjectStorageService();

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

  // Create new app listing
  app.post("/api/apps", async (req, res) => {
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
