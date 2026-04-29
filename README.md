# DrawClub

A production-oriented SaaS starter for subscription-based Stableford score tracking, monthly reward draws, charity contributions, and admin operations.

## Stack

- Next.js App Router, TypeScript, Tailwind CSS
- JWT session cookie auth
- Supabase-ready PostgreSQL schema in `lib/db/schema.sql`
- Persistent local JSON database for development, with Supabase schema/config handoff
- Stripe Checkout REST integration with mock fallback for local demos

## Demo Accounts

- Member: `member@drawclub.local` / `member123`
- Admin: `admin@drawclub.local` / `admin123`

## Features

- Email/password signup and login
- Role-based user/admin access
- Monthly/yearly subscription statuses
- Stableford score entry from 1 to 45
- Last five scores retained per user
- Duplicate score dates rejected
- Random and score-weighted draw simulation
- Published draws with jackpot rollover
- Prize pool split: 40% jackpot, 35% 4-match, 25% 3-match
- Charity selection with minimum 10% contribution
- User dashboard and admin dashboard

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Database

The Supabase/PostgreSQL schema is in:

```text
lib/db/schema.sql
```

Apply it in Supabase SQL Editor or through your migration workflow. The current app uses `lib/db/repository.ts` as a persistent local JSON store at `data/drawclub-db.json` so signup/login works across refreshes and dev-server restarts without external credentials.

Supabase environment detection lives in `lib/db/supabase.ts`. For final deployment, create a new Supabase project, apply `lib/db/schema.sql`, set `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, then replace the repository methods with Supabase queries using the same table names.

## Payments

`/api/subscriptions/checkout` is wired for Stripe Checkout through Stripe's REST API. If `STRIPE_SECRET_KEY` is present, the client receives a hosted Stripe Checkout URL and redirects there. If no key is present, the app runs an assignment-friendly mock checkout and activates the local subscription immediately.

Webhook handoff is available at:

```text
/api/stripe/webhook
```

For a demo without real Stripe keys, click either dashboard plan button and the subscription activates with visible feedback.

## Deployment

The project is Vercel-ready. Set at least:

```text
JWT_SECRET=
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

Copy `.env.example` to `.env.local` for local configuration.
