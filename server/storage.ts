// Referenced from javascript_database blueprint
import { appListings, type AppListing, type InsertAppListing } from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, sql, or, ilike } from "drizzle-orm";

export interface IStorage {
  getAppListing(id: string): Promise<AppListing | undefined>;
  getAllAppListings(filters?: {
    search?: string;
    tools?: string[];
    category?: string;
    sortBy?: "newest" | "oldest" | "popular";
  }): Promise<AppListing[]>;
  createAppListing(listing: InsertAppListing): Promise<AppListing>;
  incrementLaunchCount(id: string): Promise<void>;
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
}

export const storage = new DatabaseStorage();
