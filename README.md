# Inna Jubilee RSVP

Vite + React invitation app with a small Node API and a local SQLite database.

## Local Development

1. Install dependencies:
   `npm install`
2. Copy env example:
   `cp .env.example .env.local`
3. Set `ADMIN_SECRET` in `.env.local`.
4. Start frontend and API:
   `npm run dev`

Local SQLite data is stored in `data/rsvps.sqlite` unless `SQLITE_PATH` is set.

## Production Build

Build frontend and the bundled Node server:

```bash
npm run build:all
npm start
```

The production server listens on `PORT` and serves:

- static files from `dist`
- `/api/rsvps`
- `/api/admin/rsvps`

## Docker Compose Deployment

The compose stack runs:

- `app` - the invitation app and API
- `traefik` - HTTPS reverse proxy with Let's Encrypt
- `rsvp_data` volume - persistent SQLite database at `/data/rsvps.sqlite`

Create a `.env` file on the server:

```env
APP_IMAGE=cr.yandex/<registry-id>/50-jubilee:latest
DOMAIN=example.com
ACME_EMAIL=admin@example.com
ADMIN_SECRET=change-me
```

Then run:

```bash
docker compose pull
docker compose up -d
```

## GitHub Actions Deployment

`.github/workflows/deploy.yml` builds the image, pushes it to Yandex Container Registry, copies `docker-compose.yml` to the server, and restarts the stack.

Required GitHub secrets:

- `YC_REGISTRY_ID` - Yandex Container Registry id
- `YC_SA_JSON_CREDENTIALS` - service account JSON key with push/pull access
- `SERVER_HOST` - deployment server hostname or IP
- `SERVER_USER` - SSH user
- `SSH_PRIVATE_KEY` - private SSH key for the server
- `DEPLOY_PATH` - directory on the server for compose files
- `DOMAIN` - public domain for Traefik routing
- `ACME_EMAIL` - Let's Encrypt email
- `ADMIN_SECRET` - admin password
