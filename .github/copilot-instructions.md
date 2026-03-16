# Media Hub Development Guidelines

Smart Brains Media Hub is a Next.js 14+ app for managing media assets (images/videos) with a public gallery and protected admin dashboard. This guide ensures consistent, secure, and efficient development.

## Code Style

### TypeScript
- Always strict mode (enabled in tsconfig)
- Explicit types—no implicit `any`
- Path alias: `@/` maps to project root
- Use Zod schemas for all input validation

### Components & Styling
- **'use client'** for interactive components (forms, state)
- **No 'use client'** for data-fetching components (server components fetch async data)
- Tailwind CSS v4 with custom CSS variables (see [globals.css](app/globals.css) for brand colors):
  - `brand-primary`: #1e3a5f, `brand-secondary`: #f4a500
- Icons: lucide-react
- UI: Tailwind only (no component library)

### Naming Conventions
- **Files:** PascalCase for components (`AdminNav.tsx`), camelCase for functions
- **Database columns:** snake_case (admin_users, created_at, publitio_id)
- **Routes:** lowercase paths (/api/media, /admin/upload)
- **Variables:** camelCase for JS, snake_case for DB

## Architecture

### Next.js App Router Layout
```
(admin)/              Protected routes (middleware guards auth)
  login/              Credentials form
  admin/              Dashboard with stats
  upload/             Signed upload to Publitio
  import/             Import by URL
  media/[id]/         Edit/delete asset

(public)/             Public routes (no auth)
  page.tsx            Home
  images/, videos/    Galleries
  media/[id]/         Detail page

api/                  API endpoints
  auth/[...nextauth]/ NextAuth handlers
  media/              CRUD operations
  upload/sign/        Get Publitio signed credentials
  upload/confirm/     Create DB record after upload
  import/             Import asset from URL
```

### Authentication Flow
- **Provider:** NextAuth.js v5, Credentials (email/password)
- **Hashing:** bcryptjs
- **Storage:** JWT session (8-hour max age in auth.ts)
- **Session callback:** `auth()` call in route handlers or middleware
- **Secrets:** NEXTAUTH_SECRET must be strong + never committed

### Database (Supabase PostgreSQL)
Three core tables with key patterns:
- **admin_users:** UUID PK, email, bcryptjs password_hash, display_name, created_at
- **media_assets:** id (UUID), **publitio_id (NEVER expose to client)**, title, type, branded_url, file_size_bytes, width_px, height_px, duration_secs, uploaded_by, created_at, updated_at
- **audit_log:** id, admin_id, action, media_id, metadata JSONB, created_at

**Security critical:** Always strip `publitio_id` from API responses using destructuring: `{publitio_id: _, ...sanitized}`

### Media Upload Architecture
**Why direct-to-cloud?** Serverless functions timeout on large files.
```
Flow:
1. Client calls /api/upload/sign → Server returns Publitio signed credentials
2. Browser POSTs directly to Publitio (bypasses server, handles 500MB files)
3. Client calls /api/upload/confirm → Server creates DB record
Result: No serverless timeout on large uploads, no memory limits
```

## Build and Test

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server (localhost:3000) |
| `npm run build` | Production build |
| `npm start` | Production server |
| `npm run lint` | ESLint |
| `npx tsx scripts/seed-admin.ts <email> <password> <name>` | Create first admin user |

**Database setup (one-time):**
1. Create Supabase project
2. Run `scripts/migrations/001_initial_schema.sql` in Supabase SQL Editor
3. Run seed command above

**Environment variables (.env.local):**
```
SUPABASE_URL=your_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PUBLITIO_API_KEY=your_key
PUBLITIO_API_SECRET=your_secret
PUBLITIO_BRANDED_DOMAIN=https://your-domain.com
NEXTAUTH_SECRET=random_string_min_32_chars
NEXTAUTH_URL=http://localhost:3000 (dev) or https://yourdomain.com (prod)
```

## Conventions

### Validation
All inputs validated with Zod (`lib/validations.ts`):
```typescript
const result = CreateMediaSchema.safeParse(jsonInput);
if (!result.success) {
  return NextResponse.json({ error: result.error.message }, { status: 400 });
}
```

### API Response Pattern
```typescript
// All endpoints return: { data: T | null, error: string | null }
// Status codes: 200 (GET), 201 (POST), 400 (validation), 401 (auth), 404 (not found), 500 (error)
// ALWAYS remove publitio_id before sending to client
interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}
```

