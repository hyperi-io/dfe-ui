# Project:   dfe-ui
# File:      Dockerfile
# Purpose:   production container image for dfe-core-ui (Next.js standalone)
#
# License:   BUSL-1.1
# Copyright: (c) 2026 HYPERI PTY LIMITED
#
# Auto-built + published to ghcr.io/hyperi-io/dfe-ui by hyperi-ci (container
# publish is auto-on-Dockerfile-presence). Next.js standalone output (see
# apps/dfe-core-ui/next.config.ts: output 'standalone' + outputFileTracingRoot at
# the monorepo root) gives a minimal runtime: a self-contained server + the
# traced workspace deps. yarn 4 (berry, node-modules linker) via corepack; turbo
# builds the app + its @repo/* workspace packages.

# --- Builder ---
FROM node:24-bookworm-slim AS builder
WORKDIR /app

# Toolchain for any native (node-gyp) transitive deps. Builder-only; discarded.
# Unpinned: Debian removes superseded versions from its archive, so a version pin breaks the build at the next point release.
# hadolint ignore=DL3008
RUN apt-get update && apt-get install -y --no-install-recommends \
      python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

RUN corepack enable

# Manifests first so the install layer caches independently of source.
COPY package.json yarn.lock .yarnrc.yml turbo.json ./
COPY apps/ apps/
COPY packages/ packages/

RUN yarn install --immutable
ENV NEXT_PUBLIC_API_URL=""
# hyperi-ci stamp-version writes VERSION before a publish image build.
# COPY of a missing file fails, so bind-mount the context and copy only when present.
RUN --mount=type=bind,source=.,target=/src \
    if [ -f /src/VERSION ]; then cp /src/VERSION /app/VERSION; fi
# turbo builds the workspace packages (@repo/*) then the Next app.
RUN yarn build

# --- Runtime (Next.js standalone) ---
FROM node:24-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Non-root runtime.
RUN groupadd -g 1001 nodejs && useradd -u 1001 -g nodejs -m nextjs

# Standalone bundle carries the monorepo layout: apps/dfe-core-ui/server.js plus a
# minimal node_modules + traced packages/. Neither the built static assets nor the
# public/ tree ride in standalone -- copy both alongside the app.
COPY --from=builder --chown=nextjs:nodejs /app/apps/dfe-core-ui/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/dfe-core-ui/.next/static ./apps/dfe-core-ui/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/dfe-core-ui/public ./apps/dfe-core-ui/public

# Numeric, so a kubelet enforcing runAsNonRoot can verify it without reading /etc/passwd.
USER 1001:1001
EXPOSE 3000
CMD ["node", "apps/dfe-core-ui/server.js"]
