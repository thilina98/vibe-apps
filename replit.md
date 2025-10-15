# Vibecoded Apps Marketplace

## Overview

The Vibecoded Apps Marketplace is a platform for discovering and sharing applications built with AI-powered coding tools (vibecoding). Users can browse apps created with tools like Replit Agent, Bolt.new, v0, Cursor, Claude, ChatGPT, Lovable, and Windsurf. Creators can submit their AI-built applications with detailed information including screenshots, descriptions, key learnings, and the tools used to build them. The platform features a modern, vibrant design inspired by Product Hunt, Dribbble, and the App Store, with comprehensive filtering, search, and review capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (October 15, 2025)

**Migration from Replit Auth to Firebase Authentication:**
- Replaced Replit OIDC authentication with Firebase Authentication using Google sign-in provider
- Users no longer need a Replit account to log in - they can use any Google account
- Removed server-side session management and Passport.js
- Implemented client-side Firebase auth with token-based backend verification
- Updated all UI components to use Firebase `signInWithPopup` and `signOut` methods

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
- Firebase authentication state managed via `onAuthStateChanged` listener

### Backend Architecture

**Server Framework:**
- Express.js as the HTTP server
- TypeScript with ES modules for type-safe backend code
- Token-based authentication (Firebase ID tokens)

**API Design:**
- RESTful API endpoints under `/api` prefix
- Authentication route: `/api/auth/user` (verifies Firebase token, upserts user)
- App routes: `/api/apps` (list with filters), `/api/apps/:id` (details), `/api/apps/:id/launch` (increment counter)
- Review routes: `/api/apps/:id/reviews` (create/list), `/api/apps/:id/rating` (average rating), `/api/reviews` (create)
- Object storage routes: `/objects/:objectPath`, `/api/objects/upload`, `/api/apps/image`

**Authentication & Authorization:**
- Firebase Authentication with Google sign-in provider
- Firebase ID tokens sent in Authorization header as Bearer tokens
- Backend verification via Firebase REST API (`accounts:lookup` endpoint)
- `isAuthenticated` middleware in `server/firebaseAdmin.ts` validates tokens
- User data extracted from verified Firebase tokens and upserted to database
- Page-level and API-level auth guards
- Unauthenticated requests return 401, handled by frontend to trigger sign-in

### Data Storage Solutions

**Database:**
- PostgreSQL via Neon serverless driver with WebSocket support
- Drizzle ORM for type-safe database queries and schema management
- Schema migrations managed through `drizzle-kit push`

**Database Schema:**
- `app_listings`: Core app data (name, descriptions, URLs, tools, category, creator info, preview image, tags, learnings, launch count, timestamps, status)
- `users`: User profiles from Firebase auth (id = Firebase UID, email, firstName, lastName, profileImageUrl, createdAt, updatedAt)
- `reviews`: User reviews with ratings (app_id, user_id, rating 1-5, reviewText, createdAt) with unique constraint on (appId, userId)
- `sessions`: No longer used (removed with Replit Auth migration)

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
- User upsert on authentication (Firebase UID as primary key)

### External Dependencies

**Third-Party Services:**
- Firebase Authentication: Google OAuth login (no Replit account required)
- Google Cloud Storage: Image hosting and delivery
- Neon PostgreSQL: Serverless database hosting

**Key Libraries:**
- @neondatabase/serverless: PostgreSQL database client
- @google-cloud/storage: GCS SDK for file operations
- drizzle-orm: Type-safe SQL query builder
- firebase: Firebase Authentication SDK for client-side auth
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
1. Firebase SDK initialized with project credentials (client/src/lib/firebase.ts)
2. `useAuth` hook manages authentication state via `onAuthStateChanged`
3. User clicks "Login with Google" → `signInWithPopup(auth, googleProvider)` opens Google OAuth popup
4. On successful login, Firebase returns user object with ID token
5. ID token stored in sessionStorage for API requests
6. User data (UID, email, display name, photo) extracted and stored in React state

**Backend:**
1. Protected API endpoints require `Authorization: Bearer <idToken>` header
2. `isAuthenticated` middleware intercepts requests
3. Extracts token from Authorization header
4. Verifies token via Firebase REST API (identitytoolkit.googleapis.com/v1/accounts:lookup)
5. On successful verification, extracts user data and attaches to `req.user`
6. First request triggers user upsert to PostgreSQL (Firebase UID as primary key)

**Logout:**
1. User clicks "Logout" → `signOut(auth)` clears Firebase session
2. sessionStorage cleared
3. React state reset to null
