<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# RSVP app

This project is a Vite + React app with a Neon-backed RSVP API designed to deploy on Vercel.

## Local development

**Prerequisites:** Node.js and a Neon database.

1. Install dependencies:
   `npm install`
2. Set `DATABASE_URL` and `ADMIN_SECRET` in [.env.local](.env.local)
3. Start a Vercel dev server so the `/api` routes are available:
   `npx vercel dev`
4. In a separate terminal, or if you only need the frontend shell, you can still run:
   `npm run dev`

## Environment variables

- `DATABASE_URL` - Neon connection string for the Postgres database
- `ADMIN_SECRET` - Secret used by the admin page and the `/api/admin/rsvps` endpoint

## Deployment

Deploy the project to Vercel and configure the same environment variables in the Vercel project settings.
