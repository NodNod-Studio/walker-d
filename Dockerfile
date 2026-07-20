FROM node:22-alpine AS builder

# Install system dependencies and pnpm
RUN apk add --no-cache libc6-compat && \
    corepack enable && \
    corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./

RUN pnpm install --frozen-lockfile --ignore-scripts

COPY . .

RUN pnpm run postinstall && pnpm run build

FROM node:22-alpine AS runner

RUN apk add --no-cache curl && \
    corepack enable && \
    corepack prepare pnpm@latest --activate

WORKDIR /app

COPY --from=builder /app/.output /app/.output
COPY --from=builder /app/package.json /app/package.json

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 CMD curl -fsS "http://127.0.0.1:${PORT:-3000}/api/health" || exit 1

CMD ["node", ".output/server/index.mjs"]