### Error Handling
- **Route handlers:** try/catch → log error → NextResponse.json with status code
- **Database queries:** Always check error first: `const {data, error} = await db.select(); if(error) return handleError(error);`
- **Client side:** Use react-hot-toast for feedback: `import {toast} from 'react-hot-toast'; toast.error(message);`

### Security Patterns
- **Server-only logic:** Always add `import 'server-only'` at top of lib/auth.ts, lib/db.ts, lib/publitio.ts
- **Protected routes:** Middleware guard in middleware.ts redirects unauthenticated /admin, /login requests
- **Write operations:** API endpoints with POST/PATCH/DELETE must check `const session = await auth(); if(!session?.user) return 401`
- **Environment variables:** Never expose API secrets (PUBLITIO_API_SECRET, SUPABASE_SERVICE_ROLE_KEY) to client bundles

### Component Patterns
```typescript
// Server component with async data fetch
async function Dashboard() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const {data} = await db.from('media_assets').select().eq('uploaded_by', session.user.id);
  return <AdminTable items={data} />;
}

// Client component with form
'use client';
import {useForm} from 'react-hook-form'; import {zodResolver} from '@hookform/resolvers/zod';
export function UploadForm() {
  const form = useForm({resolver: zodResolver(CreateMediaSchema)});
  const onSubmit = async (data) => {
    const res = await fetch('/api/media', {method: 'POST', body: JSON.stringify(data)});
    if (!res.ok) return toast.error((await res.json()).error);
    toast.success('Success!');
  };
  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>;
}
```

## Common Gotchas & Solutions

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| publitio_id leaked in API response | Forgot to strip before responding | Always: `{publitio_id: _, ...rest}` |
| Secrets in client bundle | Missing 'server-only' import on lib files | Add `import 'server-only'` to auth.ts, db.ts, publitio.ts |
| Unauthorized 401 on /admin | Session expired (8hr max) or missing auth check | Verify middleware is applied; check auth() in route handler |
| Slow page loads | Querying DB inside Server Component | Use force-dynamic header or cache with revalidateTag pattern |
| Upload timeout | Large file + serverless memory limit | Use signed upload flow (direct to Publitio)—never stream to server |
| Pagination returns 0 results | Offset miscalculated | Use `(page-1)*perPage` to `page*perPage-1` as range. Page 1 = 0-23 (per_page=24) |
| Type errors with auth() | Missing NextAuth types | Import: `import {Session} from 'next-auth'` |
| Images/videos not displaying | Missing PUBLITIO_BRANDED_DOMAIN or URL malformed | Verify .env.local has PUBLITIO_BRANDED_DOMAIN + branded_url is `{domain}/{publitio_id}/{filename}` |

## Quick Reference

### Fetch Media (Public)
```typescript
GET /api/media?type=image&page=1&per_page=24 → {data: MediaAsset[], error: null}
```

### Rename Asset (Protected)
```typescript
PATCH /api/media/[id] {title: "New Title"} → {data: MediaAsset, error: null}
```

### Delete Asset (Protected)
```typescript
DELETE /api/media/[id] → Removes from DB and Publitio
```

### Query Database (Server-Side)
```typescript
const {data, error} = await db.from('table').select('col1, col2').eq('id', id).single();
if (error) throw error;
return data;
```

### Check Authentication in API Route
```typescript
const session = await auth();
if (!session?.user) {
  return NextResponse.json({error: 'Unauthorized'}, {status: 401});
}
```

### Show Toast Notification
```typescript
import {toast} from 'react-hot-toast';
toast.success('Media uploaded!');
toast.error('Something went wrong');
```

## Key Files for Reference

- [lib/auth.ts](../../lib/auth.ts) — NextAuth config, bcryptjs validation
- [lib/db.ts](../../lib/db.ts) — Supabase client setup + error handling
- [lib/validations.ts](../../lib/validations.ts) — Zod schemas
- [lib/publitio.ts](../../lib/publitio.ts) — Publitio integration
- [middleware.ts](../../middleware.ts) — Route guards
- [app/(admin)/login/page.tsx](../../app/(admin)/login/page.tsx) — Auth form example
- [app/api/media/route.ts](../../app/api/media/route.ts) — API endpoint pattern
- [types/index.ts](../../types/index.ts) — Type definitions
