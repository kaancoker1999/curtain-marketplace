# CurtainOS

**AI-powered B2B operating system for the curtain industry.**

CurtainOS connects retailers, manufacturers, sewing workshops, fabric suppliers, installers
and creative studios in one ecosystem. Retailers can order finished products or individual
services (sewing, installation, measurement, design…), and the matching engine ranks the best
providers on six dimensions:

- **Price** — service pricing models (per panel / meter / m² / hour / fixed) plus volume
  discounts and rush fees from each provider's pricing rules
- **Delivery time** — lead time vs. the buyer's deadline
- **Production capacity** — free capacity in the provider's current week
- **Waste optimization** — how efficiently the requested panel width cuts from the
  provider's fabric roll widths
- **Logistics** — haversine distance from provider to delivery city, service radii respected
- **Rating** — review average, confidence-weighted by review count

## Stack

| Layer      | Tech |
|------------|------|
| Frontend   | Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui |
| Backend    | Next.js API routes · Prisma 7 ORM · PostgreSQL |
| AI         | Provider-agnostic abstraction layer ([src/lib/ai](src/lib/ai/index.ts)) with Anthropic + OpenAI adapters |
| Matching   | Deterministic scoring engine ([src/lib/matching](src/lib/matching/index.ts)), AI adds explanations on top |
| Auth       | Clerk (integration point ready, see below) |
| Storage    | Supabase Storage (env placeholders ready) |
| Payments   | Stripe (schema + env placeholders ready) |
| Maps       | Google Maps API (env placeholder ready) |
| Deployment | Vercel |

## Quick start (no database needed)

```bash
npm install
npm run dev
```

Open http://localhost:3000. The app runs in **demo mode**: every data reader falls back to a
realistic in-memory dataset ([src/lib/demo-data.ts](src/lib/demo-data.ts)) when PostgreSQL is
unreachable, so the whole UI — including the AI matching engine at `/dashboard/match` — works
immediately.

## Going live with PostgreSQL

1. Start the database (requires Docker; or point `DATABASE_URL` in `.env` at any Postgres):

   ```bash
   npm run db:up
   ```

2. Create the schema and seed it (the seed reuses the demo dataset, so nothing changes visually):

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

3. Restart `npm run dev`. The "Demo mode" badge in the sidebar disappears once the DB is live,
   and match runs are persisted as `Rfq` + `MatchResult` rows.

## Enabling AI explanations

Set in `.env`:

```bash
AI_PROVIDER="anthropic"        # or "openai"
ANTHROPIC_API_KEY="sk-ant-…"   # or OPENAI_API_KEY
```

The match API then adds a natural-language recommendation above the ranked results. Without a
key, the engine still produces deterministic per-provider explanations — AI is additive and
never a hard dependency.

## Project structure

```
prisma/schema.prisma        Normalized multi-vendor schema: organizations (multi-role),
                            locations, users/memberships, products/variants, fabrics,
                            service offerings, production capacity, warehouses/inventory,
                            pricing rules, RFQs/bids, match results, orders/shipments/
                            payments/reviews
prisma/seed.ts              Seeds the DB from the demo dataset
src/lib/types.ts            App-level domain types (Prisma-independent)
src/lib/demo-data.ts        Demo dataset + city coordinates
src/lib/data.ts             Data access layer with live-DB → demo fallback
src/lib/db.ts               Prisma client singleton (pg driver adapter)
src/lib/ai/                 AI provider abstraction (Anthropic / OpenAI)
src/lib/matching/           Scoring engine (pure, deterministic, versioned)
src/app/api/                organizations, products, fabrics, orders, stats, match
src/app/dashboard/          Overview, AI Matching, Marketplace, Network, Orders
```

## Next integration steps

- **Clerk**: `npm install @clerk/nextjs`, wrap the root layout in `<ClerkProvider>`, add
  `middleware.ts`, then link authenticated users to `User.clerkId` (already in the schema).
- **Stripe**: `Payment.providerRef` is reserved for PaymentIntent ids; add a checkout route
  and webhook handler when payments go live.
- **Supabase Storage**: use for product/fabric images (`Product.images`, `Fabric.imageUrl`).
- **Google Maps**: replace `CITY_COORDS` lookups with Geocoding API results and render match
  results on a map.
