# GEMINI.md

## Project Overview
**Smart Brains Media Hub** is an internal media library platform for Smart Brains Kenya, an EdTech company. Its primary purpose is to provide students with a curated, branded, and stable source of images and videos for their coding projects.

The platform has two main user groups:
- **Students (Public):** Browse media and copy branded direct URLs (using `<video src>` tags).
- **Admin Staff (Authenticated):** Manage the library (upload, import, rename, replace, and delete assets).

**Absolute Source of Truth:** `Jules.md` contains the exhaustive knowledge base and 16-step implementation roadmap. It must be read in its entirety before any code is written.

## Tech Stack
| Component | Technology |
|---|---|
| **Framework** | Next.js 14+ (App Router) |
| **Language** | TypeScript 5+ (Strict Mode) |
| **Styling** | Tailwind CSS v3 |
| **Database** | Supabase (PostgreSQL) |
| **Media/CDN** | Publitio (Server-side SDK) |
| **Auth** | NextAuth v5 (Auth.js) |
| **Rate Limiting** | Upstash (Redis) |
| **Deployment** | Vercel |

## Building and Running
The project follows standard Next.js conventions once scaffolded.

- **Setup:** `npm install`
- **Development:** `npm run dev`
- **Build:** `npm run build`
- **Linting:** `npm run lint`

*Note: See `Jules.md` Section 3.7 for the exact list of packages to install.*

## Development Conventions
- **Strict Compliance:** All development must follow the specifications in `Jules.md`.
- **Folder Structure:** Use the exact structure defined in `Jules.md` Part 5 (root `app/` directory, no `src/`).
- **Security:**
  - Never prefix secrets with `NEXT_PUBLIC_`.
  - Use `import 'server-only'` for sensitive modules (`lib/db.ts`, `lib/publitio.ts`).
  - Signed upload pattern for media (browser to Publitio directly via signed URL).
  - CSRF and Route protection in `middleware.ts`.
- **Performance:** Optimise for low-bandwidth environments (Kenyan schools). Lazy load, no autoplay, and use Next.js `<Image>` for thumbnails.
- **Branding:** Adhere to the palette and typography defined in `Jules.md` Part 2. Assets are located in `assets/logos/`.

## Key Files
- `Jules.md`: Comprehensive technical roadmap and product definition.
- `assets/logos/`: Branding assets for the platform.
- `.env.example`: Template for required environment variables (Supabase, Publitio, NextAuth, Upstash).

## Database Schema
Refer to `Jules.md` Section 6 for SQL migrations:
- `media_assets`: Primary storage for media metadata.
- `admin_users`: Authentication table.
- `audit_log`: Tracking admin actions.
