# Bemlanja

Bemlanja is a modern multi-vendor e-commerce marketplace built with **Next.js 15** and **Supabase**. It supports two types of users — regular shoppers and organization sellers — each with a dedicated authentication and verification flow.

---

## ✨ Features

### 🔐 Authentication

- **Email & Password** based login via Supabase Auth
- **Split-screen Auth Layout** — a branded sidebar banner and a seamless card-free form on the right. The logo now links back to the homepage for better navigation.
- **Full Name Field** — Sign-up form now requires a full name, ensuring more complete user profiles from the start.
- **Forgot Password Security** — Enhanced flow that verifies if an email addresses exists in the database before sending a reset link, providing better feedback and security.
- **Password reveal/hide** toggle on all password inputs
- **Resend verification link** — If a user logs in without confirming their email, a new link is automatically dispatched

### 🏢 Organization (Seller) Sign-Up

- Dual-email registration — a **Personal Login Email** (for auth) and a separate **Organization Contact Email**
- **Mandatory Brand Label** — Ensuring every organization has a clear tagline/label from the start
- Auto-generate a **URL slug** from the organization name
- **Dual email verification** flow:
  1. Personal email confirmed via Supabase native link
  2. Organization contact email confirmed via a custom **6-digit OTP** sent through **Resend**

### ✅ Email Verification Guards

- Regular users blocked from logging in until personal email is verified
- Sellers blocked from the main app until both emails are verified
- If a seller's org email is unverified at login, they are redirected to `/auth/verify-org` with their email pre-filled

### 🛡️ Duplicate Prevention

- Before any signup, checks if **personal email** already exists across `auth.users`, `public.profiles`, and `public.organizations` (custom `check_email_exists` RPC).
- Checks if **organization contact email** is already registered as an org email or personal account.
- Checks if **Organization Name** is already taken (`check_org_name_exists` RPC).
- Checks if **URL slug** is already taken (`check_slug_exists` RPC).

### 🎠 Hero Carousel

- Fetches banner data from a Supabase `cms` schema
- Auto-rotating full-width banner supported by a Skeleton loading fallback via React `Suspense`

### 🔍 Global Search & Store Discovery

- **Live Search Dropdown**: Instant results for stores and products as you type, with a premium skeleton loading state.
- **Dedicated Search Page**: Fully-featured `/search` route that handles global queries across all organizations and products.
- **Cross-Platform Visibility**: Unified search experience accessible from all devices (mobile, tablet, and desktop).

### 🛠️ Advanced Product Filtering

- **Dynamic Category Filtering**: Intelligent `!inner` join logic that strictly filters by category when selected, but shows all products on reset.
- **Dual Category Support**: Seamless filtering for both Global Categories (platform-wide) and Store Categories (seller-specific).
- **Price Range Control**: Interactive range slider to narrow down results by budget.
- **Sort by Relevance**: Options to sort by Price, Newest Arrivals (`createdAt`), and alphabetically.

### 📄 Product Detail & Grid Features

- **Advanced Pagination**: Reusable top and bottom pagination controls supporting 40 items per page with mobile-responsive layouts.
- **Premium UI Polish**: Redesigned product cards, glassmorphism badges, and smooth hover animations.
- **Responsive Navigation**: Mobile-sticky filters and auto-closing sidebar drawers for optimized real estate.
- **Loading Skeletons**: Consistent skeleton states for initial grid loads and live search results.

### ⭐ Product Reviews & Feedback

- **Paginated Reviews**: Efficient client-side pagination with "Load More" and skeleton loading states.
- **Review Image Gallery**:
  - Displays up to 2 high-quality images per review card.
  - Interactive `+X` indicators for reviews with multiple images.
  - Premium full-screen `Dialog` viewer with a `Carousel` for high-resolution image browsing.
  - Clean info overlays in the gallery modal showing reviewer details and ratings.
- **Dynamic Ratings**: Star ratings and review counts dynamically aggregated from Supabase.

### 👤 Profile & User Experience

- **Enhanced Avatar Fallbacks**:
  - Automatically generates initials for users without a profile image.
  - Premium `bg-primary/10` and `text-primary` styling for better visibility.
  - Fallback to a clear `User` icon when initials are unavailable.
  - Consistent experience across the main Profile page and the Navigation Avatar Menu.
