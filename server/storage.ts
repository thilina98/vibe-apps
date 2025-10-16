// Referenced from javascript_database blueprint and javascript_log_in_with_replit blueprint
import { 
  apps,
  type App,
  type InsertApp,
  categories,
  type Category,
  type InsertCategory,
  tools,
  type Tool,
  type InsertTool,
  tags,
  type Tag,
  type InsertTag,
  appTools,
  type AppTool,
  type InsertAppTool,
  appTags,
  type AppTag,
  type InsertAppTag,
  reviews,
  type Review,
  type InsertReview,
  comments,
  type Comment,
  type InsertComment,
  toolSuggestions,
  type ToolSuggestion,
  type InsertToolSuggestion,
  users,
  type User,
  type UpsertUser,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, sql, or, ilike, and, avg, isNull, inArray } from "drizzle-orm";

export interface IStorage {
  // App operations
  getApp(id: string, userId?: string): Promise<App | undefined>;
  getAllApps(filters?: {
    search?: string;
    toolIds?: string[];
    categoryId?: string;
    status?: "draft" | "published";
    sortBy?: "newest" | "oldest" | "popular" | "rating" | "most_launched" | "highest_rated" | "trending";
    dateRange?: "week" | "month" | "3months" | "6months" | "all";
    userId?: string; // To filter by creator
  }): Promise<App[]>;
  createApp(app: InsertApp): Promise<App>;
  updateApp(id: string, appData: Partial<InsertApp>): Promise<App>;
  updateAppStatus(id: string, status: "draft" | "published"): Promise<void>;
  incrementViewCount(id: string): Promise<void>;
  getTopRatedAppsFromLastMonths(months: number, limit: number): Promise<App[]>;
  getTopTrendingApps(limit: number): Promise<App[]>;
  getTopTrendingCategories(limit: number): Promise<Array<Category & { appCount: number }>>;
  getCategoryStats(): Promise<Array<{ categoryId: string; categoryName: string; launchCount: number }>>
  
  // Category operations
  getAllCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  getCategoryById(id: string): Promise<Category | undefined>;
  
  // Tool operations
  getAllTools(): Promise<Tool[]>;
  getToolById(id: string): Promise<Tool | undefined>;
  createTool(tool: InsertTool): Promise<Tool>;
  
  // Tag operations
  getAllTags(): Promise<Tag[]>;
  getOrCreateTag(name: string): Promise<Tag>;
  getTagById(id: string): Promise<Tag | undefined>;
  
  // App-Tool relationship operations
  addToolToApp(appId: string, toolId: string): Promise<void>;
  getToolsForApp(appId: string): Promise<Tool[]>;
  removeToolFromApp(appId: string, toolId: string): Promise<void>;
  
  // App-Tag relationship operations
  addTagToApp(appId: string, tagId: string): Promise<void>;
  getTagsForApp(appId: string): Promise<Tag[]>;
  removeTagFromApp(appId: string, tagId: string): Promise<void>;
  
  // Review operations
  createReview(review: InsertReview): Promise<Review>;
  updateReview(appId: string, userId: string, rating: number, body?: string): Promise<Review>;
  getReviewsByApp(appId: string): Promise<Array<Review & { user: User | null }>>;
  getUserReviewForApp(appId: string, userId: string): Promise<Review | undefined>;
  updateAppRatingStats(appId: string): Promise<void>;
  
  // Comment operations
  createComment(comment: InsertComment): Promise<Comment>;
  getCommentsByApp(appId: string, parentCommentId?: string | null): Promise<Array<Comment & { user: User | null }>>;
  getCommentById(id: string): Promise<Comment | undefined>;
  
  // Tool suggestion operations
  createToolSuggestion(suggestion: InsertToolSuggestion): Promise<ToolSuggestion>;
  getPendingToolSuggestions(): Promise<ToolSuggestion[]>;
  approveToolSuggestion(suggestionId: string, toolData: InsertTool): Promise<Tool>;
  rejectToolSuggestion(suggestionId: string): Promise<void>;
  
