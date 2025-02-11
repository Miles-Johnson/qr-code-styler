# System Architecture Patterns

## Image Storage and Display Pattern

### Storage Flow
1. Generated images are stored in Vercel Blob storage
2. Image URLs and metadata stored in PostgreSQL database
3. Images are associated with user IDs for access control

### Image Loading Pattern
1. Next.js Image Component Configuration
   - Domains whitelisted in next.config.js
   - Support for Vercel Blob storage URLs
   - Optimized loading with priority for first page

2. Error Handling Pattern
   - Fallback UI for failed image loads
   - Comprehensive error logging
   - User feedback through toast notifications

3. Gallery Loading Pattern
   - Pagination with configurable limit
   - Lazy loading for performance
   - Optimistic UI updates

## Authentication Pattern

### Session Management
1. NextAuth.js for authentication
2. JWT strategy for session handling
3. Environment-specific configuration
   - Development: localhost:3000
   - Production: deployed URL

### Database Integration
1. User data stored in PostgreSQL
2. Drizzle ORM for database operations
3. Connection pooling for performance

## API Patterns

### Error Handling
1. Consistent error response format
2. Detailed logging in production
3. User-friendly error messages

### Data Validation
1. Type checking with TypeScript
2. Input validation at API boundaries
3. Database schema enforcement

## Frontend Patterns

### Component Architecture
1. Client-side components marked with 'use client'
2. Server-side components for data fetching
3. Shared UI components in /components/ui

### State Management
1. React hooks for local state
2. Context for global state
3. Server state with SWR/React Query

### UI/UX Patterns
1. Loading states with skeleton screens
2. Error states with retry mechanisms
3. Toast notifications for user feedback

## Development Patterns

### Environment Configuration
1. Local development with .env.local
2. Production with environment variables
3. Type-safe configuration

### Database Management
1. Drizzle for schema management
2. Migration scripts for schema changes
3. Separate dev/prod databases
