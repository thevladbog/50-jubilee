FROM node:22-bookworm-slim AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build:all

FROM node:22-bookworm-slim AS runtime

ENV NODE_ENV=production
ENV PORT=3000
ENV SQLITE_PATH=/data/rsvps.sqlite

WORKDIR /app

COPY --from=build /app/dist ./dist

RUN mkdir -p /data

VOLUME ["/data"]
EXPOSE 3000

CMD ["node", "--no-warnings", "dist/server.js"]
