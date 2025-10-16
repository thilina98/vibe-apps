# Vibecoded Apps Marketplace

## Overview

The Vibecoded Apps Marketplace is a platform for discovering and sharing applications built with AI-powered coding tools (vibecoding). Users can browse apps created with tools like Replit Agent, Bolt.new, v0, Cursor, Claude, ChatGPT, Lovable, and Windsurf. Creators can submit their AI-built applications with detailed information including screenshots, descriptions, key learnings, and the tools used to build them. The platform features a modern, vibrant design inspired by Product Hunt, Dribbble, and the App Store, with comprehensive filtering, search, and review capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (October 16, 2025)

**Latest Updates - Separated Rating & Review UI (IMDb-style):**
- ✅ **Separated components** - Rating and reviews are now completely independent with separate modals
- ✅ **Rating in header** - App title on left, ★ 7.5/10 rating display on right with clickable reviews count link
- ✅ **Rating-only modal** - Simple 10-star selection + "Remove Rating" button (no review text)
- ✅ **Review-only modal** - Separate "+ Review" button opens modal with just review text area (no stars)
- ✅ **Scroll to reviews** - Clicking reviews count in header smoothly scrolls to reviews section
- ✅ **Independent edit/delete** - Reviews have their own edit/delete buttons, rating has remove button in modal

**Previous Updates - IMDb-Style Rating System:**
- ✅ **Star rating hover effects** - Stars fill on hover up to hovered star, click to select rating
- ✅ **Rating default changed to 0** - Modal starts with all stars empty, minimum rating of 1 required
- ✅ **IMDb-style rating display** - User's rating shown as ★ 7/10 (single filled star + number)
- ✅ **Reviews list filtering** - Only reviews with text are displayed; ratings-only hidden but counted in average
- ✅ **Single star display in reviews** - Reviews show ★ 9/10 format instead of 10 stars
- ✅ **Edit and Delete functionality** - Edit/Delete buttons appear when user has written review (not just rating)
- ✅ **Delete confirmation dialog** - Checkbox option to delete rating along with review, or keep rating
- ✅ **Backend DELETE endpoint** - DELETE /api/reviews/:appId with optional rating deletion

**Previous Updates - Rating Modal & Edit Feature:**
- ✅ **Rating now uses modal dialog** - Clean popup interface instead of inline form
- ✅ **Users can edit their reviews** - Click on filled star to open modal with existing rating/review pre-populated
- ✅ User's rating displayed as filled star + number (e.g., ⭐ 8) with "Click to edit" hint
- ✅ Backend supports both create and update operations on same endpoint (POST /api/reviews)
- ✅ Modal shows 10-star rating interface with current rating pre-selected for editing
- ✅ Review text auto-populated when editing existing review

**Previous Updates - App Visibility & Rating UI:**
- ✅ **FIXED: App visibility issue** - New apps now immediately visible to all users (changed default status from "draft" to "published")
- ✅ Updated existing draft apps to published status in database
- ✅ Form validation errors display on submit page with user-friendly field names
- ✅ Backend check prevents creators from rating their own apps (403 error)
- ✅ Frontend hides rating form if user is the app creator
- ✅ Fixed field name mismatches (profilePictureUrl, name, body fields)

**Clean Database Migration Completed:**
- ✅ Dropped all old tables and recreated database with clean normalized schema (12 tables)
- ✅ Implemented proper many-to-many relationships (app_tools, app_tags join tables)
- ✅ Added foreign key relationships (apps → categories, apps → users)
- ✅ Created transformation layer to convert normalized data to frontend-compatible format
- ✅ Added 3 dummy apps with realistic data and proper relationships
- ✅ All tests passing - homepage, app details, reviews, and comments working correctly

**10-Star Ratings & Comments System:**
- Upgraded rating system from 5 stars to 10 stars for more granular feedback
- Implemented comments section with nested replies support (one level deep)
- ReviewSection component with 10-star submission and collapsible UI
- CommentsSection component with real-time posting and reply functionality
- Self-rating prevention at both backend and frontend levels

**Migration from Firebase to Direct Google OAuth:**
- Removed Firebase dependency completely - now using direct Google OAuth with Passport.js
- Simplified authentication to use only Google Cloud Console credentials (no Firebase project needed)
- Implemented session-based authentication with PostgreSQL session storage
- Users log in with Google OAuth redirect flow (standard OAuth, not popup)
- All authentication state managed server-side via sessions

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18+ with TypeScript for type safety
- Vite as the build tool and development server with HMR support
- Wouter for lightweight client-side routing (routes: `/`, `/submit`, `/app/:id`)
- TanStack Query (React Query) for server state management with infinite stale time

**UI Component System:**
- shadcn/ui (New York style) with Radix UI primitives for accessible components
- Tailwind CSS for styling with custom design system
- Custom color palette with light/dark mode support (primary: vibrant purple, tool-specific badge colors)
- Typography: Inter (UI/body), Plus Jakarta Sans (headlines), JetBrains Mono (code/tags)
- Component library includes forms, dialogs, cards, badges, avatars, toasts, and more

**State Management:**
- React Query for API data caching and synchronization
- React Hook Form with Zod validation for form state
- Local component state for UI interactions (filters, search, pagination)
- Session-based authentication checked via `/api/auth/user` endpoint

### Backend Architecture

**Server Framework:**
- Express.js as the HTTP server
- TypeScript with ES modules for type-safe backend code
- Session-based authentication with express-session and PostgreSQL storage

