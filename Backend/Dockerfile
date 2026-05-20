# syntax=docker/dockerfile:1.7
# Build context must be the repo root (Render: rootDir: . + dockerfilePath: ./Backend/Dockerfile;
# docker-compose: context: . + dockerfile: ./Backend/Dockerfile) so that the workspace lockfile
# and pnpm-workspace.yaml are visible.

FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable

# Workspace manifests first for best layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY Backend/package.json ./Backend/

# Install Backend's workspace slice (includes dev deps for TypeScript build)
RUN pnpm install --frozen-lockfile --filter ./Backend...

# Backend source
COPY Backend/tsconfig.json ./Backend/
COPY Backend/src ./Backend/src

# Compile TS → dist/
RUN pnpm --filter ./Backend build

# ---- Runtime: re-install prod deps only, copy dist ----
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable

COPY --from=build /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=build /app/Backend/package.json ./Backend/
# --ignore-scripts: skip the root `prepare: husky` lifecycle hook (husky is a devDep,
# only relevant for local git hooks, would crash here under --prod).
RUN pnpm install --frozen-lockfile --filter ./Backend... --prod --ignore-scripts

COPY --from=build /app/Backend/dist ./Backend/dist

RUN addgroup -S app && adduser -S app -G app && chown -R app:app /app
USER app

WORKDIR /app/Backend
EXPOSE 4000
CMD ["node", "dist/server.js"]
