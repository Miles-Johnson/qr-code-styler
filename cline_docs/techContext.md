# Technical Context

## Technology Stack
- **Frontend**: Next.js 13.5.1
- **Database**: PostgreSQL (Neon)
- **ORM**: Drizzle ORM
- **Authentication**: NextAuth.js
- **Image Storage**: Vercel Blob Storage
- **Styling**: Tailwind CSS

## Development Setup
### Database Configuration
- Production Database: Neon PostgreSQL (DATABASE_URL)
- Development Database: Separate Neon instance (DEV_DATABASE_URL)
- Environment-based switching using NODE_ENV

### Database Schema
- Users table for authentication and user management
- Generated Images table for storing QR code transformations
- Relationships maintained through foreign keys

## Technical Constraints
- Using free tier services where possible
- Keeping complexity minimal for maintainability
- Focus on developer-friendly tools and practices

## Environment Variables
- DATABASE_URL: Production database connection
- DEV_DATABASE_URL: Development database connection
- BLOB_READ_WRITE_TOKEN: Vercel Blob storage access
- REPLICATE_API_TOKEN: For AI image processing
- Various auth-related tokens (Google, NextAuth)

## Development Tools
- drizzle-kit for database migrations
- cross-env for environment variable management
- TypeScript for type safety
- ESLint for code quality
