# System Architecture Patterns

## Authentication Flow
1. User clicks "Sign in" button
2. Dialog opens with options:
   - Continue with Google
   - Email/Password sign in
3. Google OAuth flow:
   - Redirect to Google sign-in
   - User authenticates
   - Return to application
4. Session management via NextAuth
5. Protected routes require authentication

## Subscription System

### Tier Management
- Free tier default for new users
- Subscription status stored in user record
- Monthly usage limits tracked per user
- Reset counters monthly

### Stripe Integration
1. Subscription Plans:
   - Basic: price_1R0IC5FQBFx9IphFjKf7UL5b ($9.99/month)
   - Premium: price_1R0ICzFQBFx9IphFYbQMTegf ($19.99/month)
2. Checkout Flow:
   - User selects plan
   - Redirect to Stripe Checkout
   - Handle success/cancel returns
3. Webhook Handling:
   - Process subscription events
   - Update user subscription status
   - Track payment history

### Feature Access Control
1. Middleware checks:
   - User authentication
   - Subscription status
   - Usage limits
2. Feature gates:
   - Resolution limits
   - Monthly generation quotas
   - Queue priority
   - Advanced features

## Database Schema
1. Users Table:
   - Authentication info
   - Subscription tier
   - Usage tracking
   - Stripe customer ID
2. Generated Images:
   - User reference
   - Image metadata
   - Generation parameters
3. Subscription Plans:
   - Tier details
   - Price information
   - Feature limits
4. Payments:
   - Transaction history
   - Subscription links
   - Payment status

## API Structure
1. Authentication:
   - NextAuth routes
   - Session management
2. Subscription:
   - Plan management
   - Usage tracking
   - Payment processing
3. Image Generation:
   - QR code creation
   - Style application
   - Result storage

## Frontend Components
1. Authentication:
   - Login dialog
   - OAuth buttons
   - Session display
2. Subscription:
   - Plan comparison
   - Feature lists
   - Payment UI
3. Image Management:
   - Upload interface
   - Gallery view
   - Style controls

## Error Handling
1. Authentication:
   - Invalid credentials
   - OAuth failures
   - Session expiry
2. Subscription:
   - Payment failures
   - Limit exceeded
   - Feature access denied
3. Generation:
   - Processing errors
   - Invalid inputs
   - Resource limits
