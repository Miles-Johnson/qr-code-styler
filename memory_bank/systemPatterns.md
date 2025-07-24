# System Architecture Patterns

## Authentication Flow
The application uses **NextAuth.js** for robust authentication, supporting both social and credential-based logins.

1.  **UI Entry Points**:
    *   `components/LoginButton.tsx`: Displays "Sign in" button (or user email if logged in). Triggers a `Dialog` containing `SignInForm.tsx`.
    *   `components/SignInForm.tsx`: Provides options to "Continue with Google" or sign in with email/password.
2.  **NextAuth.js Configuration (`app/api/auth/[...nextauth]/route.ts`)**:
    *   **Providers**: Configured for `Google` OAuth and `Credentials` (email/password).
        *   `Credentials` provider uses `bcryptjs` for password hashing and `getUserByEmail` to validate credentials against the database.
    *   **Callbacks**:
        *   `signIn`: Handles user creation for new Google sign-ins (if user doesn't exist in DB) and attaches database `id` and `role` to the user object.
        *   `jwt`: Populates the JWT token with `id` and `role` from the database, and updates `lastLogin` timestamp.
        *   `session`: Exposes `id` and `role` on the client-side `session.user` object.
    *   **Session Management**: Uses `jwt` strategy with a 30-day max age.
3.  **Session Management**: `components/AuthProvider.tsx` wraps the application with `SessionProvider` from `next-auth/react` to make session data available globally.
4.  **Protected Routes**: Routes requiring authentication are protected by checking the user session (e.g., `app/subscription/page.tsx`).

## Subscription System
The application implements a tiered subscription model integrated with Stripe for payments and usage-based feature access.

### Tier Management
*   **Definition**: Subscription tiers (FREE, BASIC, PREMIUM) and their associated limits (e.g., `maxMonthlyGenerations`, `maxWidth`, `queuePriority`) are centrally defined in `src/utils/subscription.ts` within the `TIER_LIMITS` object.
*   **User Status**: Subscription status, expiration, and monthly generation counts are stored in the `users` table in the database.
*   **Logic**: `src/utils/subscription.ts` contains core functions like `getUserSubscription`, `canGenerateImage` (handles expiration, monthly resets, and limit checks), `incrementGenerationCount`, and `updateUserSubscription`.

### Stripe Integration
1.  **Checkout Flow (`app/api/subscription/checkout/route.ts`)**:
    *   Initiated from `app/subscription/page.tsx` via a `POST` request.
    *   Authenticates the user session.
    *   Retrieves plan details from the database.
    *   For paid plans, creates a Stripe Checkout Session (`mode: 'subscription'`) using `STRIPE_SECRET_KEY` and specific `STRIPE_BASIC_PRICE_ID`/`STRIPE_PREMIUM_PRICE_ID` from environment variables.
    *   Redirects user to Stripe for payment.
    *   Handles free tier activation directly without Stripe.
2.  **Webhook Handling (`app/api/webhook/stripe/route.ts`)**:
    *   Verifies incoming Stripe webhooks using `STRIPE_WEBHOOK_SECRET`.
    *   Processes key events to update the database:
        *   `checkout.session.completed`: Updates user subscription and records initial payment.
        *   `invoice.paid`: Handles recurring payments, updates subscription expiration, and records payment.
        *   `customer.subscription.updated`: Updates user's subscription details (e.g., plan changes).
        *   `invoice.payment_failed`: Records failed payments.
        *   `customer.subscription.deleted`: Downgrades user to FREE tier upon subscription cancellation.

### Feature Access Control
*   **Middleware Enforcement (`src/middleware/subscription.ts`)**: A dedicated middleware function wraps API routes (e.g., `/api/predictions`) to enforce subscription limits.
    *   Checks user authentication.
    *   Calls `canGenerateImage` to determine if the user has exceeded their monthly generation limit or if their subscription has expired.
    *   Returns 403 if limits are exceeded, providing a reason and remaining count.
    *   If successful, increments the user's generation count via `incrementGenerationCount`.

## Database Schema
The application uses **PostgreSQL** with **Drizzle ORM** for database interactions. The schema is defined in `src/schema.ts`.

*   **`users`**: Stores user authentication details, roles, and comprehensive subscription information (tier, expiration, generation counts, Stripe customer ID).
*   **`subscription_plans`**: Defines the available subscription tiers, their Stripe price IDs, pricing, and feature limits.
*   **`payments`**: Records all payment transactions, linking to users and plans.
*   **`generated_images`**: Stores metadata for AI-generated QR codes, including user reference, image URL (from Vercel Blob), prompt, and prediction ID.
*   **Schema Evolution**: The `migrations` directory (`0000_opposite_timeslip.sql`, `0001_remove_original_qr_url.sql`, `0002_seed_subscription_plans.sql`, `0003_make_original_qr_url_nullable.sql`) shows the historical changes to the database structure, including the initial setup, seeding of subscription plans, and modifications to the `original_qr_url` field.

## API Structure
The application exposes several API routes for core functionalities.

1.  **Authentication**: Handled by NextAuth.js at `/api/auth/[...nextauth]`.
2.  **Subscription**:
    *   `/api/subscription/checkout`: Initiates Stripe checkout sessions.
    *   `/api/webhook/stripe`: Receives and processes Stripe webhook events.
    *   `/api/user/subscription`: (Likely for fetching/managing user's subscription details, though not explicitly traced in detail).
3.  **Image Generation (`app/api/predictions/route.ts`, `app/api/predictions/[id]/route.ts`)**:
    *   **Initiation (`POST /api/predictions`)**:
        *   Receives QR code image (base64) and prompt from `ImageUploadForm.tsx`.
        *   Applies `subscriptionMiddleware` for limit enforcement.
        *   Calls **Replicate API** (`replicate.predictions.create`) to start the AI generation process, passing user-specific image dimensions (`maxWidth`, `maxHeight`) from their subscription limits.
        *   Configures webhooks for Replicate to notify the application on prediction start/completion.
    *   **Status Polling & Storage (`GET /api/predictions/[id]`)**:
        *   Polled by `ImageUploadForm.tsx` to check prediction status.
        *   Fetches prediction status from Replicate.
        *   Upon `succeeded` status, downloads the generated image from Replicate (with retries).
        *   Uploads the image to **Vercel Blob Storage** (`@vercel/blob`) for permanent storage.
        *   Inserts image metadata (including the Vercel Blob URL) into the `generated_images` table via `insertGeneratedImage`.

## Frontend Components
The frontend is built with **Next.js** and **React**, utilizing a modular component architecture.

1.  **Design System**: Based on **shadcn/ui** (built on **Radix UI**), providing a rich set of accessible and customizable UI primitives in `components/ui` (e.g., `Button`, `Input`, `Card`, `Dialog`).
2.  **Core Components**: Higher-level components in the `components` directory compose these UI primitives to deliver specific features:
    *   `ImageUploadForm.tsx`: Main interface for QR code styling.
    *   `QRCodeGenerator.tsx`: Generates basic QR codes using `qrcode.react`.
    *   `QRCodeModal.tsx`: Likely a modal wrapper for `QRCodeGenerator.tsx`.
    *   `LoginButton.tsx`, `SignInForm.tsx`, `AuthProvider.tsx`: Handle authentication UI and context.
    *   `SubscriptionStatus.tsx`, `UserGallery.tsx`: Display user-specific information.
3.  **Styling**: Uses **Tailwind CSS** for utility-first styling. Theming (including dark mode) is implemented using CSS variables defined in `app/globals.css`, allowing for easy customization of colors and other design tokens. `tailwindcss-animate` plugin is used for animations.

## Error Handling
The system incorporates error handling at various layers:
*   **Authentication**: Handles invalid credentials, OAuth failures, and session expiry.
*   **Subscription**: Manages payment failures, limit exceeded scenarios (via middleware), and feature access denials.
*   **Generation**: Addresses Replicate API errors, image download failures, and database storage issues, with retry mechanisms for external calls.
