# Technical Context

## Development Environment
-   **Framework**: Next.js 13.5.8 (with App Router)
-   **Language**: TypeScript 5.2.2
-   **Runtime**: Node.js
-   **Database**: PostgreSQL (Neon)
-   **Payment Gateway**: Stripe API (API Version: `2025-02-24.acacia`)
-   **AI Integration**: Replicate API
-   **Image Storage**: Vercel Blob Storage

## Key Dependencies
-   **Authentication**: NextAuth.js (for Google OAuth and Credentials provider)
-   **Database ORM**: Drizzle ORM (for PostgreSQL interactions)
-   **Payments**: Stripe SDK
-   **AI Model Interaction**: Replicate SDK
-   **Styling**: TailwindCSS (utility-first CSS framework)
-   **UI Components**: Radix UI (foundational components for accessibility) and shadcn/ui (pre-built, customizable components on top of Radix UI)
-   **Form Management**: React Hook Form with Zod for validation
-   **Image Processing**: Sharp (for image manipulation, likely on the server-side)
-   **QR Code Generation (Frontend)**: `qrcode.react`
-   **Notifications**: Sonner (for toast messages)
-   **Icons**: Lucide React

## API Integrations
1.  **Stripe**:
    *   Secret Key: `process.env.STRIPE_SECRET_KEY`
    *   Basic Plan Price ID: `process.env.STRIPE_BASIC_PRICE_ID` (e.g., `price_1R0IC5FQBFx9IphFjKf7UL5b`)
    *   Premium Plan Price ID: `process.env.STRIPE_PREMIUM_PRICE_ID` (e.g., `price_1R0ICzFQBFx9IphFYbQMTegf`)
    *   Webhook Secret: `process.env.STRIPE_WEBHOOK_SECRET`
    *   API Version: `2025-02-24.acacia`
2.  **Google OAuth**:
    *   Client ID: `process.env.GOOGLE_CLIENT_ID`
    *   Client Secret: `process.env.GOOGLE_CLIENT_SECRET`
    *   Redirect URI: `http://localhost:3000/api/auth/callback/google` (for local development)
3.  **Replicate**:
    *   API Token: `process.env.REPLICATE_API_TOKEN`
    *   Model Version: `d9243e828737bd0ce73e8cb95f81cead59dead23a303445e676147f02d6121cb` (used for AI styling)
    *   Webpack `externals` configuration for `canvas` is required for Replicate integration.
4.  **Vercel Blob Storage**:
    *   Read/Write Token: `process.env.BLOB_READ_WRITE_TOKEN`
    *   Used for permanent storage of generated QR code images.

## Database Schema
The schema is defined using Drizzle ORM in `src/schema.ts`.
1.  **Users Table**:
    *   `id`: uuid PRIMARY KEY
    *   `email`: text UNIQUE
    *   `name`: text
    *   `hashed_password`: text (default placeholder, actual hash on creation)
    *   `role`: text (default 'user')
    *   `email_verified`: boolean
    *   `last_login`: timestamp
    *   `created_at`: timestamp
    *   **Subscription Fields**: `subscription_tier`, `subscription_expires_at`, `monthly_generation_count`, `monthly_generation_reset`, `stripe_customer_id`
2.  **Generated Images Table**:
    *   `id`: uuid PRIMARY KEY
    *   `user_id`: uuid REFERENCES users(id)
    *   `image_url`: text (Vercel Blob URL)
    *   `prompt`: text
    *   `created_at`: timestamp
    *   `prediction_id`: text (Replicate prediction ID)
    *   `width`: integer
    *   `height`: integer
    *   `original_qr_url`: text (nullable, for the original QR code image if uploaded)
3.  **Subscription Plans Table**:
    *   `id`: uuid PRIMARY KEY
    *   `name`: text UNIQUE
    *   `stripe_price_id`: text
    *   `price`: integer (in cents)
    *   `max_monthly_generations`: integer
    *   `max_image_width`: integer
    *   `max_image_height`: integer
    *   `queue_priority`: integer
    *   `features`: text (JSON string)
