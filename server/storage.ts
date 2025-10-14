// Referenced from javascript_database blueprint and javascript_log_in_with_replit blueprint
import { 
  appListings, 
  type AppListing, 
  type InsertAppListing,
  users,
  type User,
  type UpsertUser,
  reviews,
  type Review,
  type InsertReview
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, sql, or, ilike, and, avg } from "drizzle-orm";

export interface IStorage {
  // App listing operations
  getAppListing(id: string): Promise<AppListing | undefined>;
  getAllAppListings(filters?: {
    search?: string;
    tools?: string[];
    category?: string;
    sortBy?: "newest" | "oldest" | "popular";
  }): Promise<AppListing[]>;
  createAppListing(listing: InsertAppListing): Promise<AppListing>;
  incrementLaunchCount(id: string): Promise<void>;
  
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Review operations
  createReview(review: InsertReview): Promise<Review>;
  getReviewsByApp(appId: string): Promise<Review[]>;
  getUserReviewForApp(appId: string, userId: string): Promise<Review | undefined>;
  getAverageRating(appId: string): Promise<number | null>;
}

export class DatabaseStorage implements IStorage {
  async getAppListing(id: string): Promise<AppListing | undefined> {
    const [listing] = await db.select().from(appListings).where(eq(appListings.id, id));
    return listing || undefined;
  }

  async getAllAppListings(filters?: {
    search?: string;
    tools?: string[];
    category?: string;
    sortBy?: "newest" | "oldest" | "popular";
  }): Promise<AppListing[]> {
    let query = db.select().from(appListings);

    const conditions = [];

    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      conditions.push(
        or(
          ilike(appListings.name, searchTerm),
          ilike(appListings.shortDescription, searchTerm),
          ilike(appListings.fullDescription, searchTerm),
          ilike(appListings.creatorName, searchTerm),
          sql`EXISTS (SELECT 1 FROM unnest(${appListings.tags}) AS tag WHERE tag ILIKE ${searchTerm})`
        )
      );
    }

    if (filters?.tools && filters.tools.length > 0) {
      conditions.push(
        sql`${appListings.vibecodingTools} && ARRAY[${sql.join(
          filters.tools.map(t => sql`${t}`),
          sql`, `
        )}]::text[]`
      );
    }

    if (filters?.category) {
      conditions.push(eq(appListings.category, filters.category));
    }

    if (conditions.length > 0) {
      query = query.where(sql`${sql.join(conditions, sql` AND `)}`);
    }

    switch (filters?.sortBy) {
      case "oldest":
        query = query.orderBy(asc(appListings.createdDate));
        break;
      case "popular":
        query = query.orderBy(desc(appListings.launchCount));
        break;
      case "newest":
      default:
        query = query.orderBy(desc(appListings.createdDate));
        break;
    }

    return await query;
  }

  async createAppListing(insertListing: InsertAppListing): Promise<AppListing> {
    const [listing] = await db
      .insert(appListings)
      .values(insertListing)
      .returning();
    return listing;
  }

  async incrementLaunchCount(id: string): Promise<void> {
    await db
      .update(appListings)
      .set({ launchCount: sql`${appListings.launchCount} + 1` })
      .where(eq(appListings.id, id));
  }

  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
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

  // Review operations
  async createReview(reviewData: InsertReview): Promise<Review> {
    const [review] = await db
      .insert(reviews)
      .values(reviewData)
      .returning();
    return review;
  }

  async getReviewsByApp(appId: string): Promise<any[]> {
    const results = await db
      .select({
        id: reviews.id,
        appId: reviews.appId,
        userId: reviews.userId,
        rating: reviews.rating,
        reviewText: reviews.reviewText,
        createdAt: reviews.createdAt,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        },
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.appId, appId))
      .orderBy(desc(reviews.createdAt));
    
    return results;
  }

  async getUserReviewForApp(appId: string, userId: string): Promise<Review | undefined> {
    const [review] = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.appId, appId), eq(reviews.userId, userId)));
    return review || undefined;
  }

  async getAverageRating(appId: string): Promise<number | null> {
    const result = await db
      .select({ avgRating: avg(reviews.rating) })
      .from(reviews)
      .where(eq(reviews.appId, appId));
    
    return result[0]?.avgRating ? Number(result[0].avgRating) : null;
  }
}

export const storage = new DatabaseStorage();
