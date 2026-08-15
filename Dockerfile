# syntax=docker/dockerfile:1.4
FROM node:18-alpine AS base
WORKDIR /app

COPY package.json ./
# The dependency layer only changes when package.json does.
RUN --mount=type=cache,target=/root/.npm npm install --legacy-peer-deps

COPY . ./

# Next keeps a webpack cache in .next/cache. Without a cache mount that cache
# is discarded with every image build, so each one recompiles the whole app
# from cold — the reason a one-line change costs the same as a rewrite. The
# mount lives in the builder, not in the image, so nothing here ships.
RUN --mount=type=cache,target=/app/.next/cache npm run build

CMD ["npm", "start"]
