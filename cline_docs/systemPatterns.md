# System Architecture Patterns

## API Patterns

### Error Handling
- Consistent error response format across all API endpoints
- Detailed error logging with context
- Client-friendly error messages

### Debugging
1. Debug Endpoints
   - Dedicated `/api/debug/*` routes for system diagnostics
   - Comprehensive status checks (auth, database, external services)
   - Safe to use in production (no sensitive data exposure)

2. Enhanced Logging
   - Structured logging with context
   - Operation timestamps
   - User context when available
   - Resource accessibility checks

## Frontend Patterns

### Component Architecture
1. Data Fetching
   - Server-side data fetching where possible
   - Client-side fetching with proper error handling
   - Pagination support for large datasets

2. Error Handling
   - Fallback UI for error states
   - User-friendly error messages
   - Retry mechanisms for failed operations

3. Debug Features
   - Debug UI components hidden by default
   - System status checks
   - Resource accessibility verification

### State Management
1. Component State
   - useState for local component state
   - useEffect for side effects and data fetching
   - Props for component configuration

2. Authentication State
   - NextAuth.js session management
   - Protected routes and components
   - Session status checks

## Database Patterns

### Query Patterns
1. Select Operations
   - Paginated queries for large datasets
   - Efficient joins and relationships
   - User-scoped queries for security

2. Connection Management
   - Connection pooling
   - Error handling and retries
   - Health checks

## Image Handling

### Storage
- Vercel Blob storage for image files
- URL-based access
- Accessibility verification

### Display
- Next.js Image component for optimization
- Lazy loading for performance
- Error fallbacks for failed loads