  // User operations
  getUserById(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  // ============================================================================
  // APP OPERATIONS
  // ============================================================================
  
  async getApp(id: string, userId?: string): Promise<App | undefined> {
    const [app] = await db.select().from(apps).where(eq(apps.id, id));
    
    if (!app) return undefined;
    
    // Only show draft apps to their creators
    if (app.status === "draft" && app.creatorId !== userId) {
      return undefined;
    }
    
    return app;
  }

  async getAllApps(filters?: {
    search?: string;
    toolIds?: string[];
    categoryId?: string;
    status?: "draft" | "published";
    sortBy?: "newest" | "oldest" | "popular" | "rating" | "most_launched" | "highest_rated" | "trending";
    dateRange?: "week" | "month" | "3months" | "6months" | "all";
    userId?: string;
  }): Promise<App[]> {
    const conditions = [];

    // Filter by status (default to published only)
    if (filters?.userId) {
      // If userId is provided, show their drafts + all published
      conditions.push(
        or(
          eq(apps.status, "published"),
          and(eq(apps.status, "draft"), eq(apps.creatorId, filters.userId))
        )
      );
    } else if (filters?.status) {
      conditions.push(eq(apps.status, filters.status));
    } else {
      // Default: only published
      conditions.push(eq(apps.status, "published"));
    }

    // Date range filter
    if (filters?.dateRange && filters.dateRange !== "all") {
      const now = new Date();
      let cutoffDate = new Date();
      
      switch (filters.dateRange) {
        case "week":
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case "month":
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case "3months":
          cutoffDate.setMonth(now.getMonth() - 3);
          break;
        case "6months":
          cutoffDate.setMonth(now.getMonth() - 6);
          break;
      }
      
      conditions.push(sql`${apps.createdAt} >= ${cutoffDate.toISOString()}`);
    }

    // Search across name and description
    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      conditions.push(
        or(
          ilike(apps.name, searchTerm),
          ilike(apps.shortDescription, searchTerm),
          ilike(apps.fullDescription, searchTerm)
        )
      );
    }

    // Filter by category
    if (filters?.categoryId) {
      conditions.push(eq(apps.categoryId, filters.categoryId));
    }

    // Filter by tools (apps that have at least one of the specified tools)
    if (filters?.toolIds && filters.toolIds.length > 0) {
      conditions.push(
        sql`EXISTS (
          SELECT 1 FROM ${appTools} 
          WHERE ${appTools.appId} = ${apps.id} 
          AND ${appTools.toolId} IN ${filters.toolIds}
        )`
      );
    }

    // Build base query with where clause
    let query = db.select().from(apps);
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    // Sort
    switch (filters?.sortBy) {
      case "oldest":
        return await query.orderBy(asc(apps.createdAt));
      case "popular":
        return await query.orderBy(desc(apps.viewCount));
      case "rating":
        return await query.orderBy(desc(apps.averageRating), desc(apps.ratingCount));
      case "most_launched":
        return await query.orderBy(desc(apps.viewCount));
      case "highest_rated":
        return await query.orderBy(desc(apps.averageRating), desc(apps.ratingCount));
      case "trending":
        // Trending: (launches in last 7 days * 2) + (rating * rating count)
        // For simplicity, we'll use viewCount + rating as approximation since we don't track launch dates
        return await query.orderBy(
          sql`(${apps.viewCount} + (${apps.averageRating}::numeric * ${apps.ratingCount})) DESC`
        );
      case "newest":
      default:
        return await query.orderBy(desc(apps.createdAt));
    }
  }

  async createApp(appData: InsertApp): Promise<App> {
    const [app] = await db.insert(apps).values(appData).returning();
    return app;
  }

  async updateApp(id: string, appData: Partial<InsertApp>): Promise<App> {
    const [app] = await db
      .update(apps)
      .set({ ...appData, updatedAt: new Date() })
      .where(eq(apps.id, id))
      .returning();
    return app;
  }

  async updateAppStatus(id: string, status: "draft" | "published"): Promise<void> {
    await db
      .update(apps)
      .set({ status, updatedAt: new Date() })
      .where(eq(apps.id, id));
  }

