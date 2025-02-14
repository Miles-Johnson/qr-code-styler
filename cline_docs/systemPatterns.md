# System Patterns

## Architecture

### Frontend
- Next.js 13 App Router
- React Server Components
- Client Components for interactive features
- TailwindCSS for styling
- shadcn/ui for UI components

### Backend
- Next.js API Routes
- Drizzle ORM for database operations
- Neon PostgreSQL for data storage
- Vercel Blob for image storage
- Replicate API for AI image generation

## Key Patterns

### Authentication
- NextAuth.js for authentication
- Google OAuth provider
- Session-based auth with JWT

### Data Flow
1. Client-side form submission
2. Server-side API processing
3. AI image generation via Replicate
4. Image storage in Vercel Blob
5. Metadata storage in Neon PostgreSQL

### Image Gallery
- Simple fetch and display pattern
- No pagination (fetch all images)
- Auto-refresh on new image generation
- Lazy loading for performance
- Error handling with toast notifications

### Database Schema
- Users table with OAuth data
- Generated images table with:
  - User reference
  - Image URL (Vercel Blob)
  - Metadata (prompt, dimensions)
  - Timestamps

### Error Handling
- Toast notifications for user feedback
- Fallback UI states
- Graceful error recovery
- Debug logging in development

## Development Practices
- TypeScript for type safety
- Client/Server component separation
- Memory Bank documentation
- Feature-based commits
- Environment-based configuration