- **Personalized Profile**: Comprehensive dashboard for managing personal details, addresses, and orders.

### 🛒 Shopping Cart & Single-Store Checkout

- **Persistent Cart**: Synced to Supabase database for authenticated users, backed up to `localStorage` for guests.
- **Auth Sync**: Automatically transfers and overwrites guest carts with the authentic database cart upon login.
- **Single-Store Checkout Rules**: Cart items are visually grouped by Store/Organization. Users can only select and checkout items from *one* store at a time. Checking an item from a different store auto-clears previous selections.
- **Loading Skeletons**: Integrated UI skeletons that match the cart layout while syncing data behind the scenes.

### 🚚 Shipping & Logistics (RajaOngkir v2)

- **Real-time Cost Calculation**: Integration with RajaOngkir Form-Base API for precise shipping costs from 30,000+ districts across Indonesia.
- **Dynamic Location Selectors**: Hierarchical Province > City > District > Sub-district dropdowns for accurate destination mapping.
- **Multi-Courier Support**: Supports JNE, TIKI, POS, and other major Indonesian couriers.
- **Smart ETD Display**: Automatically parses and displays Estimated Time of Delivery, with clean fallbacks for unavailable data.

### 💳 Secure Payments (Midtrans)

- **Snap Integration**: Seamless payment experience via Midtrans Snap popup.
- **Order Lifecycle Management**: Automatic transition from `awaiting_payment` to `processing` or `cancelled` via webhooks.
- **Robust Error Handling**: Automatic cart cleanup (only purchased items) and graceful redirects to Order History on payment window closure.
- **Checkout Skeletons**: Precise layout-matching skeletons to prevent layout jumps during payment initialization.

### 🎫 Coupon & Discount System

- **Store-Specific Coupons**: Organizations can create custom coupon codes for their own products.
- **Smart Validation**: Checks for active status, expiry dates, usage limits, and minimum purchase requirements.
- **Dynamic Calculation**: Supports both **flat amount** and **percentage-based** discounts, with instant UI updates in the Order Summary.

### 📍 Address Management

- **Multiple Addresses**: Users can save multiple shipping addresses.
- **Default Toggle**: Smart "Set as Default" logic to streamline the checkout experience.
- **District Mapping**: Stores specific RajaOngkir IDs (Province, City, District) for zero-latency shipping integration.

---

## 🗂️ Project Structure

```
bemlanja/
├── app/
│   ├── actions/              # Server Actions (e.g., sending emails via Resend)
│   ├── auth/                 # All authentication pages and routes
│   │   ├── confirm/          # Email confirmation route handler
│   │   ├── login/
│   │   ├── sign-up/
│   │   ├── sign-up-org/
│   │   ├── verify-org/       # 6-digit OTP verification for org email
│   │   ├── forgot-password/
│   │   ├── update-password/
│   │   └── layout.tsx        # Split-screen auth layout with AuthBanner
│   ├── protected/            # Dashboard, accessible after full auth
│   └── page.tsx              # Public homepage with HeroCarousel
├── components/
│   ├── auth/
│   │   ├── auth-banner.tsx   # Branded left-side banner for auth pages
│   │   ├── buttons/          # LogoutButton, AuthButton
│   │   └── form/             # LoginForm, SignUpForm, SignUpOrgForm, VerifyOrgForm, etc.
│   ├── global/               # Navbar, Footer, HeroCarousel, UserAvatarMenu
│   └── ui/                   # Shadcn/ui primitives (Button, Input, InputOTP, etc.)
├── lib/
│   └── supabase/
│       ├── client.ts         # Browser-side Supabase client
│       ├── server.ts         # Server-side Supabase client
│       └── proxy.ts          # Middleware session handler (route protection)
└── hooks/                    # Custom React hooks
```

---

## 🗄️ Database Schema (Supabase)

### 👤 Profiles (`public.profiles`)

| Column       | Type        | Notes                                            |
| ------------ | ----------- | ------------------------------------------------ |
| `userId`     | uuid        | PK, FK auth.users                                |
| `email`      | text        |                                                  |
| `full_name`  | text        |                                                  |
| `avatar_url` | text        |                                                  |
| `phone`      | text        |                                                  |
| `role`       | text        | `'user'`, `'seller'`, `'admin'`, `'super_admin'` |
| `created_at` | timestamptz | default: `now()`                                 |

