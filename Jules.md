# Smart Brains Media Hub — AI Agent Knowledge Base
## Version 1.0 | Smart Brains Kenya

---

> **Purpose of this document:** This is the complete knowledge base for an AI coding agent to build the Smart Brains Media Hub application from scratch. The agent must read this entire document before writing a single line of code. This document defines what the application is, what it is not, how it must be built, and in what order.

---

## PART 1 — PRODUCT DEFINITION

### 1.1 What This Application Is

Smart Brains Media Hub is an **internal media library platform** built for Smart Brains Kenya, an EdTech company that teaches coding to students in Kenya.

The platform serves two distinct user groups:

**Students (Public Users)**
A read-only interface where students browse a curated library of images and videos, then copy direct media URLs to use in their own HTML projects as part of their coursework.

**Admin Staff (Authenticated Users)**
A protected dashboard where Smart Brains staff manage the media library — uploading, importing, renaming, replacing, and deleting media assets.

### 1.2 Core Problem It Solves

Students in coding classes need to embed images and videos in HTML projects. They cannot rely on:
- Google Images (copyright, inconsistency)
- YouTube (blocked in some school environments, requires iframes)
- Random URLs (link rot, inappropriate content)

This platform provides a **curated, stable, branded, bandwidth-conscious** media source that students can depend on.

### 1.3 The Student Workflow (Primary Use Case)

```
Student opens Media Hub → Browses image or video gallery
→ Clicks a media item → Views detail page
→ Copies the direct URL → Pastes into HTML project

Example:
<img src="https://media.smartbrainskenya.com/images/lion.jpg">
<video src="https://media.smartbrainskenya.com/videos/intro.mp4" controls></video>
```

**Critical note:** Students use `<video src="...">` NOT `<iframe>`. The platform does NOT need to generate embed codes or iframe snippets. It only needs to expose a clean, copyable direct URL.

### 1.4 What This Application Is NOT

The agent must never build or suggest the following — they are explicitly out of scope:

| Out of Scope | Reason |
|---|---|
| Student accounts or login | Students are anonymous public users |
| Student uploads | Students never contribute media |
| Iframe embed code generator | Curriculum uses `<video src>` not iframes |
| Video player with custom controls | Native HTML5 player is sufficient |
| Social features (likes, comments, sharing) | Not an educational social platform |
| Media search (full-text) | Gallery filtering by type is sufficient for v1 |
| Public media upload API | Security risk; admin-only |
| Mobile app | Web only |
| Offline / PWA mode | Not required; assumes internet access |
| Multi-tenant support | Single organisation only |
| Paid tiers or subscriptions | Internal tool |
| Image editing or cropping | Upload as-is |
| Automatic transcoding | Publitio handles this |
| Comments or annotations on media | Not required |
| Email notifications | Not required in v1 |

---

## PART 2 — BRANDING

### 2.1 Organisation

- **Organisation name:** Smart Brains Kenya
- **Platform name:** Smart Brains Media Hub
- **Short name (UI labels):** Media Hub
- **Target audience tone:** Simple, clear, student-friendly. No jargon on public pages.

### 2.2 Colour Palette

Use these values consistently across all UI components:

| Token | Hex | Usage |
|---|---|---|
| `brand-primary` | `#1E3A5F` | Nav, buttons, headings |
| `brand-secondary` | `#F4A500` | Accents, hover states, copy button |
| `brand-bg` | `#F8F9FA` | Page background |
| `brand-surface` | `#FFFFFF` | Cards, panels |
| `brand-text` | `#1A1A2E` | Body text |
| `brand-muted` | `#6B7280` | Captions, metadata |
| `brand-success` | `#16A34A` | Upload success states |
| `brand-danger` | `#DC2626` | Delete confirmations, errors |
| `brand-border` | `#E5E7EB` | Card borders, dividers |

### 2.3 Typography

- **Font:** Inter (Google Fonts)
- **Heading weight:** 600 (semibold)
- **Body weight:** 400 (regular)
- **Code/URL display:** `font-mono` (Tailwind class)

### 2.4 Logo Usage

- Display "Smart Brains Media Hub" as text in the nav for v1
- Use brand-primary (`#1E3A5F`) for the wordmark
- Accent the word "Media Hub" with brand-secondary (`#F4A500`)
- Logo image has been provided in /assets.

### 2.5 UI Tone

- Public pages: Welcoming, minimal, easy to scan
- Admin pages: Functional, dense information, no decorative elements
- Error messages: Clear and actionable — never show raw error objects to users
- Empty states: Always show a helpful message (e.g. "No images uploaded yet")

---

## PART 3 — TECHNICAL STACK

### 3.1 Framework

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js | 14+ (App Router) |
| Language | TypeScript | 5+ (strict mode) |
| Runtime | Node.js | 20+ |
| Package manager | npm | (not yarn, not pnpm) |

### 3.2 Frontend

| Concern | Technology |
|---|---|
| Styling | Tailwind CSS v3 |
| Icons | Lucide React |
| Fonts | Inter via next/font/google |
| Form handling | React Hook Form + Zod |
| Toast notifications | react-hot-toast |
| Client state | React useState / useReducer only (no Redux, no Zustand) |

### 3.3 Backend (Serverless)

| Concern | Technology |
|---|---|
| API layer | Next.js App Router API routes (`app/api/`) |
| Validation | Zod (all API inputs validated server-side) |
| Auth | NextAuth v5 (Auth.js) — Credentials provider |
| Password hashing | bcryptjs |
| Rate limiting | @upstash/ratelimit + @upstash/redis |
| Media CDN | Publitio (server-side SDK only) |

### 3.4 Database

