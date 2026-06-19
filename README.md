# Inna Jubilee RSVP

<p align="center">
  <img src="public/android-chrome-192x192.png" alt="Юбилей Инны favicon" width="96" height="96">
</p>

Invitation and RSVP app for Inna's jubilee.

The app is a Vite + React frontend with a small Node API. Production uses a local SQLite database stored in a Docker volume, so it does not depend on Vercel or Neon.

## Stack

- React + Vite
- Tailwind CSS
- Node 24 production server
- SQLite via `node:sqlite`
- Docker Compose
- Traefik v3.7.5 with Let's Encrypt
- Yandex Container Registry for published images

## Local Development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create local env:

   ```bash
   cp .env.example .env.local
   ```

3. Set at least:

   ```env
   ADMIN_SECRET="change-me"
   SQLITE_PATH="data/rsvps.sqlite"
   ```

4. Start client and API:

   ```bash
   npm run dev
   ```

Frontend runs on `http://localhost:3000`; API runs on `http://localhost:3001` and is proxied by Vite.

## Production Server

Build frontend and server bundle:

```bash
npm run build:all
```

Run locally:

```bash
ADMIN_SECRET="change-me" SQLITE_PATH="data/rsvps.sqlite" npm start
```

The server listens on `PORT` or `3000` by default and serves:

- `/` and `/admin` from `dist`
- `/api/rsvps`
- `/api/admin/rsvps`

## Docker

Build image:

```bash
docker build -t 50-jubilee:local .
```

Run it:

```bash
docker run --rm \
  -p 3000:3000 \
  -e ADMIN_SECRET="change-me" \
  -e SQLITE_PATH="/data/rsvps.sqlite" \
  -v jubilee-data:/data \
  50-jubilee:local
```

## Docker Compose With Traefik

Create `.env` on the server:

```env
APP_IMAGE=cr.yandex/<registry-id>/50-jubilee:latest
DOMAIN=example.com
ACME_EMAIL=admin@example.com
ADMIN_SECRET=change-me
```

Start or update:

```bash
docker compose pull
docker compose up -d --remove-orphans
```

The compose stack creates:

- `app` - RSVP app and API
- `traefik` - HTTPS reverse proxy
- `rsvp_data` - persistent SQLite volume mounted at `/data`
- `traefik_letsencrypt` - ACME certificate storage

Traefik has `DOCKER_API_VERSION=1.40` set intentionally. It avoids Docker provider errors on hosts where API negotiation falls back too low.

## GitHub Actions Deployment

`.github/workflows/deploy.yml` builds the Docker image, pushes it to Yandex Container Registry, copies compose files to the server, and restarts the stack.

Required GitHub secrets:

- `YC_REGISTRY_ID`
- `YC_SA_JSON_CREDENTIALS`
- `SERVER_HOST`
- `SERVER_USER`
- `SSH_PRIVATE_KEY`
- `DEPLOY_PATH`
- `DOMAIN`
- `ACME_EMAIL`
- `ADMIN_SECRET`

## Useful Server Commands

View containers:

```bash
docker compose ps
```

View app logs:

```bash
docker compose logs -f app
```

View Traefik logs:

```bash
docker compose logs -f traefik
```

Backup SQLite database:

```bash
docker run --rm \
  -v jubilee_rsvp_data:/data \
  -v "$PWD":/backup \
  alpine cp /data/rsvps.sqlite /backup/rsvps.sqlite
```

## Favicons

Favicons and PWA icons are stored in `public/` and referenced from `index.html`:

- `favicon.ico`
- `favicon-16x16.png`
- `favicon-32x32.png`
- `apple-touch-icon.png`
- `android-chrome-192x192.png`
- `android-chrome-512x512.png`
- `site.webmanifest`
