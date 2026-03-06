# Bemlanja

Bemlanja is a modern multi-vendor e-commerce marketplace built with **Next.js 15** and **Supabase**. It supports two types of users — regular shoppers and organization sellers — each with a dedicated authentication and verification flow.

---

## ✨ Features

### 🔐 Authentication

- **Email & Password** based login via Supabase Auth
- **Split-screen Auth Layout** — a branded sidebar banner and a seamless card-free form on the right
- **Password reveal/hide** toggle on all password inputs
- **Resend verification link** — If a user logs in without confirming their email, a new link is automatically dispatched

### 🏢 Organization (Seller) Sign-Up

- Dual-email registration — a **Personal Login Email** (for auth) and a separate **Organization Contact Email**
- Auto-generate a **URL slug** from the organization name
- **Dual email verification** flow:
  1. Personal email confirmed via Supabase native link
  2. Organization contact email confirmed via a custom **6-digit OTP** sent through **Resend**

### ✅ Email Verification Guards

- Regular users blocked from logging in until personal email is verified
- Sellers blocked from the main app until both emails are verified
- If a seller's org email is unverified at login, they are redirected to `/auth/verify-org` with their email pre-filled

### 🛡️ Duplicate Prevention

- Before any signup, checks if **personal email** already exists (`auth.users` via secure RPC `check_email_exists`)
- Checks if **organization contact email** is already registered
- Checks if **URL slug** is already taken (`check_slug_exists` RPC)

### 🎠 Hero Carousel

- Fetches banner data from a Supabase `cms` schema
- Auto-rotating full-width banner supported by a Skeleton loading fallback via React `Suspense`

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

### `public.profiles`

| Column      | Type                 | Notes                  |
| ----------- | -------------------- | ---------------------- |
| `userId`    | uuid (FK auth.users) | Primary key            |
| `email`     | text                 |                        |
| `full_name` | text                 |                        |
| `role`      | text                 | `'user'` or `'seller'` |

### `public.organizations`

| Column              | Type               | Notes                                             |
| ------------------- | ------------------ | ------------------------------------------------- |
| `orgId`             | uuid               | Primary key                                       |
| `userId`            | uuid (FK profiles) |                                                   |
| `orgName`           | text               |                                                   |
| `slug`              | text               | **UNIQUE** — used as store URL                    |
| `label`             | text               | Brand tagline                                     |
| `orgEmail`          | text               | Organization contact email                        |
| `orgEmailVerified`  | boolean            | Defaults to `false`                               |
| `verificationToken` | text               | 6-digit OTP for email verification                |
| `status`            | text               | `'pending'` → `'active'` after org email verified |

### Postgres RPC Functions (SECURITY DEFINER)

| Function                             | Description                                                         |
| ------------------------------------ | ------------------------------------------------------------------- |
| `handle_new_user()`                  | Trigger on auth.users — creates `profiles` and `organizations` rows |
| `check_email_exists(p_email)`        | Checks if an email exists in `auth.users`                           |
| `check_slug_exists(p_slug)`          | Checks if an org slug is already in use                             |
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
