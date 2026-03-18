# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Build/Lint/Test Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- No test framework is configured (no test scripts in package.json)

## Project-Specific Patterns

### Server-Only Modules
- Always use `import 'server-only'` in sensitive modules (`lib/db.ts`, `lib/publitio.ts`) to prevent client-side bundling
- Never import these files in client components

### Authentication
- NextAuth v5 with JWT strategy (8-hour max age)
- Use `auth()` from `@/lib/auth` to get session in API routes
- Protected routes check `session?.user` and return 401 if unauthorized

### API Response Pattern
All API routes return `{ data, error }` format:
```typescript
return NextResponse.json({ data: null, error: 'Message' }, { status: 500 });
// or
return NextResponse.json({ data: sanitizedAsset, error: null });
```

### Database
- Raw Supabase client (no ORM)
- `publitio_id` is internal-only and sanitized before sending to client
- Always include audit_log entries for admin actions (upload, import, rename, replace, delete)

### Upload Architecture
Two upload methods exist:
1. **Direct** (`POST /api/upload`): Streams through Vercel serverless (has memory/timeout limits)
2. **Signed** (`POST /api/upload/sign` + `POST /api/upload/confirm`): Browser uploads directly to Publitio

### Tailwind CSS v4
Uses `@import "tailwindcss"` and `@theme` for custom colors (not tailwind.config.ts):
```css
@theme {
  --color-brand-primary: #1e3a5f;
  /* ... */
}
```

### Route Groups
- `(public)`: Unauthenticated pages (home, gallery, media detail)
- `(admin)`: Protected admin pages with sidebar layout

### Media Types
- Only `image` and `video` types accepted
- Student use case: `<video src="...">` NOT `<iframe>`

## Key Files
- `Jules.md`: Comprehensive technical roadmap (read before modifying)
- `GEMINI.md`: Project overview
- `middleware.ts`: Route protection (`/admin/*`, `/login`)
- `lib/auth.ts`: NextAuth configuration
- `lib/publitio.ts`: Media CDN wrapper with `buildBrandedUrl()`
