import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, index, jsonb, decimal, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const appListings = pgTable("app_listings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  shortDescription: varchar("short_description", { length: 200 }).notNull(),
  fullDescription: text("full_description").notNull(),
  launchUrl: text("launch_url").notNull(),
  vibecodingTools: text("vibecoding_tools").array().notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  creatorName: varchar("creator_name", { length: 50 }).notNull(),
  creatorContact: text("creator_contact"),
  previewImage: text("preview_image").notNull(),
  tags: text("tags").array(),
  keyLearnings: text("key_learnings"),
  launchCount: integer("launch_count").notNull().default(0),
  createdDate: timestamp("created_date").notNull().defaultNow(),
  submissionDate: timestamp("submission_date").notNull().defaultNow(),
  status: varchar("status", { length: 20 }).notNull().default("approved"),
});

export const insertAppListingSchema = createInsertSchema(appListings).omit({
  id: true,
  launchCount: true,
  createdDate: true,
  submissionDate: true,
  status: true,
}).extend({
  name: z.string().min(1, "App name is required").max(100, "App name must be 100 characters or less"),
  shortDescription: z.string().min(1, "Short description is required").max(200, "Short description must be 200 characters or less"),
  fullDescription: z.string().min(1, "Full description is required").max(2000, "Full description must be 2000 characters or less"),
  launchUrl: z.string().url("Must be a valid URL"),
  vibecodingTools: z.array(z.string()).min(1, "Select at least one vibecoding tool"),
  category: z.string().min(1, "Category is required"),
  creatorName: z.string().min(1, "Creator name is required").max(50, "Creator name must be 50 characters or less"),
  creatorContact: z.string().optional(),
  previewImage: z.string().min(1, "Preview image is required"),
  tags: z.array(z.string()).max(5, "Maximum 5 tags allowed").optional(),
  keyLearnings: z.string().max(1500, "Key learnings must be 1500 characters or less").optional(),
});

export type InsertAppListing = z.infer<typeof insertAppListingSchema>;
export type AppListing = typeof appListings.$inferSelect;

// Vibecoding tools enum for consistency
export const VIBECODING_TOOLS = [
  "Replit Agent",
  "Bolt.new",
  "v0",
  "Cursor",
  "Claude",
  "ChatGPT",
  "Lovable",
  "Windsurf",
  "Other"
] as const;

export const CATEGORIES = [
  "Productivity",
  "Education",
  "Entertainment",
  "Business",
  "Developer Tools",
  "Design",
  "Other"
] as const;

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Reviews table for rating and review system
export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  appId: varchar("app_id").notNull().references(() => appListings.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  reviewText: text("review_text"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueUserReview: unique("unique_user_review").on(table.appId, table.userId),
}));

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
}).extend({
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  reviewText: z.string().max(1000, "Review must be 1000 characters or less").optional(),
});

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;
