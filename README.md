# Maison Cake Co. — Canada Cake Ordering

Premium cake ordering starter built with current Next.js 16, TypeScript, Tailwind CSS, Supabase/PostgreSQL and Framer Motion.

## Stack

- Next.js 16.3.5
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase Auth / PostgreSQL / Storage
- Framer Motion
- Lucide React
- Stripe-ready environment variables

Next.js 16.3.5 is the current stable package at the time this starter was created. The official Next.js support policy recommends using the latest Active or Maintenance LTS release for production.

## Requirements

- Node.js 20.9+
- npm 10+
- Supabase project

## Setup

```bash
npm install
copy .env.example .env.local
npm run dev
```

On macOS/Linux:

```bash
cp .env.example .env.local
```

Open http://localhost:3000

## Supabase

1. Create a Supabase project.
2. Copy the project URL and anon/publishable key into `.env.local`.
3. Run `supabase/schema.sql` in Supabase SQL Editor.
4. Create Storage buckets later for `products`, `custom-cakes`, `reviews`, and `site-assets`.
5. Add owner-specific RLS policies after creating the first owner account.

## Stripe

Stripe variables are included in `.env.example`. Payment routes/webhooks should be implemented before production checkout. Never trust client-side payment status.

## Notes

The homepage is fully designed and responsive. Product, cart, checkout, authentication, admin and Stripe screens are intentionally scaffolded through the architecture but are not falsely presented as completed backend features.
