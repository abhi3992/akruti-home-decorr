# Akruti Home Decor

E-commerce storefront for hand-printed kids robes — Next.js, Prisma/Postgres (Neon), Razorpay (or demo checkout), and a simple admin.

## Local setup

1. Create a free [Neon](https://console.neon.tech) project.
2. Copy both connection strings:
   - **Pooled** → `DATABASE_URL` (add `?sslmode=require` if missing)
   - **Direct** → `DIRECT_URL` (no `-pooler` host; used for migrations)
3. Configure env and run:

```bash
cd akruti-home-decor
npm install
cp .env.example .env
# edit .env with Neon URLs + ADMIN_PASSWORD
npx prisma migrate deploy
npm run seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy on Vercel (cheapest production path)

Estimated cost at launch: **₹0/mo** (Vercel Hobby + Neon Free) + domain (~₹500–1,200/year) + Razorpay % on sales.

### 1. Neon database

1. Sign up at [console.neon.tech](https://console.neon.tech) (free tier).
2. Create a project (region closest to India, e.g. Singapore if available).
3. Copy **pooled** and **direct** connection strings.

### 2. Push the app to GitHub

Put `akruti-home-decor` in a GitHub repo (or deploy this folder as the repo root).

### 3. Import on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project** → import the repo.
2. **Root Directory**: set to `akruti-home-decor` if the app is in a subfolder.
3. Framework: Next.js (auto-detected).
4. Add environment variables:

| Name | Value |
| --- | --- |
| `DATABASE_URL` | Neon **pooled** connection string |
| `DIRECT_URL` | Neon **direct** connection string |
| `ADMIN_PASSWORD` | Strong password for `/admin` |
| `RAZORPAY_KEY_ID` | Optional |
| `RAZORPAY_KEY_SECRET` | Optional |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Optional (same as key id for browser) |

5. Deploy. The build runs `prisma migrate deploy` then `next build`, so tables are created automatically.

### 4. Seed products (one time)

After the first successful deploy, either:

```bash
# locally, pointing .env at the same Neon DB
npm run seed
```

Or in Vercel → Project → Settings → Environment Variables is already set; run seed from your machine against production `DATABASE_URL`.

### 5. Custom domain

Vercel → Project → **Settings → Domains** → add `akrutihomedecor.com` (or similar).

Point your domain DNS as Vercel shows (usually an `A`/`CNAME` record). Domain cost is from your registrar only.

### 6. Razorpay (when ready for real payments)

1. Create a [Razorpay](https://razorpay.com) account.
2. Add test/live keys to Vercel env vars.
3. Redeploy.
4. In Razorpay dashboard, allow your Vercel domain for checkout.

Without keys, checkout stays in **demo mode**.

## Environment reference

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Neon pooled Postgres URL (app queries) |
| `DIRECT_URL` | Neon direct Postgres URL (migrations) |
| `ADMIN_PASSWORD` | Password for `/admin` |
| `RAZORPAY_KEY_ID` | Razorpay key (optional) |
| `RAZORPAY_KEY_SECRET` | Razorpay secret (optional) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Public Razorpay key for checkout.js |

## Admin

- URL: `/admin`
- Set a strong `ADMIN_PASSWORD` before going live

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind CSS
- Prisma + Neon Postgres
- Vercel hosting
- Razorpay Checkout (India)