| Concern | Technology |
|---|---|
| Database | Supabase (PostgreSQL) |
| Client | @supabase/supabase-js (server-side only) |
| ORM | None — raw Supabase query builder |
| Migrations | Supabase Dashboard SQL editor (manual, documented) |

### 3.5 Storage

| Asset type | Storage |
|---|---|
| Images | Publitio |
| Videos | Publitio |
| Thumbnails | Publitio (auto-generated) |
| Any other files | NOT accepted — images and videos only |
| Vercel Blob | NOT used |

### 3.6 Deployment

| Concern | Platform |
|---|---|
| Hosting | Vercel |
| Serverless functions | Vercel (via Next.js API routes) |
| Environment variables | Vercel Dashboard (never in code) |
| Domain | TBD by client |

### 3.7 Packages — Exact Install List

```bash
# Core
npm install next@latest react@latest react-dom@latest typescript @types/node @types/react @types/react-dom

# Styling
npm install tailwindcss postcss autoprefixer
npm install lucide-react

# Forms and validation
npm install react-hook-form zod @hookform/resolvers

# Auth
npm install next-auth@beta bcryptjs @types/bcryptjs

# Database
npm install @supabase/supabase-js

# Media
npm install publitio-js-sdk

# UX
npm install react-hot-toast

# Rate limiting (configure after Upstash account setup)
npm install @upstash/ratelimit @upstash/redis
```

---

## PART 4 — ARCHITECTURE

