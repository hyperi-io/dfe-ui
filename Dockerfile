# Project:   dfe-ui
# File:      Dockerfile
# Purpose:   production container image for dfe-core-ui (Next.js standalone)
#
# License:   BUSL-1.1
# Copyright: (c) 2026 HYPERI PTY LIMITED
#
# docs/build-and-deploy.md covers the three stages.

# Trixie by name: the bare node:24-slim tag is still Debian 12. Renovate moves the digest.
ARG NODE_IMAGE=node:24-trixie-slim@sha256:43b9ba1142b8dcf33fa8f922ca1be85714adc444e0586c7cf7726daaeabc1bea

# --- Builder ---
# Install and build run natively on the build host: yarn install under QEMU dies with EPIPE.
FROM --platform=$BUILDPLATFORM ${NODE_IMAGE} AS builder
WORKDIR /app

# node-gyp toolchain for native dependencies, in the builder stage alone.
# Unpinned: Debian removes superseded versions from its archive, so a version pin breaks the build at the next point release.
# hadolint ignore=DL3008
RUN apt-get update && apt-get install -y --no-install-recommends \
      python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

RUN corepack enable

COPY package.json yarn.lock .yarnrc.yml turbo.json ./
COPY apps/ apps/
COPY packages/ packages/
# The app's lint-rule tests import repo-root scripts, and `yarn build` type-checks them.
COPY scripts/ scripts/

# Every published arch's prebuilt packages, so the standalone trace carries each and app_tree keeps the target's.
RUN yarn config set supportedArchitectures.cpu --json '["x64","arm64"]' \
    && yarn install --immutable
ENV NEXT_PUBLIC_API_URL=""
# VERSION exists in a publish build alone, and COPY of a missing file fails.
RUN --mount=type=bind,source=.,target=/src \
    if [ -f /src/VERSION ]; then cp /src/VERSION /app/VERSION; fi
RUN yarn build

# --- App tree ---
# The runtime /app, assembled on the build host so nothing here runs emulated.
FROM --platform=$BUILDPLATFORM ${NODE_IMAGE} AS app_tree
WORKDIR /app

# The standalone output leaves out .next/static and public/, so both are copied beside it.
COPY --from=builder /app/apps/dfe-core-ui/.next/standalone ./
COPY --from=builder /app/apps/dfe-core-ui/.next/static ./apps/dfe-core-ui/.next/static
COPY --from=builder /app/apps/dfe-core-ui/public ./apps/dfe-core-ui/public

# Drops the other arch's prebuilt packages, and fails the build on any binary not built for the target.
ARG TARGETARCH
RUN --mount=type=bind,source=scripts/native-arch.mjs,target=/usr/local/lib/native-arch.mjs \
    node /usr/local/lib/native-arch.mjs "$TARGETARCH" /app

# --- Runtime (Next.js standalone) ---
FROM ${NODE_IMAGE} AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN groupadd -g 1001 nodejs && useradd -u 1001 -g nodejs -m nextjs

COPY --from=app_tree --chown=nextjs:nodejs /app ./

# Numeric, so a kubelet enforcing runAsNonRoot can verify it without reading /etc/passwd.
USER 1001:1001
EXPOSE 3000
CMD ["node", "apps/dfe-core-ui/server.js"]
