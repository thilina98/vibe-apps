import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, index, jsonb, decimal, unique, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================================================
// 1. USER & AUTHENTICATION TABLES
// ============================================================================

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  profilePictureUrl: varchar("profile_picture_url", { length: 255 }),
  bio: text("bio"),
  socialLink1: varchar("social_link_1", { length: 255 }),
  socialLink2: varchar("social_link_2", { length: 255 }),
  role: varchar("role", { length: 20 }).notNull().default("user"), // 'user' or 'admin'
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;

export const userAuthentications = pgTable("user_authentications", {
  provider: varchar("provider", { length: 50 }).notNull(),
  providerId: varchar("provider_id", { length: 255 }).notNull(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.provider, table.providerId] }),
}));

export type UserAuthentication = typeof userAuthentications.$inferSelect;
export type InsertUserAuthentication = typeof userAuthentications.$inferInsert;

// ============================================================================
// 2. CORE CONTENT TABLES
// ============================================================================

export const apps = pgTable("apps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  shortDescription: varchar("short_description", { length: 200 }).notNull(),
  fullDescription: text("full_description").notNull(),
  launchUrl: varchar("launch_url", { length: 255 }).notNull(),
  previewImageUrl: varchar("preview_image_url", { length: 255 }).notNull(),
  keyLearnings: text("key_learnings"),
  status: varchar("status", { length: 30 }).notNull().default("draft"), // 'draft', 'pending_approval', 'published', 'rejected'
  viewCount: integer("view_count").notNull().default(0),
  averageRating: decimal("average_rating", { precision: 4, scale: 2 }).notNull().default("0.00"),
  ratingCount: integer("rating_count").notNull().default(0),
  creatorId: varchar("creator_id").references(() => users.id, { onDelete: "set null" }),
  categoryId: varchar("category_id").references(() => categories.id, { onDelete: "set null" }),
  rejectionReason: text("rejection_reason"),
  rejectedAt: timestamp("rejected_at"),
  rejectedBy: varchar("rejected_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_date").notNull().defaultNow(), // using created_date to match DB
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type App = typeof apps.$inferSelect;

export const insertAppSchema = createInsertSchema(apps).omit({
  id: true,
  viewCount: true,
  averageRating: true,
  ratingCount: true,
  rejectionReason: true,
  rejectedAt: true,
  rejectedBy: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  name: z.string().min(1, "App name is required").max(100),
  shortDescription: z.string().min(1, "Short description is required").max(200),
  fullDescription: z.string().min(1, "Full description is required").max(2000),
  launchUrl: z.string().url("Must be a valid URL"),
  previewImageUrl: z.string().min(1, "Preview image is required"),
  keyLearnings: z.string().max(1500).optional(),
  status: z.enum(["draft", "pending_approval", "published", "rejected"]).default("draft"),
  creatorId: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
});

export type InsertApp = z.infer<typeof insertAppSchema>;

// ============================================================================
// 3. TAXONOMY TABLES (Categories, Tools, Tags)
// ============================================================================

export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 50 }).notNull().unique(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

export const tools = pgTable("tools", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull().unique(),
  websiteUrl: varchar("website_url", { length: 255 }),
  logoUrl: varchar("logo_url", { length: 255 }),
});

export type Tool = typeof tools.$inferSelect;
export type InsertTool = typeof tools.$inferInsert;

export const tags = pgTable("tags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 50 }).notNull().unique(),
});

export type Tag = typeof tags.$inferSelect;
export type InsertTag = typeof tags.$inferInsert;

// ============================================================================
// 4. JOIN TABLES (Many-to-Many Relationships)
// ============================================================================

export const appTools = pgTable("app_tools", {
  appId: varchar("app_id").notNull().references(() => apps.id, { onDelete: "cascade" }),
  toolId: varchar("tool_id").notNull().references(() => tools.id, { onDelete: "cascade" }),
}, (table) => ({
  pk: primaryKey({ columns: [table.appId, table.toolId] }),
}));

export type AppTool = typeof appTools.$inferSelect;
export type InsertAppTool = typeof appTools.$inferInsert;

export const appTags = pgTable("app_tags", {
  appId: varchar("app_id").notNull().references(() => apps.id, { onDelete: "cascade" }),
  tagId: varchar("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
}, (table) => ({
  pk: primaryKey({ columns: [table.appId, table.tagId] }),
}));

export type AppTag = typeof appTags.$inferSelect;
export type InsertAppTag = typeof appTags.$inferInsert;

// ============================================================================
// 5. USER INTERACTION TABLES (Reviews, Comments)
// ============================================================================

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  appId: varchar("app_id").notNull().references(() => apps.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "set null" }),
  rating: integer("rating").notNull(), // 1-5
  title: varchar("title", { length: 150 }),
  body: text("body"),
  deletedAt: timestamp("deleted_at"),
  deletedBy: varchar("deleted_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  uniqueUserReview: unique("unique_user_review").on(table.appId, table.userId),
}));

export type Review = typeof reviews.$inferSelect;

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  title: z.string().max(150).optional(),
  body: z.string().max(2000).optional(),
});

export type InsertReview = z.infer<typeof insertReviewSchema>;

export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  appId: varchar("app_id").notNull().references(() => apps.id, { onDelete: "cascade" }),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
  parentCommentId: varchar("parent_comment_id"),
  deletedAt: timestamp("deleted_at"),
  deletedBy: varchar("deleted_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Comment = typeof comments.$inferSelect;

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
}).extend({
  content: z.string().min(1, "Comment cannot be empty").max(2000),
  appId: z.string().min(1),
  userId: z.string().min(1),
  parentCommentId: z.string().optional(),
});

export type InsertComment = z.infer<typeof insertCommentSchema>;

// ============================================================================
// 6. TOOL SUGGESTION WORKFLOW
// ============================================================================

export const toolSuggestions = pgTable("tool_suggestions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  suggestedName: varchar("suggested_name", { length: 100 }).notNull(),
  appId: varchar("app_id").notNull().references(() => apps.id, { onDelete: "cascade" }),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // 'pending', 'approved', 'rejected'
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type ToolSuggestion = typeof toolSuggestions.$inferSelect;

export const insertToolSuggestionSchema = createInsertSchema(toolSuggestions).omit({
  id: true,
  status: true,
  createdAt: true,
}).extend({
  suggestedName: z.string().min(1, "Tool name is required").max(100),
  appId: z.string().min(1),
  userId: z.string().min(1),
});

export type InsertToolSuggestion = z.infer<typeof insertToolSuggestionSchema>;

// ============================================================================
// 7. SESSION STORAGE (for authentication)
// ============================================================================

export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// ============================================================================
// 8. CONSTANTS & ENUMS
// ============================================================================

export const USER_ROLES = ["user", "admin"] as const;
export const APP_STATUS = ["draft", "pending_approval", "published", "rejected"] as const;
export const SUGGESTION_STATUS = ["pending", "approved", "rejected"] as const;

// ============================================================================
// 9. API RESPONSE TYPES (for compatibility with old database structure)
// ============================================================================

export interface AppListing {
  id: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  launchUrl: string;
  vibecodingTools: string[];
  category: string;
  creatorName: string;
  creatorContact?: string | null;
  previewImageUrl: string;
  tags?: string[] | null;
  keyLearnings?: string | null;
  launchCount: number;
  createdDate: Date | string;
  submissionDate: Date | string;
  status: string;
  creatorId?: string | null;
  categoryId?: string | null;
  rejectionReason?: string | null;
  rejectedAt?: Date | string | null;
  rejectedBy?: string | null;
}
