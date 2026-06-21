# 🥂 Gharmai Drinks — Full-Stack Delivery Platform

**Your Party Starts at Home.** A production-ready, full-stack premium alcohol & food delivery
platform for Pokhara, Nepal — luxury animated storefront + a complete admin CMS where
non-technical staff control every product, photo, ad, promotion and blog post in real time.

Built with **Next.js 15 · TypeScript · Tailwind CSS · Framer Motion · Prisma · PostgreSQL · NextAuth**.

---

## ✨ What's inside

### Storefront (`/`)
- Hard **18+ age gate** (consent stored in `localStorage`)
- Cinematic hero with **admin-managed banner carousel**
- Product catalog with **search, category filters, badges, sponsored cards**
- **Ads engine** placements: top promo bar, hero carousel, mid-page banner, entry pop-up (frequency-controlled), sponsored product cards, flash-sale countdown
- Signature specials, **VIP tiers**, reviews, how-it-works
- **Cart + WhatsApp checkout** (coupon validation, order saved to DB, formatted WhatsApp handoff)
- Sticky mobile bottom nav, floating WhatsApp, toast confirmations
- **Blog** (`/blog`) for content marketing
- SEO: per-page metadata, `sitemap.xml`, `robots.txt`, structured data ready

### Admin CMS (`/admin`)
- Secure **role-based login** (NextAuth + bcrypt)
- Roles: **Super Admin · Content Editor · Order Manager** (sidebar adapts to role)
- **Dashboard** — revenue, orders, top products, ad CTR
- **Products** — full CRUD, multi-image upload, badges, stock, featured/sponsored, SEO
- **Ads & Banners** — full CRUD with placement, scheduling (auto-publish/expire), audience targeting, priority, live preview, impression/click tracking
- **Promotions** — coupon codes (%/fixed/BOGO), min order, usage limits, expiry
- **Blog posts** — rich body, cover image, draft/scheduled/published, SEO meta
- **Orders** — filter, update status, view WhatsApp log per order
- **Customers & VIP** — profiles, tier & reward-point adjustment
- **Media library** + Cloudinary support, **activity audit log**

---

## 🚀 Quick start (local)

### 1. Install
```bash
cd gharmai-platform
npm install
```

### 2. Configure environment (zero database setup)
```bash
cp .env.example .env
```
The app ships with **SQLite** — no database server needed. `.env` already points to a
local file (`DATABASE_URL="file:./dev.db"`). Just set a secret and your WhatsApp number:
```env
NEXTAUTH_SECRET="run: openssl rand -base64 32"
NEXT_PUBLIC_WHATSAPP_NUMBER="9779746302115"   # your real WhatsApp number, country code, no +
```
> **Going to production?** Switch `provider` in `prisma/schema.prisma` to `"postgresql"`
> and set `DATABASE_URL` to a Neon/Supabase connection string, then `npm run db:push`.

### 4. Create tables + seed demo data
```bash
npm run db:push      # creates all tables
npm run db:seed      # adds categories, products, ads, coupons, 3 admin users
```

### 5. Run
```bash
npm run dev
```
- Storefront → http://localhost:3470
- Admin → http://localhost:3470/admin

**Seeded logins** (password = `SEED_ADMIN_PASSWORD`, default `ChangeMe123!`):
| Role | Email |
|------|-------|
| Super Admin | admin@gharmaidrinks.com |
| Content Editor | editor@gharmaidrinks.com |
| Order Manager | orders@gharmaidrinks.com |

> Change these passwords immediately in production.

---

## ☁️ Deployment

### Recommended: Vercel + Neon
1. Push this folder to a GitHub repo.
2. **Database**: create a Neon project, copy the connection string.
3. **Vercel**: "New Project" → import the repo.
4. Add environment variables in Vercel (Settings → Environment Variables):
   `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (your live domain, e.g. `https://gharmaidrinks.com`),
   `NEXT_PUBLIC_WHATSAPP_NUMBER`, and Cloudinary keys (optional).
5. Deploy. The `build` script runs `prisma generate` automatically.
6. After first deploy, run migrations against production once:
   ```bash
   DATABASE_URL="<prod url>" npx prisma db push
   DATABASE_URL="<prod url>" npm run db:seed
   ```

### Media uploads
- **Local dev**: files save to `/public/uploads` automatically (no config).
- **Production**: set the `CLOUDINARY_*` env vars — uploads auto-route to Cloudinary with optimization. (Serverless filesystems are read-only, so Cloudinary or S3 is required in prod.)

### Build & run a production server elsewhere
```bash
npm run build
npm run start      # serves on port 3470
```

---

## ⚡ Performance & SEO notes
- All images use Next `<Image>` / lazy `<img>` loading; remote hosts whitelisted in `next.config.mjs`.
- Storefront is `force-dynamic` so CMS edits appear instantly. For peak Lighthouse scores you can switch to ISR (`export const revalidate = 60`).
- `sitemap.xml` and `robots.txt` are generated automatically and include published blog posts.
- Per-product / per-post SEO meta fields are editable from the admin.
- Framer Motion reveals use `whileInView` with `once: true` — no stuck-hidden or flicker states.

---

## 🗂 Project structure
```
gharmai-platform/
├─ prisma/
│  ├─ schema.prisma         # all entities (Products, BannerAds, Promotions, Posts, Orders…)
│  └─ seed.ts               # demo data + 3 role-based admins
├─ lib/
│  ├─ prisma.ts             # DB client singleton
│  ├─ auth.ts               # NextAuth config + role helper
│  ├─ guard.ts              # API route role guard
│  └─ activity.ts           # audit log helper
├─ app/
│  ├─ page.tsx              # storefront (server-rendered, DB-driven)
│  ├─ blog/                 # public blog
│  ├─ admin/                # CMS (login + dashboard + managers)
│  ├─ api/                  # REST API (see below)
│  ├─ sitemap.ts · robots.ts
│  └─ layout.tsx · globals.css
├─ components/
│  ├─ store/                # StoreClient, CartContext
│  └─ admin/                # Sidebar, Providers, MediaUpload
└─ middleware.ts            # protects /admin/*
```

## 🔌 API routes
| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/products` · `/api/products/[id]` | GET/POST/PATCH/DELETE | product CRUD |
| `/api/categories` | GET | category list |
| `/api/banners` · `/api/banners/[id]` | GET/POST/PATCH/DELETE | ads CRUD + scheduled filtering |
| `/api/banners/track` | POST | impression/click tracking |
| `/api/promotions` · `/api/promotions/[id]` | GET/POST/PATCH/DELETE | coupons |
| `/api/promotions/validate` | POST | validate coupon at checkout |
| `/api/posts` · `/api/posts/[id]` | GET/POST/PATCH/DELETE | blog |
| `/api/media` | GET/POST | media library / upload |
| `/api/orders` · `/api/orders/[id]` | GET/POST/PATCH | orders + status |
| `/api/customers` · `/api/customers/[id]` | GET/PATCH | customers & VIP |
| `/api/analytics` | GET | dashboard stats |
| `/api/auth/[...nextauth]` | GET/POST | admin auth |

See **[STAFF-GUIDE.md](./STAFF-GUIDE.md)** for the non-technical "how to add a product / ad / blog post" walkthrough.

---

## ⚖️ Compliance
Strictly 18+. The age gate blocks all product/price content until confirmed. A responsible-drinking
and delivery-area disclaimer is shown in the footer. Sale to minors is prohibited.
