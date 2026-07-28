# ─── Build ──────────────────────────────────────────────────────────────────
FROM node:22-alpine AS build

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate
WORKDIR /app

# manifesti prima: il layer delle dipendenze si riusa fra le build
COPY pnpm-workspace.yaml package.json .npmrc ./
COPY packages/engine/package.json packages/engine/
COPY packages/content/package.json packages/content/
COPY packages/ai/package.json packages/ai/
COPY apps/server/package.json apps/server/
COPY apps/web/package.json apps/web/
COPY tools/validate-cases/package.json tools/validate-cases/
COPY tools/simulate/package.json tools/simulate/
COPY tools/generate-assets/package.json tools/generate-assets/
COPY tools/loadtest/package.json tools/loadtest/
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# ─── Esecuzione ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS runtime

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8787
ENV HOST=0.0.0.0
ENV STATIC_DIR=/app/apps/web/dist

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages
COPY --from=build /app/apps/server/dist ./apps/server/dist
COPY --from=build /app/apps/server/package.json ./apps/server/
COPY --from=build /app/apps/web/dist ./apps/web/dist
COPY --from=build /app/package.json ./

# nessun processo di root
RUN addgroup -S meridien && adduser -S meridien -G meridien && chown -R meridien:meridien /app
USER meridien

EXPOSE 8787

HEALTHCHECK --interval=30s --timeout=4s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||8787)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "--enable-source-maps", "apps/server/dist/index.js"]
