# Technical Context

## Development Environment
- Next.js 13.5.8
- TypeScript
- Node.js
- PostgreSQL (Neon)
- Stripe API

## Key Dependencies
- NextAuth for authentication
- Drizzle ORM for database
- Stripe SDK for payments
- Replicate for AI processing
- TailwindCSS for styling
- Radix UI for components

## API Integrations
1. Stripe
   - Secret Key: [REDACTED]
   - Basic Plan ID: price_1R0IC5FQBFx9IphFjKf7UL5b
   - Premium Plan ID: price_1R0ICzFQBFx9IphFYbQMTegf
   - Webhook Secret: [REDACTED]

2. Google OAuth
   - Client ID: [REDACTED]
   - Redirect URI: http://localhost:3000/api/auth/callback/google

3. Replicate
   - API Token: [REDACTED - Set via REPLICATE_API_TOKEN env var]
   - Model Version: d9243e828737bd0ce73e8cb95f81cead59dead23a303445e676147f02d6121cb

## Database Schema
1. Users Table
   ```sql
   - id: uuid PRIMARY KEY
   - email: text UNIQUE
   - name: text
   - subscription_tier: text
   - subscription_expires_at: timestamp
   - monthly_generation_count: integer
   - monthly_generation_reset: timestamp
   - stripe_customer_id: text
   ```

2. Generated Images Table
   ```sql
   - id: uuid PRIMARY KEY
   - user_id: uuid REFERENCES users(id)
   - image_url: text
   - prompt: text
   - created_at: timestamp
   - prediction_id: text
   - width: integer
   - height: integer
   ```

3. Subscription Plans Table
   ```sql
   - id: uuid PRIMARY KEY
   - name: text UNIQUE
   - stripe_price_id: text
   - price: integer
   - max_monthly_generations: integer
   - max_image_width: integer
   - max_image_height: integer
   - queue_priority: integer
   - features: text (JSON)
   ```

4. Payments Table
   ```sql
   - id: uuid PRIMARY KEY
   - user_id: uuid REFERENCES users(id)
   - plan_id: uuid REFERENCES subscription_plans(id)
   - amount: integer
   - stripe_payment_intent_id: text
   - stripe_subscription_id: text
   - status: text
   - created_at: timestamp
   ```

## API Routes
1. Authentication
   - /api/auth/[...nextauth]
   - /api/auth/callback/google

2. Subscription
   - /api/subscription/checkout
   - /api/webhook/stripe
   - /api/user/subscription

3. Image Generation
   - /api/predictions
   - /api/predictions/[id]

## Frontend Routes
1. Main Routes
   - / (home)
   - /subscription
   - /subscription/success
   - /subscription/cancel

2. Protected Routes
   - /dashboard
   - /settings
   - /gallery

## Development Commands
```bash
# Development
npm run dev

# Database Migrations
npm run migrate
npm run migrate:subscription

# Testing
npm run test-env
npm run test-db
npm run test-insert
```

## Environment Variables
Required in .env.local:
- DATABASE_URL
- NEXTAUTH_SECRET
- NEXTAUTH_URL
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- REPLICATE_API_TOKEN
- BLOB_READ_WRITE_TOKEN

## Deployment
- Vercel for hosting
- Neon for database
- Stripe for payments
- Google Cloud Console for OAuth
- Replicate for AI processing