### 4.1 System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     VERCEL EDGE / CDN                       │
└────────────────────┬────────────────────┬───────────────────┘
                     │                    │
          ┌──────────▼──────────┐  ┌──────▼──────────────┐
          │   Public Routes     │  │   Admin Routes       │
          │  /                  │  │  /admin/*            │
          │  /images            │  │  Protected by        │
          │  /videos            │  │  middleware.ts       │
          │  /media/[id]        │  └──────┬──────────────┘
          └──────────┬──────────┘         │
                     │           ┌────────▼──────────┐
                     │           │  NextAuth Session  │
                     │           │  (JWT, httpOnly)   │
                     │           └────────┬──────────┘
                     │                    │
          ┌──────────▼────────────────────▼──────────┐
          │         Next.js App Router                 │
          │         app/api/* (Serverless Functions)   │
          │                                            │
          │  /api/media        GET list, POST create   │
          │  /api/media/[id]   GET, PATCH, DELETE      │
          │  /api/upload       POST (signed upload)    │
          │  /api/import       POST (URL import)       │
          │  /api/auth/*       NextAuth handlers       │
          └──────────┬────────────────────┬───────────┘
                     │                    │
          ┌──────────▼──────────┐  ┌──────▼──────────────┐
          │    Supabase          │  │   Publitio CDN       │
          │    (PostgreSQL)      │  │                      │
          │    media_assets      │  │   Actual files       │
          │    admin_users       │  │   Branded delivery   │
          │    audit_log         │  │   URL construction   │
          └─────────────────────┘  └──────────────────────┘
```

### 4.2 Upload Architecture (Critical)

**Do NOT stream file bytes through a Vercel serverless function.** This will exceed memory (1GB limit) and timeout (60s limit) for video files.

Instead, use the **signed upload pattern:**

```
Admin browser selects file
→ POST /api/upload/sign   (serverless function)
   → Validates admin session
   → Generates Publitio signed upload URL (server-side, keys never exposed)
   → Returns signed URL + upload parameters to browser
→ Browser streams file DIRECTLY to Publitio using signed URL
→ Browser POSTs confirmation to /api/upload/confirm (serverless function)
   → Writes metadata to Supabase
   → Returns final asset record
```

### 4.3 URL Import Architecture

For "Import by URL" (admin pastes an external URL):

```
Admin pastes URL
→ POST /api/import   (serverless function)
   → Validates admin session
   → Fetches external URL using node-fetch (server-side)
   → Streams to Publitio API
   → Writes metadata to Supabase
   → Returns asset record
```

**Constraint:** URL import is only reliable for files under ~100MB within the 60s Vercel timeout. Document this limitation for admins.

### 4.4 Public URL Strategy

Students must receive a branded URL, not a raw Publitio internal URL.

```
Raw Publitio URL (never exposed):
https://media.publitio.com/[account-hash]/v1/files/...

Branded delivery URL (what students copy):
https://media.smartbrainskenya.com/images/lion.jpg
```

The `branded_url` field in Supabase stores the branded URL. The API never returns the raw Publitio URL to any client-side request.

---

## PART 5 — FOLDER STRUCTURE

The agent must create exactly this structure. Do not deviate.

```
smart-brains-media-hub/
├── app/
│   ├── (public)/
│   │   ├── layout.tsx                  # Public layout (nav + footer)
│   │   ├── page.tsx                    # Homepage
│   │   ├── images/
│   │   │   └── page.tsx               # Image gallery
│   │   ├── videos/
│   │   │   └── page.tsx               # Video library
│   │   └── media/
│   │       └── [id]/
│   │           └── page.tsx           # Media detail + URL copy
│   ├── (admin)/
│   │   ├── layout.tsx                  # Admin layout (auth guard + sidebar)
│   │   ├── login/
│   │   │   └── page.tsx               # Login page
│   │   └── admin/
│   │       ├── page.tsx               # Dashboard (media list)
│   │       ├── upload/
│   │       │   └── page.tsx           # Upload form
│   │       ├── import/
│   │       │   └── page.tsx           # Import by URL form
│   │       └── media/
│   │           └── [id]/
│   │               └── page.tsx       # Edit media (rename, replace, delete)
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts           # NextAuth handler
│   │   ├── media/
│   │   │   ├── route.ts               # GET (list) | POST (create record)
│   │   │   └── [id]/
│   │   │       └── route.ts           # GET | PATCH | DELETE
│   │   ├── upload/
│   │   │   ├── sign/
│   │   │   │   └── route.ts           # Generate signed upload URL
│   │   │   └── confirm/
│   │   │       └── route.ts           # Confirm upload, write to DB
│   │   └── import/
│   │       └── route.ts               # Import media by URL
│   ├── globals.css
│   ├── layout.tsx                      # Root layout
│   └── not-found.tsx
├── components/
│   ├── public/
│   │   ├── PublicNav.tsx
│   │   ├── PublicFooter.tsx
│   │   ├── MediaCard.tsx
│   │   ├── MediaGrid.tsx
│   │   └── URLCopyButton.tsx
│   └── admin/
│       ├── AdminSidebar.tsx
│       ├── AdminNav.tsx
│       ├── MediaTable.tsx
│       ├── UploadForm.tsx
│       ├── ImportForm.tsx
│       ├── DeleteConfirmModal.tsx
│       └── RenameForm.tsx
├── lib/
│   ├── publitio.ts                     # Publitio wrapper — server-only
│   ├── db.ts                           # Supabase client — server-only
│   ├── auth.ts                         # NextAuth config
│   ├── validations.ts                  # Shared Zod schemas
│   └── utils.ts                        # Shared pure utilities
├── types/
│   └── index.ts                        # All shared TypeScript types
├── middleware.ts                        # Route protection (root level)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── .env.local                          # Never committed
├── .env.example                        # Committed — shows required keys
├── .gitignore
└── README.md
```

---

## PART 6 — DATABASE SCHEMA

The agent must create these exact tables in Supabase. Run as SQL migrations.

### 6.1 media_assets

```sql
CREATE TABLE media_assets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publitio_id     TEXT UNIQUE NOT NULL,
  title           TEXT NOT NULL,
  type            TEXT NOT NULL CHECK (type IN ('image', 'video')),
  branded_url     TEXT NOT NULL,
  file_hash       TEXT,
  file_size_bytes BIGINT,
  width_px        INTEGER,
  height_px       INTEGER,
  duration_secs   INTEGER,         -- for video only
  uploaded_by     UUID REFERENCES admin_users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_media_assets_type ON media_assets(type);
CREATE INDEX idx_media_assets_created_at ON media_assets(created_at DESC);
```

### 6.2 admin_users

```sql
CREATE TABLE admin_users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT UNIQUE NOT NULL,
  password_hash   TEXT NOT NULL,
  display_name    TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### 6.3 audit_log

```sql
CREATE TABLE audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    UUID REFERENCES admin_users(id),
  action      TEXT NOT NULL CHECK (action IN ('upload', 'import', 'rename', 'replace', 'delete')),
  media_id    UUID REFERENCES media_assets(id) ON DELETE SET NULL,
  metadata    JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);
```

### 6.4 updated_at Trigger

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON media_assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## PART 7 — ENVIRONMENT VARIABLES

### 7.1 Required Variables

The agent must create `.env.example` with exactly these keys (no values):

```bash
# Supabase
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# Publitio
PUBLITIO_API_KEY=
PUBLITIO_API_SECRET=
PUBLITIO_BRANDED_DOMAIN=

# NextAuth
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Upstash (rate limiting)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

### 7.2 Critical Rules

- **NONE** of these variables must be prefixed with `NEXT_PUBLIC_`
- Server-only modules must begin with `import 'server-only'`
- The agent must never hard-code credentials anywhere in the codebase
- The agent must add `.env.local` to `.gitignore` from the start

---

## PART 8 — TYPESCRIPT TYPES

The agent must define these types in `types/index.ts` before building any components.

```typescript
export type MediaType = 'image' | 'video';

export interface MediaAsset {
  id: string;
  publitio_id: string;
  title: string;
  type: MediaType;
  branded_url: string;
  file_size_bytes: number | null;
  width_px: number | null;
  height_px: number | null;
  duration_secs: number | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  display_name: string;
  created_at: string;
}

export interface AuditLogEntry {
  id: string;
  admin_id: string;
  action: 'upload' | 'import' | 'rename' | 'replace' | 'delete';
  media_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
}
```

---

## PART 9 — SECURITY RULES

The agent must enforce every rule below. These are non-negotiable.

### 9.1 Server-Only Enforcement

Add `import 'server-only'` as the first line in:
- `lib/publitio.ts`
- `lib/db.ts`

### 9.2 Route Protection

`middleware.ts` (root level) must protect all `/admin/*` routes:

```typescript
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
  const isLoginPage = req.nextUrl.pathname === '/login';

  if (isAdminRoute && !req.auth) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (isLoginPage && req.auth) {
    return NextResponse.redirect(new URL('/admin', req.url));
  }
});

export const config = {
  matcher: ['/admin/:path*', '/login'],
};
```

### 9.3 API Route Auth Pattern

Every admin API route must verify session at the start:

```typescript
import { auth } from '@/lib/auth';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ... rest of handler
}
```

### 9.4 Input Validation

Every API route must validate its input with Zod before any processing:

```typescript
const schema = z.object({
  title: z.string().min(1).max(200),
  type: z.enum(['image', 'video']),
});

const parsed = schema.safeParse(await req.json());
if (!parsed.success) {
  return Response.json({ error: 'Invalid input' }, { status: 400 });
}
```

### 9.5 Response Sanitisation

The public API (`/api/media`) must NEVER return `publitio_id` or any internal Publitio field. Only return fields that students need.

---

## PART 10 — COMPONENT SPECIFICATIONS

### 10.1 URLCopyButton (Critical Component)

This is the most important public-facing component. It must:
- Display the full branded URL in a monospace read-only input
- Have a "Copy URL" button beside it
- On click: copy to clipboard, change button text to "Copied!" for 2 seconds, then revert
- On copy failure (clipboard API unavailable): show a fallback message to manually select the text
- Style the URL field with `brand-secondary` accent

### 10.2 MediaCard (Public Gallery)

Must display:
- Thumbnail (image) or video preview frame (for video, show play icon overlay)
- Title
- Media type badge (IMAGE / VIDEO)
- Link to detail page
- No admin controls — public DOM must contain zero admin elements

### 10.3 MediaGrid

- Responsive grid: 2 columns mobile, 3 tablet, 4 desktop
- Show empty state if no media: "No [images/videos] have been added yet."
- Loading skeleton — show placeholder cards while fetching

### 10.4 AdminSidebar

Navigation items:
- Dashboard (icon: LayoutDashboard)
- Upload Media (icon: Upload)
- Import by URL (icon: Link)
- Sign Out (icon: LogOut) — at bottom

### 10.5 DeleteConfirmModal

Must require explicit confirmation — a typed confirmation or a two-step button press. Never delete on single click. Show the media title in the confirmation message.

---

## PART 11 — PAGE SPECIFICATIONS

### 11.1 Homepage `/`

- Hero section: Platform name + one-line description
- Two CTA cards: "Browse Images" and "Browse Videos"
- No login prompt for public users
- Lightweight — SSG (static)

### 11.2 Image Gallery `/images`

- Heading: "Image Library"
- MediaGrid of all images, ordered by `created_at DESC`
- Server-side rendered with `revalidate = 60` (cache for 60 seconds)
- Pagination: 24 items per page

### 11.3 Video Library `/videos`

- Same structure as Image Gallery
- Heading: "Video Library"
- Pagination: 12 items per page (videos are larger cards)

### 11.4 Media Detail `/media/[id]`

- Large image display OR native HTML5 video player (`<video controls>`)
- Title
- URLCopyButton with branded URL
- "← Back" link
- Metadata: file size, dimensions (for images), duration (for video)

### 11.5 Login `/login`

- Email + password form
- Error message on failure: "Invalid email or password" (never specify which field is wrong)
- No "forgot password" for v1 (admin resets via Supabase dashboard)
- Redirect to `/admin` on success

### 11.6 Admin Dashboard `/admin`

- Summary counts: Total images, Total videos, Total assets
- Table of all media assets (title, type, URL, date, actions)
- Actions per row: Edit, Delete
- Sort by: created_at DESC (default)
- Pagination: 20 per page

### 11.7 Upload Page `/admin/upload`

- File picker (accept: image/*, video/*)
- Title field (auto-populated from filename, editable)
- Submit button
- Progress indicator during upload
- Success: redirect to admin dashboard with toast
- Error: display error message inline, do not reset form

### 11.8 Import by URL Page `/admin/import`

- URL input field
- Title field
- Validate URL format client-side before submitting
- Submit triggers server-side fetch + Publitio upload
- Loading state with spinner (this can take 10–30 seconds)
- Success: redirect to dashboard with toast
- Error: display message inline

### 11.9 Edit Media Page `/admin/media/[id]`

- Current title + rename form
- Current URL displayed (read-only)
- Replace file section (upload new file, replaces in Publitio)
- Delete section (with confirmation modal)
- Each action is its own form — do not combine

---

## PART 12 — PERFORMANCE REQUIREMENTS

Given that this runs in Kenyan school environments with limited bandwidth:

- **No autoplay** on any video, anywhere
- **Lazy load** all images below the fold (`loading="lazy"` on `<img>`)
- **Optimised thumbnails:** use Next.js `<Image>` component for all gallery thumbnails with `quality={75}`
- **No heavy client-side JavaScript** on public pages — prefer Server Components
- **Limit gallery page size:** 24 images / 12 videos per page maximum
- **No analytics scripts** (no Google Analytics, no tracking pixels) — keep page load lean
- **Static generation where possible:** Homepage is static; gallery pages use ISR (`revalidate = 60`)

---

## PART 13 — ERROR HANDLING STANDARDS

### 13.1 API Error Responses

All API routes must return consistent JSON:

```typescript
// Success
{ data: T, error: null }

// Failure
{ data: null, error: "Human-readable message" }
```

HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad request (invalid input)
- 401: Unauthenticated
- 403: Forbidden (authenticated but not authorised)
- 404: Not found
- 500: Server error (log internally, return generic message to client)

### 13.2 Client-Side Error Display

- Never show raw error objects or stack traces to users
- Admin pages: show inline error messages above the relevant form field
- Public pages: show a friendly message ("Something went wrong. Please try again.")
- Use `react-hot-toast` for transient success/error toasts on admin actions

---

## PART 14 — WHAT THE AGENT MUST NOT DO

The agent must refuse or avoid the following patterns even if they seem convenient:

| Anti-Pattern | Why |
|---|---|
| `NEXT_PUBLIC_PUBLITIO_API_KEY` | Exposes secret to browser bundle |
| Buffering video through serverless function body | Memory/timeout limit exceeded |
| Storing Publitio raw internal URLs in DB or returning them to client | Exposes vendor internals |
| Using `localStorage` for auth tokens | XSS vulnerability |
| Admin UI controls rendered in public page DOM (CSS-hidden) | Inspect element exposes them; use route groups |
| `useEffect` data fetching on public pages | Use Server Components instead |
| Vercel Blob for media storage | Redundant; Publitio already handles this |
| Hardcoded admin credentials in seed files | Security risk |
| `any` TypeScript type | Defeats type safety; use `unknown` then narrow |
| Skipping Zod validation on API inputs | Opens injection/DoS surface |
| Single-click delete without confirmation | Accidental data loss |

---

## PART 15 — CONTRADICTIONS RESOLVED

The agent must apply these resolutions to any apparent conflicts in requirements:

| Apparent Conflict | Resolution |
|---|---|
| "Don't expose Publitio URLs" vs "Students copy URLs" | Students copy **branded domain URLs** (e.g. `media.smartbrainskenya.com`). These do not expose Publitio API credentials. The secret is the API key used to manage assets, not the delivery URL. |
| "Zero-data environment" vs "Vercel-hosted platform" | Platform requires internet. "Zero-data" means **low-bandwidth**, not offline. Optimise for speed on slow connections. |
| "No authentication" on public pages vs "Admin login" | Two separate route groups enforce strict separation. Public routes have no auth middleware. Admin routes always require auth middleware. |

---

## PART 16 — STEP-BY-STEP AGENT PROMPT FLOW

> **Instructions for the AI agent operator:** Execute each prompt in sequence. Do not skip steps. Do not combine steps. Verify output after each step before proceeding to the next.

---

### PHASE 0 — PROJECT SCAFFOLD

---

**STEP 0.1 — Create Next.js Project**

```
You are a senior TypeScript engineer. Create a new Next.js 14+ project with the App Router.

Requirements:
- Project name: smart-brains-media-hub
- TypeScript: strict mode enabled (strict: true in tsconfig.json)
- Tailwind CSS: configured
- ESLint: enabled
- App Router: yes
- src/ directory: NO (use app/ at root)

After creating:
1. Install all packages from the knowledge base Section 3.7
2. Create .gitignore including: .env.local, node_modules, .next
3. Create .env.example with all keys from Section 7.1 (no values)
4. Verify: Run `npm run build` and confirm it succeeds

Do not create any pages yet.
```

---

**STEP 0.2 — Tailwind and Font Configuration**

```
Configure Tailwind CSS and fonts for Smart Brains Media Hub.

1. Update tailwind.config.ts:
   - Extend theme with the brand colour palette from Section 2.2 of the knowledge base
   - Use the token names exactly as specified (brand-primary, brand-secondary, etc.)

2. Update app/globals.css:
   - Import Tailwind base, components, utilities
   - Set base body styles: bg-brand-bg, text-brand-text, font-sans

3. Update app/layout.tsx (root layout):
   - Import Inter font via next/font/google
   - Apply as className to <html>
   - Set metadata: title "Smart Brains Media Hub", description for SEO

4. Verify the dev server starts without errors: npm run dev
```

---

**STEP 0.3 — TypeScript Types**

```
Create the file types/index.ts with all TypeScript types defined in Section 8 of the knowledge base.

Requirements:
- Copy every interface and type exactly as specified
- Do not add, remove, or modify any fields
- Export all types

Do not create any other files in this step.
```

---

**STEP 0.4 — Environment and Server-Only Libraries**

```
Create the core server-side library files.

1. Create lib/db.ts:
   - First line: import 'server-only'
   - Import createClient from @supabase/supabase-js
   - Create and export a Supabase client using SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars
   - Use service role key (not anon key) — this file is server-only

2. Create lib/publitio.ts:
   - First line: import 'server-only'
   - Import publitio-js-sdk
   - Create and export a Publitio client using PUBLITIO_API_KEY and PUBLITIO_API_SECRET env vars
   - Export a helper function: buildBrandedUrl(publitioPath: string): string
     → Constructs full URL from PUBLITIO_BRANDED_DOMAIN + path

3. Create lib/utils.ts:
   - Export: formatFileSize(bytes: number): string → human-readable (e.g. "2.4 MB")
   - Export: formatDuration(seconds: number): string → "mm:ss" format
   - Export: cn(...classes: string[]): string → Tailwind class merge utility

4. Create lib/validations.ts:
   - Import zod
   - Export CreateMediaSchema (fields: title, type, branded_url, publitio_id)
   - Export UpdateMediaSchema (fields: title — partial)
   - Export ImportMediaSchema (fields: url, title)

Do not connect to real services yet. Mock the env vars in .env.local with placeholder values.
```

---

### PHASE 1 — AUTH SYSTEM

---

**STEP 1.1 — NextAuth Configuration**

```
Set up NextAuth v5 (Auth.js) authentication.

1. Create lib/auth.ts:
   - Configure NextAuth with Credentials provider
   - On sign-in: query admin_users table in Supabase by email
   - Compare password using bcryptjs.compare()
   - If valid: return user object with id, email, display_name
   - If invalid: return null
   - Session strategy: JWT
   - Session max age: 8 hours (28800 seconds)
   - Include user.id in JWT token

2. Create app/api/auth/[...nextauth]/route.ts:
   - Export GET and POST handlers from NextAuth

3. Create middleware.ts at project root:
   - Implement route protection exactly as specified in Section 9.2 of the knowledge base
   - Protect: /admin/* 
   - Allow redirect: /login

4. Create a seed script (scripts/seed-admin.ts):
   - Accept email, password, display_name as arguments
   - Hash password with bcryptjs (10 rounds)
   - Insert into admin_users table
   - Print confirmation
   - This is a one-time setup utility, not part of the app

Verify: The middleware correctly redirects unauthenticated requests from /admin to /login.
```

---

**STEP 1.2 — Login Page**

```
Build the login page at app/(admin)/login/page.tsx.

Requirements from Section 11.5 of the knowledge base:
- Email + password form
- Use React Hook Form + Zod for validation
- On submit: call signIn from next-auth/react
- On success: redirect to /admin
- On failure: show "Invalid email or password" (never specify which field)
- No "Forgot password" link
- Branding: Smart Brains Media Hub logo text (see Section 2.4)
- Centred card layout, clean and minimal

Do not add any other admin pages yet. Verify login works end-to-end.
```

---

### PHASE 2 — DATABASE AND API LAYER

---

**STEP 2.1 — Database Migration**

```
Create the Supabase database schema.

Generate a SQL file at: scripts/migrations/001_initial_schema.sql

Include all tables and indexes from Section 6 of the knowledge base:
- admin_users
- media_assets
- audit_log
- updated_at trigger

Also include:
- Row Level Security: DISABLE on all tables (we use service role key server-side)
- A comment header explaining this migration

Do NOT run this migration. Output the SQL file only.
Document in README.md: "Run scripts/migrations/001_initial_schema.sql in Supabase SQL Editor to set up the database."
```

---

**STEP 2.2 — Media API Routes**

```
Build the media API routes.

1. Create app/api/media/route.ts:
   GET:
   - Query parameter: type (optional, 'image' | 'video')
   - Query parameter: page (default: 1)
   - Query parameter: per_page (default: 24, max: 48)
   - Return: PaginatedResponse<MediaAsset>
   - NEVER return publitio_id field to client
   - Order: created_at DESC
   - No auth required (public endpoint)

   POST:
   - Requires auth (Section 9.3 pattern)
   - Validate with CreateMediaSchema (Section 0.4)
   - Insert into media_assets table
   - Insert audit_log entry (action: 'upload')
   - Return: ApiResponse<MediaAsset>

2. Create app/api/media/[id]/route.ts:
   GET:
   - Return single asset by id
   - NEVER return publitio_id to client
   - No auth required

   PATCH:
   - Requires auth
   - Validate with UpdateMediaSchema
   - Update title in media_assets
   - Update updated_at (trigger handles this)
   - Insert audit_log entry (action: 'rename')
   - Return: ApiResponse<MediaAsset>

   DELETE:
   - Requires auth
   - Call Publitio delete API (server-side)
   - Delete from media_assets table
   - Insert audit_log entry (action: 'delete')
   - Return: ApiResponse<null>

All responses must follow the ApiResponse<T> format from types/index.ts.
All errors must return appropriate HTTP status codes (Section 13.1).
```

---

**STEP 2.3 — Upload API Routes**

```
Build the signed upload pipeline (see Section 4.2 for architecture).

1. Create app/api/upload/sign/route.ts:
   POST:
   - Requires auth
   - Accept: { filename: string, content_type: string, file_size: number }
   - Validate: content_type must be image/* or video/*
   - Validate: file_size max 500MB
   - Generate Publitio signed upload parameters server-side
   - Return signed URL + upload parameters to client
   - NEVER expose PUBLITIO_API_KEY or PUBLITIO_API_SECRET in response

2. Create app/api/upload/confirm/route.ts:
   POST:
   - Requires auth
   - Accept: { publitio_response: object, title: string }
   - Extract publitio_id and construct branded_url using buildBrandedUrl()
   - Insert into media_assets
   - Insert audit_log entry (action: 'upload')
   - Return: ApiResponse<MediaAsset>

Do not write the client-side upload component yet.
```

---

**STEP 2.4 — Import API Route**

```
Build the URL import route.

Create app/api/import/route.ts:
POST:
- Requires auth
- Validate with ImportMediaSchema (url, title)
- Validate url is a valid URL (Zod .url())
- Fetch the file from the external URL server-side (use node fetch)
- Stream to Publitio API
- On success: extract publitio_id, construct branded_url
- Insert into media_assets
- Insert audit_log entry (action: 'import')
- Return: ApiResponse<MediaAsset>
- Error handling: if URL is unreachable or Publitio fails, return 502 with message

Note in a code comment: "Reliable for files under ~100MB within 60s Vercel timeout"
```

---

### PHASE 3 — PUBLIC UI

---

**STEP 3.1 — Shared Public Components**

```
Build all reusable public-facing components. Use Server Components where possible.

1. components/public/PublicNav.tsx:
   - "Smart Brains Media Hub" logo text (Section 2.4)
   - Links: Images, Videos
   - No login/admin links visible to public
   - Responsive: hamburger menu on mobile

2. components/public/PublicFooter.tsx:
   - "© Smart Brains Kenya"
   - Minimal — one line

3. components/public/MediaCard.tsx:
   Props: { asset: MediaAsset }
   - Show thumbnail via Next.js <Image> (quality={75}, lazy loading)
   - For video: show play icon overlay on thumbnail
   - Show title and type badge (IMAGE / VIDEO)
   - Entire card is a link to /media/[id]
   - Use brand colours for badge: images = brand-primary, videos = brand-secondary

4. components/public/MediaGrid.tsx:
   Props: { assets: MediaAsset[], emptyMessage: string }
   - Responsive grid (Section 10.3)
   - Empty state display
   - Loading skeleton (Tailwind animate-pulse)

5. components/public/URLCopyButton.tsx:
   Props: { url: string }
   - Exactly as specified in Section 10.1
   - Client Component (add 'use client')
   - Must handle clipboard failure gracefully

6. Update app/(public)/layout.tsx:
   - Include PublicNav and PublicFooter
   - Main content area with padding
```

---

**STEP 3.2 — Public Pages**

```
Build all public-facing pages.

1. app/(public)/page.tsx — Homepage (Section 11.1):
   - Static generation (no revalidate)
   - Hero: platform name + "A curated media library for Smart Brains students"
   - Two cards: Browse Images, Browse Videos (links to /images and /videos)
   - Keep it fast and lightweight

2. app/(public)/images/page.tsx — Image Gallery (Section 11.2):
   - Server Component with revalidate = 60
   - Fetch from /api/media?type=image
   - Display MediaGrid with pagination
   - 24 per page

3. app/(public)/videos/page.tsx — Video Library (Section 11.3):
   - Same structure as images page
   - 12 per page

4. app/(public)/media/[id]/page.tsx — Detail Page (Section 11.4):
   - Server Component with revalidate = 60
   - Fetch single asset
   - If type === 'image': display <Image> full size
   - If type === 'video': display native <video controls> element with src={asset.branded_url}
   - URLCopyButton with branded_url
   - Metadata display (file size, dimensions, duration)
   - Back link

5. app/not-found.tsx:
   - Clean 404 page with link back to home

Verify: All public pages render correctly. No admin elements in DOM. Video plays with <video> tag.
```

---

### PHASE 4 — ADMIN UI

---

**STEP 4.1 — Admin Shell**

```
Build the admin layout and navigation.

1. components/admin/AdminSidebar.tsx:
   - Navigation items from Section 10.4
   - Active link highlighting
   - Display logged-in user's display_name
   - Sign out button at bottom

2. components/admin/AdminNav.tsx:
   - Top bar for mobile
   - Shows current page title

3. app/(admin)/layout.tsx:
   - Import auth from lib/auth
   - Server-side session check: if no session, redirect to /login
   - Render AdminSidebar + main content area
   - This is a secondary auth guard (middleware.ts is primary)

4. Verify: Navigating to /admin when unauthenticated redirects to /login.
   Navigating to /admin when authenticated shows the sidebar layout.
```

---

**STEP 4.2 — Admin Dashboard**

```
Build the admin dashboard page.

app/(admin)/admin/page.tsx (Section 11.6):

1. Summary stats row:
   - Total images, Total videos, Total assets
   - Fetch from Supabase server-side

2. components/admin/MediaTable.tsx:
   Props: { assets: MediaAsset[], total: number, page: number }
   - Columns: Thumbnail (small), Title, Type, URL (truncated), Date, Actions
   - Actions: Edit button (→ /admin/media/[id]), Delete button
   - Pagination controls
   - 20 per page

3. Delete initiates DeleteConfirmModal (build next step)
4. Server Component — fetch data server-side

Verify: Dashboard renders media list. Pagination works.
```

---

**STEP 4.3 — Admin Modals and Forms Components**

```
Build reusable admin form components.

1. components/admin/DeleteConfirmModal.tsx (Section 10.5):
   Props: { asset: MediaAsset, onConfirm: () => void, onCancel: () => void }
   - Two-step confirmation: first click shows confirmation, second click confirms
   - Show: "Are you sure you want to delete '[title]'? This cannot be undone."
   - Delete button: red (brand-danger)
   - Cancel button: neutral

2. components/admin/RenameForm.tsx:
   Props: { asset: MediaAsset, onSuccess: (asset: MediaAsset) => void }
   - Single text input for title
   - React Hook Form + Zod validation
   - Submit calls PATCH /api/media/[id]
   - Show success toast on completion

3. components/admin/UploadForm.tsx:
   - File picker: accept="image/*,video/*"
   - Title input (auto-populated from filename, editable)
   - Submit: POST to /api/upload/sign, then upload directly to Publitio, then POST to /api/upload/confirm
   - Progress: show upload percentage during file transfer
   - Disable submit button during upload

4. components/admin/ImportForm.tsx:
   - URL input with validation
   - Title input
   - Submit: POST to /api/import
   - Loading state: spinner with "Importing..." label (can take 10–30 seconds)
   - Do not show progress percentage (unknown duration)
```

---

**STEP 4.4 — Admin Action Pages**

```
Build the remaining admin pages.

1. app/(admin)/admin/upload/page.tsx (Section 11.7):
   - Page title: "Upload Media"
   - Render UploadForm
   - On success: redirect to /admin with toast "Media uploaded successfully"
   - On error: display error inline

2. app/(admin)/admin/import/page.tsx (Section 11.8):
   - Page title: "Import by URL"
   - Render ImportForm
   - On success: redirect to /admin with toast "Media imported successfully"
   - On error: display error inline

3. app/(admin)/admin/media/[id]/page.tsx (Section 11.9):
   - Fetch asset server-side
   - Three sections:
     a. Rename (RenameForm)
     b. Replace file (UploadForm variant — replaces existing Publitio asset)
     c. Delete (DeleteConfirmModal inline trigger)
   - Each section is clearly labelled with a heading and separator
   - On delete success: redirect to /admin

Verify: All admin CRUD operations work end-to-end.
```

---

### PHASE 5 — HARDENING

---

**STEP 5.1 — Rate Limiting**

```
Add rate limiting to sensitive API routes using @upstash/ratelimit.

1. Create a rate limiter in lib/rate-limit.ts:
   - Import Ratelimit from @upstash/ratelimit
   - Import Redis from @upstash/redis
   - Export: uploadLimiter (5 requests per hour per IP)
   - Export: importLimiter (10 requests per hour per IP)
   - Export: authLimiter (10 requests per 15 minutes per IP)

2. Apply uploadLimiter to: /api/upload/sign
3. Apply importLimiter to: /api/import
4. Apply authLimiter to: /api/auth/[...nextauth] (credentials sign-in)

5. On rate limit exceeded: return 429 with message "Too many requests. Please try again later."

Note: Requires Upstash account. Add instructions to README.md.
```

---

**STEP 5.2 — Security Headers**

```
Configure security headers in next.config.ts.

Add the following headers to all routes:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()

For public pages:
- Content-Security-Policy: restrict script-src to 'self'
  (allow fonts.googleapis.com for Inter font)

Add to next.config.ts using the headers() async function.
```

---

**STEP 5.3 — Error Boundaries and Not Found States**

```
Add robust error handling across the application.

1. Create app/error.tsx (global error boundary):
   - Client Component
   - Show: "Something went wrong. Please refresh the page."
   - Show reset button
   - Log error to console (not to user)

2. Create app/(public)/media/[id]/not-found.tsx:
   - "Media not found"
   - Link back to gallery

3. Create app/(admin)/admin/media/[id]/not-found.tsx:
   - "Media not found or was deleted"
   - Link back to dashboard

4. In all API routes, wrap Supabase and Publitio calls in try/catch:
   - Log error server-side with console.error
   - Return { data: null, error: "Something went wrong" } with 500 status
   - Never return raw error messages to client

5. Verify: All empty states from Section 10.3 and 10.5 are implemented.
```

---

**STEP 5.4 — Performance Optimisation**

```
Apply performance requirements from Section 12.

1. Audit all public pages — verify:
   - No autoplay on <video> elements
   - All below-fold <img> tags have loading="lazy"
   - All gallery images use Next.js <Image> with quality={75}
   - No tracking scripts in layout.tsx
   - Homepage is static (no revalidate)

2. Verify next.config.ts:
   - Add images.domains for Publitio branded domain
   - Enable React strict mode

3. Run: npm run build
   - Verify no TypeScript errors
   - Verify no ESLint errors
   - Check bundle sizes — public pages should have minimal client JS

4. Generate production build and test all routes manually.
```

---

### PHASE 6 — DOCUMENTATION AND HANDOVER

---

**STEP 6.1 — README**

```
Write a complete README.md.

Sections:
1. Project Overview — what this is and who it's for
2. Tech Stack — list from knowledge base
3. Prerequisites — Node 20+, npm, Supabase account, Publitio account, Vercel account
4. Environment Setup — list all .env.local variables with descriptions
5. Database Setup — "Run scripts/migrations/001_initial_schema.sql in Supabase SQL Editor"
6. Creating First Admin User — how to run scripts/seed-admin.ts
7. Local Development — npm install, npm run dev
8. Deployment — Vercel deployment steps, required env vars in Vercel dashboard
9. Admin Guide — upload, import, rename, delete instructions
10. Architecture Notes — reference to signed upload pattern, why Vercel Blob is not used
11. Known Limitations — URL import max ~100MB, Vercel 60s function timeout
```

---

**STEP 6.2 — Final Verification Checklist**

```
Run through this complete checklist. Fix any failures before marking the build complete.

PUBLIC ROUTES:
[ ] / — Homepage loads, static, no auth required
[ ] /images — Gallery loads, 24 per page, lazy images
[ ] /videos — Gallery loads, 12 per page
[ ] /media/[id] — Image renders with <Image>, video renders with <video controls>
[ ] URLCopyButton — copies to clipboard, shows "Copied!" for 2 seconds
[ ] No admin elements in public DOM (inspect element)

ADMIN ROUTES:
[ ] /login — Form works, error on bad credentials, redirect on success
[ ] /admin — Redirects to /login when unauthenticated
[ ] /admin — Dashboard shows media table and summary stats
[ ] /admin/upload — File upload works end-to-end, metadata saved to Supabase
[ ] /admin/import — URL import works, metadata saved to Supabase
[ ] /admin/media/[id] — Rename saves to Supabase
[ ] /admin/media/[id] — Delete removes from Publitio and Supabase
[ ] Audit log — all admin actions recorded in audit_log table

SECURITY:
[ ] PUBLITIO_API_KEY not in browser bundle (check Network tab)
[ ] PUBLITIO_API_SECRET not in browser bundle
[ ] /admin/* returns 302 to /login when no session (not 401 or 403)
[ ] API routes return 401 JSON when called without session
[ ] No raw error messages returned to client

PERFORMANCE:
[ ] No autoplay on any video
[ ] Lighthouse score on /images: Performance > 80
[ ] Build succeeds: npm run build
[ ] No TypeScript errors: npx tsc --noEmit
[ ] No ESLint errors: npm run lint
```

---

## APPENDIX A — Agent Behaviour Rules

When executing the prompts above, the AI agent must:

1. **Read the knowledge base before each step.** Reference the relevant sections of this document at the start of each prompt.
2. **Do not combine steps.** Each step is atomic. Complete one before starting the next.
3. **Ask before deviating.** If a technical constraint makes a specification impossible, state the issue and propose an alternative before implementing it.
4. **Use the exact package versions specified.** Do not upgrade or substitute packages without explicit instruction.
5. **Do not add unrequested features.** Build only what is specified.
6. **Security rules are absolute.** No exceptions to Section 9 and Section 14.
7. **TypeScript strict mode is non-negotiable.** Fix type errors — do not suppress with `any` or `@ts-ignore`.
8. **Test after each phase.** Run `npm run build` at the end of each phase before proceeding.

---

## APPENDIX B — Publitio Integration Notes

- Publitio API documentation: https://publit.io/docs
- Use the `publitio-js-sdk` package (Node.js server-side only)
- The signed upload pattern requires: `api.signedQuery()` or equivalent
- Branded domain must be configured in the Publitio dashboard before `buildBrandedUrl()` will work
- Test Publitio connectivity with a single manual upload before building the upload pipeline
- Publitio asset IDs are used as the primary reference — never store raw file paths

---

*End of Knowledge Base — Version 1.0*
