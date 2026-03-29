# DropSplit AI

DropSplit AI is a production-oriented MVP for an AI swim coach focused on middle school and high school swimmers. The app is built around a chat-first coaching experience that can generate weekly plans, explain sets, recommend event focus, log swim times from natural language, and track progress over time.

## Stack

- Next.js 16 App Router + TypeScript
- Tailwind CSS v4 + shadcn/ui
- Supabase Auth, Postgres, and Storage
- OpenAI API for coaching and image summarization
- Stripe subscriptions
- Recharts for progress visualizations
- Zod + react-hook-form for typed forms
- Vercel-ready deployment

## Product Surface

- Marketing landing page
- Email/password auth flow
- Multi-step swimmer onboarding
- Dashboard with plan snapshot, stats, charting, and coach notes
- Chat-first coaching screen with natural-language time logging
- Weekly plan screen with adjustment actions
- Swim log and progress tracking
- Settings and billing pages
- File upload support for results screenshots and practice images
- Stripe subscription checkout + webhook scaffold

## Project Structure

```text
src/
  app/                App Router routes, layouts, and API handlers
  actions/            Server actions for auth, onboarding, and billing
  components/         Feature components and shared UI
  lib/                Integrations, AI logic, mock data, validation, helpers
  types/              Typed domain models
supabase/
  migrations/         SQL schema migration
  seed.sql            Demo data seed for local Supabase development
```

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example file and fill in the integrations you want to use.

```bash
cp .env.example .env.local
```

Required for full functionality:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_PRICE_ID_PRO`
- `STRIPE_WEBHOOK_SECRET`

### 3. Start the app

```bash
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

## Demo Mode

If Supabase environment variables are missing, the app falls back to a fully styled demo mode backed by realistic mock data in `/src/lib/mock-data.ts`. This is useful for UI work and quick product walkthroughs without provisioning external services.

## Supabase Setup

1. Create a Supabase project.
2. Enable Email auth in the Supabase dashboard.
3. Run the schema from `/supabase/migrations/20260328223000_initial_schema.sql` in the SQL editor.
4. Optional: run `/supabase/seed.sql` to create a demo swimmer account and sample data.
5. Add your project URL, anon key, and service role key to `.env.local`.

The migration creates:

- swimmer profile, goals, plans, workout, chat, log, billing, and usage tables
- row-level security policies scoped to the signed-in user
- a `swim-uploads` storage bucket and storage policies
- a helper RPC for monthly AI usage tracking

### Seed account

After running `/supabase/seed.sql`, you can sign in with:

- email: `dillon@dropsplit.dev`
- password: `SwimFast123!`

## Stripe Setup

1. Create a recurring monthly price in Stripe for the paid plan.
2. Put the price ID in `STRIPE_PRICE_ID_PRO`.
3. Start a webhook forwarder locally:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

4. Copy the reported webhook secret into `STRIPE_WEBHOOK_SECRET`.

Billing flow included in the scaffold:

- checkout session creation at `/api/stripe/checkout`
- webhook handling at `/api/stripe/webhook`
- subscription status persistence in `subscriptions`
- free-tier usage limit prompts in the app UI

## OpenAI Setup

Set `OPENAI_API_KEY` and optionally override `OPENAI_MODEL`.

The coaching layer includes:

- a swim-specific system prompt
- structured reply parsing for coach actions
- natural-language time detection
- workout explanation and adjustment helpers
- vision-based uploaded image summarization when a public image URL is available

## File Uploads

Uploaded images are stored in Supabase Storage under the `swim-uploads` bucket. The chat UI keeps upload affordances intentionally small, while the log page includes a cleaner dropzone for screenshots and result images.

## Quality Checks

```bash
npm run lint
npm run typecheck
npm run build
```

## Deployment Notes

### Vercel

1. Create a new Vercel project from this repository.
2. Add the same environment variables from `.env.local` to Vercel.
3. Set the production `NEXT_PUBLIC_APP_URL` to your deployed URL.
4. Update Stripe success, cancel, and webhook settings to use the production domain.
5. In Supabase auth settings, add your Vercel domain to the allowed redirect URLs.

### GitHub readiness

The repository is structured for standard GitHub + Vercel deployment. No Vite-specific tooling is used.

## Notes

- Light mode is the default product experience.
- The chat screen is the product center of gravity and drives the time-logging workflow.
- Dryland recommendations stay optional and conservative.
- Training guidance is written for intermediate age-group and high-school swimmers, not elite-volume programs.
