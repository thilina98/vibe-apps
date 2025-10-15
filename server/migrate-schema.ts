import { drizzle } from "drizzle-orm/neon-serverless";
import { neonConfig, Pool } from "@neondatabase/serverless";
import ws from "ws";
import { sql } from "drizzle-orm";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
const db = drizzle(pool, { schema });

async function migrate() {
  console.log("🔄 Starting database migration...");

  try {
    // Create user_authentications table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_authentications (
        provider VARCHAR(50) NOT NULL,
        provider_id VARCHAR(255) NOT NULL,
        user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        PRIMARY KEY (provider, provider_id)
      )
    `);
    console.log("✅ Created user_authentications table");

    // Update users table - add new columns
    await db.execute(sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS name VARCHAR(100),
      ADD COLUMN IF NOT EXISTS bio TEXT,
      ADD COLUMN IF NOT EXISTS social_link_1 VARCHAR(255),
      ADD COLUMN IF NOT EXISTS social_link_2 VARCHAR(255),
      ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user'
    `);
    
    // Populate name column from existing first_name and last_name
    await db.execute(sql`
      UPDATE users 
      SET name = COALESCE(
        NULLIF(TRIM(CONCAT(COALESCE(first_name, ''), ' ', COALESCE(last_name, ''))), ''),
        'User'
      )
      WHERE name IS NULL
    `);
    
    // Set name as NOT NULL after populating
    await db.execute(sql`
      ALTER TABLE users 
      ALTER COLUMN name SET NOT NULL
    `);
    
    // Rename profile_image_url to profile_picture_url if needed
    await db.execute(sql`
      DO $$ 
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'profile_image_url'
        ) THEN
          ALTER TABLE users RENAME COLUMN profile_image_url TO profile_picture_url;
        END IF;
      END $$;
    `);
    
    console.log("✅ Updated users table");

    // Rename app_listings to apps if needed
    await db.execute(sql`
      DO $$ 
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_name = 'app_listings'
        ) THEN
          ALTER TABLE app_listings RENAME TO apps;
        END IF;
      END $$;
    `);
    
    await db.execute(sql`
      ALTER TABLE apps
      ADD COLUMN IF NOT EXISTS screenshot_url VARCHAR(255),
      ADD COLUMN IF NOT EXISTS creator_id VARCHAR REFERENCES users(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS category_id VARCHAR,
      ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0.00,
      ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0,
      ALTER COLUMN status SET DEFAULT 'draft'
    `);
    
    // Migrate preview_image to screenshot_url
    await db.execute(sql`
      UPDATE apps 
      SET screenshot_url = preview_image 
      WHERE screenshot_url IS NULL
    `);
    
    // Set screenshot_url as NOT NULL
    await db.execute(sql`
      ALTER TABLE apps 
      ALTER COLUMN screenshot_url SET NOT NULL
    `);
    
    console.log("✅ Renamed and updated apps table");

    // Create categories table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(50) NOT NULL UNIQUE
      )
    `);
    
    // Insert default categories
    await db.execute(sql`
      INSERT INTO categories (name) VALUES 
        ('Productivity'),
        ('Education'),
        ('Entertainment'),
        ('Business'),
        ('Developer Tools'),
        ('Design'),
        ('Other')
      ON CONFLICT (name) DO NOTHING
    `);
    console.log("✅ Created categories table");

    // Create tools table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS tools (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL UNIQUE,
        website_url VARCHAR(255),
        logo_url VARCHAR(255)
      )
    `);
    
    // Insert default tools
    await db.execute(sql`
      INSERT INTO tools (name) VALUES 
        ('Replit Agent'),
        ('Bolt.new'),
        ('v0'),
        ('Cursor'),
        ('Claude'),
        ('ChatGPT'),
        ('Lovable'),
        ('Windsurf'),
        ('Other')
      ON CONFLICT (name) DO NOTHING
    `);
    console.log("✅ Created tools table");

    // Create tags table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS tags (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(50) NOT NULL UNIQUE
      )
    `);
    console.log("✅ Created tags table");

    // Create app_tools join table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS app_tools (
        app_id VARCHAR NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
        tool_id VARCHAR NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
        PRIMARY KEY (app_id, tool_id)
      )
    `);
    console.log("✅ Created app_tools table");

    // Create app_tags join table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS app_tags (
        app_id VARCHAR NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
        tag_id VARCHAR NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
        PRIMARY KEY (app_id, tag_id)
      )
    `);
    console.log("✅ Created app_tags table");

    // Update reviews table for 1-10 rating
    await db.execute(sql`
      ALTER TABLE reviews
      ADD COLUMN IF NOT EXISTS title VARCHAR(150),
      ADD COLUMN IF NOT EXISTS body TEXT,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()
    `);
    
    // Rename review_text to body if needed
    await db.execute(sql`
      DO $$ 
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'reviews' AND column_name = 'review_text'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'reviews' AND column_name = 'body'
        ) THEN
          ALTER TABLE reviews RENAME COLUMN review_text TO body;
        ELSIF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'reviews' AND column_name = 'review_text'
        ) AND EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'reviews' AND column_name = 'body'
        ) THEN
          -- Both exist, drop review_text
          ALTER TABLE reviews DROP COLUMN review_text;
        END IF;
      END $$;
    `);
    console.log("✅ Updated reviews table");

    // Create comments table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS comments (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        content TEXT NOT NULL,
        app_id VARCHAR NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
        user_id VARCHAR REFERENCES users(id) ON DELETE SET NULL,
        parent_comment_id VARCHAR REFERENCES comments(id) ON DELETE CASCADE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    console.log("✅ Created comments table");

    // Create tool_suggestions table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS tool_suggestions (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        suggested_name VARCHAR(100) NOT NULL,
        app_id VARCHAR NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
        user_id VARCHAR REFERENCES users(id) ON DELETE SET NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    console.log("✅ Created tool_suggestions table");

    // Add foreign key for category_id after categories table exists
    await db.execute(sql`
      ALTER TABLE apps
      ADD CONSTRAINT apps_category_id_fkey 
      FOREIGN KEY (category_id) 
      REFERENCES categories(id) 
      ON DELETE SET NULL
    `);
    console.log("✅ Added category foreign key to apps");

    console.log("✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

migrate();
