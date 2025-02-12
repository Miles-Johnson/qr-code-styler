# Technical Stack

## Frontend
- Next.js 14 (React framework)
- TypeScript for type safety
- TailwindCSS for styling
- NextAuth.js for authentication
- Next/Image for image optimization

## Backend
- Next.js API routes
- Drizzle ORM for database operations
- Vercel Blob for image storage
- PostgreSQL (Neon) for database

## Development Tools
- ESLint for code quality
- Prettier for code formatting
- TypeScript for static typing
- Git for version control

## Debugging Infrastructure

### API Debug Endpoints
1. `/api/debug/gallery`
   - Authentication status check
   - Database connection verification
   - Image URL accessibility testing
   - Environment information

### Enhanced Logging
- Structured JSON logging
- Operation context tracking
- Error tracing
- Resource accessibility verification

### UI Debug Tools
- Debug components for system status
- Resource accessibility checks
- Authentication state verification

## Development Setup
1. Environment Variables:
   ```
   DATABASE_URL=postgresql://...
   DEV_DATABASE_URL=postgresql://...
   NEXTAUTH_SECRET=...
   NEXTAUTH_URL=http://localhost:3000
   ```

2. Development Commands:
   ```bash
   npm run dev     # Start development server
   npm run build   # Production build
   npm run start   # Start production server
   ```

## Production Environment
- Vercel deployment platform
- Neon PostgreSQL database
- Vercel Blob storage
- Production logging enabled