### 🏢 Organizations (`public.organizations`)

| Column              | Type    | Notes                            |
| ------------------- | ------- | -------------------------------- |
| `orgId`             | uuid    | PK, default: `gen_random_uuid()` |
| `userId`            | uuid    | FK auth.users                    |
| `orgName`           | text    |                                  |
| `slug`              | text    | **UNIQUE** — Store URL           |
| `label`             | text    | Brand tagline                    |
| `description`       | text    |                                  |
| `logoUrl`           | text    |                                  |
| `bannerUrl`         | text    |                                  |
| `status`            | text    | default: `'pending'`             |
| `orgEmail`          | text    |                                  |
| `orgEmailVerified`  | boolean | default: `false`                 |
| `verificationToken` | text    | 6-digit OTP                      |

### 📦 Products (`public.products`)

| Column        | Type    | Notes                            |
| ------------- | ------- | -------------------------------- |
| `productId`   | uuid    | PK, default: `gen_random_uuid()` |
| `orgId`       | uuid    | FK organizations                 |
| `name`        | text    |                                  |
| `description` | text    | Supports long description        |
| `price`       | numeric |                                  |
| `image_url`   | text    | Main thumbnail                   |
| `is_active`   | boolean | default: `true`                  |

### ⭐ Product Reviews (`public.product_reviews`)

| Column      | Type     | Notes                            |
| ----------- | -------- | -------------------------------- |
| `reviewId`  | uuid     | PK, default: `gen_random_uuid()` |
| `productId` | uuid     | FK products                      |
| `userId`    | uuid     | FK profiles/auth.users           |
| `rating`    | smallint | 1-5 star scale                   |
| `body`      | text     | Review content                   |

### 🖼️ Product Review Images (`public.product_review_images`)

| Column     | Type | Notes                            |
| ---------- | ---- | -------------------------------- |
| `id`       | uuid | PK, default: `gen_random_uuid()` |
| `reviewId` | uuid | FK product_reviews               |
| `url`      | text | Image resolution URL             |

### �️ Product Images (`public.product_images`)

| Column       | Type    | Notes                            |
| ------------ | ------- | -------------------------------- |
| `imageId`    | uuid    | PK, default: `gen_random_uuid()` |
| `productId`  | uuid    | FK products                      |
| `url`        | text    |                                  |
| `sort_order` | integer | default: `0`                     |

### 🎭 Product Variants (`public.product_variants`)

| Column         | Type    | Notes                            |
| -------------- | ------- | -------------------------------- |
| `variantId`    | uuid    | PK, default: `gen_random_uuid()` |
| `productId`    | uuid    | FK products                      |
| `name`         | text    |                                  |
| `price`        | numeric |                                  |
| `stock`        | integer | default: `0`                     |
| `weight_grams` | integer | default: `0`                     |

### 📍 Addresses (`public.user_addresses`)

| Column           | Type    | Notes                              |
| ---------------- | ------- | ---------------------------------- |
| `addressId`      | uuid    | PK, default: `gen_random_uuid()`   |
| `userId`         | uuid    | FK auth.users                      |
| `label`          | text    | e.g. 'Home'                        |
| `street_address` | text    |                                    |
| `recipient_name` | text    |                                    |
| `phone`          | text    |                                    |
| `province_id`    | text    | RajaOngkir Province ID             |
| `city_id`        | text    | RajaOngkir City ID                 |
| `district_id`    | text    | RajaOngkir District ID             |
| `subdistrict_id` | text    | RajaOngkir Sub-district ID         |
| `is_default`     | boolean | default: `false`                   |

### 🎫 Coupons (`public.coupons`)

| Column           | Type        | Notes                            |
| ---------------- | ----------- | -------------------------------- |
| `couponId`       | uuid        | PK                               |
| `orgId`          | uuid        | FK organizations                 |
| `code`           | text        | e.g. 'BEMLANJA10'                |
| `discount_type`  | text        | 'percentage' or 'flat'           |
| `discount_value` | numeric     |                                  |
| `min_purchase`   | numeric     |                                  |
| `is_active`      | boolean     |                                  |
| `expires_at`     | timestamptz |                                  |

### 📜 Orders (`public.orders`)

