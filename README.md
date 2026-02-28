# Smart Brains Media Hub

Smart Brains Media Hub is a custom-built media library platform for **Smart Brains Kenya**. It provides a stable, branded environment for students to access images and videos for their coding coursework while offering admin staff a streamlined interface for asset management.

## 🚀 Key Features

- **Public Gallery:** Clean, responsive browsing of images and videos.
- **Direct Branded URLs:** Copy stable URLs for use in HTML `<img src>` and `<video src>` tags.
- **Admin Dashboard:** Overview of media assets with usage statistics.
- **Signed Uploads:** Efficient direct-to-cloud uploading for large media files (up to 500MB).
- **Import by URL:** Quick asset ingestion from external web addresses.
- **Management Tools:** Rename assets, replace files, and secure deletion with confirmation.
- **Security:** Protected admin routes, hashed passwords, and strict server-side environment variable handling.

## 🛠 Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript 5+
- **Styling:** Tailwind CSS v4
- **Database:** Supabase (PostgreSQL)
- **Media Storage/CDN:** Publitio
- **Authentication:** NextAuth.js v5 (Auth.js)
- **Validation:** Zod
- **API Client:** Axios

## 📋 Prerequisites

- **Node.js:** 20+
- **Database:** Supabase Account
- **Media:** Publitio Account
- **Hosting:** Vercel (Recommended)

## ⚙️ Environment Setup

Create a `.env.local` file in the root directory:

```bash
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Publitio
PUBLITIO_API_KEY=your_api_key
PUBLITIO_API_SECRET=your_api_secret
PUBLITIO_BRANDED_DOMAIN=https://your-media-domain.com

# NextAuth
NEXTAUTH_SECRET=your_random_secret
NEXTAUTH_URL=http://localhost:3000
```

## 🏗 Database Migration

Run the provided SQL script in your Supabase SQL Editor:
`scripts/migrations/001_initial_schema.sql`

## 👤 Creating the First Admin

Run the following command to seed your first administrative user:
```bash
npx tsx scripts/seed-admin.ts <email> <password> <displayName>
```

## 💻 Local Development

1. Install dependencies: `npm install`
2. Start the dev server: `npm run dev`
3. Open [http://localhost:3000](http://localhost:3000)

## 🚢 Deployment

1. Push code to a GitHub repository.
2. Connect the repository to Vercel.
3. Configure all environment variables in the Vercel Dashboard.
4. Run the database migration in Supabase.

## 🔒 Security & Architecture

- **Server-Only Enforcement:** Sensitive logic is restricted to server environments via `import 'server-only'`.
- **Signed Uploads:** Large files are streamed directly from the browser to Publitio, bypassing serverless function timeouts and memory limits.
- **Zero Raw IDs:** Publitio internal IDs and raw URLs are never exposed to public users.

---
Built with ❤️ for **Smart Brains Kenya**