**API Design:**
- RESTful API endpoints under `/api` prefix
- Authentication routes: `/api/login` (Google OAuth), `/api/callback` (OAuth callback), `/api/logout` (destroy session)
- Auth status: `/api/auth/user` (returns current user from session)
- App routes: `/api/apps` (list with filters), `/api/apps/:id` (details), `/api/apps/:id/launch` (increment counter)
- Review routes: `/api/apps/:id/reviews` (create/list), `/api/apps/:id/rating` (average rating), `/api/reviews` (create)
- Object storage routes: `/objects/:objectPath`, `/api/objects/upload`, `/api/apps/image`

**Authentication & Authorization:**
- Google OAuth 2.0 via Passport.js with passport-google-oauth20 strategy
- Session management with express-session and connect-pg-simple
- Sessions stored in PostgreSQL `sessions` table (auto-created)
- `isAuthenticated` middleware in `server/googleAuth.ts` checks `req.isAuthenticated()`
- User data extracted from Google profile and upserted to database
- Page-level and API-level auth guards
- Unauthenticated requests return 401, handled by frontend to redirect to `/api/login`

### Data Storage Solutions

**Database:**
- PostgreSQL via Neon serverless driver with WebSocket support
- Drizzle ORM for type-safe database queries and schema management
- Schema migrations managed through `drizzle-kit push`

**Database Schema:**
- `app_listings`: Core app data (name, descriptions, URLs, tools, category, creator info, preview image, tags, learnings, launch count, timestamps, status)
- `users`: User profiles from Google OAuth (id = Google profile ID, email, name, profilePictureUrl, bio, social links, role, createdAt, updatedAt)
- `reviews`: User reviews with ratings (app_id, user_id, rating 1-10, reviewText, createdAt) with unique constraint on (appId, userId) - 10-star rating system
- `comments`: User comments with nested replies (app_id, user_id, content, parent_comment_id for replies, createdAt) - supports one level of nesting
- `sessions`: Session storage table (auto-created by connect-pg-simple)

**File Storage:**
- Google Cloud Storage for image uploads
- Object storage accessed via Replit sidecar with external account credentials
- ACL policy system for public/private file access control
- Uppy dashboard for client-side file uploads with AWS S3-compatible interface
- Preview images limited to 5MB, image/* mime types only

**Data Access Patterns:**
- Repository pattern through `IStorage` interface implemented by `DatabaseStorage`
- Filtering by search term (ilike across name, description, creator, tags), tools (array contains), category
- Sorting by newest, oldest, or popular (launch count)
- Average rating calculation via SQL aggregation
- Launch count increment with optimistic UI updates
- User upsert on authentication (Google profile ID as primary key)

### External Dependencies

**Third-Party Services:**
- Google OAuth 2.0: Direct authentication (no Firebase needed)
- Google Cloud Storage: Image hosting and delivery
- Neon PostgreSQL: Serverless database hosting

**Key Libraries:**
- @neondatabase/serverless: PostgreSQL database client
- @google-cloud/storage: GCS SDK for file operations
- drizzle-orm: Type-safe SQL query builder
- passport: Authentication middleware framework
- passport-google-oauth20: Google OAuth 2.0 strategy for Passport
- express-session: Session management middleware
- connect-pg-simple: PostgreSQL session store for express-session
- @uppy/core, @uppy/aws-s3, @uppy/dashboard: File upload UI and logic
- react-hook-form + @hookform/resolvers + zod: Form validation
- react-markdown + remark-gfm: Markdown rendering for descriptions
- date-fns: Date formatting utilities

**Development Tools:**
- @replit/vite-plugin-runtime-error-modal: Enhanced error overlay
- @replit/vite-plugin-cartographer: Development tooling
- tsx: TypeScript execution for development
- esbuild: Production build bundling

### Authentication Flow

**Client-Side:**
1. User clicks "Login with Google" → redirects to `/api/login`
2. `/api/login` initiates Google OAuth flow (Passport.js)
3. User authenticates with Google on Google's OAuth page
4. Google redirects back to `/api/callback` with authorization code
5. Passport exchanges code for user profile data
6. User data upserted to PostgreSQL, session created
7. User redirected to home page (`/`) with session cookie

**Backend:**
1. `/api/login` route uses `passport.authenticate('google')` to start OAuth
2. `/api/callback` route uses `passport.authenticate('google')` to complete OAuth
3. Passport strategy extracts user data from Google profile
4. User upserted to database (Google profile ID as primary key)
5. `passport.serializeUser` stores user ID in session
6. `passport.deserializeUser` fetches user from database on subsequent requests
7. Protected routes check `req.isAuthenticated()` via `isAuthenticated` middleware

**Session Management:**
1. Sessions stored in PostgreSQL `sessions` table via connect-pg-simple
2. Session cookie (httpOnly, secure in production, sameSite: lax)
3. 30-day session expiration
4. All API requests include session cookie via `credentials: 'include'`

**Logout:**
1. User clicks "Logout" → POST to `/api/logout`
2. `req.logout()` destroys session
3. Session removed from database
4. User redirected to home page

### Google OAuth Configuration

**Required Setup:**
1. Google Cloud Console project with OAuth 2.0 credentials
2. Authorized redirect URI must include: `https://YOUR-REPLIT-URL/api/callback`
3. Environment variables:
   - `GOOGLE_CLIENT_ID`: OAuth 2.0 Client ID
   - `GOOGLE_CLIENT_SECRET`: OAuth 2.0 Client Secret
   - `SESSION_SECRET`: Secret for signing session cookies (optional, auto-generated if not set)

**Current Callback URL:**
- `https://316b5bd2-9f58-4298-8c70-82bb67a42bfa-00-1ygsbduvpp84b.spock.replit.dev/api/callback`
- This must be added to Google Cloud Console → Credentials → OAuth 2.0 Client → Authorized redirect URIs