| Column            | Type    | Notes                                    |
| ----------------- | ------- | ---------------------------------------- |
| `orderId`         | uuid    | PK                                       |
| `userId`          | uuid    | FK Profiles                              |
| `orgId`           | uuid    | FK Organizations                         |
| `status`          | text    | 'pending', 'awaiting_payment', 'success' |
| `total`           | numeric | Final amount paid                        |
| `midtrans_token`  | text    | SNAP Token                               |
| `shipping_cost`   | numeric |                                          |
| `coupon_discount` | numeric |                                          |

### 📂 Categories & Relationships

- **`public.categories`**: Global platform categories.
- **`public.org_categories`**: Store-specific categories.
- **`public.product_categories`**: Linkage between products and global categories.
- **`public.product_org_categories`**: Linkage between products and store categories.

### 🛒 Cart Items (`public.cart_items`)

| Column      | Type    | Notes                                    |
| ----------- | ------- | ---------------------------------------- |
| `id`        | uuid    | PK, default: `gen_random_uuid()`         |
| `userId`    | uuid    | FK auth.users                            |
| `productId` | uuid    | FK products                              |
| `variantId` | uuid    | FK product_variants, nullable for base   |
| `quantity`  | integer | default: `1`                             |

### Postgres RPC Functions (SECURITY DEFINER)

| Function                             | Description                                                         |
| ------------------------------------ | ------------------------------------------------------------------- |
| `handle_new_user()`                  | Trigger on auth.users — creates `profiles` and `organizations` rows |
| `check_email_exists(p_email)`        | Checks if an email exists in `auth.users`, `organizations`, or `profiles` |
| `check_slug_exists(p_slug)`          | Checks if an org slug is already in use                             |
| `check_org_name_exists(p_name)`      | Checks if an organization name is already in use                   |
| `verify_org_email(p_email, p_token)` | Verifies OTP and marks org email as verified                        |
| `regenerate_org_token(p_email)`      | Generates a new OTP for a still-unverified org                      |

---

## 🚀 Getting Started

### 1. Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Resend](https://resend.com) account (for organization email verification)

### 2. Clone the repository

```bash
git clone <your-repo-url>
cd bemlanja
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
RESEND_API_KEY=your_resend_api_key

# Shipping & Payments
RAJAONGKIR_API_KEY=your_rajaongkir_v2_key
MIDTRANS_SERVER_KEY=your_midtrans_server_key
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=your_midtrans_client_key
```

### 4. Set up the Supabase database

Run the following SQL in your **Supabase SQL Editor** to create the required tables, triggers, and RPC functions. (See `supabase/migrations/` or the [Supabase Dashboard](https://supabase.com/dashboard) for your project.)

Key steps:

- Enable the `cms` schema in **Settings → API → Exposed schemas**
- Create the `profiles` and `organizations` tables
- Deploy the `handle_new_user` trigger and all RPC functions

### 5. Run locally

```bash
npm run dev
```

The app will be running at [http://localhost:3000](http://localhost:3000).

---

## 🔑 Authentication Flows

### Regular User Signup

1. Go to `/auth/sign-up`
2. Enter email and password
3. Confirm your email via the link sent to your inbox
4. Log in at `/auth/login`

### Organization (Seller) Signup

1. Go to `/auth/sign-up-org`
2. Fill in Organization Name, Store URL Slug, Brand Label, Organization Contact Email, and Personal Login Email + password
3. Confirm your **Personal Email** via Supabase's confirmation link
4. Enter the **6-digit OTP** sent to your **Organization Contact Email** at `/auth/verify-org`
5. Log in — you'll be redirected to the dashboard

---

## 📦 Tech Stack

| Technology                                                | Purpose                                  |
| --------------------------------------------------------- | ---------------------------------------- |
| [Next.js 15](https://nextjs.org)                          | Full-stack React framework               |
| [Supabase](https://supabase.com)                          | Auth, PostgreSQL database, RLS, RPCs     |
| [Resend](https://resend.com)                              | Transactional email for org verification |
| [Tailwind CSS v4](https://tailwindcss.com)                | Utility-first styling                    |
| [shadcn/ui](https://ui.shadcn.com)                        | Accessible UI component library          |
| [Sonner](https://sonner.emilkowal.ski)                    | Toast notifications                      |
| [Lucide React](https://lucide.dev)                        | Icon library                             |
| [next-themes](https://github.com/pacocoursey/next-themes) | Dark/Light mode support                  |

---

## 📄 License

This project is private and not open source.