4.  **Payments Table**:
    *   `id`: uuid PRIMARY KEY
    *   `user_id`: uuid REFERENCES users(id)
    *   `plan_id`: uuid REFERENCES subscription_plans(id)
    *   `amount`: integer (in cents)
    *   `stripe_payment_intent_id`: text
    *   `stripe_subscription_id`: text
    *   `status`: text ('pending', 'completed', 'failed', 'refunded')
    *   `created_at`: timestamp

## API Routes
1.  **Authentication**:
    *   `/api/auth/[...nextauth]`: NextAuth.js API routes for sign-in, sign-out, and session management.
2.  **Subscription**:
    *   `/api/subscription/checkout`: Handles initiation of Stripe checkout sessions.
    *   `/api/webhook/stripe`: Stripe webhook endpoint for processing payment and subscription events.
    *   `/api/user/subscription`: (Likely for fetching/managing user's subscription details).
3.  **Image Generation**:
    *   `/api/predictions` (POST): Initiates AI image generation via Replicate.
    *   `/api/predictions/[id]` (GET): Fetches prediction status from Replicate and handles image storage to Vercel Blob.
    *   `/api/predictions/[id]/stream`: (Not explicitly traced, but likely for streaming prediction updates).

## Frontend Routes
1.  **Main Routes**:
    *   `/` (home page)
    *   `/subscription`: Displays subscription plans and initiates checkout.
    *   `/subscription/success`: Success page after Stripe checkout.
    *   `/subscription/cancel`: Cancel page after Stripe checkout.
2.  **Protected Routes**:
    *   `/dashboard`
    *   `/settings`
    *   `/gallery` (likely `UserGallery.tsx` component)

## Development Commands
*   `npm run dev`: Starts the Next.js development server.
*   `npm run build`: Creates a production build of the Next.js application.
*   `npm run migrate`: Runs Drizzle ORM database migrations (production).
*   `npm run migrate:dev`: Runs Drizzle ORM database migrations (development).
*   `npm run migrate:subscription`: Runs specific subscription-related database migrations.
*   `npm run migrate:subscription:dev`: Runs specific subscription-related database migrations (development).
*   `npm run test-env`: Tests environment variables.
*   `npm run test-db`: Tests database connection.
*   `npm run test-insert`: Tests database insertion.
*   `npm run start`: Starts the production server.
*   `npm run lint`: Runs Next.js linter.

## Environment Variables
Required in `.env.local`:
-   `DATABASE_URL`: PostgreSQL connection string.
-   `NEXTAUTH_SECRET`: Secret for NextAuth.js.
-   `NEXTAUTH_URL`: Base URL for NextAuth.js callbacks.
-   `GOOGLE_CLIENT_ID`: Google OAuth client ID.
-   `GOOGLE_CLIENT_SECRET`: Google OAuth client secret.
-   `STRIPE_SECRET_KEY`: Stripe API secret key.
-   `STRIPE_WEBHOOK_SECRET`: Stripe webhook signing secret.
-   `STRIPE_BASIC_PRICE_ID`: Stripe Price ID for the Basic plan.
-   `STRIPE_PREMIUM_PRICE_ID`: Stripe Price ID for the Premium plan.
-   `REPLICATE_API_TOKEN`: Replicate API token.
-   `BLOB_READ_WRITE_TOKEN`: Vercel Blob storage token.
-   `VERCEL_URL`: (Optional, used for webhook host in production).
-   `NGROK_HOST`: (Optional, used for webhook host in development if using ngrok).

## Deployment
-   **Hosting**: Vercel
-   **Database**: Neon (PostgreSQL)
-   **Payments**: Stripe
-   **OAuth**: Google Cloud Console
-   **AI Processing**: Replicate
-   **Image Storage**: Vercel Blob Storage
