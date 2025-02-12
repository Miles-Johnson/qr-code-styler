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
   - Separate mount and refresh effects
   - Optimized state updates

2. Error Handling
   - Fallback UI for error states
   - User-friendly error messages
   - Retry mechanisms for failed operations
   - Comprehensive error logging
   - State recovery after errors

3. Debug Features
   - Debug UI components hidden by default
   - System status checks
   - Resource accessibility verification
   - Component lifecycle logging
   - State change tracking

4. Gallery Implementation
   - Initial mount data loading
   - Refresh trigger handling
   - Ordered data presentation
   - Image loading optimization
   - Error boundary protection

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
   - Ordered result sets
   - Optimized filtering

2. Connection Management
   - Connection pooling
   - Error handling and retries
   - Health checks
   - Connection state logging
   - Automatic recovery

## Image Handling

### Storage
- Vercel Blob storage for image files
- URL-based access
- Accessibility verification

### Display
- Next.js Image component for optimization
- Lazy loading for performance
- Error fallbacks for failed loads
