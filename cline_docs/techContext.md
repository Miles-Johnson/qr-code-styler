# Technical Context

## Core Technologies

### Frontend
- Next.js 14 with App Router
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui components

### Backend
- Next.js API Routes
- PostgreSQL with Neon
- Drizzle ORM
- NextAuth.js for authentication

### Image Processing
- Replicate API for image generation
- Vercel Blob Storage for image hosting
- Next.js Image component for optimization

## Infrastructure

### Database
- Neon PostgreSQL
- Connection pooling enabled
- Separate dev/prod databases
- Environment-specific connection strings

### Storage
- Vercel Blob Storage for images
- Public access configuration
- Blob read/write token required

### Authentication
- NextAuth.js with JWT strategy
- Google OAuth provider
- Credentials provider
- Environment-specific callback URLs

## Configuration Requirements

### Environment Variables
```
REPLICATE_API_TOKEN=
DATABASE_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
BLOB_READ_WRITE_TOKEN=
DEV_DATABASE_URL=
```

### Next.js Configuration
```javascript
// Image domains for next/image
remotePatterns: [
  {
    protocol: 'https',
    hostname: 'replicate.delivery',
  },
  {
    protocol: 'https',
    hostname: '*.public.blob.vercel-storage.com',
  }
]
```

## Development Setup

### Local Development
1. Install dependencies: `npm install`
2. Set up .env.local
3. Run development server: `npm run dev`

### Database Management
1. Create migrations: `npm run db:generate`
2. Apply migrations: `npm run db:push`
3. Type generation: `npm run db:types`

### Production Deployment
1. Configure environment variables
2. Verify database connections
3. Set NEXTAUTH_URL to deployment URL
