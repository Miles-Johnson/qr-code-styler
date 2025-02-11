# System Patterns

## Database Architecture
### Multi-Environment Setup
```typescript
// Environment-based database selection
const DATABASE_URL = process.env.NODE_ENV === 'development' 
  ? process.env.DEV_DATABASE_URL 
  : process.env.DATABASE_URL;
```

### Schema Design
- Users table as the core entity
- Generated Images linked to users via foreign key
- Timestamps for auditing (createdAt, lastLogin)
- UUID primary keys for security

## Development Patterns
### Database Operations
- Drizzle ORM for type-safe queries
- Centralized schema definitions
- Migration-based schema changes
- Environment-specific commands (e.g., migrate:dev)

### Environment Management
- NODE_ENV based configuration
- Separate databases for development and production
- Environment-specific npm scripts
- Cross-env for Windows compatibility

## Code Organization
### Database Layer
```
src/
  ├── schema.ts      # Database schema definitions
  ├── db.ts          # Database connection setup
  ├── migrate.ts     # Migration management
  └── queries/       # Organized query functions
      ├── insert.ts
      ├── select.ts
      ├── update.ts
      └── delete.ts
```

### Migration Pattern
1. Define schema changes in schema.ts
2. Generate migrations using drizzle-kit
3. Apply migrations using environment-specific commands
4. Verify changes with test data