  async incrementViewCount(id: string): Promise<void> {
    await db
      .update(apps)
      .set({ viewCount: sql`${apps.viewCount} + 1` })
      .where(eq(apps.id, id));
  }

  async getTopRatedAppsFromLastMonths(months: number, limit: number): Promise<App[]> {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);

    return await db
      .select()
      .from(apps)
      .where(
        and(
          eq(apps.status, "published"),
          sql`${apps.createdAt} >= ${cutoffDate.toISOString()}`
        )
      )
      .orderBy(desc(apps.averageRating), desc(apps.ratingCount))
      .limit(limit);
  }

  async getTopTrendingApps(limit: number): Promise<App[]> {
    // Trending score: (viewCount + (rating * rating count))
    // This approximates (Launches × 2) + (Average Rating × Number of Ratings)
    return await db
      .select()
      .from(apps)
      .where(eq(apps.status, "published"))
      .orderBy(
        sql`(${apps.viewCount} + (${apps.averageRating}::numeric * ${apps.ratingCount})) DESC`
      )
      .limit(limit);
  }

  async getTopTrendingCategories(limit: number): Promise<Array<Category & { appCount: number }>> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const result = await db
      .select({
        id: categories.id,
        name: categories.name,
        appCount: sql<number>`COUNT(${apps.id})::int`,
      })
      .from(categories)
      .leftJoin(apps, and(
        eq(apps.categoryId, categories.id),
        eq(apps.status, "published"),
        sql`${apps.createdAt} >= ${sevenDaysAgo.toISOString()}`
      ))
      .groupBy(categories.id, categories.name)
      .orderBy(sql`COUNT(${apps.id}) DESC`)
      .limit(limit);

    return result;
  }

  async getCategoryStats(): Promise<Array<{ categoryId: string; categoryName: string; launchCount: number }>> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const result = await db
      .select({
        categoryId: categories.id,
        categoryName: categories.name,
        launchCount: sql<number>`SUM(${apps.viewCount})::int`,
      })
      .from(categories)
      .leftJoin(apps, and(
        eq(apps.categoryId, categories.id),
        eq(apps.status, "published"),
        sql`${apps.createdAt} >= ${sevenDaysAgo.toISOString()}`
      ))
      .groupBy(categories.id, categories.name)
      .orderBy(sql`SUM(${apps.viewCount}) DESC`);

    return result;
  }

  // ============================================================================
  // CATEGORY OPERATIONS
  // ============================================================================

  async getAllCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(asc(categories.name));
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(categoryData).returning();
    return category;
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  // ============================================================================
  // TOOL OPERATIONS
  // ============================================================================

  async getAllTools(): Promise<Tool[]> {
    return await db.select().from(tools).orderBy(asc(tools.name));
  }

  async getToolById(id: string): Promise<Tool | undefined> {
    const [tool] = await db.select().from(tools).where(eq(tools.id, id));
    return tool || undefined;
  }

  async createTool(toolData: InsertTool): Promise<Tool> {
    const [tool] = await db.insert(tools).values(toolData).returning();
    return tool;
  }

  // ============================================================================
  // TAG OPERATIONS
  // ============================================================================

  async getAllTags(): Promise<Tag[]> {
    return await db.select().from(tags).orderBy(asc(tags.name));
  }

  async getOrCreateTag(name: string): Promise<Tag> {
    const normalizedName = name.toLowerCase().trim();
    
    // Try to find existing tag
    const [existingTag] = await db
      .select()
      .from(tags)
      .where(eq(tags.name, normalizedName));
    
    if (existingTag) {
      return existingTag;
    }
    
    // Create new tag
    const [newTag] = await db
      .insert(tags)
      .values({ name: normalizedName })
      .returning();
    
    return newTag;
  }

  async getTagById(id: string): Promise<Tag | undefined> {
    const [tag] = await db.select().from(tags).where(eq(tags.id, id));
    return tag || undefined;
  }

  // ============================================================================
  // APP-TOOL RELATIONSHIP OPERATIONS
  // ============================================================================

  async addToolToApp(appId: string, toolId: string): Promise<void> {
    await db
      .insert(appTools)
      .values({ appId, toolId })
      .onConflictDoNothing();
  }

  async getToolsForApp(appId: string): Promise<Tool[]> {
    const result = await db
      .select({
        id: tools.id,
        name: tools.name,
        websiteUrl: tools.websiteUrl,
        logoUrl: tools.logoUrl,
      })
      .from(appTools)
      .innerJoin(tools, eq(appTools.toolId, tools.id))
      .where(eq(appTools.appId, appId))
      .orderBy(asc(tools.name));
    
    return result;
  }

  async removeToolFromApp(appId: string, toolId: string): Promise<void> {
    await db
      .delete(appTools)
      .where(and(eq(appTools.appId, appId), eq(appTools.toolId, toolId)));
  }

  // ============================================================================
  // APP-TAG RELATIONSHIP OPERATIONS
  // ============================================================================

  async addTagToApp(appId: string, tagId: string): Promise<void> {
    await db
      .insert(appTags)
      .values({ appId, tagId })
      .onConflictDoNothing();
  }

  async getTagsForApp(appId: string): Promise<Tag[]> {
    const result = await db
      .select({
        id: tags.id,
        name: tags.name,
      })
      .from(appTags)
      .innerJoin(tags, eq(appTags.tagId, tags.id))
      .where(eq(appTags.appId, appId))
      .orderBy(asc(tags.name));
    
    return result;
  }

  async removeTagFromApp(appId: string, tagId: string): Promise<void> {
    await db
      .delete(appTags)
      .where(and(eq(appTags.appId, appId), eq(appTags.tagId, tagId)));
  }

  // ============================================================================
  // REVIEW OPERATIONS
  // ============================================================================

  async createReview(reviewData: InsertReview): Promise<Review> {
    const [review] = await db.insert(reviews).values(reviewData).returning();
    
    // Update app rating stats
    await this.updateAppRatingStats(reviewData.appId);
    
    return review;
  }

  async updateReview(appId: string, userId: string, rating: number, body?: string): Promise<Review> {
    const [review] = await db
      .update(reviews)
      .set({ 
        rating, 
        body: body || null,
        updatedAt: new Date() 
      })
      .where(and(eq(reviews.appId, appId), eq(reviews.userId, userId)))
      .returning();
    
    // Update app rating stats
    await this.updateAppRatingStats(appId);
    
    return review;
  }

  async getReviewsByApp(appId: string): Promise<Array<Review & { user: User | null }>> {
    const results = await db
      .select({
        id: reviews.id,
        appId: reviews.appId,
        userId: reviews.userId,
        rating: reviews.rating,
        title: reviews.title,
        body: reviews.body,
        createdAt: reviews.createdAt,
        updatedAt: reviews.updatedAt,
        user: users,
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.appId, appId))
      .orderBy(desc(reviews.createdAt));
    
    return results.map(r => ({
      id: r.id,
      appId: r.appId,
      userId: r.userId,
      rating: r.rating,
      title: r.title,
      body: r.body,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      user: r.user,
    }));
  }

  async getUserReviewForApp(appId: string, userId: string): Promise<Review | undefined> {
    const [review] = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.appId, appId), eq(reviews.userId, userId)));
    
    return review || undefined;
  }

  async deleteReview(appId: string, userId: string, deleteRating: boolean): Promise<void> {
    if (deleteRating) {
      await db
        .delete(reviews)
        .where(and(eq(reviews.appId, appId), eq(reviews.userId, userId)));
    } else {
      await db
        .update(reviews)
        .set({ 
          body: null,
          updatedAt: new Date() 
        })
        .where(and(eq(reviews.appId, appId), eq(reviews.userId, userId)));
    }
    
    await this.updateAppRatingStats(appId);
  }

  async updateAppRatingStats(appId: string): Promise<void> {
    const result = await db
      .select({
        avgRating: avg(reviews.rating),
        count: sql<number>`COUNT(*)::int`,
      })
      .from(reviews)
      .where(eq(reviews.appId, appId));
    
    const avgRating = result[0]?.avgRating ? Number(result[0].avgRating).toFixed(2) : "0.00";
    const ratingCount = result[0]?.count || 0;
    
    await db
      .update(apps)
      .set({
        averageRating: avgRating,
        ratingCount: ratingCount,
        updatedAt: new Date(),
      })
      .where(eq(apps.id, appId));
  }

  // ============================================================================
  // COMMENT OPERATIONS
  // ============================================================================

  async createComment(commentData: InsertComment): Promise<Comment> {
    const [comment] = await db.insert(comments).values(commentData).returning();
    return comment;
  }

  async getCommentsByApp(
    appId: string, 
    parentCommentId?: string | null
  ): Promise<Array<Comment & { user: User | null }>> {
    const conditions = [eq(comments.appId, appId)];
    
    // Filter by parent comment ID (null for top-level, specific ID for replies)
    if (parentCommentId === null || parentCommentId === undefined) {
      conditions.push(isNull(comments.parentCommentId));
    } else {
      conditions.push(eq(comments.parentCommentId, parentCommentId));
    }
    
    const results = await db
      .select({
        id: comments.id,
        content: comments.content,
        appId: comments.appId,
        userId: comments.userId,
        parentCommentId: comments.parentCommentId,
        createdAt: comments.createdAt,
        user: users,
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(and(...conditions))
      .orderBy(desc(comments.createdAt));
    
    return results.map(r => ({
      id: r.id,
      content: r.content,
      appId: r.appId,
      userId: r.userId,
      parentCommentId: r.parentCommentId,
      createdAt: r.createdAt,
      user: r.user,
    }));
  }

  async getCommentById(id: string): Promise<Comment | undefined> {
    const [comment] = await db.select().from(comments).where(eq(comments.id, id));
    return comment || undefined;
  }

  // ============================================================================
  // TOOL SUGGESTION OPERATIONS
  // ============================================================================

  async createToolSuggestion(suggestionData: InsertToolSuggestion): Promise<ToolSuggestion> {
    const [suggestion] = await db
      .insert(toolSuggestions)
      .values(suggestionData)
      .returning();
    
    return suggestion;
  }

  async getPendingToolSuggestions(): Promise<ToolSuggestion[]> {
    return await db
      .select()
      .from(toolSuggestions)
      .where(eq(toolSuggestions.status, "pending"))
      .orderBy(asc(toolSuggestions.createdAt));
  }

  async approveToolSuggestion(suggestionId: string, toolData: InsertTool): Promise<Tool> {
    // Get the suggestion
    const [suggestion] = await db
      .select()
      .from(toolSuggestions)
      .where(eq(toolSuggestions.id, suggestionId));
    
    if (!suggestion) {
      throw new Error("Tool suggestion not found");
    }
    
    // Create the tool
    const [tool] = await db.insert(tools).values(toolData).returning();
    
    // Update the suggestion status
    await db
      .update(toolSuggestions)
      .set({ status: "approved" })
      .where(eq(toolSuggestions.id, suggestionId));
    
    // Find all apps with matching tool suggestions and add the tool to them
    const matchingSuggestions = await db
      .select()
      .from(toolSuggestions)
      .where(
        and(
          eq(toolSuggestions.suggestedName, suggestion.suggestedName),
          eq(toolSuggestions.status, "pending")
        )
      );
    
    // Add tool to all matching apps
    for (const matchingSuggestion of matchingSuggestions) {
      await this.addToolToApp(matchingSuggestion.appId, tool.id);
      
      // Update suggestion status
      await db
        .update(toolSuggestions)
        .set({ status: "approved" })
        .where(eq(toolSuggestions.id, matchingSuggestion.id));
    }
    
    return tool;
  }

  async rejectToolSuggestion(suggestionId: string): Promise<void> {
    await db
      .update(toolSuggestions)
      .set({ status: "rejected" })
      .where(eq(toolSuggestions.id, suggestionId));
  }

  // ============================================================================
  // USER OPERATIONS
  // ============================================================================

  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    
    return user;
  }
}

export const storage = new DatabaseStorage();
