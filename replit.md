# Vibecoded Apps Marketplace

## Overview

The Vibecoded Apps Marketplace is a platform for discovering and sharing applications built with AI-powered coding tools (vibecoding). Users can browse apps created with tools like Replit Agent, Bolt.new, v0, Cursor, Claude, ChatGPT, Lovable, and Windsurf. Creators can submit their AI-built applications with detailed information including screenshots, descriptions, key learnings, and the tools used to build them. The platform features a modern, vibrant design inspired by Product Hunt, Dribbble, and the App Store, with comprehensive filtering, search, and review capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

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

### Backend Architecture

**Server Framework:**
- Express.js as the HTTP server
- TypeScript with ES modules for type-safe backend code
- Session-based authentication with PostgreSQL session store

**API Design:**
- RESTful API endpoints under `/api` prefix
- Authentication routes: `/api/auth/user`, `/api/login`, `/api/callback`
- App routes: `/api/apps` (list with filters), `/api/apps/:id` (details), `/api/apps/:id/launch` (increment counter)
- Review routes: `/api/apps/:id/reviews` (create/list), `/api/apps/:id/rating` (average rating)
- File upload: `/api/upload/start` for signed upload URLs

**Authentication & Authorization:**
- OpenID Connect (OIDC) authentication via Replit
- Passport.js with custom OIDC strategy
- Session management with connect-pg-simple for PostgreSQL storage
- Page-level and API-level auth guards (isAuthenticated middleware)
- Unauthenticated requests return 401, handled by frontend to redirect to login

### Data Storage Solutions

**Database:**
- PostgreSQL via Neon serverless driver with WebSocket support
- Drizzle ORM for type-safe database queries and schema management
- Schema migrations managed through `drizzle-kit push`

**Database Schema:**
- `app_listings`: Core app data (name, descriptions, URLs, tools, category, creator info, preview image, tags, learnings, launch count, timestamps, status)
- `users`: User profiles from Replit auth (id, username, full name, profile image, bio, timestamps)
- `reviews`: User reviews with ratings (app_id, user_id, rating 1-5, comment, timestamps)
- `sessions`: Express session storage for authentication state

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

### External Dependencies

**Third-Party Services:**
- Replit Authentication (OIDC): User login and identity management
- Google Cloud Storage: Image hosting and delivery
- Neon PostgreSQL: Serverless database hosting

**Key Libraries:**
- @neondatabase/serverless: PostgreSQL database client
- @google-cloud/storage: GCS SDK for file operations
- drizzle-orm: Type-safe SQL query builder
- openid-client: OIDC authentication
- @uppy/core, @uppy/aws-s3, @uppy/dashboard: File upload UI and logic
- react-hook-form + @hookform/resolvers + zod: Form validation
- react-markdown + remark-gfm: Markdown rendering for descriptions
- date-fns: Date formatting utilities

**Development Tools:**
- @replit/vite-plugin-runtime-error-modal: Enhanced error overlay
- @replit/vite-plugin-cartographer: Development tooling
- tsx: TypeScript execution for development
- esbuild: Production build bundling